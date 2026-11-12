import { writable } from "svelte/store";
import { closeModal, openModal } from "../../components/backdrop/BackdropStore2";
import appConfig from "../../config/appConfig";
import NPaths from "../../paths";
import { createArrayStore } from "../../store/ArrayStore";
import Storage from "../storage/storage";

import type { PluginType, PluginUseTypes } from "./plugin-helpers";
import { PluginClass } from "./plugin-helpers";
import PluginInstallerModal from "./plugin-installer-modal.svelte";
import pluginModalSvelte from "./plugin-modal.svelte";
import pluginsModalSvelte from "./plugins-modal.svelte";
import { createBlocklyPlugin } from "./buildin-plugins";


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

export const openPluginInstaller = (url?: string) => {
  openModal({
    id: 'plugin-installer',
    component: PluginInstallerModal,
    componentProps: {
      url
    }
  })
}

export const closePluginInstaller = () => {
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

    PluginStore.upsertMany(items);
  },
  itemInitializer: (item: PluginType) => {
    return new PluginClass(item)
  },
  itemSerializer: (item: PluginType) => {
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
      if (action == 'onNote' && !lid) lid = 'auto';

      // Get the Iframe
      const iframeId = `plugin-${lid}-${plugin.id}`;
      let iframe: HTMLIFrameElement = document.getElementById(iframeId) as HTMLIFrameElement;
      if (iframe && allowed) {
        iframe.contentWindow.postMessage(message, plugin.url);
      }
    })
  }

}

export const initializeBuildinPlugins = () => {
  const blocklyPlugin = createBlocklyPlugin()
  const allPlugins = PluginStore.rawState()
  const existing = allPlugins.find((p) => p.id === 'nomie-blockly')

  if (!existing) {
    PluginStore.upsert(blocklyPlugin)
  }
}

/**
 * Register change listeners for plugin preferences to enable real-time sync
 * When plugin preferences are updated on other devices via CouchDB,
 * this function ensures the app detects and handles those changes.
 */
export const registerPluginPreferencesListeners = async () => {
  try {
    const plugins: Array<PluginClass> = PluginStore.rawState()

    console.log('[PluginStore] Registering preference listeners for', plugins.length, 'plugins')

    for (const plugin of plugins) {
      const prefsPath = `plugins/${plugin.id}/prefs.json`

      // Register listener for preference changes from CouchDB sync
      Storage.get(prefsPath, (changedPrefs: any) => {
        console.log(`[PluginStore] Preference update detected for plugin: ${plugin.name} (${plugin.id})`)
        console.log(`[PluginStore] Updated prefs:`, Object.keys(changedPrefs || {}))

        // Note: Individual plugins may need to reload their preferences
        // This broadcasts the update so plugins can react if needed
        broadcastPluginMessage(
          {
            action: 'preferencesUpdated',
            data: {
              pluginId: plugin.id,
              preferences: changedPrefs,
            },
          },
          plugin.id,
          'auto'
        )
      })
    }

    console.log('[PluginStore] Plugin preference listeners initialized')
  } catch (e) {
    console.error('[PluginStore] Error registering preference listeners:', e)
  }
}