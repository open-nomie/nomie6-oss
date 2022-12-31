import type AwardChain from './award-chain.class'
import type { AwardConfig } from './award.class'
import Award from './award.class'
import { usageAwards } from './usage-awards'

export type AppOpenStreakProps = { lastOpened: Date; streak: number }

type UsageAwardFactoryProps = {
  existingAwards: Array<Award>
  daysUsing: number
  streakDays: number
  chain: AwardChain
}

export const usageAwardFactory = (props: UsageAwardFactoryProps): Array<Award> => {
  const newAwards = usageAwards
    .filter((a: AwardConfig) => {
      return !props.chain.chain.find((ca) => ca.id === a.id)
    })
    .filter((a: AwardConfig) => {
      if (a.config?.type === 'open-streak') {
        return props.streakDays >= a.config.days
      } else if (a.config?.type === 'usage-length') {
        return props.daysUsing >= a.config.days
      } else {
        return false
      }
    })
    .map((a: AwardConfig) => {
      return new Award(a)
    })

  return newAwards
}
