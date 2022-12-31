export default class Log {
  label: any;
  render: boolean;
  constructor(label, render = true) {
    this.label = label;
    this.render = render;
  }
  success(title, v1?: any) {
    if (this.render) {
      console.log("✅ ✅ ✅ ✅ " + this.label);
      this.showArgs("✅ ", arguments);
      console.log("");
    }
  }
  log(title, v1?) {
    if (this.render) {
      this.showArgs(`${this.label} ↠`, arguments);
    }
  }
  error(e) {
    console.log("📛 📛 📛 📛 📛 📛 ");
    console.log("📛 " + this.label);
    this.showArgs("📛", arguments);
    console.log("📛 📛 📛 📛 📛 📛 ");
    console.log("");
  }

  notice(e) {
    console.log("👯👯👯👯👯👯👯👯👯👯👯👯👯👯👯👯👯");
    console.log("👯 " + this.label);
    this.showArgs("👯", arguments);
    console.log("👯👯👯👯👯👯👯👯👯👯👯👯👯👯👯👯👯");
    console.log("");
  }
  showArgs(emoji, args) {
    if (args) {
      for (let i = 0; i < args.length; i++) {
        console.log(i == 0 ? "⭐️ " + emoji : "✨   ", args[i]);
      }
    }
  }
}
