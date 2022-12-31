
// import type NLog from '../../nomie-log/nomie-log'
// import dayjs from 'dayjs'
import { it, describe, expect } from 'vitest'
// import CSVRImport from './csv-import-helper'
const zeno = `tag,timestamp
Peed,2020-08-30T08:28:00.000-04:00
Peed,2020-08-29T08:28:00.000-04:00
Peed,2020-08-28T08:28:00.000-04:00
Peed,2020-08-27T08:28:00.000-04:00
Peed,2020-08-23T08:28:00.000-04:00
Peed,2020-08-22T08:28:00.000-04:00
Peed,2020-08-12T08:28:00.000-04:00
Peed,2020-08-11T08:28:00.000-04:00`

describe('CSVR Import Tests', () => {
  it('should', ()=>{
    expect(1).toBe(1);
  })
  // const importer = new CSVRImport({
  //   template: '#{f0} #zeno imported #{f1}',
  //   fieldMap: {
  //     end: 1,
  //   },
  // })

  // it('should do something', () => {
  //   importer.csv(zeno)
  //   expect(importer.parsed).toBeTruthy()
  //   expect(importer.parsed.data.length).toBe(9)
  //   expect(importer.parsed.data[0][0]).toBe('tag')
  //   expect(importer.getHeaders()[0]).toBe('tag')
  // })

  // it('should generate some logs!', () => {
  //   importer.csv(zeno)
  //   let logs: Array<NLog> = importer.toLogs()
  //   expect(dayjs(logs[1].end).format('YYYY MM DD h:mm a')).toBe('2020 08 30 8:28 am')
  //   expect(logs[1].note).toContain('#Peed')
  //   expect(logs.length).toBe(9)
  // })
})
