import type { AwardConfig } from './award.class'

export const getAwardById = (id: string): AwardConfig => {
  return usageAwards.find((a) => a.id == id)
}

export const usageAwards: Array<AwardConfig> = [
  {
    id: 'open-streak-1',
    name: '1 Day Open Streak',
    value: 0.01,

    config: {
      type: 'open-streak',
      days: 1,
    },
  },
  {
    id: 'open-streak-2',
    name: '2 Day Open Streak',
    value: 0.02,

    config: {
      type: 'open-streak',
      days: 2,
    },
  },
  {
    id: 'open-streak-7',
    name: '7 Day Open Streak',
    value: 0.05,

    config: {
      type: 'open-streak',
      days: 7,
    },
  },
  {
    id: 'open-streak-14',
    name: '14 Day Open Streak',
    value: 0.1,

    config: {
      type: 'open-streak',
      days: 14,
    },
  },
  {
    id: 'open-streak-30',
    name: '30 Day Open Streak',
    value: 0.6,

    config: {
      type: 'open-streak',
      days: 30,
    },
  },
  {
    id: 'open-streak-90',
    name: '90 Day Open Streak',
    value: 1,

    config: {
      type: 'open-streak',
      days: 90,
    },
  },
  {
    id: 'usage-1-year',
    name: '1 Year of Nomie',
    value: 0.6,

    config: {
      type: 'usage-length',
      days: 365,
    },
  },
  {
    id: 'usage-2-year',
    name: '2 Years of Nomie',
    value: 0.6,

    config: {
      type: 'usage-length',
      days: 365 * 2,
    },
  },
  {
    id: 'usage-3-year',
    name: '3 Years of Nomie',
    value: 0.6,

    config: {
      type: 'usage-length',
      days: 365 * 3,
    },
  },
  {
    id: 'usage-4-year',
    name: '4 Years of Nomie',
    value: 0.6,

    config: {
      type: 'usage-length',
      days: 365 * 4,
    },
  },
  {
    id: 'usage-5-year',
    name: '5 Years of Nomie',
    value: 0.6,

    config: {
      type: 'usage-length',
      days: 365 * 5,
    },
  },
  {
    id: 'usage-6-year',
    name: '6 Years of Nomie',
    value: 0.6,

    config: {
      type: 'usage-length',
      days: 365 * 6,
    },
  },
  {
    id: 'usage-7-year',
    name: '7 Years of Nomie',
    value: 0.6,

    config: {
      type: 'usage-length',
      days: 365 * 7,
    },
  },
  {
    id: 'usage-8-year',
    name: '8 Years of Nomie',
    value: 0.6,

    config: {
      type: 'usage-length',
      days: 365 * 8,
    },
  },
  {
    id: 'usage-9-year',
    name: '9 Years of Nomie',
    value: 0.6,

    config: {
      type: 'usage-length',
      days: 365 * 9,
    },
  },
  {
    id: 'usage-10-year',
    name: 'A decade of Nomie',
    value: 0.6,
    config: {
      type: 'usage-length',
      days: 365 * 10,
    },
  },
  {
    id: 'award-creator',
    name: 'The Creator',
    reason: 'Created a tracker',
    value: 0.8,
  },
  {
    id: 'award-wordsmith',
    name: 'Wordsmith',
    value: 0.7,
  },
]
