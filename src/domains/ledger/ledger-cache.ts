import dayjs from 'dayjs'
import localforage from 'localforage'

import unique from 'lodash/uniq'

import NLog from '../nomie-log/nomie-log'

const store = localforage.createInstance({
  name: 'log-cache',
})

export const saveLogToCache = async (log: NLog) => {
  const path = `${log.endDayjs().format('YYYY-MM-DD')}/${log._id}`
  return store.setItem(path, log)
}

export const deleteLogFromCache = async (log: NLog): Promise<any> => {
  try {
    const path = `${log.endDayjs().format('YYYY-MM-DD')}/${log._id}`
    return store.removeItem(path)
  } catch (e) {
    return undefined
  }
}

export const deleteAllFromCache = async () => {
  return await store.clear()
}

export const getLogChaseDates = async (): Promise<Array<Date>> => {
  const keys = await store.keys()

  const uniqueKeys = unique(keys.map((key) => key.split('/')[0])).map((key) => {
    return dayjs(`${key}`).toDate()
  })

  return uniqueKeys
}

export const getLogsFromCache = async (): Promise<Array<NLog>> => {
  // const allKeys = await store.keys()
  const logs: Array<NLog> = []
  await store.iterate(({}, value) => {
    logs.push(new NLog(value))
  })
  return logs
}

export const getLogsFromCacheByDay = async (date: Date): Promise<Array<NLog>> => {
  const _date = dayjs(date).format('YYYY-MM-DD')
  const keys = await store.keys()
  const filteredKeys = keys.filter((key) => {
    return key.search(_date) > -1
  })
  const logs = []
  for (let i = 0; i < filteredKeys.length; i++) {
    let key = filteredKeys[i]
    const log = await store.getItem(key)
    logs.push(log)
  }
  return logs.map((log) => new NLog(log))
}
