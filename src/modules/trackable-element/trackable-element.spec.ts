// import TrackableElement, { toElement } from '../../../src/modules/trackable-element/trackable-element'
// // import extractor from "../../../src/utils/extract/extract";

import { test, describe, expect } from 'vitest'

describe('modules/trackable-element', function () {
  test('Deprecated', () => {
    expect(1).toBe(1)
  })
})
// describe('modules/trackable-element', function () {
//   let trackerElement = toElement('#mood')
//   let personElement = toElement('@bobby')
//   let contextElement = toElement('+cheese')

//   let manual = new TrackableElement({ id: 'sample', type: 'person' })

//   it('should be instance of TrackableElement', () => {
//     expect(trackerElement).toBeInstanceOf(TrackableElement)
//     expect(personElement).toBeInstanceOf(TrackableElement)
//     expect(contextElement).toBeInstanceOf(TrackableElement)
//   })

//   it('should produce a Trackable', () => {
//     const trackable = trackerElement.toTrackable({})
//     expect(trackable.type).toBe('tracker')
//   })

//   it('should be lowercase the ID ', () => {
//     expect(new TrackableElement({ id: 'Uppercase' }).id).toEqual('uppercase')
//   })

//   it('should be support populating data from a raw string ', () => {
//     expect(new TrackableElement({ raw: '#cheese' }).id).toEqual('cheese')
//     expect(new TrackableElement({ raw: '#cheese' }).type).toEqual('tracker')
//     expect(new TrackableElement({ raw: '#cheese(44)' }).value).toEqual(44)
//     expect(new TrackableElement({ raw: '@bobby' }).id).toEqual('bobby')
//     expect(new TrackableElement({ raw: '@bobby' }).type).toEqual('person')
//     expect(new TrackableElement({ raw: '+covid' }).id).toEqual('covid')
//     expect(new TrackableElement({ raw: '+covid' }).type).toEqual('context')
//   })

//   it('should generate search terms', () => {
//     expect(trackerElement.toSearchTerm()).toEqual('#mood')
//     expect(personElement.toSearchTerm()).toEqual('@bobby')
//     expect(contextElement.toSearchTerm()).toEqual('+cheese')
//   })
//   it('should generate search terms when created manually', () => {
//     expect(manual.toSearchTerm()).toEqual('@sample')
//   })

//   it('should fill in missing information when person manually', () => {
//     let person = new TrackableElement({ id: 'sample', type: 'person' })
//     expect(person.raw).toEqual('@sample')
//     expect(person.prefix).toEqual('@')
//   })
//   it('should fill in missing information when tracker manually', () => {
//     let tracker = new TrackableElement({ id: 'sample', type: 'tracker' })
//     expect(tracker.raw).toEqual('#sample')
//     expect(tracker.prefix).toEqual('#')
//   })
//   it('should fill in missing information when context manually', () => {
//     let context = new TrackableElement({ id: 'sample', type: 'context' })
//     expect(context.raw).toEqual('+sample')
//     expect(context.prefix).toEqual('+')
//   })
// })
