// const NOMIEPROMPTS = {};
import {PluginType} from "../../../src/domains/plugins/plugin-helpers";


type UserPrefs = {
  use24Hour?: boolean;
  useMetric?: boolean;
  useLocation?: boolean;
  weekStarts: 'monday' | 'sunday';
  theme: 'dark' | 'light' | 'system';
}

class NomiePlugin {
  
  pluginDetails:PluginType
  registered: boolean;
  pid: undefined | string;
  listeners: any;
  ready:boolean;
  storage:any;
  prefs?: UserPrefs; 

  constructor(starter:PluginType) {
    this.pluginDetails = {...starter}
    this.registered = false;
    this.pid = undefined;
    this.listeners = {};
    this.ready = false;
    this.storage = JSON.parse(localStorage.getItem('npl-storage') || '{}');
    

    const fireReady = ()=>{
      if(!this.ready) {
        window.addEventListener("message", (evt)=>{
          this.onMessage(evt);
        }, false);
        this.ready = true;
        this.pid = this.getPid();
      }
    }

    fireReady();
    this.register();

  }

  _writeStorage() {
    localStorage.setItem('npl-storage', JSON.stringify(this.storage)); 
  }

  getItem(key) {
    return this.storage[key];
  }


  

  setItem(key, value) {
    this.storage[key] = value;
    this._writeStorage();
  }

  searchNotes(term, date=new Date(), daysBack=7) {
    return new Promise((resolve)=>{
      let id = `search-${Math.random().toString(16).replace('0.','')}`;
      this.broadcast('searchNotes', { 
        term, date, daysBack, id
      })
      this.listeners[id]=(payload)=>{
        resolve(payload.results)
      };
    })
  }

  selectTrackables(type=undefined, multiple=true) {
    return new Promise((resolve)=>{
      let id = `select-${Math.random().toString(16).replace('0.','')}`;
      this.broadcast('selectTrackables', { id, type, multiple });
      this.listeners[id]=(payload)=>{
        resolve(payload.selected)
      };
    })
  }

  get is24Hour() {
    return this.prefs?.use24Hour;
  }
  get isMetric() {
    return this.prefs?.useMetric;
  }
  

  createNote(log) {
    setTimeout(()=>{
      if(typeof log === 'string') {
        this.broadcast('createNote', { note: log })
      } else {
        this.broadcast('createNote', log)
      }
    },300)
  }

  _fireListeners(key, payload) {
    (this.listeners[key] || []).forEach((func)=>{
      func(payload);
    })
  }

  onMessage(event) {
    const action = event.data.action;
    const payload = event.data.data;
    switch(action) {
      case "registered":
        this.registered = true;
        this.pid = payload.id;
        this.prefs = {...payload.user};
        this._fireListeners('onRegistered', this);

      break;
      case "onUIOpened":
        this._fireListeners('onUIOpened', this);
      break;
      case "onNote":
        console.log("onNote Fire", action, payload);
        this._fireListeners('onNote', payload);
      break;
      case "onLaunch":
        this.registered = true;
      break;
      case "promptReply": 
        this.listenerResponse(payload);
      break;
      case "searchReply": 
        this.listenerResponse(payload)
      break;
      case "trackablesSelected": 
        console.log("Trackables Selected", payload);
        this.listenerResponse(payload)
      break;
      case "confirmReply": 
        this.listenerResponse(payload);
      break;
    }
   }

   

   prompt(title, message, type) {
    return new Promise((resolve, reject)=>{
      let id = `prompt-${Math.random().toString(16)}`;
      this.broadcast('prompt', { 
        title, message, type, id
      })
      this.listeners[id] = (payload)=>{
        resolve(payload);
      };
    })
  }

  confirm(title, message) {
    return new Promise((resolve, reject)=>{
      let id = `confirm-${Math.random().toString(16)}`;
      this.broadcast('confirm', { 
        title, message
      })
      this.listeners[id] = (payload)=>{
        resolve(payload);
      };
    })
  }
   
  listenerResponse(payload) {
    if(this.listeners && this.listeners[payload.id]) {
      const resolve = this.listeners[payload.id];
      if(resolve) {
        resolve(payload);
        delete this.listeners[payload.id];
      } else {
        console.error(`No resolve found for prompts[${payload.id}]`);
      }
    }
  }

  broadcast(action, payload) {
    const pid = this.getPid();
    if(window.parent) {
      window.parent.postMessage({ action, data: { ...payload, ...{pid}} }, "*")
    }
  }

  getPid():string | undefined {
    return new URL(window.location.href).searchParams.get('pid') || undefined
  }

  onUIOpened(func:Function):void {
    this.on('onUIOpened', func);
  }

  onNote(func:Function):void {
    this.on('onNote', func);
  }

  onRegistered(func:Function):void {
    this.on('onRegistered', func);
  }

  on(eventName:string, func:Function) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    if(!this.listeners[eventName].includes(func)) {
      this.listeners[eventName].push(func);
    }
  }

  register() {
    if(!this.pid || !this.registered) {
      this.pid = this.getPid();
      if(this.pid) {
        let pluginDetails = {...this.pluginDetails};
        pluginDetails.id = this.pid;
        this.broadcast('register', pluginDetails);
      }
    }
  }

}

