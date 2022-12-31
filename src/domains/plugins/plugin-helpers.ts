import { uid } from "../../modules/uid/uid";

export type PluginUseTypes = 'getLocation' | 'alert' | 'alertReply'  | 'onWidget' | 'getTrackableReply' | 'getTrackableUsage' | 'getTrackable' | 'getStorageItemReply' | 'setStorageItemReply' |  'locationReply' | 'getTrackableUsageReply' | 'trackablesSelected' | 'selectTrackables' | 'onUIOpened' | 'registered' | 'onLaunch' | 'openURL' | 'searchNotes' | 'searchReply' | 'confirmReply' | 'promptReply' | 'onNote' | 'createNote' | 'queryNotes'

export type PluginRef = {
  name: string;
  description: string;
  emoji?: string;
  url: string;
}

export type PluginType = {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  addToCaptureMenu: boolean;
  addToMoreMenu: boolean;
  addToWidgets: boolean;
  url: string;
  version: string;
  active: boolean;
  uses: Array<PluginUseTypes>
  error?: string;
  locked?: boolean;
}

export class PluginClass {
  id: string;
  name: string;
  description?: string;
  url: string;
  emoji?: string;
  addToCaptureMenu: boolean;
  addToMoreMenu: boolean;
  addToWidgets: boolean;
  version: string;
  active: boolean;
  uses: Array<PluginUseTypes>
  error?: string;
  locked?: boolean;

  constructor(starter: PluginType) {
    this.id = starter.id || uid();
    this.name = starter.name;
    this.emoji = starter.emoji;
    this.description = starter.description;
    this.addToCaptureMenu = starter.addToCaptureMenu == true ? true : false;
    this.addToMoreMenu = starter.addToMoreMenu == true ? true : false;
    this.addToWidgets = starter.addToWidgets == true ? true : false;
    this.url = starter.url;
    this.version = starter.version;
    this.active = starter.active;
    this.uses = starter.uses || [];
    this.error = undefined;
    this.locked = starter.locked;
  }

  hasError(message: string) {
    this.error = message;

  }

  get isAutoLoad(): boolean {
    return this.uses.includes('onLaunch') ||
      this.uses.includes('onNote');
  }

  get urlWithParams(): string {
    try {
      const url = new URL(this.url || "");
      url.searchParams.append('pid', this.id);
      return url.toString();
    } catch (e) {
      return undefined;
    }
  }
}