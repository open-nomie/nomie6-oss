export default class PositivityCondition {
  if: "value" | "hour" | "momth";
  is: "gt" | "gte" | "lt" | "lte" | "eq";
  v: number;
  sc: number;
  constructor(starter) {
    starter = starter || {};
    this.if = starter.if || "value";
    this.is = starter.is || "gt";
    this.v = starter.v || 1;
    // Score
    this.sc = starter.sc || undefined;
  }

  get score() {
    return this.sc;
  }
  set score(score) {
    this.sc = score;
  }
}
