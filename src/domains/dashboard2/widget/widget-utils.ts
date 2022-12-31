import type { WidgetClass } from './widget-class'
import type { IWidgetType } from './widget-types'

export function canSaveWidget(testWidget: WidgetClass, widgetTypes:Array<IWidgetType>): boolean {
  let type = widgetTypes.find((wdgt) => wdgt.id == testWidget.type)
  if (type) {
    let required = type.requires
    if (required.indexOf('token') > -1 && !testWidget.token) {
      console.info('Select a trackable element to display')
      return false
    }
    // @ts-ignore
    if (required.indexOf('element') > -1 && !testWidget.token) {
      console.info('Select a trackable element to display')
      return false
    }
    if (required.indexOf('timeframe') > -1 && !testWidget.timeRange) {
      console.info('This widget requires a timeframe')
      return false
    }
  } else {
    console.info('Select a Widget Type')
    return false
  }
  return true
}
