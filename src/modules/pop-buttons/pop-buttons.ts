import {
  CalendarOutline,
  CreateOutline,
  EyeSolid,
  PencilOutline,
  PinSolid,
  PulseOutline,
  SparklesOutline,
} from '../../components/icon/nicons'

import type NLog from '../../domains/nomie-log/nomie-log'
import type { PopMenuButton } from '../../components/pop-menu/usePopmenu'
import type { Trackable } from '../../domains/trackable/Trackable.class'
import capitalize from 'lodash/capitalize'
import dayjs from 'dayjs'
import { getDateFormats } from '../../domains/preferences/Preferences'
import { openLogDisplay } from '../../domains/nomie-log/log-display-modal/LogDisplayStore'
import { openLogEditor } from '../../domains/nomie-log/LogEditorStore'
import { openOnThisDayModal } from '../../domains/on-this-day/useOnThisDayModal'
import { openTrendingModal } from '../../domains/trending/TrendingModalStore'
import { showTrackablePopmenu } from '../../domains/board/boardActions'
import { wait } from '../../utils/tick/tick'
import MagnetOutlineSvelte from '../../n-icons/MagnetOutline.svelte'
import { LedgerStore, saveLog } from '../../domains/ledger/LedgerStore'

const dateFormats = getDateFormats()

export const getDatePopButtons = (date: Date): Array<PopMenuButton> => {
  return [
    {
      title: `View ${dayjs(date).format(dateFormats.mmm_d_yyyy)}`,
      icon: CalendarOutline,
      click() {
        openOnThisDayModal(date)
      },
    },
    {
      title: `Trending ${dayjs(date).format(dateFormats.mmm_d_yyyy)}`,
      icon: PulseOutline,
      click() {
        openTrendingModal(date)
      },
    },
  ]
}

export const addDividerToFirst = (buttons: Array<PopMenuButton>): Array<PopMenuButton> => {
  const btns = [...buttons]
  btns[0].divider = true
  return btns
}

export const getLogPopButtons = (log: NLog, includeDescription: boolean = true): Array<PopMenuButton> => {
  const buttons = [
    {
      title: 'View Note',
      description: includeDescription ? `${log.note.substring(0, 200)}` : undefined,
      icon: EyeSolid,
      click() {
        openLogDisplay(log)
      },
    },
    {
      title: 'Edit Note',
      icon: CreateOutline,
      click() {
        openLogEditor(log)
      },
    }
  ]
  if(log.pinned) {
    buttons.push({
      title: 'Unpin Note',
      icon: MagnetOutlineSvelte,
      click() {
        delete log.pinned;
        LedgerStore.updateLog(log);
      }
    })
  } else {
    buttons.push({
      title: 'Pin Note',
      icon: MagnetOutlineSvelte,
      click() {
        log.pinned = true;
        LedgerStore.updateLog(log);
      }
    })
  }
  return buttons;
}

export const getTrackableDetailPopButton = (trackable: Trackable): Array<PopMenuButton> => {
  return [
    {
      title: `${capitalize(trackable.label)} Usage...`,
      icon: SparklesOutline,
      async click() {
        await wait(400)
        showTrackablePopmenu(trackable)
      },
    },
  ]
}
