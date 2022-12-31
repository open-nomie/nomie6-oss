import nid from "../nid/nid";

export interface IBoard {
  index?: number;
  id?: string;
  trackers: Array<string>;
  label: string;
}
export default class Board {
  index?: number;
  id?: string;
  trackers: Array<string>;
  label: string;
  constructor(starter: IBoard) {
    if (starter) {
      this.index = starter.index;
      this.id = starter.id;
      this.trackers = starter.trackers;
      this.label = starter.label;
    } else {
      this.id = nid();
    }
  }
}
