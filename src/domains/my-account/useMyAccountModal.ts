import MyAccountModal from './my-account-modal.svelte'
import { openModal } from '../../components/backdrop/BackdropStore2'
import { writable } from 'svelte/store'
import upgradesModalSvelte from './upgrades-modal.svelte'

export const MyAccountModalStore = writable(false)

export const openMyAccount = () => {
  openModal({
    component: MyAccountModal,
    componentProps: {},
    id: 'my-account',
  })
  // MyAccountModalStore.update((t) => true)
}

export const closeMyAccount = () => {
  // MyAccountModalStore.update((t) => false)
}

export const openSubscriptionModal = (canClose:boolean = true)=>{
  openModal({
    id:'subscriptions',
    component: upgradesModalSvelte,
    componentProps: {
      canClose
    }
  })
}