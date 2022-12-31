import { GoalClass } from './goal-class'
import NLog from '../nomie-log/nomie-log'
import TrackerClass from '../../modules/tracker/TrackerClass'
import dayjs from 'dayjs'
import { getDurationFromGoals } from './goal-utils'
import logsToTrackableUsage from '../usage/usage-utils'
import { test, describe, expect } from 'vitest'

// jest.mock('@stripe/firestore-stripe-payments', () => {
//   return {}
// })

// .meta.env.VITE_APP_FIRESTORE_ROOT
describe('Goals!', () => {
  const logs = [
    { end: dayjs('2021-03-07').toDate(), note: `#walk(2) #coffee(1.5)` },
    { end: dayjs('2021-03-08').toDate(), note: `#walk(2)` },
    { end: dayjs('2021-03-09').toDate(), note: `#walk(2)` },
    { end: dayjs('2021-03-10').toDate(), note: `#walk(2)` },
    { end: dayjs('2021-03-11').toDate(), note: `#coffee(5) #water(12) #mood(3)` },
    { end: dayjs('2021-03-12').toDate(), note: `#coffee(1) #mood(4) #walk(4.4)` },
    { end: dayjs('2021-03-13').toDate(), note: `#coffee(3) #water(50) #mood(5)` },
    { end: dayjs('2021-03-16').toDate(), note: `#coffee(2) #mood(6)` },
    { end: dayjs('2021-03-15').toDate(), note: `#coffee(3) #water(100) #mood(7)` },
    { end: dayjs('2021-03-16').toDate(), note: `#coffee(2) #mood(8) #walk(43)` },
    { end: dayjs('2021-03-17').toDate(), note: `#coffee(4) #water(400) #mood(5)` },
    { end: dayjs('2021-04-01').toDate(), note: `#coffee(2) #water(400) #mood(5)` },
    { end: dayjs('2021-04-02').toDate(), note: `#coffee(4.3) #sleep(40000) #mood(2)` },
    { end: dayjs('2021-04-04').toDate(), note: `#coffee(4) #water(400) #mood(5)` },
  ].map((l) => {
    return new NLog({ end: l.end, note: l.note })
  })

  for (let i = 0; i < 100; i++) {
    const date = dayjs('2021-04-04').add(1, 'day')
    const note =
      i % 5 ? `#random${Math.random.toString().replace('0.', '')} Note here` : `#coffee(2) #water(400) #mood(5)`
    logs.push(new NLog({ end: date.toDate(), note }))
  }

  const mood = new TrackerClass({ tag: 'mood', math: 'avg', emoji: '😭' })
  const coffee = new TrackerClass({ tag: 'coffee', math: 'sum', emoji: '☕️' })
  const water = new TrackerClass({ tag: 'water', math: 'sum', emoji: '💦' })
  const walk = new TrackerClass({ tag: 'walk', math: 'sum', emoji: '🚶‍♀️' })
  const empty = new TrackerClass({ tag: 'empty', math: 'sum', emoji: '🚶‍♀️' })

  let trackables = {
    '#mood': mood.toTrackable(),
    '#coffee': coffee.toTrackable(),
    '#water': water.toTrackable(),
    '#walk': walk.toTrackable(),
    '#empty': empty.toTrackable(),
  }

  const usages = logsToTrackableUsage(logs, { trackables })

  let CoffeeGoal = new GoalClass({
    duration: 'day',
    target: 2,
    comparison: 'lte',
    trackable: trackables['#coffee'],
  })

  // let EmptyGoal = new GoalClass({
  //   duration: 'day',
  //   target: 2,
  //   comparison: 'lte',
  //   trackable: trackables['#empty'],
  // })

  let WaterGoal = new GoalClass({
    duration: 'day',
    target: 40,
    comparison: 'gte',
    trackable: trackables['#water'],
  })

  // let WalkGoal = new GoalClass({
  //   duration: 'week',
  //   target: 10,
  //   comparison: 'gte',
  //   trackable: trackables['#walk'],
  // })

  // let WalkMonthGoal = new GoalClass({
  //   duration: 'month',
  //   target: 75,
  //   comparison: 'gte',
  //   trackable: trackables['#walk'],
  // })

  // test('it should get the start and end dates for a group of Goals that has a Month duration', () => {
  //   const shouldBeMonthGoals = [WalkGoal, CoffeeGoal, WaterGoal, WalkMonthGoal]
  //   const monthTimeSpan = getDurationFromGoals(shouldBeMonthGoals)
  //   expect(monthTimeSpan.start.format('YYYY-MM-DD')).toBe(dayjs().startOf('month').format('YYYY-MM-DD'))
  // })

  test('it shoudl be able to calculate the right score for the dont do', () => {
    const scores = CoffeeGoal.calculateScores(usages['#coffee'])
    expect(scores[0].percent).toBe(75)
  })

  test('it should know if its a do it or dont do it goal', () => {
    expect(CoffeeGoal.isDontDoIt).toBe(true)
    expect(WaterGoal.isDontDoIt).toBe(false)
  })

  // test('it should get the start and end dates for a group of Goals that has a Week duration', () => {
  //   const shouldBeWeekGoals = [WalkGoal, CoffeeGoal, WaterGoal]
  //   const weekTimeSpan = getDurationFromGoals(shouldBeWeekGoals)
  //   expect(weekTimeSpan.start.format('YYYY-MM-DD')).toBe(dayjs().startOf('week').format('YYYY-MM-DD'))
  // })

  test('it should get the start and end dates for a group of Goals that has a Day duration - and a custom date', () => {
    const shouldBeDayGoals = [CoffeeGoal, WaterGoal]
    const base = dayjs().add(4, 'day')
    const dayTimespan = getDurationFromGoals(shouldBeDayGoals, base)
    expect(dayTimespan.start.format('YYYY-MM-DD')).toBe(base.startOf('day').format('YYYY-MM-DD'))
  })

  test('it should get the start and end dates for a group of Goals that has a Day duration', () => {
    const shouldBeDayGoals = [CoffeeGoal, WaterGoal]
    const dayTimespan = getDurationFromGoals(shouldBeDayGoals)
    expect(dayTimespan.start.format('YYYY-MM-DD')).toBe(dayjs().startOf('day').format('YYYY-MM-DD'))
  })

  test('it should calculate the day scores for a DONTDOIT goal', () => {
    const scores = CoffeeGoal.calculateScores(usages['#coffee'])
    expect(scores.length).toBeGreaterThan(11)
  })

  // test('it should calculate Month Long Goals', () => {
  //   const scores = WalkGoal.calculateScores(usages['#walk'])
  //   expect(scores.length).toBe(1)
  // })

  test('it should calculate scores for a DO IT GOAL', () => {
    // Todo: make this mor in depth
    const scores = WaterGoal.calculateScores(usages['#water'])
    expect(scores[0].success).toBe(false)
    expect(scores[6].success).toBe(true)
  })

  test('It should work as na object', () => {
    expect(CoffeeGoal.target).toBe(2)
    expect(CoffeeGoal.duration).toBe('day')
    expect(CoffeeGoal.comparison).toBe('lte')
    expect(CoffeeGoal.trackable).toEqual(trackables['#coffee'])
    expect(GoalClass).toBeTruthy()
  })
})
