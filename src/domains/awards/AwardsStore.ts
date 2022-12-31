import type { AppOpenStreakProps } from './helpers/award-utils'
import Award from './helpers/award.class'
import AwardChain from './helpers/award-chain.class'
import { Interact } from '../../store/interact'
import { LedgerStore } from '../ledger/LedgerStore'
import NewAwardModal from './new-awards-modal.svelte'
import Storage from '../../domains/storage/storage'
import { dateDiff } from '../../modules/date-diff/date-diff'
import dayjs from 'dayjs'
import { openModal } from '../../components/backdrop/BackdropStore2'
import { usageAwardFactory } from './helpers/award-utils'
import { usageAwards } from './helpers/usage-awards'
import { wait } from '../../utils/tick/tick'
import { writable } from 'svelte/store'
import NPaths from '../../paths'
import { trackEvent } from '../usage/stat-ping'

type AwardStoreProps = {
  ready: boolean
  saving: boolean
  chain?: AwardChain
  awards: Array<Award>
  newAwards: Array<Award>
}

const AwardStoreState: AwardStoreProps = {
  chain: undefined,
  ready: false,
  saving: false,
  awards: [],
  newAwards: [],
}

export const AwardStore = writable(AwardStoreState)

AwardStore.subscribe((store) => {
  if (store.newAwards.length) {
    trackEvent('new-awards')
    openModal({
      id: `new-awards`,
      component: NewAwardModal,
      position: 'bottom',
      componentProps: {},
    })
  }
})

/**
 * Initiialize the Award Store
 */
export const initAwardStore = async () => {
  const chain = new AwardChain(Storage.getEngine(), NPaths.storage.awards())
  await chain.open()

  AwardStore.update((s) => {
    s.chain = chain
    s.ready = true
    s.awards = chain.chain
    s.newAwards = []
    return s
  })

  // Wait some time for the awards
  await wait(1000)
  awardMonitorAppOpened(chain)
}

export const getAwardChain = (): AwardChain => {
  return getState().chain
}

const getState = (): AwardStoreProps => {
  let state: AwardStoreProps
  AwardStore.update((s) => {
    state = s
    return s
  })
  return state
}

export const giveAward = (id: string) => {
  const state = getState()
  const availableAwards = usageAwards.filter((ua) => {
    return !state.awards.find((sa) => sa.id == ua.id)
  })
  let foundAvailable = availableAwards.find((aa) => aa.id === id)
  if (!state.chain.getById(id) && foundAvailable) {
    AwardStore.update((s) => {
      let award = new Award(foundAvailable)
      award.reason = 'Created a tracker'
      s.newAwards = [award]
      return s
    })
  }
}

/**
 * Monitor for New Usage Awards
 * @param chain
 */
export const awardMonitorAppOpened = async (chain: AwardChain) => {
  // Setup Dates - first day opened and now
  const firstDate = (await LedgerStore.getFirstDate(false)).toDate()
  const nowDjs = dayjs(new Date())

  // Set a default Streak if one doesnt exist
  const defaultStreak: AppOpenStreakProps = {
    lastOpened: nowDjs.startOf('day').toDate(),
    streak: 0,
  }
  // Get the Streak From Storage
  const openStreak: AppOpenStreakProps = (await Storage.get('open-streak.json')) || defaultStreak

  // Calculate number of days this user has been using nomie
  const daysUsing = Math.floor(dateDiff(firstDate, new Date()))
  // Find the last Day opened -
  const lastDayOpened = dayjs(openStreak.lastOpened).startOf('day')
  // Get Now Start of Day
  const nowDay = nowDjs.startOf('day')
  const lastOpenedHoursAgo = Math.abs(lastDayOpened.diff(nowDay, 'hours'))
  // If its 24 hours, then we opened it the next day
  if (lastOpenedHoursAgo == 24) {
    openStreak.streak = openStreak.streak + 1
  } else if (lastOpenedHoursAgo > 24) {
    // If its longer than 24 hours - break the chain - set it back to zero
    openStreak.streak = 0
  }
  openStreak.lastOpened = new Date()

  AwardStore.update((s) => {
    const newAwards = usageAwardFactory({
      existingAwards: s.awards,
      chain,
      streakDays: openStreak.streak,
      daysUsing,
    })

    s.newAwards = newAwards
    return s
  })

  // Save the update
  Storage.put('open-streak.json', openStreak)
}

/**
 * See if any new Awards need to be minted
 * @param type
 * @param days
 * @returns
 */

export const saveNewAwards = async () => {
  // Get awards and Chain
  let awardsToSave: Array<Award> = []
  let chain: AwardChain
  // Block UI
  Interact.blocker('Saving...')
  // Update the Store
  AwardStore.update((s: AwardStoreProps) => {
    s.saving = true
    awardsToSave = s.newAwards
    chain = s.chain
    return s
  })
  // Save them
  let saved = []
  for (let i = 0; i < awardsToSave.length; i++) {
    await chain.add(awardsToSave[i]).then(() => {
      saved.push(awardsToSave[i])
    })
  }
  // Stop BLocking UI
  Interact.stopBlocker()
  await wait(200)

  AwardStore.update((s) => {
    s.saving = false
    s.chain = chain
    s.awards = chain.chain
    s.newAwards = []
    return s
  })

  return
}
