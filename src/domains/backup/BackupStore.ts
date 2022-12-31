import { derived, writable } from 'svelte/store'

import { Interact } from '../../store/interact'
import { Lang } from '../../store/lang'
import dayjs from 'dayjs'

import { exportStorage } from '../storage/import-export'

const STORAGE_KEY = 'last-backup-date'
export const BackupStore = writable<undefined | string>(localStorage.getItem(STORAGE_KEY))
BackupStore.subscribe((s) => {
  localStorage.setItem(STORAGE_KEY, s)
})

export const BackupDaysAgo = derived(BackupStore, ($BackupStore) => {
  if (!$BackupStore) {
    return 9000
  } else {
    return dayjs().diff(new Date($BackupStore), 'day')
  }
})

export const backupConfirmed = async () => {
  BackupStore.update((s) => new Date().toJSON())
}

export const generateBackup = async (): Promise<boolean> => {
  let confirmed = await Interact.confirm(
    `${Lang.t('settings.export-title', 'Generate a Backup')}`,
    `${Lang.t('settings.export-confirm', 'This might take a while if you have a lot of data.')}`
  )
  if (confirmed) {
    await exportStorage()
    backupConfirmed()

    return true
  }
  return false
}
