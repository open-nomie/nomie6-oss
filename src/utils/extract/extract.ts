import snakeCase from '../snake-case/snake-case'

// import { tokenize } from 'nomie-utils'

import { tokenizeLite } from '../../modules/tokenizer/lite'
import type { Token } from '../../modules/tokenizer/lite'
// import { tokenizeDeep } from '../../modules/tokenizer/deep'

declare var window: any
// window.tokenize = tokenize

/**
 * Parse a string into an array of Trackable Items
 * pass in an optional option.includeGeneric to include all terms
 * @param {String} str
 * @param {Object} options
 */

type parseOptionProps = {
  includeGeneric?: boolean
}

function parse(str = '', options?: parseOptionProps): Array<Token> {
  options = options || {}
  return tokenizeLite(str).filter((token: Token) => {
    if (options.includeGeneric) {
      return true
    } else {
      return token.type !== 'generic' && token.type !== 'line-break'
    }
  })
}
/**
 * Converts a single trackable element like #tag or @people to a TrackableElement
 * @param {String} str
 */
function toElement(str: string) {
  const parsed: Array<Token> = parse(str)
  if (parsed.length) {
    return parsed[0]
  } else if (str.length) {
    parsed.push({ id: snakeCase(str), prefix: '', raw: str, type: 'generic' })
  }
  return parsed.length ? parsed[0] : null
}

function generateRaw(str = '', type = 'generic') {
  switch (type) {
    case 'tracker':
      return `#${str}`
    case 'person':
      return `@${str}`
    case 'context':
      return `+${str}`
    default:
      return str
  }
}

export default {
  parse,
  toElement,
  generateRaw,
  people(str) {
    return parse(str).filter((token) => {
      return token.type == 'person'
    })
  },
  trackers(str) {
    return parse(str).filter((token) => {
      return token.type == 'tracker'
    })
  },
  context(str) {
    return parse(str).filter((token) => {
      return token.type == 'context'
    })
  },
}
