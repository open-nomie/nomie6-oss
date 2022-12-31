import download, { selectFile } from '../../modules/download/download'

import { AppVersion } from '../../modules/app-version/app-version'
import { Interact } from '../../store/interact'
import Storage from './storage'
import chunk from 'lodash/chunk'
import dayjs from 'dayjs'
import math from '../../utils/math/math'

import { hideImportModal, showCSVImportModal, showImportModal } from '../import-export/ImporterStore'
import { wait } from '../../utils/tick/tick'
import TrackerClass from '../../modules/tracker/TrackerClass'
import { MasterTrackables, saveTrackable } from '../trackable/TrackableStore'
import { getRawPermissions } from '../my-account/PermissionsStore'
import { smartMerge } from './smart-merge'
import { TemplateToImport } from './storage-export.helper'
type exportPropsType = {
  onChange: Function
  onComplete: Function
}
export type N6StorageExport = {
  version: string
  created: Date
  files: {
    [key: string]: any
  }
}

/**
 * Export all Files within the Storage Engine
 * @param props
 */
export const exportStorage = async (props?: exportPropsType) => {
  const storage: any = {}
  const files: Array<string> = await Storage.list()
  const chunks = chunk(files, 10)
  Interact.blocker('Starting Exporter...', 0)
  await wait(200)
  for (let i = 0; i < chunks.length; i++) {
    let chunk = chunks[i]
    for (let c = 0; c < chunk.length; c++) {
      let path = Storage.convertPath(chunk[c])
      Interact.blocker(`${path}`, math.percentage(chunks.length - 1, i))
      let content = await Storage.get(path)
      if (content) {
        storage[path] = content
      }
    }
  }
  const payload: N6StorageExport = {
    version: `${AppVersion}`,
    created: new Date(),
    files: storage,
  }
  await download.json(`n${AppVersion}-${dayjs().format('YYYY-MM-DD-H')}.json`, payload)

  Interact.stopBlocker()
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
    const archive: N6StorageExport | any = JSON.parse(fileUpload.data)

    /**
     * Is this a version 6 Archive, or the older format?
     */
    if(archive && archive.type && archive.type == 'template') {
      const importerFormat:any = TemplateToImport(archive);
      return await importStorageArchive(importerFormat);
    } else if (archive.files && archive.version.substring(0, 1) === '6') {
      // Newer Importer imports it all - no longer lets you select parts
      return await importStorageArchive(archive)
    } else if (archive.type === 'tracker' && archive.tracker) {
      const tracker = new TrackerClass(archive.tracker)
      const confirmed = await Interact.confirm(`Install ${tracker.tag}?`)
      if (confirmed) {
        saveTrackable({
          trackable: tracker.toTrackable(),
          known: MasterTrackables,
          permissions: getRawPermissions(),
          prompt: true,
        })
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
}
/**
 * Import a Storage Archive
 * @param archive N6StorageExport
 * @param mergeData Should we merge this with existing, or overrite?
 * @returns
 */
export const importStorageArchive = async (archive: N6StorageExport, props:ImportProps={}): Promise<Boolean> => {
  const files = Object.keys(archive.files).map((path) => {
    return {
      path,
      content: archive.files[path],
    }
  })
  
  let confirmed = props.silent ? true :  await Interact.confirm(
    `Import?`,
    `This ${archive.version} archive contains ${Object.keys(archive.files).length} files. This action cannot be undone.`
  )
  if (confirmed) {
    const chunkedFiles = chunk(files, 10)
    const errors: Array<any> = []
    const done: Array<any> = []

    /**
     * Loop Over Each Chunk of Files
     */
    for (let i = 0; i < chunkedFiles.length; i++) {
      const cfiles = chunkedFiles[i]

      /**
       * Loop Over Paths in this Chunk
       */
      for (let c = 0; c < cfiles.length; c++) {
        Interact.blocker(`${cfiles[c].path}`, math.percentage(files.length, done.length))

        try {
          let path = cfiles[c].path
          let content = cfiles[c].content

          /**
           * If the Existing Exists, and it's not a string
           * then we will merge the Two together using
           * lodash merge
           */
          const existing = await Storage.get(path)
          if (existing && typeof existing !== 'string') {
            let merged = smartMerge(existing, content)
            await Storage.put(path, merged)
          } else {
            // It's either a string, or the existing doesn't exist
            await Storage.put(path, content)
          }

          done.push(path)
        } catch (e) {
          errors.push({ path: cfiles[c].path, e })
        }
      }
    }

    Interact.stopBlocker()

    /**
     * Check if we have errors
     */
    if(!props.silent) {
      if (!errors.length) {
        await Interact.alert(`Successfully imported ${files.length} files`)
        window.location.reload()
        return true
      } else {
        console.error(errors)
        await Interact.alert('Notice', `${errors.length} files errored on Import. Check your console to see the details`)
        window.location.reload()
        return true
      }
    }
    return true
  } // end if Confirmed
}
