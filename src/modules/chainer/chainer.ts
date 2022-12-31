class Chainer {
  value: any;
  constructor(v: any) {
    this.value = v;
  }
  whenExists(f: any) {
    if (!this.value) return this;
    return new Chainer(f(this.value));
  }
}

export default Chainer;
