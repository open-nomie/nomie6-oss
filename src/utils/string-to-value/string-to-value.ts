import { parseNumber } from '../parseNumber/parseNumber'
import time from '../time/time'
const StringToValue = (valueStr: any) => {
  if (typeof valueStr == 'string') {
    if (valueStr.split('.').length == 2) {
      // For 1.345
      return parseNumber(valueStr)
    } else if (valueStr.search(':') > -1) {
      // For 00:00:00
      return time.timestringToSeconds(valueStr)
    } else {
      return parseInt(valueStr)
    }
  } else {
    return valueStr
  }
}

export default StringToValue
