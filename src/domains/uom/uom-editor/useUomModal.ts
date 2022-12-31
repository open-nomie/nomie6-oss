import { writable } from 'svelte/store'
import type { UomType } from '../../utils/nomie-uom/uoms'

type uomModalStoreType = {
  uom?: UomType
  onSave?: Function
  onCancel?: Function
  show?: boolean
}

const state: uomModalStoreType = {}
export const UomModalStore = writable(state)

type OpenUomEditorProps = {
  uom?: UomType
  onSave?: Function
  onCancel?: Function
}
export const openUomEditor = (props: OpenUomEditorProps) => {
  UomModalStore.update((s) => {
    s.onCancel = props.onCancel
    s.onSave = props.onSave
    s.uom = props.uom
    s.show = true
    return s
  })
}

export const closeUomEditor = () => {
  UomModalStore.update((s) => {
    s.onCancel = undefined
    s.onSave = undefined
    s.uom = undefined
    s.show = false
    return s
  })
}
