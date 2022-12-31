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
 
})
