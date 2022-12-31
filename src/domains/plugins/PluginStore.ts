import { writable } from "svelte/store";
import { closeModal, openModal } from "../../components/backdrop/BackdropStore2";
import appConfig from "../../config/appConfig";
import NPaths from "../../paths";
import { createArrayStore } from "../../store/ArrayStore";
import { getRawPermissions, PermissionsState, PermissionsStore } from "../my-account/PermissionsStore";
import type { PluginType, PluginUseTypes } from "./plugin-helpers";
import { PluginClass } from "./plugin-helpers";
import PluginInstallerModal from "./plugin-installer-modal.svelte";
import pluginModalSvelte from "./plugin-modal.svelte";
import pluginsModalSvelte from "./plugins-modal.svelte";


export type PluginAction = {
  name: string;
  on(payload: any): void
}





export const getAvailablePlugins = async (): Promise<Array<PluginType>> => {
  return []
}

export const openPluginsModal = () => {
  openModal({
    id: 'plugins',
    component: pluginsModalSvelte,
    componentProps: {

    }
  })
}

export const OpenedPluginStore = writable<Array<string>>([]);

export const openPluginModal = (plugin: PluginClass) => {
  // OpenedPluginStore.update(s => {
  //   if (!s.includes(plugin.id)) {
  //     s.push(plugin.id)
  //   }
  //   return s;
  // })
  openModal({
    id: plugin.id,
    component: pluginModalSvelte,
    componentProps: {
      plugin 
    }
  })
  // openIFrameModal(plugin.urlWithParams, plugin.name, {
  //   action: "onUIOpened",
  //   data: {}
  // })
}

export const closePluginModal = () => {

}

export const openPluginInstaller = (url?:string) => {
  openModal({
    id:'plugin-installer',
    component: PluginInstallerModal,
    componentProps: {
      url 
    }
  })
}

export const closePluginInstaller = ()=>{
  closeModal('plugin-installer');
}

export const closePluginsModal = () => {
  closeModal('plugins');
}

export const PluginStore = createArrayStore(NPaths.storage.plugins(), {
  label: 'Plugins',
  key: 'id',
  onInitalized(items, perms) {

    

    // Perms comes from the data passed
    // into the PluginStore.init(data)

    // Limit number of plugins if not canAPI
    if(!perms.canAPI) {
      //&& items.length > appConfig.max_free_plugins
      /**
       * The User Cannot API - so they are limited to appConfig.max_free_plugins
       * We will lock all plugins after the appConfig.max_free_plugins is hit
       */
      let locked = items.map((plugin:PluginClass,index)=>{
        if(index >= appConfig.max_free_plugins) {
          plugin.locked = true;
          plugin.active = false;
        } else {
          plugin.locked = false;
        }
        return plugin;
      })  
      // Update the locks
      PluginStore.upsertMany(locked);
    } else if(perms.canAPI && items.find(p=>p.locked)) {

      // We have an API, so we will remove any unlocked plugins
      let unlocked = items.map((plugin:PluginClass)=>{
        plugin.locked = false;
        return plugin;
      })  
      PluginStore.upsertMany(unlocked);
    }
  },
  itemInitializer: (item: PluginType) => {
    return new PluginClass(item)
  },
  itemSerializer: (item: Location) => {
    return JSON.parse(JSON.stringify(item))
  },
})

export type PluginMessageType = {
  action: PluginUseTypes,
  data: any
}

export const securedActions = ["selectTrackables", "onNote", "createNote", "searchNotes"]

export const broadcastPluginMessage = (message: PluginMessageType, pluginId?: string, lid?: string) => {
  
  let plugins: Array<PluginClass> = PluginStore.rawState();
  let action = typeof message == 'object' ? message.action : undefined;
  // Target a specific plugin

  // Loop over plugins
  if (action) {
    
    // Target Specific Plugin by Id
    if (pluginId) {
      plugins = plugins.filter(p => p.id == pluginId);
    }
    // Loop over plugins
    plugins.forEach((plugin) => {
      // Determin if it's allowed to run this action
      let allowed = (securedActions.includes(message.action) && plugin.uses.includes(message.action)) || (!securedActions.includes(message.action))
      if(action == 'onNote' && !lid) lid = 'auto';
      
      // Get the Iframe
      const iframeId = `plugin-${lid}-${plugin.id}`;
      let iframe: HTMLIFrameElement = document.getElementById(iframeId) as HTMLIFrameElement;
      if (iframe && allowed) {
        iframe.contentWindow.postMessage(message, plugin.url);
      }
    })
  }

}