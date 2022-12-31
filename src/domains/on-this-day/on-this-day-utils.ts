import extractor from '../../utils/extract/extract'
import math from '../../utils/math/math'

export function hasNote(str, fuzzy: boolean = true): boolean {
  let parsed = extractor.parse(str, { includeGeneric: true })
  let generic = parsed.filter((tElement) => {
    return tElement.type == 'generic'
  })
  let percentage = math.percentage(parsed.length, generic.length)

  if (generic.length === 0) {
    return false
  } else if (percentage >= 20) {
    return true
  } else {
    return false
  }
}
