import extractor from './extract'
import { it, describe, expect } from 'vitest'
let note = `This is a #test of +context @person #语 @语 +语 @brandon Nomies 
  
#extractor(4)! #home(0)? #coffee(3), #sleep(01:00:00) #taco[b32] and #cheese #cheese #cheese`

describe('utils/extractor', function () {
  it('should parse this persons note', () => {
    let theNote = `This is a special #checkin because I did a 24 hr fast for the first time and I was alright. I did drink some coffees though. You can see that in the logs. #mood(9)



    #meal`
    let extracted = extractor.parse(theNote)
    expect(extracted[2].value).toEqual(1)
  })

  it('Should be able extract Element decimal points from string', () => {
    expect(extractor.toElement('#mood(0.6)').value).toEqual(0.6)
  })

  it('Should be able extract Element from string', () => {
    expect(extractor.toElement(' #mood').type).toEqual('tracker')
    expect(extractor.toElement('#mood(43)').value).toEqual(43)
    expect(extractor.toElement('#语(43.324321234321233oz)').value).toEqual(43.324321234321233)
    expect(extractor.toElement('#语(43)').id).toEqual('语')
    expect(extractor.toElement('@mood').type).toEqual('person')
    expect(extractor.toElement('+mood').type).toEqual('context')
    expect(extractor.toElement('+mood(32)').type).toEqual('context')
    expect(
      extractor.toElement(`

+mood(32)
#water`).value
    ).toEqual(32)
    expect(extractor.toElement('+mood(32): #dd').id).toEqual('mood')
    expect(extractor.toElement('+😁').id).toEqual('😁')
    expect(extractor.toElement('#timer(02:00:00)').value).toEqual(7200)
    expect(extractor.toElement('#timer(02:00)').value).toEqual(7200)
    expect(extractor.toElement('#timer()').value).toEqual(1)
  })

  const tester = (options: any = {}) => {
    let defaultFunc = () => {}
    options.count = options.count || 400
    options.name = options.name || 'Unknown'
    options.function = options.function || defaultFunc

    let start = new Date().getTime()
    for (var i = 0; i < options.count; i++) {
      options.function()
    }

    return new Date().getTime() - start
  }

  it("should handle 's ok", () => {
    let note = "this is @brandon's test #momo's too? #momo(34)'s"
    let parsed = extractor.parse(note)
    expect(parsed[0].id).toEqual('brandon')
    expect(parsed[1].id).toEqual('momo')
    expect(parsed[2].id).toEqual('momo')
    expect(parsed[2].remainder).toEqual("'s")
  })

  it('should parse 60,000 complicated notes in less than 5 seconds', () => {
    let notes = []
    let parsed = tester({
      name: 'baseline',
      count: 60000,
      function() {
        notes.push(extractor.parse(note))
      },
    })
    expect(parsed).toBeLessThan(6000)
  })

  it('Should handle #test_time: #sample #dooo', () => {
    let note = ' #test_time: #sample #dooo'
    let parsed = extractor.parse(note)
    expect(parsed[0].id).toEqual('test_time')
  })

  it('Should handle a generic object in the toElement', () => {
    let element = extractor.toElement('sample do')
    expect(element.id).toEqual('sample_do')
    expect(element.type).toEqual('generic')
    expect(element.raw).toEqual('sample do')
  })

  it('should handle being passed a null', () => {
    expect(extractor.parse().length).toEqual(0)
  })

  it('should handle new lines with the first tag', () => {
    let note = `do this man. 
 
#mood(4) #energy(4) #motivation(2) #stress(8) #sd(3)`
    let parsed = extractor.parse(note)
    expect(parsed[0].id).toEqual('mood')
  })

  it('Should do fine with something like +covid19.', () => {
    let note = `This is a note  +covid19.\n\t\r +covid14 
    `
    expect(extractor.parse(note)[1].type).toEqual('context')
    expect(extractor.parse(note)[1].id).toEqual('covid14')
    expect(extractor.parse(note)[0].type).toEqual('context')
    expect(extractor.parse(note)[0].id).toEqual('covid19')
  })

  it('should extract all the things', () => {
    let note =
      'This is a #test of +context @person #语 @语 +语 @brandon Nomies #extractor(4)! #home(0)? #coffee(3), #sleep(01:00:00) and #cheese #cheese #cheese'

    let results = extractor.parse(note)
    expect(results.length).toEqual(14)
    expect(results[0].type).toEqual('tracker')
    expect(results[1].type).toEqual('context')
    expect(results[2].type).toEqual('person')
  })

  it('should allow inclusion of generic terms', () => {
    let note = 'This is a #note, can you dig it?'
    let parsed = extractor.parse(note, { includeGeneric: true })
    expect(parsed[3].remainder).toEqual(',')
    expect(parsed.length).toEqual(8)
    expect(parsed[7].raw).toEqual('it?')
  })

  it('should extract tracker detail', () => {
    let results = extractor.trackers(note)

    expect(results[0].id).toEqual('test')
    expect(results[1].id).toEqual('语')
    expect(results[2].id).toBe('extractor')
    expect(results[2].value).toEqual(4)
    expect(results[3].id).toEqual('home')
    expect(results[3].value).toEqual(0)
    expect(results[4].id).toEqual('coffee')
    expect(results[4].value).toEqual(3)
    expect(results[5].id).toEqual('sleep')
    expect(results[5].value).toEqual(3600)
  })

  it('extract-people', () => {
    let note = 'What a test! @brandon_corbin @b41d34 #extractor(4) +context1 +winner'
    let results = extractor.context(note)
    expect(results[0].id).toEqual('context1')
    expect(results[1].id).toEqual('winner')
    let note2 = 'No Context'
    let results2 = extractor.context(note2)
    expect(results2.length).toEqual(0)
    // expect(math.sum([1, 2])).toEqual(3);
  })
  it('extract-people', () => {
    let note = 'What a test! @brandon_corbin @b41d34 #extractor(4) +context1 +winner'
    let results = extractor.people(note)

    expect(results[0].id).toEqual('brandon_corbin')
    expect(results[1].id).toEqual('b41d34')

    let note2 = 'No Context'
    let results2 = extractor.people(note2)
    expect(results2.length).toEqual(0)
    // expect(math.sum([1, 2])).toEqual(3);
  })
})
