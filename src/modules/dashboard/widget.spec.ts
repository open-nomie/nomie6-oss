import { WidgetClass } from '../../domains/dashboard2/widget/widget-class'
import NDate from '../../utils/ndate/ndate'
import { it, describe, expect } from 'vitest'
let weekMoodWidget: any = {
  dateFormat: 'MMM Do YYYY',
  includeAvg: false,
  timeFormat: 'h:mm A',
  type: 'barchart',
  id: '1bd372e4e536f3601093f805947ed45a',
  size: 'md',
  timeRange: {
    label: 'This Week',
    start: {
      startOf: 'week',
    },
    end: {
      endOf: 'week',
    },
    id: 'this-week',
  },
  element: {
    id: 'mood',
    type: 'tracker',
    raw: '#mood',
    prefix: '#',
  },
  math: 'mean',
}

let moodWidget = new WidgetClass(weekMoodWidget)

describe('widget test suite', () => {
  it('should be an Widget', () => {
    expect(moodWidget).toBeInstanceOf(WidgetClass)
  })
  it('should get things for Sunday users', () => {
    let start = NDate.getFirstDayOfWeek()
    let end = NDate.getLastDayOfWeek()
    let dateRange = moodWidget.getDateRange('sunday')
    expect(start.format('YYYY-MM-DD')).toBe(dateRange[0].format('YYYY-MM-DD'))
    expect(end.format('YYYY-MM-DD')).toBe(dateRange[1].format('YYYY-MM-DD'))
    expect(moodWidget.getTitle()).toBe('mood')
    expect(moodWidget.isValid()).toBe(true)
    expect(moodWidget.timeFormat).toBe('h:mm a')
    expect(start.format('ddd')).toBe('Sun')
    expect(end.format('ddd')).toBe('Sat')
  })

  it('should get things for Monday users', () => {
    NDate.setFirstDayOfWeek('monday')
    let start = NDate.getFirstDayOfWeek()
    let end = NDate.getLastDayOfWeek()
    let dateRange = moodWidget.getDateRange('monday')
    expect(start.format('ddd')).toBe('Mon')
    expect(end.format('ddd')).toBe('Sun')
    expect(start.format('YYYY-MM-DD')).toBe(dateRange[0].format('YYYY-MM-DD'))
    expect(end.format('YYYY-MM-DD')).toBe(dateRange[1].format('YYYY-MM-DD'))
  })
})
