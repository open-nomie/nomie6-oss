import { closeModal, openModal } from '../../components/backdrop/BackdropStore2'
import NPaths from '../../paths'
import { createArrayStore } from '../../store/ArrayStore'
import { Template } from './templates-utils'
import TemplateEditorModal from './template-editor-modal.svelte'
import TemplateManagerModal from './template-manager-modal.svelte'
import { Interact } from '../../store/interact'
import { TemplateToImport } from '../storage/storage-export.helper'
import templatePreviewModalSvelte from './template-preview-modal.svelte'
import { importStorageArchive } from '../storage/import-export'
import { showToast } from '../../components/toast/ToastStore'
import { getRawPrefs } from '../preferences/Preferences'
import { InitTrackableStore, TrackableStore } from '../trackable/TrackableStore'
import { initializeDashStore } from '../dashboard2/DashStore'
import { initUniboardStore } from '../board/UniboardStore'
import is from '../../utils/is/is'

/* Creating a store for the templates. */
export const TemplateStore = createArrayStore(NPaths.storage.templates(), {
  key: 'id',
  label: 'Template',
  itemInitializer: (item) => {
    return new Template(item)
  },
  itemSerializer: (item: Template) => {
    return item.asObject
  },
})

/**
 * It opens a modal with the id `template-manager` and the component `TemplateManagerModal`
 */
export const openTemplateManager = () => {
  openModal({
    id: 'template-manager',
    component: TemplateManagerModal,
  })
}

/**
 * It closes the template manager modal
 */
export const closeTemplateManager = () => {
  closeModal('template-manager')
}

/**
 * It prompts the user for a URL, then opens the template at that URL
 */
export const openExternalTemplate = async (_url?:string) => {
  try {
    const url = _url || await Interact.prompt('Template URL', 'Full url to the template', {
      placeholder: `https://url-to-template`,
    })
    if (`${url || ''}`.length) {
      if (is.url(url)) {
        openTemplateRef(url)
      } else {
        throw new Error('Invalid URL, please try again')
      }
    }
  } catch (e) {
    Interact.error(`${e.message}`)
  }
}

/**
 * It takes a URL, fetches the JSON from that URL, and then opens a preview of the template
 * @param {string} url - The URL of the template you want to open.
 * @returns A function that takes a url and returns a promise that resolves to a template preview.
 */
export const openTemplateRef = async (url: string) => {
  try {
    const call = await fetch(url)
    const payload = await call.json()
    if (payload && payload.type == 'template') {
      const template = new Template(payload)
      return openTemplatePreview(template)
    } else {
      throw new Error('Invalid Template Type')
    }
  } catch (e) {
    Interact.error(`${e}`)
  }
}

/**
 * It opens a modal with the template preview component
 * @param {Template | undefined} [template] - The template to preview.
 */
export const openTemplatePreview = (template?: Template | undefined) => {
  openModal({
    id: 'template-preview',
    component: templatePreviewModalSvelte,
    componentProps: {
      template,
    },
  })
}

/**
 * It opens a modal with the id `template-editor` and the component `TemplateEditorModal`
 */
export const openTemplateEditor = (template?: Template | undefined) => {
  openModal({
    id: 'template-editor',
    component: TemplateEditorModal,
    componentProps: {
      template,
    },
  })
}

/**
 * It closes the modal with the id of 'template-editor'
 */
export const closeTemplateEditor = () => {
  closeModal('template-editor')
}

/**
 * It takes a template object, asks the user if they want to install it, and if they do, it converts
 * the template to an importable archive, imports it, and closes the modal
 * @param {Template} template - Template - this is the template object that is passed to the function.
 */
export const useTemplate = async (template: Template) => {
  const confirmed = await Interact.confirm(`Install the ${template.name} template?`)
  if (confirmed) {
    const backup: any = TemplateToImport(template, getRawPrefs().useMetric)
    await importStorageArchive(backup, { silent: true })
    showToast({ message: `${template.name} installed` })
    closeModal('template-preview')
    let trackables = await InitTrackableStore();
    initializeDashStore();
    initUniboardStore(trackables);
  }
}
