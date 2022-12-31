import { strToColor } from '../../modules/colors/string-to-color'

import { Trackable } from '../trackable/Trackable.class'

export type ContextType = {
  tag: string
  duration?: number
  label?: string
  avatar?: string
  emoji?: string
  color?: string
}

export class ContextClass {
  tag: string
  duration?: number
  label?: string
  avatar?: string
  emoji?: string
  color?: string

  constructor(starter: string | ContextType | undefined) {
    if (starter && typeof starter === 'string') {
      this.tag = starter
      this.label = starter.replace('+', '')
    } else if (starter && typeof starter === 'object' && starter.tag) {
      this.tag = starter.tag
      this.label = starter.label || starter.tag
      this.duration = starter.duration || 1
      this.avatar = starter.avatar
      this.emoji = starter.emoji
      this.color = starter.color || strToColor(this.tag)
    }
  }

  get asObject() {
    return JSON.parse(JSON.stringify(this))
  }

  toTrackable(): Trackable {
    return new Trackable({
      type: 'context',
      id: this.tag,
      ctx: this,
      value: 1,
    })
  }
}
