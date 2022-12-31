import CalendarViewModal from './calendar-view-modal.svelte'
import type { Trackable } from '../trackable/Trackable.class'
import type { TrackableUsage } from '../usage/trackable-usage.class'
import { openModal } from '../../components/backdrop/BackdropStore2'
import { writable } from 'svelte/store'

export type CalendarViewProps = {
  date?: Date
  trackable?: Trackable
  trackableUsage?: TrackableUsage
  show?: boolean
}

export const CalendarViewStore = writable<CalendarViewProps>({})

export const openCalendarView = (props: CalendarViewProps) => {
  props.date = props.date || new Date()
  openModal({
    id: `calendarview-modal-${props.date.toDateString()}`,
    position: 'fullscreen',
    component: CalendarViewModal,
    componentProps: {
      props,
    },
  })
  CalendarViewStore.update((s) => {
    return { ...props, ...{ show: true } }
  })
}
export const closeCalendarView = () => {
  CalendarViewStore.update((s) => {
    return { show: false }
  })
}
