import { writable } from 'svelte/store'
import { parseNumber } from '../../utils/parseNumber/parseNumber'

const launchCount: number = parseNumber(localStorage.getItem('launchCount') || '1')
export const LaunchCount = writable(launchCount)

export const trackLaunch = () => {
  localStorage.setItem('launchCount', `${launchCount + 1}`)
}
