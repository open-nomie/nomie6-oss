import appConfig from '../../config/appConfig'
import { writable } from 'svelte/store'
import type { MessagesState, MessageType } from './message.td'
import { openMarkdownModal } from '../../components/markdown-modal/MarkdownModalStore'

function createMessageStore() {
  const state: MessagesState = {
    messages: [],
    loading: true,
    unseen: 0,
    lastSeenDate: new Date(localStorage.getItem('last-message-date') || new Date('1/1/1969')),
    activeMessage: undefined,
  }
  const { subscribe, update, set } = writable(state)

  const closeModal = () => {
    update((s) => {
      s.activeMessage = undefined
      return s
    })
  }

  /**
   * Remember the Last Date
   * This will record the last seen date
   * so we can calculate how many new unseen there are
   */
  const rememberSeenDate = () => {
    const seenDate = new Date()
    localStorage.setItem('last-message-date', seenDate.toJSON())
    update((s) => {
      s.lastSeenDate = seenDate
      return s
    })
  }

  const readMessage = (message: MessageType) => {
    openMarkdownModal({ title: message.subject, path: message.content })
    update((s) => {
      message.unseen = false
      s.activeMessage = message
      s.unseen = s.messages.filter((m) => m.unseen).length
      return s
    })
  }

  /**
   * Load Messages
   * This pulls messages from the CDN
   */
  const loadMessages = async () => {
    update((s) => {
      s.loading = true
      return s
    })
    try {
      const call = await fetch(`${appConfig.messages_url}?date=${new Date().getTime()}`)
      const messages: Array<MessageType> = (await call.json())
        .map((msg: MessageType) => {
          msg.created = new Date(msg.created)
          msg.unseen = msg.created > state.lastSeenDate
          return msg
        })
        .sort((a, b) => (a.created > b.created ? -1 : 1))

      update((s) => {
        s.loading = false
        s.messages = messages
        s.unseen = messages.filter((m) => m.unseen).length
        return s
      })
    } catch (e) {
      update((s) => {
        s.loading = false
        return s
      })
      console.error(`Error getting messages from CDN`)
      console.error(e)
    }
  }

  return {
    rememberSeenDate,
    closeModal,
    loadMessages,
    subscribe,
    set,
    readMessage,
  }
}

export const MessageStore = createMessageStore()
