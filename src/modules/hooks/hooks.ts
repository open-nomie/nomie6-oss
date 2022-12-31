import Logger from "../../utils/log/log";
const console = new Logger("modules/hooks");

/**
 * Super Simple Hook System Listener Thing
 *
 * const hooks = new Hooky();
 * hooks.hook('onBeforeAdd', (payload)=>doSomething());
 * hooks.run('onBeforeAdd', 'goo');
 */

export default class Hooky {
  hooks: any;
  constructor() {
    this.hooks = {};
  }
  hook(hookName, func) {
    if (typeof func === "function") {
      this.hooks[hookName] = this.hooks[hookName] || [];
      this.hooks[hookName].push(func);
      return () => {
        this.hooks[hookName] = this.hooks[hookName].filter((hookFunc) => {
          return hookFunc !== func;
        });
      };
    }
  }
  run(hookName, payload) {
    if (this.hooks.hasOwnProperty(hookName)) {
      this.hooks[hookName].forEach((hook) => {
        hook(payload);
      });
    } else {
      // Silently faile
    }
  }
}
