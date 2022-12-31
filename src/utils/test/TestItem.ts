import nid from '../../modules/nid/nid'

export class TestItem {
  //@ts-ignore
  id?: string
  name?: string
  constructor(starter: any = {}) {
    this.id = starter.id || nid()
    this.name = starter.name
  }
}
