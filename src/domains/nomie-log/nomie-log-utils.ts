import { tokenizeLite } from '../../modules/tokenizer/lite'
import math from '../../utils/math/math'

export const notePercentage = (str: string): number => {
  const tokens = tokenizeLite(str)
  const generics = tokens.filter((t) => t.type === 'generic').length
  return Math.round(100 * math.percentage(tokens.length, generics)) / 100
}

export const isTextNote = (str: string): boolean => {
  return notePercentage(str) >= 50
}

export const isDataNote = (str: string): boolean => {
  return notePercentage(str) < 50
}

export const isLongFormat = (str: string): boolean => {
  if (str.split(' ').length < 5) return false
  return isTextNote(str)
}
