import time from '../time/time'
import { Parser } from 'expr-eval'

const prefixes: any = { context: '+', person: '@', tracker: '#' }

export type TokenTypes = 'person' | 'link' | 'generic' | 'tracker' | 'context' | 'place' | 'line-break'
export interface Token {
  id: string
  raw: string // Raw word
  prefix: string // #,@,+
  type: TokenTypes // type of trackableElement
  value?: string | number // value of the tracker
  remainder?: string //any trailing words
  uom?: string
}

export interface WordPart {
  word: string
  remainder: string // ending parts of a word, < like that comma
}

/**
 *
 * Get Parsed Value from word
 * Returns a value string from #tracker(value)
 *
 * @param {String} word
 */
function getParsedValue(word: string): ParsedStringValue {
  const wordSplit = word.split('(')
  let value = wordSplit.length === 2 ? wordSplit[1].replace(')', '') : '1'
  value = value.length ? value : '1'
  return parseStringValue(value)
}

interface ParsedStringValue {
  value: number
  uom?: string
}

/**
 * Parse String Value
 * Convert a string into a value, or a time string 01:03:44 into seconds
 * @param valueStr String
 */
function parseStringValue(valueStr: string): ParsedStringValue {
  const uomMatch = valueStr.match(/[a-z/%$]+/gi)
  const uom = uomMatch ? uomMatch[0] : undefined

  if (valueStr.match(/\+|-|\/|\*|Mod|\(|\)/)) {
    valueStr = valueStr.replace(/[a-z]+/gi, '')
    try {
      return {
        value: Parser.evaluate(valueStr),
        uom,
      }
    } catch (e) {
      return {
        value: 0,
        uom,
      }
    }
  } else if (valueStr.split('.').length === 2) {
    return {
      value: parseFloat(valueStr),
      uom,
    }
  } else if (valueStr.search(':') > -1) {
    return {
      value: time.timestringToSeconds(valueStr),
      uom: 'timer',
    }
  } else {
    return {
      value: parseInt(valueStr),
      uom,
    }
  }
}

/**
 *
 * Scrub
 * Removes common word ending characters
 *
 * @param {String} word
 */
function scrub(word: string): WordPart {
  // let uom:string;
  const cleanedWord: string = word.trim().replace(/(’s|'s|'|,|\.|!|’|\?|:)/gi, '')
  return {
    word: cleanedWord,
    remainder: word.trim().replace(cleanedWord, ''),
  }
}

/**
 *
 * toToken
 * Creates a payload that can be turned into a
 *
 * @param {String} type tracker,context,person,generic
 * @param {String} word
 * @param {String} value
 * @param {String} remainder
 */

type ToTokenProps = {
  type: TokenTypes
  word: string
  value?: any
  remainder?: any
  raw?: string
  uom?: string
}

function toToken(tokenPayload: ToTokenProps): Token {
  const { word, type, value, remainder, raw, uom } = tokenPayload
  const prefix: string = prefixes[type] || ''
  const id: string = (
    word.search(/\(/) > -1 ? word.replace(prefix, '').split('(')[0] : word.replace(prefix, '')
  ).toLowerCase()

  let finalRaw = raw || word || ''

  return {
    id,
    raw: finalRaw, // Raw word
    prefix, // #,@,+
    type, // type of trackableElement
    value, // value of the tracker
    remainder, //any trailing words
    uom,
  }
}

export const strToToken = (str: string = ''): Token | undefined => {
  const tokens = strToTokens(str)
  if (tokens.length) return tokens[0]
  return undefined
}

/**
 *
 * Parse
 * parses a string and returns an array of
 * elements
 *
 * @param {String} str
 */
export const strToTokens = (str: string = ''): Array<Token> => {
  // Split it into an array of lines
  const lines = str.split(/\r?\n/)
  const final: Array<Token> = []
  // Loop over each line
  lines.forEach((line) => {
    // Extract
    const tokens = tokenizeLite(line)
    tokens.forEach((token: Token) => {
      final.push(token)
    })
    // Add the line Break
    if (lines.length > 1) {
      final.push(toToken({ type: 'line-break', word: '' }))
    }
  })
  // Return parsed note
  return final
}

/**
 *
 * Parse a Line to an array.
 * @param {String} str
 *
 */
export const tokenizeLite = (str: string = ''): Array<Token> => {
  const wordArray: Array<string> = str.trim().replace(/\n/g, ' \n ').split(' ')
  return (
    // Split on the space
    wordArray
      .map((word: string) => {
        // Loop over each word
        const scrubbed = scrub(word) // Scrub it clean
        const parsedValueString = getParsedValue(word)

        const firstChar = word.trim().substring(0, 1)
        // switch on first character

        /**
         * Tracker Match
         */
        if (firstChar === '#' && word.length > 1) {
          /**
           * Timer Match
           */
          if (word.match(/\d\d:\d\d/)) {
            return toToken({
              type: 'tracker',
              word: word.trim(),
              value: parsedValueString.value,
              remainder: scrubbed.remainder.replace(word, ''),
              uom: parsedValueString.uom,
            })
          } else {
            return toToken({
              type: 'tracker',
              word: scrubbed.word,
              raw: word.trim(),
              value: parsedValueString.value,
              remainder: scrubbed.remainder.replace(word, '').trim(),
              uom: parsedValueString.uom,
            })
          }
        } else if (firstChar === '@' && word.length > 1) {
          /**
           * It's a Person Match
           */
          return toToken({
            type: 'person',
            word: scrubbed.word.toLowerCase(),
            raw: word.trim(),
            value: parsedValueString.value,
            remainder: scrubbed.remainder,
            uom: parsedValueString.uom,
          })
        } else if (firstChar === '+' && word.length > 1) {
          /**
           * It's a Context Match
           */
          return toToken({
            type: 'context',
            word: scrubbed.word,
            raw: word.trim(),
            value: parsedValueString.value,
            remainder: scrubbed.remainder,
            uom: parsedValueString.uom,
          })
        } else if (word.search(/(\w){3}:\/\/(\w)/) > -1) {
          return toToken({
            type: 'link',
            word: word.trim().replace(/(https|http):\/\//gi, ''),
            raw: word.trim(),
          })
        } else if (word == '\n') {
          return toToken({
            type: 'line-break',
            word: '\n',
          })
        } else if (word) {
          return toToken({
            type: 'generic',
            word: word.trim(),
          })
        }
        return undefined
      })
      .filter((word) => word)
  )
} // end parse string

// else if (firstChar === '/' && word.length > 1) {
//   /**
//    * It's a Place Match
//    */
//   return toToken({
//     type: 'place',
//     word: scrubbed.word,
//     raw: word,
//     value: parsedValueString.value,
//     remainder: scrubbed.remainder,
//     uom: parsedValueString.uom,
//   })
// }
