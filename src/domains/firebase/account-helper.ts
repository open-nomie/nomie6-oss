import { closeModal, openModal } from '../../components/backdrop/BackdropStore2'
import LoginRegisterModal from './login-register-modal.svelte'
import PlanSelectModal from './plan-select-modal.svelte'
export const openLoginModal = () => {
  openModal({
    id: 'login',
    component: LoginRegisterModal,
    componentProps: {},
    position: 'bottom',
  })
}

export const closeLoginRegisterModal = () => {
  closeModal('login');
}

export const openPlanSelectorModal = (canClose: boolean = false) => {
  openModal({
    id: 'plan-selector',
    component: PlanSelectModal,
    componentProps: {
      canClose,
    },
    position: 'real-fullscreen',
  })
}
