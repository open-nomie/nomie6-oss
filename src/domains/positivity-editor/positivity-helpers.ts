import type { PositivityType } from '../../config/appConfig'
import appConfig from '../../config/appConfig'
import { openDropMenu } from '../../components/menu/useDropmenu'

export const openScoreSelectMenu = (target): Promise<PositivityType> => {
  return new Promise((resolve, reject) => {
    openDropMenu(
      target,
      appConfig.positivity
        .sort((a, b) => (a.score < b.score ? 1 : -1))
        .map((pos) => {
          return {
            title: pos.label,
            emoji: pos.emoji,
            click() {
              resolve(pos)
            },
          }
        })
    )
  })
}
