import { openPopMenu, PopMenuButton } from "../../components/pop-menu/usePopmenu"
import appConfig from "../../config/appConfig"

import { firebaseAuth } from "../firebase/FirebaseStore"
import { openMyAccount } from "../my-account/useMyAccountModal"
import { openLoginModal, openRegisterModal } from "../nomie-cloud/account/account-helper"

export const showNomieConnectPopup = () => {
  let buttons: Array<PopMenuButton> = []
  if (!firebaseAuth.currentUser) {
    buttons.push({
      title: 'Login',
      click() {
        openLoginModal()
      },
    }),
      buttons.push({
        title: 'Register',
        click() {
          openRegisterModal()
        },
      })
  } else {
    buttons.push({
      title: 'See Upgrade Options',
      click() {
        openMyAccount()
      },
    })
  }
  buttons.push({
    title: 'Learn More...',
    click() {
      window.open(appConfig.apiDocumentation, 'docs')
    },
  })
  openPopMenu({
    id: 'nomie-api-options',
    description: 'Nomie API access, Unlock multiple Plugins.',
    title: 'Nomie Connect Subscription needed. $2.99 USD per month',
    buttons,
  })
}