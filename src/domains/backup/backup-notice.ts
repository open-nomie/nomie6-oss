import { get } from 'svelte/store'
import { Prefs } from '../preferences/Preferences'
import { Lang } from '../../store/lang'
import AlertBox from '../../components/alertbox/alertbox.svelte'
import { closeModal, openModal } from '../../components/backdrop/BackdropStore2'
import { generateBackup } from './BackupStore'

const DAY_MS = 24 * 60 * 60 * 1000
const CHECK_EVERY_MS = 60 * 60 * 1000

let dialogOpen = false

/**
 * Should the notice show now?
 * - never after "Discard" or "Back up now"
 * - on every app start
 * - during a session, again once 24 hours have passed since it was last shown
 */
const shouldShow = (onStart: boolean): boolean => {
  const prefs = get(Prefs)
  if (!prefs.onboarded || prefs.backupNoticeDiscarded || dialogOpen) return false
  if (onStart || !prefs.backupNoticeShownAt) return true
  return Date.now() - prefs.backupNoticeShownAt >= DAY_MS
}

const showNotice = () => {
  dialogOpen = true
  Prefs.update((p) => ({ ...p, backupNoticeShownAt: Date.now() }))
  const id = 'backup-notice'
  openModal({
    id,
    component: AlertBox,
    position: 'center',
    componentProps: {
      payload: {
        title: Lang.t('backup-notice.title', 'Please make a backup today'),
        message: Lang.t(
          'backup-notice.message',
          'We found a bug that stopped some backups from including everything, and some backups from August and September could not be restored at all. A regular backup protects your data, so please make one now. It takes a moment, and it includes all your trackers, logs, boards, templates and settings.'
        ),
        ok: Lang.t('backup-notice.now', 'Back up now'),
        cancel: Lang.t('backup-notice.later', 'Later'),
        discard: Lang.t('backup-notice.discard', 'Discard'),
        onInteract: (res) => {
          dialogOpen = false
          closeModal(id)
          if (res.value === 'discard') {
            Prefs.update((p) => ({ ...p, backupNoticeDiscarded: true }))
          } else if (res.value === true) {
            Prefs.update((p) => ({ ...p, backupNoticeDiscarded: true }))
            generateBackup()
          }
          // "Later" (or Escape) keeps the notice; it comes back on the next start or after 24 hours
        },
      },
    },
  })
}

const maybeShow = (onStart: boolean) => {
  if (shouldShow(onStart)) showNotice()
}

let started = false

/**
 * Call once when the app has started. Shows the notice on start, and checks
 * hourly so that a session running for more than 24 hours sees it again.
 * The backup message is mounted again on every page with a header, so the
 * guard keeps this to one start-up check per app load.
 */
export const startBackupNotice = () => {
  if (started) return
  started = true
  maybeShow(true)
  setInterval(() => maybeShow(false), CHECK_EVERY_MS)
}
