import NLog from '../nomie-log/nomie-log'
import Person from '../people/Person.class'
import TrackerClass from '../../modules/tracker/TrackerClass'
import { getTrackableVisuals, setTrackableVisuals, strToTrackable } from './trackable-utils'
import type { ITrackables } from './trackable-utils'
import { logToTrackableUsage } from '../usage/usage-utils'
import { test, describe, expect } from 'vitest'
const knownTrackables: ITrackables = {
  '#sample': new TrackerClass({
    id: '123456',
    tag: 'sample',
    emoji: '⚠️',
  }).toTrackable(),
  '#fire': new TrackerClass({
    id: '55555',
    tag: 'fire',
    emoji: '🔥',
  }).toTrackable(),
  '@jackey': new Person({
    username: 'jackey',
    avatar:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAB+FBMVEUAAAA/mUPidDHiLi5Cn0XkNTPmeUrkdUg/m0Q0pEfcpSbwaVdKskg+lUP4zA/iLi3msSHkOjVAmETdJSjtYFE/lkPnRj3sWUs8kkLeqCVIq0fxvhXqUkbVmSjwa1n1yBLepyX1xxP0xRXqUkboST9KukpHpUbuvRrzrhF/ljbwaljuZFM4jELaoSdLtElJrUj1xxP6zwzfqSU4i0HYnydMtUlIqUfywxb60AxZqEXaoifgMCXptR9MtklHpEY2iUHWnSjvvRr70QujkC+pUC/90glMuEnlOjVMt0j70QriLS1LtEnnRj3qUUXfIidOjsxAhcZFo0bjNDH0xxNLr0dIrUdmntVTkMoyfL8jcLBRuErhJyrgKyb4zA/5zg3tYFBBmUTmQTnhMinruBzvvhnxwxZ/st+Ktt5zp9hqota2vtK6y9FemNBblc9HiMiTtMbFtsM6gcPV2r6dwroseLrMrbQrdLGdyKoobKbo3Zh+ynrgVllZulTsXE3rV0pIqUf42UVUo0JyjEHoS0HmsiHRGR/lmRz/1hjqnxjvpRWfwtOhusaz0LRGf7FEfbDVmqHXlJeW0pbXq5bec3fX0nTnzmuJuWvhoFFhm0FtrziBsjaAaDCYWC+uSi6jQS3FsSfLJiTirCOkuCG1KiG+wSC+GBvgyhTszQ64Z77KAAAARXRSTlMAIQRDLyUgCwsE6ebm5ubg2dLR0byXl4FDQzU1NDEuLSUgC+vr6urq6ubb29vb2tra2tG8vLu7u7uXl5eXgYGBgYGBLiUALabIAAABsElEQVQoz12S9VPjQBxHt8VaOA6HE+AOzv1wd7pJk5I2adpCC7RUcHd3d3fXf5PvLkxheD++z+yb7GSRlwD/+Hj/APQCZWxM5M+goF+RMbHK594v+tPoiN1uHxkt+xzt9+R9wnRTZZQpXQ0T5uP1IQxToyOAZiQu5HEpjeA4SWIoksRxNiGC1tRZJ4LNxgHgnU5nJZBDvuDdl8lzQRBsQ+s9PZt7s7Pz8wsL39/DkIfZ4xlB2Gqsq62ta9oxVlVrNZpihFRpGO9fzQw1ms0NDWZz07iGkJmIFH8xxkc3a/WWlubmFkv9AB2SEpDvKxbjidN2faseaNV3zoHXvv7wMODJdkOHAegweAfFPx4G67KluxzottCU9n8CUqXzcIQdXOytAHqXxomvykhEKN9EFutG22p//0rbNvHVxiJywa8yS2KDfV1dfbu31H8jF1RHiTKtWYeHxUvq3bn0pyjCRaiRU6aDO+gb3aEfEeVNsDgm8zzLy9egPa7Qt8TSJdwhjplk06HH43ZNJ3s91KKCHQ5x4sw1fRGYDZ0n1L4FKb9/BP5JLYxToheoFCVxz57PPS8UhhEpLBVeAAAAAElFTkSuQmCC',
    displayName: 'Wacky Jackey',
  }).toTrackable(),
}

describe('Trackable Store Test', () => {
  test('logToTrackableUsage should get all types ', () => {
    const log = new NLog({
      note: '@jackey is here, and #fire is good #bad',
    })
    const usage = logToTrackableUsage(log, {}, knownTrackables)
    expect(usage['#fire']).toBeTruthy()
    expect(usage['@jackey']).toBeTruthy()
  })

  test('Should turn an unknown tracker string into a trackable', () => {
    const moon = strToTrackable('#moon(13)', {})
    expect(moon.tracker).toBeTruthy()
    expect(moon.tracker.tag).toBe('moon')
    expect(moon.tracker.id).toBeTruthy()
    expect(moon.value).toBe(13)
  })
  test('Should turn an unknown person string into a trackable', () => {
    const moon = strToTrackable('@bobsmith', {})
    expect(moon.person).toBeTruthy()
    expect(moon.person.username).toBe('bobsmith')
  })

  test('Should turn an tracker string into a trackable', () => {
    const fire = strToTrackable('#fire(04:43:32)', knownTrackables)
    expect(fire.tracker).toBeTruthy()
    expect(fire.tracker.id).toBe('55555')
    expect(fire.tracker.emoji).toBe('🔥')
    expect(fire.value).toBe(17012) // converted to a number
  })

  test('Should turn an person string into a trackable', () => {
    const person = strToTrackable('@jackey', knownTrackables)
    expect(person.person).toBeTruthy()
    expect(person.person.username).toBe('jackey')
    expect(person.person.displayName).toBe('Wacky Jackey')
  })
})

describe('Trackable should be able to get and set for Types', () => {
  test('Context', () => {
    const contextTrackable = strToTrackable('+sample', knownTrackables)
    contextTrackable.emoji = '🏴‍☠️'
    contextTrackable.avatar = 'bb'
    contextTrackable.label = 'new Label'
    expect(contextTrackable.ctx.label).toBe('new Label')
    expect(contextTrackable.ctx.emoji).toBe('🏴‍☠️')
    expect(contextTrackable.ctx.avatar).toBe('bb')
    expect(contextTrackable.tag).toBe('+sample')
  })
  test('Person', () => {
    const contextTrackable = strToTrackable('@jackey', knownTrackables)
    contextTrackable.emoji = '🏴‍☠️'
    contextTrackable.avatar = 'bb'
    contextTrackable.label = 'new Label'
    expect(contextTrackable.person.displayName).toBe('new Label')
    expect(contextTrackable.person.emoji).toBe('🏴‍☠️')
    expect(contextTrackable.person.avatar).toBe('bb')
    expect(contextTrackable.tag).toBe('@jackey')
  })
  test('Tracker', () => {
    const contextTrackable = strToTrackable('#jackey', knownTrackables)
    contextTrackable.emoji = '🏴‍☠️'
    contextTrackable.avatar = 'bb'
    contextTrackable.label = 'new Label'
    expect(contextTrackable.tracker.label).toBe('new Label')
    expect(contextTrackable.tracker.emoji).toBe('🏴‍☠️')
    expect(contextTrackable.tracker.avatar).toBe('bb')
    expect(contextTrackable.label).toBe('new Label')
    expect(contextTrackable.emoji).toBe('🏴‍☠️')
    expect(contextTrackable.avatar).toBe('bb')
    expect(contextTrackable.tag).toBe('#jackey')
  })
})

describe('Trackable Utilities Test', () => {
  test('Getting visuals from a tracker', () => {
    const visuals = getTrackableVisuals(knownTrackables['#fire'])
    expect(visuals.color).toBe('#369DD3')
    expect(visuals.label).toBe('Fire')
    expect(visuals.emoji).toBe('🔥')
  })
  test('Setting visuals on a Trackable', () => {
    const visuals = {
      label: 'Fire Sucks',
      color: '#555555',
      emoji: '🔥🔥',
    }
    const newTracker = setTrackableVisuals(knownTrackables['#fire'], visuals)
    expect(newTracker.color).toBe('#555555')
    expect(newTracker.label).toBe('Fire Sucks')
    expect(newTracker.emoji).toBe('🔥🔥')
  })
})
