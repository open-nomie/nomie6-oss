<script lang="ts">
  import dayjs from 'dayjs'

  import escapeRegExp from 'lodash/escapeRegExp'
  import Storage from '../../domains/storage/storage'
  import { onDestroy, onMount } from 'svelte'
  import locate from '../../modules/locate/locate'
  import { tokenToTrackable } from '../../modules/tokenizer/tokenToTrackable'
  import { Interact } from '../../store/interact'
  import { wait } from '../../utils/tick/tick'
  import { LedgerStore, queryToTrackableUsage, saveLog } from '../ledger/LedgerStore'
  import NLog from '../nomie-log/nomie-log'
  import { selectTrackables } from '../trackable/trackable-selector/TrackableSelectorStore'
  import PluginFrame from './plugin-frame.svelte'
  import { TrackableStore } from '../trackable/TrackableStore'
  import { broadcastPluginMessage, openPluginModal, PluginStore } from './PluginStore'
  import { openIFrameModal } from '../../components/modal/iframe-modal-helper'

  import type { PluginClass, PluginType, PluginUseTypes } from './plugin-helpers'
  import { strToTagSafe } from '../trackable/trackable-utils'
  import { strToToken } from '../../modules/tokenizer/lite'
  import { Trackable } from '../trackable/Trackable.class'
  import { getTrackerInputAsString } from '../tracker/input/TrackerInputStore'
  import { parseNumber } from '../../utils/parseNumber/parseNumber'
  import { openExternalTemplate } from '../templates/templates-svelte-helpers'
  import { openLogEditor } from '../nomie-log/LogEditorStore'
  import { openTrackableEditor } from '../trackable/trackable-editor/TrackableEditorStore'

  /**
   * Singleton Receive Message
   * used for plugin iframes as the
   * main listener
   * @param evt
   */
  const receiveMessage = async (evt) => {
    // Extract Message, action and payload
    let message = evt.data
    let action = message.action
    let payload = message.data
    let lid = message.data?.lid

    // If it's a plugin action and payload
    if (action && payload) {
      // Get plugin ID
      let pluginId = payload.pid

      // Find the Plugin That Called this.
      let plugin = $PluginStore.find((p) => {
        return p.id === `${pluginId}`
      })

      if (plugin) {
        // If we're missing a location Id
        // display an error message
        if (!lid && action !== 'register') {
          console.error(`${action} was called without a LID`, plugin)
        }

        if (action == 'createNote') {
          pluginCreateNote(plugin, action, payload)
        } else if (action == 'register') {
          // register doesn't do anything here.
          // Check in the plugin-frame for the
          // register event details
        } else if (action == 'selectTrackables') {
          pluginSelectTrackable(plugin, action, payload)
        } else if (action === 'openURL') {
          openIFrameModal(payload.url, payload.title || payload.url)
        } else if (action === 'openPlugin') {
          openPluginModal(plugin)
        } else if (action === 'openNoteEditor') {
          openNoteEditor(plugin, payload)
        } else if (action === 'openTemplateURL') {
          openExternalTemplate(payload.url)
        } else if (action === 'openTrackableEditor') {
          pluginOpenTrackableEditor(plugin, payload)
        } else if (action === 'getTrackableUsage') {
          pluginGetTrackableUsage(plugin, action, payload)
        } else if (action === 'getLocation') {
          pluginGetLocation(plugin, action, payload)
        } else if (action === 'prompt') {
          pluginPrompt(plugin, payload)
        } else if (action === 'alert') {
          pluginAlert(plugin, payload)
        } else if (action === 'confirm') {
          pluginConfirm(plugin, payload)
        } else if (action === 'searchNotes') {
          pluginSearchNotes(plugin, action, payload)
        } else if (action === 'getStorageItem') {
          pluginGetStorageItem(plugin, payload)
        } else if (action === 'setStorageItem') {
          pluginSetStorageItem(plugin, payload)
        } else if (action === 'getTrackable') {
          pluginGetTrackable(plugin, payload)
        } else if (action === 'getTrackableInput') {
          pluginGetTrackableInput(plugin, payload)
        }
      }
    }
  }

  const tagToTrackable = (tag: string): Trackable => {
    const token = strToToken(tag)
    return tokenToTrackable(token, $TrackableStore.trackables)
  }

  const openNoteEditor = (plugin: PluginType, payload: any) => {
    if (payload.note) {
      let note = new NLog(payload.note)
      openLogEditor(note)
    }
  }

  const pluginGetTrackableInput = async (plugin: PluginType, payload: { id: string; tag: string; lid: string }) => {
    const trackable = tagToTrackable(payload.tag)
    let response: { value?: number; note?: string } = {}
    if (trackable.type == 'tracker') {
      const res = await getTrackerInputAsString({
        tracker: trackable.tracker,
        trackables: $TrackableStore.trackables,
        expandNote: true,
        allowSave: false,
      })
      if (res) {
        response.note = res.raw
        response.value = parseNumber(res.value)
      }
    } else if (trackable.type == 'context') {
      response.note = trackable.getNoteValue()
      response.value = trackable.ctx.duration
    } else {
      response.note = trackable.getNoteValue()
    }

    broadcast(plugin, 'getTrackableReply', {
      id: payload.id,
      lid: payload.lid,
      note: response.note,
      value: response.value,
    })
  }

  const pluginOpenTrackableEditor = (plugin: PluginType, payload: any) => {
    let trackable = $TrackableStore.trackables[payload.trackable.tag]
    if (!trackable) {
      trackable = new Trackable(payload.trackable)
    }
    openTrackableEditor(trackable)
  }

  const pluginGetTrackable = async (plugin: PluginType, payload: { id: string; tag: string; lid: string }) => {
    const trackable = tagToTrackable(payload.tag)
    broadcast(plugin, 'getTrackableReply', {
      id: payload.id,
      lid: payload.lid,
      trackable: trackable,
    })
  }

  // A function that is called when a plugin is registered to use the createNote action.
  const pluginCreateNote = async (plugin: PluginType, action: PluginUseTypes, payload: any) => {
    if (plugin.uses.includes('createNote')) {
      let log = new NLog(payload)
      saveLog(log, { silent: true })
    } else {
      throwActionNotRegistered(plugin, action)
    }
  }

  // A function that is called when a plugin wants to search notes.
  const pluginSearchNotes = async (plugin: PluginType, action: PluginUseTypes, payload: any) => {
    if (plugin.uses.includes('searchNotes')) {
      let end = dayjs(payload.date || new Date()).endOf('day')
      let daysBack = payload.daysBack > 60 ? 60 : payload.daysBack
      let start = end.subtract(daysBack, 'days').startOf('day')
      let results = await LedgerStore.query({ search: escapeRegExp(payload.term), start, end })

      broadcastPluginMessage(
        {
          action: 'searchReply',
          data: {
            id: payload.id,
            results: results.map((r: NLog) => {
              let raw: any = r.toObject()
              raw.elements = r.elements
              raw.hasNote = r.hasNote
              raw.hasTodo = r.hasTodo
              return raw
            }),
          },
        },
        plugin.id,
        payload.lid
      )
    } else {
      throwActionNotRegistered(plugin, action)
    }
  }

  const throwActionNotRegistered = (plugin: PluginType, action: any) => {
    Interact.alert(
      'Action Not Registered',
      `${action} needs to be provided in the plugins (${plugin.name}) use: [] array`
    )
  }

  const broadcastInteractReply = (type, plugin, payload, value) => {
    broadcastPluginMessage(
      {
        action: type,
        data: {
          ...payload,
          ...{
            value,
          },
        },
      },
      plugin.id,
      payload.lid
    )
  }

  const pluginConfirm = async (plugin: PluginType, payload: any) => {
    await wait(200)
    const confirmed = await Interact.confirm(payload.title, payload.message)
    broadcastInteractReply('confirmReply', plugin, payload, confirmed)
  }

  const pluginPrompt = async (plugin: PluginType, payload: any) => {
    await wait(200)
    const answer = await Interact.prompt(`${payload.title}`, `${payload.message || ''} - for ${plugin.name}`, {
      placeholder: payload.title,
      valueType: payload.type,
    })

    if (answer) {
      broadcastInteractReply('promptReply', plugin, payload, answer)
    }
  }

  const pluginAlert = async (plugin: PluginType, payload: any) => {
    await wait(200)
    const answer: any = await Interact.alert(`${payload.title}`, `${payload.message || ''} - for ${plugin.name}`)
    if (answer) {
      broadcastInteractReply('alertReply', plugin, payload, answer.value)
    }
  }

  const pluginGetStorageItem = async (plugin: PluginType, payload: any) => {
    let path = `plugins/${plugin.id}/${strToTagSafe(payload.key)}.json`
    let data: any = undefined
    try {
      data = await Storage.get(path)
    } catch (e) {
      console.error(e)
    }
    broadcast(plugin, 'getStorageItemReply', {
      id: payload.id,
      lid: payload.lid,
      value: data,
    })
  }

  const broadcast = (plugin: PluginType, action: PluginUseTypes, payload: any) => {
    broadcastPluginMessage(
      {
        action,
        data: payload,
      },
      plugin.id,
      payload.lid
    )
  }

  const pluginSetStorageItem = async (plugin: PluginType, payload: any) => {
    let path = `plugins/${plugin.id}/${strToTagSafe(payload.key)}.json`
    try {
      await Storage.put(path, payload.value)
    } catch (e) {
      console.error(e)
    }
    broadcast(plugin, 'setStorageItemReply', {
      id: payload.id,
      lid: payload.lid,
    })
  }

  const pluginSelectTrackable = async (plugin: PluginType, action: PluginUseTypes, payload: any) => {
    if (plugin.uses.includes('selectTrackables')) {
      const type = payload.type
      const selected = await selectTrackables(type, payload.multiple == false ? false : true)
      if (selected) {
        broadcastPluginMessage(
          {
            action: 'trackablesSelected',
            data: {
              id: payload.id,
              selected,
            },
          },
          plugin.id,
          payload.lid
        )
      }
    } else {
      throwActionNotRegistered(plugin, action)
    }
  }

  const pluginGetTrackableUsage = async (plugin: PluginType, action: PluginUseTypes, payload: any) => {
    if (plugin.uses.includes('getTrackableUsage')) {
      const trackable = tokenToTrackable(strToToken(payload.tag), $TrackableStore.trackables)
      payload.daysBack = payload.daysBack || 7
      let date = payload.date ? new Date(payload.date) : new Date()
      let daysBack = payload.daysBack > 90 ? 90 : payload.daysBack
      let groupByDay = payload.groupByDay ? true : false

      const dateRange = {
        end: dayjs(date),
        start: dayjs(date).subtract(daysBack, 'days'),
      }

      const trackableUsage = await queryToTrackableUsage(trackable, dateRange, $TrackableStore.trackables)
      const usage: any = groupByDay ? trackableUsage.byDay : trackableUsage
      usage.dates = usage.dates.map((djs) => djs.toDate())

      try {
        broadcastPluginMessage(
          {
            action: 'getTrackableUsageReply',
            data: {
              id: payload.id,
              trackable: trackable,
              usage: usage,
            },
          },
          plugin.id,
          payload.lid
        )
      } catch (e) {
        console.error(e)
      }
    } else {
      throwActionNotRegistered(plugin, action)
    }
  }

  const pluginGetLocation = async (plugin: PluginType, action: PluginUseTypes, payload: any) => {
    if (plugin.uses.includes('getLocation')) {
      let location: any = { lat: undefined, lng: undefined }
      try {
        location = await locate()
      } catch (e) {}
      if (location.latitude) {
        broadcastPluginMessage(
          {
            action: 'locationReply',
            data: {
              id: payload.id,
              ...{
                lat: location.latitude,
                lng: location.longitude,
              },
            },
          },
          plugin.id,
          payload.lid
        )
      }
    } else {
      throwActionNotRegistered(plugin, action)
    }
  }

  let autoLoadPlugin: Array<PluginClass> = []

  $: if ($PluginStore) {
    autoLoadPlugin = $PluginStore
      .filter((p) => {
        return p.active && !p.locked
      })
      .filter((p) => {
        return p.uses.includes('onLaunch') || p.uses.includes('onNote')
      })
  }

  let unsub: any
  onMount(() => {
    window.addEventListener('message', receiveMessage)
    unsub = LedgerStore.hook('onLogSaved', (log) => {
      broadcastPluginMessage({
        action: 'onNote',
        data: log.expanded(),
      })
    })
  })
  onDestroy(() => {
    window.removeEventListener('message', receiveMessage)
    unsub()
  })
</script>

<div id="live-plugin-holder" class="w-0 h-0 overflow-hidden">
  {#each autoLoadPlugin as plugin, index}
    <PluginFrame lid="auto" {plugin} openAction="onLaunch" />
  {/each}
</div>
