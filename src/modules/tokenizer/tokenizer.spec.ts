// import { tokenize, tokenizeDeep } from './tokenize-note'
import { test, expect } from 'vitest'
import { tokenizeLite } from './lite'
import { tokenizeDeep } from './deep'

let note = `Testing #notes #notes(10.1)
    #sleep(04:00:00) #sleep(00:10:00) #note #notes_boat /home
@bob, @Bob! @mom @😡
  https://google.com nomie://nomie.app
    +contexts(90days) +contextsy Sweet movie.`

test('It should pass along a . in the raw', () => {
  const token = tokenizeLite(`#bb(0.4)`)
  expect(token[0].raw).toBe('#bb(0.4)')
})

test('It should handle 2nd line no space', () => {
  const token = tokenizeLite(`first line
#bb(0.4)`)
  expect(token.find((t) => t.type == 'tracker').raw).toBe('#bb(0.4)')
})

test('it should handle duplicate trackers with different values', ()=>{
  const tokens = tokenizeLite('#water(1) #water(2)');
  expect(tokens.length).toBe(2);
  expect(tokens[0].value).toBe(1);
  expect(tokens[1].value).toBe(2);
})

test('should parse a note', () => {
  let tokens = tokenizeLite(note)

  expect(tokens.filter((t) => t.type == 'context').length).toBe(2)
  expect(tokens.filter((t) => t.type == 'tracker').length).toBe(6)
  expect(tokens.filter((t) => t.type == 'person').length).toBe(4)
  expect(tokens.filter((t) => t.type == 'link').length).toBe(2)
})

test('should handle math values', () => {
  let addition = tokenizeLite('note #math(4+4)')
  expect(addition[1].value).toBe(8)
  let multiply = tokenizeLite('note #math(4*4)')
  expect(multiply[1].value).toBe(16)
  let division = tokenizeLite('note #math(16/4)')
  expect(division[1].value).toBe(4)
  let withText = tokenizeLite('note #math(16/4+4hrs)')
  expect(withText[1].value).toBe(8)
  let broken = tokenizeLite('note #math(16/4+4hrs+&)')
  expect(broken[1].value).toBe(0)
})

test('should not find a single + as a context', () => {
  let note = `This is a + note`
  let results = tokenizeDeep(note)
  expect(results.context.length).toBe(0)
})

test('should handle handle links', () => {
  let linkNote = `This is a note with linkes!
    https://github.com and https://nomie.app what about http://twitter.com/brandoncorbin and thats it
  `
  let results = tokenizeDeep(linkNote)

  expect(results.links.length).toBe(3)
  expect(results.links[0].raw).toBe('https://github.com')
  expect(results.links[2].raw).toBe('http://twitter.com/brandoncorbin')
})

test('should handle nothing gracefully', () => {
  expect(tokenizeLite(undefined).length).toBe(0)
  expect(tokenizeLite('').length).toBe(0)
  expect(tokenizeLite('me').length).toBe(1)
  expect(tokenizeLite('#balls()').length).toBe(1)
})

test('Should handle time strings properly', () => {
  let tokens = tokenizeLite(note)
  expect(tokens).toBeTruthy()
  tokens.forEach((token) => {
    if (token.id == 'sleep') {
      expect(token.raw).toMatch(/(\d\d:\d\d)/)
    }
  })
})

test('should tokenize deep a note', () => {
  let results = tokenizeDeep(note)

  expect(results).toBeTruthy()
  expect(results.context.length).toBe(2)
  expect(results.people.length).toBe(3)
  expect(results.trackers.length).toBe(4)
  expect(results.get('tracker', 'sleep').sum).toBe(15000)
  // Does not exist
  expect(results.get('tracker', 'turkey')).toBeFalsy()
  expect(results.get('turkey', 'turkey')).toBeFalsy()
})

test('it should support including text in the value like #walked(1mile)', () => {
  expect(tokenizeLite('#walked(1.6mile)')[0].value).toBe(1.6)
})

test('it should support funky endings', () => {
  expect(tokenizeLite('#walked(1.6mile).')[0].id).toBe('walked')
  expect(tokenizeLite('#walked(1.6mile),')[0].id).toBe('walked')
  expect(tokenizeLite('#walked!!')[0].id).toBe('walked')
  expect(tokenizeLite('#walked?')[0].id).toBe('walked')
  expect(tokenizeLite('+travel(10days)')[0].value).toBe(10)
})

test('it should extract a UOM from a field', () => {
  expect(tokenizeLite('+travel(10days)')[0].uom).toBe('days')
  expect(tokenizeLite('+travel(10:30:32)')[0].uom).toBe('timer')
  expect(tokenizeLite('+travel(23mg)')[0].uom).toBe('mg')
  expect(tokenizeLite('+travel(24hours)')[0].uom).toBe('hours')
  expect(tokenizeLite('+travel(12mg/d)')[0].uom).toBe('mg/d')
  expect(tokenizeLite('+travel(12%)')[0].uom).toBe('%')
  expect(tokenizeLite('+travel(12%)')[0].value).toBe(12)
})

test('it should handle funky characters', () => {
  expect(tokenizeDeep('#💩(1.6mile)').get('tracker', '💩').sum).toBe(1.6)
  expect(tokenizeDeep('+💩').get('context', '💩')).toBeTruthy()
  expect(tokenizeDeep('@💩').get('person', '💩')).toBeTruthy()
})

test("it should handle adding 's after things", () => {
  expect(tokenizeLite(`@brandon's`)[0].id).toBe('brandon')
  expect(tokenizeLite(`#brandon's`)[0].id).toBe('brandon')
  expect(tokenizeLite(`+brandon's`)[0].id).toBe('brandon')
})

test('it should find the right type', () => {
  expect(tokenizeLite(`@brandon's`)[0].type).toBe('person')
  expect(tokenizeLite(`#brandon's`)[0].type).toBe('tracker')
  expect(tokenizeLite(`+brandon's`)[0].type).toBe('context')
  expect(tokenizeLite(`https://nomie.app`)[0].type).toBe('link')
  expect(tokenizeLite(`http://nomie.app`)[0].type).toBe('link')
  expect(tokenizeLite(`draft5://open?mode=123466`)[0].type).toBe('link')
  expect(tokenizeLite(`nomie://sample?123466`)[0].type).toBe('link')
  expect(tokenizeLite(`://open?mode=123466`)[0].type).toBe('generic')
})

test('stats should sum and average multiple of the same tag', () => {
  let results = tokenizeDeep(note)
  let noteTracker = results.trackers.find((el) => el.id == 'notes')
  expect(noteTracker.sum).toBe(11.1)
  expect(noteTracker.avg).toBe(5.55)
  expect(noteTracker.values.toString()).toBe([1, 10.1].toString())

  let sleepTracker = results.trackers.find((el) => el.id == 'sleep')
  expect(sleepTracker.values.toString()).toBe([14400, 600].toString())
  // let notes = results.stats.
})
