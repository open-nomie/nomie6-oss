import config from './config/appConfig'

const NPaths = {
  firestoreRoot() {
    return `env/${import.meta.env.VITE_APP_FIRESTORE_ROOT}`
  },
  firestore(path: string) {
    return `env/${import.meta.env.VITE_APP_FIRESTORE_ROOT}/${path}`
  },
  firestoreUserKeys(uid: string) {
    return `customers/${uid}/keys`
  },
  firestoreUserKey(uid: string, key: string) {
    return `customers/${uid}/keys/${key}`
  },
  apiFresh(uid: string) {
    return `/customers/${uid}/api-fresh`
  },
  firestoreUserSubscriptions(uid: string) {
    return `/customers/${uid}/subscriptions`
  },
  localSubscriptions(uid: string) {
    return `/customers/${uid}/subscriptions_local`
  },
  blueBox(uid: string): string {
    return `env/${import.meta.env.VITE_APP_FIRESTORE_ROOT}/${uid}/bluebox`
  },
  awardChainDoc(uid: string = 'local') {
    return `awards.json`
  },
  virgilCard(userId: string) {
    return `customers/${userId}/virgil/card`
  },
  approvedTrackers() {
    return `trackable-library/trackables/approved`
  },
  routes: {
    board(id) {
      return `/board/${id}`
    },
    analytics() {
      return `/analytics`
    },
    search() {
      return `/search`
    },
    history() {
      return `/history`
    },
    dashboard() {
      return `/dashboard`
    },
    people() {
      return `/people`
    },
    settings() {
      return '/settings'
    },
    uoms() {
      return '/uoms'
    },
  },
  storage: {
    trackers() {
      return `trackers.json`
    },
    backup() {
      return `backup-settings.json`
    },
    search() {
      return `searches.json`
    },
    book(id: string) {
      return `${config.data_root}/books/${id}`
    },
    boards() {
      return `boards.json`
    },
    uniboards() {
      return `uniboards.json`
    },
    dashboards() {
      return `dashboards.json`
    },
    context() {
      return `context.json`
    },
    csvTemplates() {
      return `csv-templates.json`
    },
    templates() {
      return `templates.json`
    },
    people() {
      return `people.json`
    },
    locations() {
      return `locations.json`
    },
    writingPrompts() {
      return `writing-prompts.json`
    },
    plugins() {
      return `plugins.json`
    },
    goals() {
      return `goals.json`
    },
    awards() {
      return `awards.json`
    },
    lastUsage() {
      return `last-usage.json`
    },
    lastUsed() {
      return 'trackable-usage.json'
    },
    trackableUsage() {
      return 'trackable-usage.json'
    },
    uom() {
      return 'uoms.json'
    },
  },
  local: {
    storage(path: string) {
      return `storage/${path}`
    },
    storageType() {
      return NPaths.local.storage(`root/storage_type`)
    },
    sidestore(path: string) {
      return `${config.data_root}/localDB/${path}`
    },
  },
}

export default NPaths
