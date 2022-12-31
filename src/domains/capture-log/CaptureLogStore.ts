import Hooky from '../../modules/hooks/hooks'
import type { ITrackers } from '../../modules/import/import'
import NLog from '../nomie-log/nomie-log'
import NomieLog from '../nomie-log/nomie-log'
import type { NomieLogType } from '../nomie-log/nomie-log'
import ScoreNote from '../../modules/scoring/score-note'
import debounce from 'lodash/debounce'
import { openLogEditor } from '../nomie-log/LogEditorStore'
import { writable } from 'svelte/store'

const activeLogInit = () => {
  let base: NomieLogType = {}
  // Start with empty time - let ledger set it one.
  base.end = null
  base.start = null

  const { subscribe, set, update } = writable<NomieLogType>(base)

  const hooky = new Hooky()

  const methods = {
    clear: debounce(() => {
      clearHighlightedTrackers()
      update((state) => {
        state = {}
        state.start = null
        state.end = null

        return state
      })
    }, 500),
    hook(hookType, func) {
      // pass to hooky
      hooky.hook(hookType, func)
    },
    journal(log: NLog) {
      log = log instanceof NLog ? log : new NLog(log || {})
      openLogEditor(log)
      // Interact.toggleFocusedEditor()
    },
    updateNote(note) {
      update((state) => {
        state.note = `${note.trim()} `
        // this.runHook('onUpdate', b);
        hooky.run('onUpdate', state)
        return state
      })
    },
    asLog() {
      let log
      update((state) => {
        log = new NomieLog(state)
        return state
      })
      return log
    },
    calculateScore(note: string, knownTrackers?: ITrackers) {
      return ScoreNote(note, new Date(), knownTrackers)
    },
    removeStr(str: string) {
      update((state) => {
        state.note = state.note
          .split(' ')
          .filter((word) => {
            return word !== str
          })
          .join(' ')
        return state
      })
    },
    addElement(element) {
      update((state) => {
        let note = (state.note || '').trim().split(' ')
        note.push(element.trim())
        state.note = note.join(' ').trim() + ' '
        hooky.run('onAddElement', element)
        return state
      })
    },
    addTag(tag, value?) {
      update((state) => {
        if (!isNaN(parseFloat(value))) {
          state.note = `${state.note} #${tag}(${value}) `
        } else {
          state.note = `${state.note} #${tag} `
        }
        hooky.run('onAddTag', { tag, value })
        return state
      })
    },
    focus() {
      const input = document.getElementById('textarea-capture-note');
      if(input) input.focus();
    },
  }

  return {
    subscribe,
    update,
    set,
    ...methods,
  }
}

export const ActiveLogStore = activeLogInit()

export const setCaptureLogDate = (input: number | Date) => {
  ActiveLogStore.update((s) => {
    s.end = new Date(input)
    return s
  })
}

export const clearCaptureLog = () => {
  ActiveLogStore.update((state) => {
    state = {}
    state.start = null
    state.end = null
    return state
  })
}

export const clearCaptureLogDate = () => {
  ActiveLogStore.update((state) => {
    state = {}
    state.start = null
    state.end = null
    return state
  })
}

export const clearHighlightedTrackers = () => {
  const buttons = document.querySelectorAll('.item-grid .shortcut-button')
  buttons.forEach((child) => {
    child.classList.remove('in-note')
  })
}
