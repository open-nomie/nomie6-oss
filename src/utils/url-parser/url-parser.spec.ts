// Nomie ID
import URLParser, { getURLParams } from './url-parser'
import { it, describe, expect } from 'vitest'

describe('module/url-parser', () => {
  it('should get url params', () => {
    let url = 'https://google.com/?q=Whats up&name=brandon&s=1234,4232&size=8'
    let parsed = getURLParams(url)
    expect(parsed.name).toBe('brandon')
  })
})

describe('modules/url-parser', function () {
  it('url should be truthy', () => {
    let url = URLParser('http://google.com')
    expect(url).toBeTruthy()
  })

  it('url should be valid', () => {
    let url = URLParser('http://google.com')
    expect(url.valid).toEqual(true)
  })

  it('url should be invalid', () => {
    let url = URLParser('http')

    expect(url.valid).toEqual(false)
  })

  it('url should be invalid', () => {
    let url = URLParser('google')

    expect(url.valid).toEqual(false)
  })
  it('url should be invalid', () => {
    let url = URLParser('google.com')
    expect(url.valid).toEqual(false)
  })
})
