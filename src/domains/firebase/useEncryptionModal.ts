import { writable } from 'svelte/store'
import { closeModal, openModal } from '../../components/backdrop/BackdropStore2'
import { trackEvent } from '../usage/stat-ping'
import ManageEncryptionModal from './manage-encryption-keys.svelte'
import PasscodeModal from './passcode-questions-modal.svelte'
type encryptionBase = { show: boolean; onClose?: Function }
const base: encryptionBase = { show: false }
export const showEncryptionModal = writable(base)

type EncryptionModalProps = {
  onDismiss?: Function
}

export const hideEncryptionModal = () => {
  showEncryptionModal.update((s) => {
    s.show = false
    s.onClose = undefined
    return s
  })
}

export const openManageEncryptionModal = () => {
  trackEvent('open_manage_encryption');
  openModal({
    id: 'manage-encryption-keys',
    component: ManageEncryptionModal,
  })
}

type PasscodeModalType = {
  onChange?: Function
  onCancel?: Function
  canCancel?: boolean
  isFirst: boolean
}

export const openPasscodeModal = (props: PasscodeModalType) => {
  openModal({
    id: 'passcode-modal',
    component: PasscodeModal,
    componentProps: {
      onChange: props.onChange,
      onCancel: props.onCancel,
      canCancel: props.canCancel,
      isFirst: props.isFirst,
    },
  })
}

export const closePasscodeModal = ()=>{
  closeModal("passcode-modal");
}

// export const useEncrpytionModal = (props: EncryptionModalProps) => {
//   const open = () => {
//     showEncryptionModal.update((s) => {
//       s.show = true
//       if (props.onDismiss) s.onClose = props.onDismiss
//       return s
//     })
//   }
//   const close = () => {
//     showEncryptionModal.update((s) => {
//       s.show = false
//       s.onClose = undefined
//       return s
//     })
//   }
//   return [open, close]
// }
