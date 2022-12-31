import Logger from '../../../utils/log/log'

const userSession = new blockstack.UserSession()
const console = new Logger('engine.blockstack')
let askingForBlockstack = false

export default {
  ready: false,
  authRequired: true,
  name: 'Blockstack',
  listeners: [],
  description: 'Encrypted storage you control.',
  profile: null,
  init() {
    /** Storage Init */
    return new Promise((resolve, reject) => {
      // Check if User signin is already pending
      if (userSession.isSignInPending()) {
        /**
         * User Signin is Pending
         * We will complete the signin, then
         * refresh the page so everything loads
         */
        userSession
          .handlePendingSignIn()
          .then(() => {
            setTimeout(() => {
              window.location.href = '/'
            }, 120)
          })
          .catch((e) => {
            console.error('handlePending', e.message)
          })
      } else if (userSession.isUserSignedIn()) {
        /**
         * THe user is logged in
         * Fire off the ready listeners
         * and resolve the blockstack profile
         */
        this.fireReady()
        resolve(this.getProfile())
      } else {
        /**
         * Confirm if they want to signin with blockstack
         * if not, we will clear out their localstorage
         * and let them do it again
         */
        if (confirm('Sign-in/Register with Blockstack?')) {
          this.login()
        } else {
          // Clear local storage
          localStorage.clear()
          // Show Onboarding
          // window.location.reload();
          window.location.href = '/'
        }
      }
    }) // end return promise
  },
  onReady(func) {
    if (this.ready) {
      func()
    } else {
      if (this.listeners.indexOf(func) == -1) {
        this.listeners.push(func)
      }
    }
  },
  fireReady() {
    this.ready = true
    this.listeners.forEach((func) => {
      func()
    })
    this.listeners = []
  },
  processLogin() {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        window.location.href = '/'
      })
    } else if (userSession.isUserSignedIn()) {
      func()
    } else if ((askingForBlockstack = false)) {
      // console.error('REDIRECTING TO BLOCKSTACK');
      setTimeout(() => {
        askingForBlockstack = true
      }, 1)
      if (confirm('Sign-in/Register with Blockstack?')) {
        this.login()
      } else {
        askingForBlockstack = false
        // Clear local storage
        localStorage.clear()
        // Show Onboarding
        // window.location.reload();
        window.location.href = '/'
      }
    }
  },
  async getProfile() {
    if (this.profile) {
      return this.profile
    } else {
      let u = new blockstack.UserSession()
      let data = await u.loadUserData()
      this.profile = data
      return this.profile
    }
  },
  login() {
    window.blockstack.redirectToSignIn()
  },
  put(path, content) {
    return blockstack.putFile(path, JSON.stringify(content))
  },
  get(path) {
    return blockstack.getFile(path).then((content) => {
      return content ? JSON.parse(content) : null
    })
  },
  list() {
    return new Promise((resolve, reject) => {
      let files = []
      blockstack
        .listFiles((file, what) => {
          files.push(file)
          return true
        })
        .then(() => {
          resolve(files)
        })
        .catch(reject)
    })
  },
  delete(path) {
    return blockstack.deleteFile(path)
  },
}
