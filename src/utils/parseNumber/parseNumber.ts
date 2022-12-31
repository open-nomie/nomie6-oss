export const parseNumber = (value: number | string): number => {
  if (typeof value === 'number') return Math.round(100 * value) / 100

  if (typeof value === 'string' && value.search(/\./) > -1) {
    const v = parseFloat(`${value}`)
    return Math.round(100 * v) / 100
  }
  if (typeof value === 'string') return parseInt(`${value}`)
  return NaN
}
