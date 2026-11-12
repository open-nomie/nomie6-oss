//@ts-ignore
import NomieApp from './App.svelte'
import { pwService } from './modules/pwa/PWAService'

/* Initialize PWA service - handles service worker registration and update checks */
pwService.initialize()

/**
 * Setup Day JS
 */
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
import weekOfYear from 'dayjs/plugin/weekOfYear'
dayjs.extend(weekOfYear)
import advancedFormat from 'dayjs/plugin/advancedFormat'
dayjs.extend(advancedFormat)
import dayOfYear from 'dayjs/plugin/dayOfYear'
dayjs.extend(dayOfYear)
import isoWeek from 'dayjs/plugin/isoWeek'
dayjs.extend(isoWeek)

const app = new NomieApp({
  target: document.body,
})

export default app
