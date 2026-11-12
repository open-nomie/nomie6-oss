import Storage from './engines/storage.dumb'
import { it, describe, expect } from 'vitest'
import { smartMerge } from './smart-merge'
describe('modules/smart-merge', function () {
  it('should get should merge arrays', () => {
    let array1 = [{
      id: '12345',
      names: ['Bob', 'Taco', 'Silly'],
      count: 2
    },
    {
      id: '123456',
      names: ['Paul', 'Grace', 'Billy']
    }]

    let array2 = [{
      id: '12345',
      names: ['Shifty', 'Lefty',  'Grandma'],
      count: 4
    },
    {
      id: '124',
      names: ['Frank', 'Betty', 'Sam']
    },
    {
      id: '1246',
      names: ['Six', '5', 'For']
    }]

    const merged = smartMerge(array1, array2);
    console.log(merged);
    expect(merged).toBeTruthy();
    expect(merged.length).toBe(4);
    expect(merged[merged.length-1].id).toBe('1246')
    expect(merged[0].names.join(",")).toBe("Bob,Taco,Silly,Shifty,Lefty,Grandma")
    expect(merged[0].count).toBe(4)
  })

  it("should merge objects", ()=>{
    let obj1={
      name: "Brandon",
      age: 45,
      tags: ['turkey'],
      sub: { time: true }
    }
    let obj2={
      type: "Person",
      age: 55,
      tags: ['fly'],
      sub: { notime: true }
    }
    const merged = smartMerge(obj1, obj2);
    expect(merged.age).toBe(55);
    expect(merged.name).toBe('Brandon')
    expect(merged.type).toBe('Person');
    expect(merged.tags.join(",")).toBe('turkey,fly')
    expect(merged.sub.notime).toBe(true);
    expect(merged.sub.time).toBe(true);
  })

  it('should not duplicate shared items in nested lists', () => {
    const local = [{ id: 'b1', label: 'Health', elements: ['#sleep', '#mood'] }]
    const incoming = [{ id: 'b1', label: 'Health', elements: ['#sleep', '#water'] }]
    const merged = smartMerge(local, incoming)
    expect(merged).toHaveLength(1)
    expect(merged[0].elements).toEqual(['#sleep', '#mood', '#water'])
  })

  it('should be idempotent when the same data is merged repeatedly', () => {
    const local = [{ id: 'b1', elements: ['#sleep', '#mood'], widgets: [{ id: 'w1', type: 'chart' }] }]
    const once = smartMerge(local, local)
    const thrice = smartMerge(smartMerge(once, local), local)
    expect(thrice).toEqual(local)
  })

  it('should merge nested objects that share an id instead of duplicating them', () => {
    const local = { dashboards: [{ id: 'd1', widgets: [{ id: 'w1', title: 'Old' }] }] }
    const incoming = { dashboards: [{ id: 'd1', widgets: [{ id: 'w1', title: 'New' }, { id: 'w2', title: 'Added' }] }] }
    const merged = smartMerge(local, incoming)
    expect(merged.dashboards[0].widgets).toEqual([
      { id: 'w1', title: 'New' },
      { id: 'w2', title: 'Added' },
    ])
  })

  it('should keep every item that has no id', () => {
    const noIds = [{ name: 'a' }, { name: 'b' }, { name: 'c' }]
    expect(smartMerge(noIds, [])).toEqual(noIds)
    expect(smartMerge(noIds, [{ name: 'c' }, { name: 'd' }])).toEqual([...noIds, { name: 'd' }])
  })

  it('should merge every copy when more than two items share an id', () => {
    const merged = smartMerge([{ id: 'x', a: 1 }], [{ id: 'x', b: 2 }, { id: 'x', c: 3 }])
    expect(merged).toEqual([{ id: 'x', a: 1, b: 2, c: 3 }])
  })

  it('keeps identical items without an id as many times as the larger side has them', () => {
    expect(smartMerge([{ name: 'a' }, { name: 'a' }], [])).toEqual([{ name: 'a' }, { name: 'a' }])
    expect(smartMerge([{ name: 'a' }], [{ name: 'a' }, { name: 'a' }])).toEqual([{ name: 'a' }, { name: 'a' }])
    const once = smartMerge([{ name: 'a' }, { name: 'a' }], [{ name: 'a' }, { name: 'a' }])
    expect(smartMerge(once, [{ name: 'a' }, { name: 'a' }])).toEqual([{ name: 'a' }, { name: 'a' }])
  })

  it('a null in the backup does not erase a value on this device', () => {
    const merged = smartMerge({ tracker: { label: 'Mood', color: '#f00' } }, { tracker: { label: 'Mood', color: null } })
    expect(merged.tracker.color).toBe('#f00')
  })

  it('refuses to merge a list with an object instead of dropping one side', () => {
    expect(() => smartMerge([{ id: 'g1' }], { id: 'g2' } as any)).toThrow()
    expect(() => smartMerge({ id: 'g1' }, [{ id: 'g2' }] as any)).toThrow()
  })

  it('an empty list or object from the backup changes nothing', () => {
    expect(smartMerge([{ id: 'g1' }], [])).toEqual([{ id: 'g1' }])
    expect(smartMerge({ mood: { tag: 'mood' } }, {})).toEqual({ mood: { tag: 'mood' } })
  })

  it('an empty placeholder on this device takes the backup value of the other type', () => {
    expect(smartMerge({}, [{ id: 'g1' }] as any)).toEqual([{ id: 'g1' }])
  })
})
