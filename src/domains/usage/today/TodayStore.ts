import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

import { writable } from 'svelte/store'
import { objectHash } from '../../../modules/object-hash/object-hash'

import type { ITrackables } from '../../ledger/ledger-tools'
import { LedgerStore } from '../../ledger/LedgerStore'

import logsToTrackableUsage from '../usage-utils'
import type { TrackableUsageMap } from '../trackable-usage.class'

type TodayStoreStateType = {
  date: Dayjs
  usage: TrackableUsageMap
  usageHash: string
  showController: boolean
}

type LoadTodayProps = {
  date?: Dayjs | Date | number
  knownTrackables: ITrackables
  showController?: boolean
}

const initialState: TodayStoreStateType = {
  date: dayjs(),
  usage: {},
  usageHash: '',
  showController: false,
}

export const TodayStore = writable(initialState)

export const goBackInTime = () => {
  TodayStore.update((s) => {
    s.showController = true
    return s
  })
}

export const loadToday = async (props: LoadTodayProps) => {
  const date = dayjs(props.date || new Date())
  const logs = await LedgerStore.query({ start: date.startOf('day'), end: date.endOf('day'), caller: 'today-store' })
  const usage = logsToTrackableUsage(logs, { trackables: props.knownTrackables || {}, caller: '$TodayStore.loadToday' })

  // Update Store
  TodayStore.update((s) => {
    s.date = date
    s.usage = usage
    s.usageHash = objectHash(usage)
    if (props.showController === false) {
      s.showController = false
    }
    return s
  })
}
