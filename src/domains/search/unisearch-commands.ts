import { Prefs, setDocumentTheme } from '../preferences/Preferences'

import { ActiveLogStore } from '../capture-log/CaptureLogStore'
import CreateOutline from '../../n-icons/CreateOutline.svelte'
import NLog from '../nomie-log/nomie-log'
import type { PopMenuButton } from '../../components/pop-menu/usePopmenu'
import { Trackable } from '../trackable/Trackable.class'
import { TrackerLibrary } from '../library/tracker-library'
import { addNewPerson, getAddPersonButton } from '../board/boardActions'
import { generateBackup } from '../backup/BackupStore'
import { openTrackableEditor } from '../trackable/trackable-editor/TrackableEditorStore'
import { closeUnisearch } from './UnisearchStore'

export const unisearchCommands: Array<PopMenuButton> = [
  {
    title: 'Create Custom tracker',
    description: 'Create and Add a new tracker! ',
    click() {
      openTrackableEditor(
        new Trackable({
          type: 'tracker',
        })
      )
    },
  },
  getAddPersonButton(),
  {
    title: 'Write Journal Entry',
    icon: CreateOutline,
    description: 'Browse the nomie library of trackers, add create',
    click() {
      ActiveLogStore.journal(new NLog({}))
    },
  },
  {
    title: 'Open Library',
    description: 'Browse the nomie library of trackers, add create',
    click() {
      TrackerLibrary.toggle()
    },
  },
  {
    title: 'Dark Theme',
    click() {
      Prefs.update((s) => {
        s.theme = 'dark'
        setDocumentTheme(s.theme)
        closeUnisearch();
        return s
      })
    },
  },
  {
    title: 'Light Theme',
    click() {
      Prefs.update((s) => {
        s.theme = 'light'
        setDocumentTheme(s.theme)
        closeUnisearch();
        return s
      })
    },
  },
  {
    title: 'System Theme',
    click() {
      Prefs.update((s) => {
        s.theme = 'auto'
        setDocumentTheme(s.theme)
        closeUnisearch();
        return s
      })
    },
  },
  {
    title: 'Generate Backup',
    click() {
      generateBackup()
    },
  },
]
