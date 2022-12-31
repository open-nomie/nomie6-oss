import type { ITrackers } from '../../modules/import/import'
import type Record from '../../domains/nomie-log/nomie-log'
import ScoreNote from '../../modules/scoring/score-note'
import appConfig from '../../config/appConfig'
import type { PositivityType } from '../../config/appConfig'
import { openDropMenu } from '../../components/menu/useDropmenu'
import { openPopMenu, PopMenuButton } from '../../components/pop-menu/usePopmenu'

export interface IPositivityResults {
  positive: number
  negative: number
  neutral: number
  total: number
  byHour: Array<number>
}
export interface IPositivityEmoji {
  emoji: string
  score: number
}

export const getPositivityMenu = (onSelect:Function):Array<PopMenuButton>=>{
  return appConfig.positivity
        .sort((a, b) => (a.score < b.score ? 1 : -1))
        .map((pos) => {
          return {
            title: pos.label,
            emoji: pos.emoji,
            click() {
              onSelect(pos)
            },
          }
        })
}

export const selectPositivityPopmenu = (score:number)=>{
 return new Promise((resolve)=>{
   openPopMenu({
    title: 'Select Positivity',
    id: 'select-positivity',
    buttons: getPositivityMenu(resolve)
   })
 })
}

export const selectPositivity = (target): Promise<PositivityType> => {
  return new Promise((resolve) => {
    openDropMenu(
      target,
      getPositivityMenu(resolve)
    )
  })
}

export function getEmojiFromScore(_score: number, onlyEmoji: boolean = false): IPositivityEmoji | string {
  let score = typeof _score == 'number' ? _score : 0;
  if (score < -2) {
    score = -2
  } else if (score > 2) {
    score = 2
  } else if (score === undefined) {
    score = 0
  }
  let match = appConfig.positivity.find((es: IPositivityEmoji) => {
    return es.score == score
  })
  if (match) {
    return onlyEmoji ? match.emoji : match
  }
}

export function positivityFromLogs(logs: Array<any>, trackers: ITrackers): IPositivityResults {
  let positive = 0
  let negative = 0
  let neutral = 0
  let total = 0

  let byHour = Array(24).fill(0);

  logs.forEach((row: Record) => {
    let score = row.score || ScoreNote(row.note, row.end, trackers)
    if (score == 0) {
      neutral++
    } else if (score > 0) {
      positive = positive + score
    } else {
      negative = negative + Math.abs(score)
    }
    total++
    let hour = row.endDayjs().hour();
    byHour[hour] = byHour[hour]+score;
  })
  return { positive, negative, neutral, total, byHour }
}
