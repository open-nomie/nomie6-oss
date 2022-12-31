import localforage from 'localforage'
import { CheckmarkCircle, CircleOutline } from '../../components/icon/nicons'
import { openPopMenu } from '../../components/pop-menu/usePopmenu'
import Storage, { StorageEngines } from '../../domains/storage/storage'
import { Interact } from '../../store/interact'
import { Lang } from '../../store/lang'

import { wait } from '../../utils/tick/tick'
import { deleteAllFromCache } from '../ledger/ledger-cache'

import { getRawPrefs, Prefs, saveStorageType } from '../preferences/Preferences'
import { trackEvent } from '../usage/stat-ping'

type selectNewStorageProps = {
  current: 'local' | 'pouchdb' | string
  onSelect: Function
}

export const switchToLocal = async () => {
  const confirmed = await Interact.confirm(
    'Switch to Local Only?',
    'You can always switch back later. Note that data is not shared between storage types.'
  )
  if (confirmed) {
    saveStorageType('local')
    window.location.href = '/'
  }
}

export const switchStorage = async (type, ignoreConfirm: boolean = false) => {
  let to = type
  let conf =
    ignoreConfirm ||
    (await Interact.confirm(
      'Switch Storage Type?',
      `You can always switch back. 

      Note: Your data will not automatically move over. You'll first need to export it, then you can import into this new storage.`
    ))

  if (conf === true) {
    if (['local', 'firebase'].indexOf(to) > -1) {
      saveStorageType(to)
      Interact.reload()
    } else {
      alert(`Error: ${to} is not valid`)
    }
  }
}

/**
 * Select Storage Menu
 * Display a popmenu of storage options
 * @param props 
 */
export const useStorageSelectMenu = async (props: selectNewStorageProps) => {
  const prefs = getRawPrefs()
  const permissions = {}

  // perfs.betaFeatures

  let buttons = StorageEngines.map((storageEngine) => {
    let disabled: boolean = false;


    return {
      title: storageEngine.name,
      disabled: disabled,
      description: `${storageEngine.price} ${storageEngine.description}`,
      click() {
        if (prefs.storageType !== storageEngine.id) {
          trackEvent(`switch-engine-${storageEngine.id}`)
          props.onSelect(storageEngine.id)
        }
      },
      icon: props.current === storageEngine.id ? CheckmarkCircle : CircleOutline,
    }
  })

  openPopMenu({
    id: `storage-options`,
    title: `${Lang.t('storage.type_selector_title', 'Storage Options')}`,
    description: `${Lang.t('storage.type_selector_description', 'How would you like your data stored?')}`,
    buttons: buttons,
  })
}

/**
 * A Confirmed function to delete all data from nomie
 */
export const deleteEverything = async () => {
  try {
    let res = await Interact.confirm(
      `${Lang.t('settings.danger-zone')}`,
      `${Lang.t('settings.delete-warning', 'This will destroy ALL data in Nomie. Are you absolutely sure?')}`,
      `${Lang.t('settings.destroy', 'Destroy')}`
    )

    if (res) {
      await wait(300)

      res = await Interact.confirm(
        `${Lang.t('settings.danger-zone')}`,
        `${Lang.t('settings.delete-warning-again', 'So you REALLY want all ALL data in Nomie destroyed?')}`,
        `${Lang.t('settings.destroy', 'Destroy')}`
      )
      await wait(200)
      if (res) {
        Interact.blocker(`${Lang.t('settings.deleting-data', 'Deleting data...')}`)
        await wait(200)
        let files = await Storage.list()

        let promises = []
        files.forEach((file) => {
          promises.push(Storage.delete(file))
        })
        await Promise.all(promises)
        await localforage.clear()
        await deleteAllFromCache()
        localStorage.clear()
        Interact.stopBlocker()
        await Interact.alert('Done', 'Your data has been destroyed.')

        window.location.href = '/'
      }
    } // end if confirmed
  } catch (e) {
    Interact.alert(Lang.t('general.error'), e.message)
  }
}
