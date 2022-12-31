import { getDurationFromGoals, getTimespanFromGoal } from './goal-utils'

import type { Dayjs } from 'dayjs'
import { GoalClass } from './goal-class'
import GoalDetailModal from './goal-details-modal.svelte'
import GoalEditorModal from './goal-editor-modal.svelte'
import type { GoalScoreType } from './goal-class'
import type { GoalType } from './goal-class'
import type { ITrackables } from '../trackable/trackable-utils'
import { Interact } from '../../store/interact'
import { MasterTrackables } from '../trackable/TrackableStore'
import NPaths from '../../paths'
import Storage from '../../domains/storage/storage'
import type { TrackableUsage } from '../usage/trackable-usage.class'
import { createArrayStore } from '../../store/ArrayStore'
import { createLSStore } from '../../store/LSStore'
import dayjs from 'dayjs'
import { openModal } from '../../components/backdrop/BackdropStore2'
import { queryToUsageMap } from '../ledger/LedgerStore'
import { showConfetti } from '../../components/confetti/ConfettiStore'
import { showToast } from '../../components/toast/ToastStore'
import { wait } from '../../utils/tick/tick'
import { writable } from 'svelte/store'
import { trackEvent } from '../usage/stat-ping'

export type GoalUsageResponseType = {
  id: string
  goal: GoalClass
  scores: undefined | Array<GoalScoreType>
  trackableUsage: TrackableUsage
  historic: Array<{ date: Dayjs; score: GoalScoreType }>
}

export type TodaysGoalsType = { today: undefined | 'success' | 'failure'; goal: GoalClass }

/**
 * Create overall GoalStore to hold goals array
 */
// export const GoalStore = writable<Array<TodaysGoalsType> | undefined>(undefined)

export const GoalStore = createArrayStore(NPaths.storage.goals(), {
  label: 'Goals',
  key: 'id',
  itemInitializer: (item) => {
    return new GoalClass(item)
  },
  itemSerializer: (goal: GoalClass) => {
    return goal
  },
})

/**
 * Create a Store for the Modals
 */
export const GoalModalStore = writable({
  editor: undefined as GoalClass | undefined,
  detail: undefined as GoalClass | undefined,
})

/**
 * Init Goals
 * get the goals from storage and update
 */

let masterGoals: Array<GoalClass> = []

type SavedGoalScoreType = {
  goalId: string
  success: boolean
  failure: boolean
  date: string
}

export const GoalScoreStore = writable([0, 0])
export const GoalStatusStore = createLSStore('/goal-status')

/**
 * It takes a list of goals, a list of trackables, and a date, and returns a list of goal scores
 * @param goals - Array<GoalClass> - This is an array of GoalClass objects.
 * @param {ITrackables} trackables - ITrackables - this is the trackables object that you get from the
 * TrackablesStore
 * @param options - { silent?: boolean; caller?: string } = { silent: false, caller: 'unknown' }
 */

export const loadGoalsForToday = async (
  goals: Array<GoalClass>,
  trackables: ITrackables,
  options: { silent?: boolean; caller?: string } = { silent: false, caller: 'unknown' }
) => {
  const savedState: {
    [key: string]: SavedGoalScoreType
  } = GoalStatusStore.rawState() || {}

  // Get Usage from Goals
  let results: Array<GoalUsageResponseType> = await getGoalUsage(goals, trackables, dayjs())

  // lets calculate successes and totals

  let successes = 0

  results.forEach((res) => {
    if (res.scores.length) {
      if (res.scores[0].success) successes = successes + 1
    } else if (res.goal.isDontDoIt) {
      successes = successes + 1
    }
  })

  // Update the Score Store
  // GoalScoreStore.update((s) => [successes, total])
  const showSuccess = (goal: GoalClass) => {
    showToast({ type: 'success', message: `🎉 Congrats! You met your ${goal.tag} goal!` })
    showConfetti()
  }
  const showFailure = (goal) => {
    showToast({ type: 'failure', message: `Keep working on that ${goal.tag} goal!` })
  }

  /**
   * Lets see how we all compare
   */
  results.forEach((res) => {
    // Can we find it in the saved cached?
    // let fromSaved = saved.find((s) => s.goalId == res.goal.id)
    let fromSaved = savedState[res.goal.id]
    const score = res.scores[0]

    // If we have it in the saved
    if (fromSaved) {
      if (score) {
        // is it today?
        if (dayjs(fromSaved.date).format('YYYY-MM-DD') === score.date.format('YYYY-MM-DD')) {
          if (score.success && score.success !== fromSaved.success) {
            // We went from no Success to Success
            showSuccess(res.goal)
          } else if (score.failure === true && score.failure != fromSaved.failure) {
            // We went from no Success to Success
            showFailure(res.goal)
          }
        }
      }
    } else if (score && res.goal) {
      // It wasnt from Saved - so its new.
      if (score.success === true) {
        showSuccess(res.goal)
      } else if (score.failure === true) {
        showFailure(res.goal)
      }
    }
  }) // end looping over results

  const updatedScores: Array<SavedGoalScoreType> = results
    .map((res) => {
      let failure = false
      let success = false

      if (res.scores[0]) {
        failure = res.scores[0].failure
        success = res.scores[0].success
      } else if (res.goal.isDontDoIt) {
        // It's a don't do it - and they haven't done it
        success = true
        failure = false
      }

      return {
        goalId: res.goal.id,
        date: res.scores.length ? res.scores[0].date.toDate().toJSON() : new Date().toJSON(),
        success: success,
        failure: failure,
      }
    })
    .filter((s) => s)

  let map = {}
  updatedScores.map((s) => {
    map[s.goalId] = s
  })
  GoalStatusStore.updateSync((s) => {
    return { ...s, ...map }
  })
}

/**
 * Open a Goal Detail Modal
 * @param goal
 */
export const openGoalDetail = (goal: GoalClass) => {
  openModal({
    id: `goal-${goal.id}`,
    position: 'fullscreen',
    componentProps: {
      goal,
    },
    component: GoalDetailModal,
  })
}

/**
 * Open Editor Modal
 * @param goal
 */
export const openGoalEditor = (goal?: GoalClass) => {
  trackEvent('open_goal_editor');
  openModal({
    id: `goal-${goal.id}-editor`,
    position: 'fullscreen',
    componentProps: {
      goal,
    },
    component: GoalEditorModal,
  })
}

/**
 * Get Goal Usage
 * Takes an array of goals and trackables
 * and gets all logs needed to figure out
 * who did what
 * @param goals
 * @param trackables
 * @returns Array GoalUsageResponseType
 */
export const getGoalUsage = async (
  _goals: Array<GoalClass>,
  trackables,
  date?: Dayjs
): Promise<Array<GoalUsageResponseType>> => {
  const goals = _goals.filter((g) => g)
  if (goals.length) {
    const timespan = getDurationFromGoals(goals || [], date)
    const usages = await queryToUsageMap({ start: timespan.start, end: timespan.end }, trackables)
    const goalUsages = goals.map((goal: GoalClass) => {
      const goalTimespan = getTimespanFromGoal(goal)
      const usage = usages[goal.tag]
      const truncatedUsage = usage ? usage.truncate(goalTimespan.start, goalTimespan.end) : undefined
      const scores = goal.calculateScores(truncatedUsage)
      const response: GoalUsageResponseType = {
        id: goal.id,
        goal,
        scores,
        trackableUsage: truncatedUsage,
        historic: [],
      }
      return response
    })
    let successes = 0
    goalUsages.forEach((gu) => {
      if ((!gu.scores.length && gu.goal.isDontDoIt) || (gu.scores.length && gu.scores[0].success === true)) {
        successes = successes + 1
      }
    })

    const newScore = [successes, goals.length]

    wait(200).then(() => GoalScoreStore.update((s) => newScore))

    return goalUsages
  } else {
    return []
  }
}
