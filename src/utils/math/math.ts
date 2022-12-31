import calculate from '../calculate/calculate'
import mean from 'lodash/mean'
import min from 'lodash/min'
import sum from 'lodash/sum'
import max from 'lodash/max'
import random from 'lodash/random'
import round from 'lodash/round'
import sample from 'lodash/sample'

import evaluate from 'math-expression-evaluator'

export default {
  evaluate(str: string): number {
    return evaluate(str)
  },
  // Sum an array
  sum: (arr: Array<number>) => {
    return (arr || []).length ? sum(arr) : 0
  },
  // Round a number
  round: (num: number, amount?: number): number => {
    amount = amount || 100
    return Math.round(amount * num) / amount
  },
  // Get max from array
  max: (arr: Array<number>): number => {
    return (arr || []).length ? max([...arr]) : 0
  },
  // Get the min from array
  min: (arr, includeZero = false): number => {
    if (arr.length) {
      arr = includeZero == true ? arr : arr.filter((a) => a)
      return min(arr)
    } else {
      return 0
    }
  },
  // Average an Array
  average: (arr: Array<number>, ignoreZeros?: boolean): number => {
    arr = arr || [0]
    arr = arr.length ? arr : [0]
    if (ignoreZeros) {
      arr = ignoreZeros ? arr.filter((row) => row) : arr
    }
    return round(mean(arr), 2) || 0
  },
  // Get the percentage of 2 numbers
  percentage: (n1, n2, flip?: boolean): number => {
    if (flip) {
      return round(((n1 - n2) / n1) * 100)
    } else {
      return round(100 - ((n1 - n2) / n1) * 100)
    }
  },
  // Random Range from to numbers
  random_range: (min: number, max: number): number => {
    return random(min, max)
  },
  // Random from Array
  random: (arr: Array<any>): any => {
    return sample(arr)
  },

  percentile(arr): Array<number> {
    const total = this.sum(arr)
    return arr.map((v: number) => {
      return this.percentage(total, v)
    })
  },
  trustfulNumber(number, def): number {
    return isNaN(number) ? def : number
  },
  isNumber(check): boolean {
    return !isNaN(check) && check !== null && check !== undefined
  },
  isInt(n): boolean {
    return Number(n) === n && n % 1 === 0
  },
  isFloat(n): boolean {
    return Number(n) === n && n % 1 !== 0
  },
  calculate(calcArray): number {
    return calculate(calcArray)
  },
}

export const centsToDollars = (cents: number) => {
  return cents / 100
}

export const centsToFormatedDollar = (cents: number) => {
  return `$${centsToDollars(cents).toFixed(2)}`
}
