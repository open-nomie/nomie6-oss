import { PluginClass } from './plugin-helpers'
import type { PluginUseTypes } from './plugin-helpers'

// All major permissions for plugins
const ALL_PERMISSIONS: PluginUseTypes[] = [
  'onLaunch',
  'onNote',
  'onUIOpened',
  'selectTrackables',
  'getTrackable',
  'getTrackableUsage',
  'searchNotes',
  'getStorageItem',
  'setStorageItem',
  'openURL',
  'openPlugin',
  'createNote',
  'queryNotes',
  'getLocation',
  'alert',
  'confirm',
  'prompt',
]

export const createBlocklyPlugin = (): PluginClass => {
  return new PluginClass({
    id: 'nomie-blockly',
    name: 'Nomie Blockly',
    url: 'https://dailynomie.github.io/nomie-plugin-blockly/',
    version: '1.0.0',
    emoji: '🧱',
    active: true,
    buildin: true,
    addToCaptureMenu: false,
    addToMoreMenu: false,
    addToWidgets: false,
    uses: ALL_PERMISSIONS,
    setupComplete: false,
  })
}
