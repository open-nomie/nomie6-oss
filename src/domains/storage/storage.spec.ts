import Storage from './engines/storage.dumb'
import { it, describe, expect } from 'vitest'
describe('modules/storage.dumb should mock storage calls', function () {
  it('should get and put variables', () => {
    Storage.onReady(async () => {
      await Storage.put('testers/name.json', 'Tester McTesterson')
      const name = await Storage.get('testers/name.json')
      expect(name).toEqual(name)
    })
  })
  it('should delete variables', async () => {
    await Storage.put('testers/name.json', 'Tester McTesterson')
    await Storage.delete('testers/name.json')
    const name = await Storage.get('testers/name.json')
    expect(name).toEqual(null)
  })

  it('should list documents', async () => {
    await Storage.put('testers/name.json', 'Tester McTesterson')
    await Storage.put('testers/lists.json', [1, 2, 3])
    const list = await Storage.list()
    expect(list.length).toEqual(2)
  })
})
