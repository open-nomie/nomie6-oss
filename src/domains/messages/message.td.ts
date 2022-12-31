export type MessageType = {
  created: string | Date
  subject: string
  content: string
  unseen: boolean
}

export type MessagesState = {
  messages: Array<MessageType>
  loading: boolean
  unseen: number
  lastSeenDate: Date
  activeMessage: MessageType | undefined
}
