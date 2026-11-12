import { strToColor } from '../../modules/colors/string-to-color'

import { Trackable } from '../trackable/Trackable.class'

export type PointerType = {
  tag: string
  duration?: number
  description?: string
  reminder?: boolean
  reminderdate?: Date
  label?: string
  avatar?: string
  emoji?: string
  color?: string
}

export class PointerClass {
  tag: string
  duration?: number
  description?: string
  reminder?: boolean
  reminderdate?: Date
  label?: string
  avatar?: string
  emoji?: string
  color?: string

  constructor(starter: string | PointerType | undefined) {
    if (starter && typeof starter === 'string') {
      this.tag = starter
      this.label = starter.replace('^', '')
    } else if (starter && typeof starter === 'object') {
      // Load all properties from object, even if tag doesn't exist yet
      this.tag = starter.tag
      this.label = starter.label || starter.tag || ''
      this.duration = starter.duration || 1
      this.description = starter.description || ""
      this.reminder = starter.reminder || false
      this.reminderdate = starter.reminderdate || new Date()
      this.avatar = starter.avatar
      this.emoji = starter.emoji
      this.color = starter.color || (this.tag ? strToColor(this.tag) : undefined)
    } else {
      // Initialize defaults for new pointer
      this.label = ''
      this.description = ''
      this.reminder = false
      this.reminderdate = new Date()
    }
  }

  get asObject() {
    return JSON.parse(JSON.stringify(this))
  }

  toTrackable(): Trackable {
    return new Trackable({
      type: 'pointer',
      id: this.tag,
      ptr: this,
      value: 1,
    })
  }
}
