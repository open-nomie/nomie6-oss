import text, { initials, replaceTextAt } from './text'
import { it, describe, expect } from 'vitest'
describe('text tests', () => {
  it('should truncate', () => {
    expect(text.truncate('aaaaaaaaaa', 5)).toBe('aaaaa...')
  })
  it('should truncate with the end', () => {
    let _txt = 'abcdefghijklmnopqrstuvwxyz.gif'
    expect(text.truncate(_txt, 10, 5)).toBe('abcde...z.gif')
  })
  it('should truncate with the end', () => {
    let _txt = 'abcdefghijklmnopqrstuvwxyz.gif'
    expect(text.truncate(_txt, 10, 4)).toBe('abcdef....gif')
  })

  it('should generate initials', () => {
    expect(initials('brandon corbin')).toBe('BC')
    expect(initials('Abraham Bart McSweeny McNight')).toBe('AM')
    expect(initials('Jacob B Smith')).toBe('JS')
    expect(initials('poooolboy')).toBe('PO')
    expect(initials('p')).toBe('P')
    expect(initials('')).toBe('NA')
  })
  
})


describe("Replace text at position", ()=>{
  it('should replace the right part', ()=>{
    const base = "Today my #mood ";
    const pos = 9;
    const replaceThis = '#mood'
    const withThis = '#mood(40)';
    const final = replaceTextAt(base, replaceThis, withThis, pos);
    expect(final).toEqual('Today my #mood(40) ');
  })
});