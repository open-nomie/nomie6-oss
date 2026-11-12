import Storage from '../../domains/storage/storage'
import NPaths from '../../paths'
import appConfig from '../../config/appConfig'

export type PluginIssue = {
  pluginId: string
  pluginName: string
  issueType: 'duplicates-in-file' | 'rogue-folder'
  duplicatesFound?: number
  fileLocation: string
}

export type DedupResult = {
  totalPluginsInMainList: number
  pluginIssues: Array<PluginIssue>
  totalDuplicateEntries: number
  totalRogueFolders: number
  hasDuplicates: boolean
}

/**
 * Remove duplicates from an array by identifier field or exact match
 * Checks for common identifier fields (id, label, name, widgetid, etc.)
 * If array items have one of these fields, deduplicates by that field (keeps first occurrence)
 * Otherwise deduplicates by exact JSON match
 */
const deduplicateArray = (arr: any[]): { cleaned: any[]; removed: number } => {
  const seen = new Set<string>()
  const unique: any[] = []
  let removedCount = 0

  // Common identifier fields to check in order of priority
  const identifierFields = ['id', 'widgetid', 'label', 'name', 'key', 'uuid']

  arr.forEach((item) => {
    let key: string

    if (item && typeof item === 'object') {
      // Try to find an identifier field in the item
      const identifierField = identifierFields.find((field) => item[field] !== undefined)

      if (identifierField) {
        // Use the identifier field value as the key
        key = String(item[identifierField])
      } else {
        // No identifier field found, use exact JSON match
        key = JSON.stringify(item)
      }
    } else {
      // Primitive value, use exact match
      key = JSON.stringify(item)
    }

    if (!seen.has(key)) {
      seen.add(key)
      unique.push(item)
    } else {
      removedCount++
    }
  })

  return { cleaned: unique, removed: removedCount }
}

/**
 * Recursively scan and deduplicate JSON structure at all levels
 * Finds duplicate objects/arrays within the same parent
 */
const recursiveDedup = (data: any): { cleaned: any; duplicatesFound: number } => {
  let duplicatesFound = 0

  // If it's an array at this level, deduplicate it
  if (Array.isArray(data)) {
    const result = deduplicateArray(data)
    duplicatesFound += result.removed

    // Recursively process each item in the array
    const processedArray = result.cleaned.map((item) => {
      const recursive = recursiveDedup(item)
      duplicatesFound += recursive.duplicatesFound
      return recursive.cleaned
    })

    return { cleaned: processedArray, duplicatesFound }
  }

  // If it's an object, recursively process each property
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const cleaned: Record<string, any> = {}

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key]

        // If this property is an array, deduplicate it
        if (Array.isArray(value)) {
          const result = deduplicateArray(value)
          duplicatesFound += result.removed

          // Recursively process array items
          cleaned[key] = result.cleaned.map((item) => {
            const recursive = recursiveDedup(item)
            duplicatesFound += recursive.duplicatesFound
            return recursive.cleaned
          })
        } else {
          // Recursively process the value
          const recursive = recursiveDedup(value)
          duplicatesFound += recursive.duplicatesFound
          cleaned[key] = recursive.cleaned
        }
      }
    }

    return { cleaned, duplicatesFound }
  }

  // Primitive value, return as-is
  return { cleaned: data, duplicatesFound }
}

/**
 * Scan JSON files for duplicate entries and detect rogue plugin folders
 * This is a read-only operation that only reports what would be cleaned
 */
export const scanForPluginDuplicates = async (): Promise<DedupResult> => {
  try {
    // Read the main plugins.json file
    const pluginsData = await Storage.get(NPaths.storage.plugins())

    const result: DedupResult = {
      totalPluginsInMainList: 0,
      pluginIssues: [],
      totalDuplicateEntries: 0,
      totalRogueFolders: 0,
      hasDuplicates: false,
    }

    // Collect valid plugin IDs from plugins.json
    const validPluginIds = new Set<string>()

    // Check plugins.json for duplicates (recursively at all levels)
    if (pluginsData) {
      if (Array.isArray(pluginsData)) {
        result.totalPluginsInMainList = pluginsData.length

        // Collect valid plugin IDs
        pluginsData.forEach((plugin) => {
          if (plugin.id) {
            validPluginIds.add(plugin.id)
          }
        })
      }

      const dedup = recursiveDedup(pluginsData)

      if (dedup.duplicatesFound > 0) {
        result.pluginIssues.push({
          pluginId: 'plugins.json',
          pluginName: 'Main Plugin List',
          issueType: 'duplicates-in-file',
          duplicatesFound: dedup.duplicatesFound,
          fileLocation: NPaths.storage.plugins(),
        })
        result.totalDuplicateEntries += dedup.duplicatesFound
        result.hasDuplicates = true
      }

      // Now check individual plugin prefs files for duplicates
      if (Array.isArray(pluginsData)) {
        const scannedPrefs = new Set<string>() // Track unique plugin IDs we've scanned

        for (const plugin of pluginsData) {
          const pluginId = plugin.id
          const pluginName = plugin.name

          // Only scan each unique plugin once (skip if we already scanned this ID)
          if (scannedPrefs.has(pluginId)) {
            continue
          }
          scannedPrefs.add(pluginId)

          // Don't include data_root prefix - storage paths don't have it
          const prefsPath = `plugins/${pluginId}/prefs.json`

          try {
            const prefsData = await Storage.get(prefsPath)

            if (prefsData) {
              const dedup = recursiveDedup(prefsData)

              if (dedup.duplicatesFound > 0) {
                result.pluginIssues.push({
                  pluginId,
                  pluginName,
                  issueType: 'duplicates-in-file',
                  duplicatesFound: dedup.duplicatesFound,
                  fileLocation: prefsPath,
                })
                result.totalDuplicateEntries += dedup.duplicatesFound
                result.hasDuplicates = true
              }
            }
          } catch (e) {
            // Plugin prefs file doesn't exist or can't be read, which is fine
            // Some plugins may not have prefs
          }
        }
      }
    }

    // Now scan for rogue plugin folders (folders not in plugins.json)
    try {
      const allFiles = await Storage.list()

      // Extract plugin folder IDs from the file list
      // Storage paths don't include data_root prefix
      const patterns = [
        new RegExp(`^plugins/([^/]+)(?:/|$)`),
      ]

      const foundPluginIds = new Set<string>()

      allFiles.forEach((file) => {
        for (const pattern of patterns) {
          const match = file.match(pattern)
          if (match) {
            foundPluginIds.add(match[1])
            break
          }
        }
      })

      // Find rogue folders (exist on disk but not in plugins.json)
      foundPluginIds.forEach((folderId) => {
        if (!validPluginIds.has(folderId)) {
          result.pluginIssues.push({
            pluginId: folderId,
            pluginName: `Rogue Plugin Folder`,
            issueType: 'rogue-folder',
            fileLocation: `plugins/${folderId}/`,
          })
          result.totalRogueFolders++
          result.hasDuplicates = true
        }
      })
    } catch (e) {
      console.error('Error scanning for rogue plugin folders:', e)
      // Continue anyway, rogue folder detection is optional
    }

    return result
  } catch (e) {
    console.error('Error scanning for plugin duplicates:', e)
    throw e
  }
}

/**
 * Remove duplicate entries from JSON files and delete rogue plugin folders (DESTRUCTIVE)
 * Only call after user confirmation
 */
export const cleanupPluginDuplicates = async (): Promise<DedupResult> => {
  try {
    const scanResult = await scanForPluginDuplicates()

    if (!scanResult.hasDuplicates) {
      return scanResult
    }

    // Clean up plugins.json - remove duplicates at all levels
    const pluginsData = await Storage.get(NPaths.storage.plugins())
    if (pluginsData) {
      const dedup = recursiveDedup(pluginsData)
      await Storage.put(NPaths.storage.plugins(), dedup.cleaned)
    }

    // Re-read cleaned plugins data for processing prefs
    const cleanedPluginsData = await Storage.get(NPaths.storage.plugins())

    // Collect valid plugin IDs from cleaned plugins.json
    const validPluginIds = new Set<string>()
    if (Array.isArray(cleanedPluginsData)) {
      cleanedPluginsData.forEach((plugin) => {
        if (plugin.id) {
          validPluginIds.add(plugin.id)
        }
      })

      // Clean up individual plugin prefs files
      for (const plugin of cleanedPluginsData) {
        const pluginId = plugin.id
        const prefsPath = `plugins/${pluginId}/prefs.json`

        try {
          const prefsData = await Storage.get(prefsPath)

          if (prefsData) {
            const dedup = recursiveDedup(prefsData)
            // Only save if there were duplicates
            if (dedup.duplicatesFound > 0) {
              await Storage.put(prefsPath, dedup.cleaned)
            }
          }
        } catch (e) {
          // Prefs file doesn't exist or can't be read - skip
        }
      }
    }

    // Delete rogue plugin folders
    try {
      const allFiles = await Storage.list()
      const pluginFolderPattern = new RegExp(`^plugins/([^/]+)/`)

      for (const file of allFiles) {
        const match = file.match(pluginFolderPattern)
        if (match) {
          const folderId = match[1]
          if (!validPluginIds.has(folderId)) {
            // This is a rogue folder, delete all files in it
            try {
              // Delete each file in the rogue folder
              const filesToDelete = allFiles.filter((f) => f.startsWith(`plugins/${folderId}/`))
              for (const fileToDelete of filesToDelete) {
                await Storage.delete(fileToDelete)
              }
            } catch (e) {
              console.error(`Error deleting rogue plugin folder ${folderId}:`, e)
            }
          }
        }
      }
    } catch (e) {
      console.error('Error cleaning up rogue plugin folders:', e)
      // Continue anyway
    }

    // Return clean scan result
    return {
      totalPluginsInMainList: Array.isArray(cleanedPluginsData) ? cleanedPluginsData.length : 0,
      pluginIssues: [],
      totalDuplicateEntries: 0,
      totalRogueFolders: 0,
      hasDuplicates: false,
    }
  } catch (e) {
    console.error('Error cleaning plugin duplicates:', e)
    throw e
  }
}
