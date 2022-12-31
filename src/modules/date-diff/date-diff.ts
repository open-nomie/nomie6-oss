export const dateDiff = (date1: Date, date2: Date, part: 'days' = 'days') => {
  // To calculate the time difference of two dates
  var timeDiff = date2.getTime() - date1.getTime()
  // To calculate the no. of days between two dates
  var dayDiff = timeDiff / (1000 * 3600 * 24)
  // return day diff
  return Math.abs(dayDiff)
}
