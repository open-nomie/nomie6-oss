import { closeModal, openModal } from '../../../components/backdrop/BackdropStore2'
import Register from './register.svelte'
import Login from './login.svelte'

export const openRegisterModal = () => {
  openModal({
    id: 'register',
    component: Register,
    position: 'bottom',
    tappable: true,
    componentProps: {
      onRegister: () => {
        window.location.reload()
      },
    },
  })
}
export const closeRegisterModal = () => {
  closeModal('register')
}

export const openLoginModal = () => {
  openModal({
    id: 'login-form',
    component: Login,
    position: 'bottom',
    tappable: true,
    componentProps: {
      onLogin: () => {},
    },
  })
}
export const closeLoginModal = () => {
  closeModal('login-form')
}
