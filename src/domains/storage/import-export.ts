import download, { selectFile } from '../../modules/download/download'

import { AppVersion } from '../../modules/app-version/app-version'
import { Interact } from '../../store/interact'
import Storage from './storage'
import dayjs from 'dayjs'
import math from '../../utils/math/math'

import { hideImportModal, showCSVImportModal, showImportModal } from '../import-export/ImporterStore'
import { wait } from '../../utils/tick/tick'
import TrackerClass from '../../modules/tracker/TrackerClass'
import { MasterTrackables, saveTrackable } from '../trackable/TrackableStore'

import { addMissing, smartMerge } from './smart-merge'
import { TemplateToImport } from './storage-export.helper'
import { collectLocalSettings, restoreLocalSettings, type LocalSettings } from '../backup/local-settings'

/**
 * Normalize context.json from backup format to storage format
 * Backups might have context as arrays, but context storage needs key-value objects (KVStore format)
 * Note: pointers.json should remain as arrays since PointerStore uses ArrayStore format
 */
const normalizeContextFile = (path: string, content: any): any => {
  // Only process context.json
  if (path !== 'context.json') {
    return content
  }

  // If already an object (key-value), return as-is
  if (content && typeof content === 'object' && !Array.isArray(content)) {
    return content
  }

  // If it's an array, convert to key-value object using 'tag' as key
  if (Array.isArray(content)) {
    const result: { [key: string]: any } = {}
    content.forEach((item) => {
      if (item && item.tag) {
        result[item.tag] = item
      }
    })
    return result
  }

  // Return as-is if it's neither array nor object
  return content
}

export const STORAGE_ARCHIVE_FORMAT = 'nomie-storage-archive'
export const STORAGE_ARCHIVE_SCHEMA = 1

export type N6StorageExport = {
  format?: string // 'nomie-storage-archive' (archives made before Oct 2026 have no format field)
  schema?: number
  version: string // app version that made the archive, e.g. "6.7.4-dn" or "dn6.8.0v20260928"
  created: Date | string
  counts?: {
    files: number
    logs: number
  }
  files: {
    [key: string]: any
  }
  local?: LocalSettings // allow-listed browser settings, see backup/local-settings.ts
}

/**
 * Is this a Nomie 6 storage archive?
 * Detected by its shape, never by the version string: the version prefix changed
 * from "6." to "dn6." in August 2026 and broke the old check.
 */
export const isStorageArchive = (archive: any): boolean => {
  return !!archive && typeof archive === 'object' && !!archive.files && typeof archive.files === 'object' && !Array.isArray(archive.files)
}

export const isBookPath = (path: string): boolean => /(^|\/)books\//.test(path)

/**
 * Read every file in the storage engine into an archive object.
 * Files that fail to read are reported, not silently skipped.
 */
export const buildStorageArchive = async (
  onProgress?: (path: string, percent: number) => void
): Promise<{ archive: N6StorageExport; failures: Array<string> }> => {
  const files: { [key: string]: any } = {}
  const failures: Array<string> = []
  const paths: Array<string> = (await Storage.list()) || []
  let logs = 0

  for (let i = 0; i < paths.length; i++) {
    const path = Storage.convertPath(paths[i])
    if (onProgress) onProgress(path, math.percentage(paths.length, i))
    try {
      const content = await Storage.getStrict(path)
      if (content !== null && content !== undefined) {
        files[path] = content
        if (isBookPath(path) && Array.isArray(content)) logs += content.length
      }
    } catch (e) {
      console.error(`Backup could not read ${path}`, e)
      failures.push(path)
    }
  }

  const archive: N6StorageExport = {
    format: STORAGE_ARCHIVE_FORMAT,
    schema: STORAGE_ARCHIVE_SCHEMA,
    version: `${AppVersion}`,
    created: new Date().toJSON(),
    counts: { files: Object.keys(files).length, logs },
    files,
    local: collectLocalSettings(),
  }
  return { archive, failures }
}

/**
 * Export all Files within the Storage Engine as a download
 * @returns true only when every file was read and the download was started
 */
export const exportStorage = async (): Promise<boolean> => {
  Interact.blocker('Starting backup...', 0)
  try {
    await wait(200)
    const { archive, failures } = await buildStorageArchive((path, percent) => Interact.blocker(path, percent))
    await download.json(`nomie-backup-${dayjs().format('YYYY-MM-DD-HHmm')}.json`, archive)
    Interact.stopBlocker()

    if (failures.length) {
      await Interact.alert(
        'Backup incomplete',
        `${failures.length} file(s) could not be read and are missing from this backup: ${failures.join(', ')}`
      )
      return false
    }
    return true
  } catch (e) {
    Interact.stopBlocker()
    console.error(e)
    await Interact.alert('Backup failed', e instanceof Error ? e.message : String(e))
    return false
  }
}

/**
 * Import Storage
 * @param merge
 * @returns
 */
export const importStorage = async (merge: boolean = true): Promise<Boolean> => {
  const fileUpload = await selectFile('.json,.csv')

  if (`${fileUpload.file.name}`.toLowerCase().endsWith('.csv')) {
    hideImportModal()

    showCSVImportModal(fileUpload);

  } else {
    let archive: N6StorageExport | any
    try {
      archive = JSON.parse(fileUpload.data)
    } catch (e) {
      await Interact.alert('Not a valid file', 'This file is not valid JSON, so it cannot be imported.')
      return false
    }
    if (!archive || typeof archive !== 'object') {
      await Interact.alert('Not a valid file', 'This file does not contain a Nomie backup.')
      return false
    }

    /**
     * Is this a version 6 Archive, or the older format?
     */
    if (archive && archive.type && archive.type == 'template') {
      const importerFormat: any = TemplateToImport(archive);
      return await importStorageArchive(importerFormat);
    } else if (isStorageArchive(archive)) {
      // Nomie 6 / Daily Nomie storage archive - restores every file it contains
      return await importStorageArchive(archive)
    } else if (archive.type === 'tracker' && archive.tracker) {
      const tracker = new TrackerClass(archive.tracker)
      const confirmed = await Interact.confirm(`Install ${tracker.tag}?`)
      if (confirmed) {
        const saved = await saveTrackable({
          trackable: tracker.toTrackable(),
          known: MasterTrackables,
          permissions: {},
          prompt: true,
        })
        if (!saved) await Interact.alert(`${tracker.tag} could not be installed`)
        //tracker.toTrackable()
        // MasterTrackables, getRawPermissions(), true
      }
    } else {
      // Older Formats - use the older Importer
      hideImportModal()
      await wait(300)
      showImportModal(archive)
    }
  }
}


type ImportProps = {
  silent?: boolean
  addMissingOnly?: boolean // keep what is already on this device, only add what is missing (templates)
}
/**
 * Import a Storage Archive
 * @param archive N6StorageExport
 * @param mergeData Should we merge this with existing, or overrite?
 * @returns
 */
/**
 * Write every file of an archive into the storage engine, merging with what is
 * already there (see smartMerge). Also restores allow-listed local settings.
 */
export const writeStorageArchive = async (
  archive: N6StorageExport,
  onProgress?: (path: string, percent: number) => void,
  mode: 'merge' | 'add-missing' = 'merge'
): Promise<{ done: Array<string>; errors: Array<{ path: string; e: any }>; localSettings: number }> => {
  const files = Object.keys(archive.files).map((path) => ({ path, content: archive.files[path] }))
  const errors: Array<{ path: string; e: any }> = []
  const done: Array<string> = []

  for (const file of files) {
    if (onProgress) onProgress(file.path, math.percentage(files.length, done.length))
    try {
      const path = file.path
      // Normalize context.json from array to key-value format (KVStore)
      // Pointers.json is left as-is since PointerStore uses ArrayStore format
      const content = normalizeContextFile(path, file.content)

      // Merge with existing data when there is any; otherwise write as-is
      const existing = await Storage.getStrict(path)
      if (existing && typeof existing !== 'string') {
        await Storage.put(path, mode === 'add-missing' ? addMissing(existing, content) : smartMerge(existing, content))
      } else {
        await Storage.put(path, content)
      }
      done.push(path)
    } catch (e) {
      errors.push({ path: file.path, e })
    }
  }

  let localSettings = 0
  try {
    localSettings = restoreLocalSettings(archive.local, localStorage, mode === 'add-missing')
  } catch (e) {
    errors.push({ path: 'local settings', e })
  }

  return { done, errors, localSettings }
}

export const importStorageArchive = async (archive: N6StorageExport, props: ImportProps = {}): Promise<Boolean> => {
  const fileCount = Object.keys(archive.files).length
  const logCount =
    archive.counts?.logs ??
    Object.keys(archive.files)
      .filter(isBookPath)
      .reduce((total, path) => total + (Array.isArray(archive.files[path]) ? archive.files[path].length : 0), 0)
  const created = archive.created ? ` from ${dayjs(archive.created).format('D MMM YYYY HH:mm')}` : ''

  let confirmed = props.silent ? true : await Interact.confirm(
    `Restore backup?`,
    `This backup${created} contains ${fileCount} files and ${logCount.toLocaleString()} logs. It will be merged with the data on this device. This action cannot be undone.`
  )
  if (confirmed) {
    // Items that exist on both sides keep this device's version, unless the user picks the backup's.
    // Dismissing the question keeps this device's version too.
    let mode: 'merge' | 'add-missing' = 'add-missing'
    if (!props.addMissingOnly && !props.silent) {
      const useBackup = await Interact.confirm(
        'Items already on this device',
        'Some items exist on this device and in the backup. Keep this device\'s version (recommended), or use the version from the backup? Items only in the backup are always added.',
        'Use backup version',
        'Keep this device (recommended)'
      )
      mode = useBackup ? 'merge' : 'add-missing'
    }
    const { errors } = await writeStorageArchive(archive, (path, percent) => Interact.blocker(path, percent), mode)

    Interact.stopBlocker()

    /**
     * Check if we have errors
     */
    if (errors.length) console.error(errors)
    if (!props.silent) {
      if (!errors.length) {
        await Interact.alert(`Successfully restored ${fileCount} files`)
        window.location.reload()
        return true
      } else {
        await Interact.alert(
          'Restore incomplete',
          `${errors.length} of ${fileCount} files could not be restored: ${errors.map((e) => e.path).join(', ')}`
        )
        window.location.reload()
        return false
      }
    }
    return !errors.length
  } // end if Confirmed
}
