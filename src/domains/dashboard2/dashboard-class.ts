/**
 * Dec 23 2021 - Brandon
 * Dashboard Class is a object for working with a dashboard
 * this will automatically construct widgets from a generic
 * dashboard payload from storage
 */

import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

import nid from '../../modules/nid/nid'
import { objectHash } from '../../modules/object-hash/object-hash'

import type { WidgetPayloadType } from './widget/widget-class'
import { WidgetClass } from './widget/widget-class'

export type DashboardPayload = {
  label: string
  widgets: Array<WidgetPayloadType>
  id: string
  created?: string
}

export class DashboardClass {
  label: string
  widgets: Array<WidgetClass>
  id: string
  created: Date

  constructor(starter: DashboardPayload | DashboardClass) {
    this.id = starter.id || nid()
    this.widgets = (starter.widgets || []).map((widgetPayload: WidgetPayloadType) => new WidgetClass(widgetPayload))
    this.created = starter.created ? new Date(starter.created) : new Date()
    this.label = starter.label || 'Unnamed'
  }

  get hash(): string {
    return objectHash(this.widgets)
  }

  /**
   * Returns the frame needed for
   * covering all the widgets - we will then use that to get all notes
   * for said timeframe
   */
  get timeframe(): { start: Dayjs; end: Dayjs } {
    let earliest: Dayjs = dayjs().add(100, 'years')
    let latest: Dayjs = dayjs().subtract(100, 'years')

    this.widgets.forEach((w: WidgetClass) => {
      if (w.timeframe.start.toDate().getTime() < earliest?.toDate()?.getTime()) {
        earliest = w.timeframe?.start
      }
      if (w.timeframe?.end.toDate()?.getTime() > latest?.toDate()?.getTime()) {
        latest = w.timeframe?.end
      }
    })

    return {
      start: earliest,
      end: latest,
    }
  }
}
