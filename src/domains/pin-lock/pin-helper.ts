import PinModal from './pin-lock.svelte'
import { openModal } from '../../components/backdrop/BackdropStore2'

import { Interact } from '../../store/interact'

type OpenPinLockProps = {
  canClose?: boolean
  title?: string
  isMatch: Function
}

export const openPinLock = async (props: OpenPinLockProps) => {
  return new Promise((resolve) => {
    openModal({
      id: 'pin-lock',
      position: 'center',
      component: PinModal,
      tappable: props.canClose,
      componentProps: {
        title: props.title,
        canClose: props.canClose,

        onPin: (pin) => {
          if (props.isMatch(pin)) {
            resolve(pin)
          } else {
            Interact.error('Invalid Pin. Try again')
          }
        },
      },
    })
  })
}
