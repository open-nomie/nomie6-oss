<script lang="ts">
  import ScanOutline from './../../../n-icons/ScanOutline.svelte'
  import { CloudAPIStore } from './../../cloud-api/CloudApiStore'
  import TrackableAvatar from '../../../components/avatar/trackable-avatar.svelte'
  import BackdropModal from '../../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../../components/backdrop/BackdropStore2'
  import Button from '../../../components/button/button.svelte'

  import IonIcon from '../../../components/icon/ion-icon.svelte'
  import Input from '../../../components/input/input.svelte'
  import ListItem from '../../../components/list-item/list-item.svelte'
  import { openIFrameModal } from '../../../components/modal/iframe-modal-helper'

  import Spinner from '../../../components/spinner/spinner.svelte'
  import { showToast } from '../../../components/toast/ToastStore'
  import ToolbarGrid from '../../../components/toolbar/toolbar-grid.svelte'
  import { AppVersion } from '../../../modules/app-version/app-version'
  import { randomColor } from '../../../modules/colors/colors'
  import { objectHash } from '../../../modules/object-hash/object-hash'

  import CreateOutline from '../../../n-icons/CreateOutline.svelte'
  import DownloadOutline from '../../../n-icons/DownloadOutline.svelte'
  import LockClosedSolid from '../../../n-icons/LockClosedSolid.svelte'
  import TrashOutline from '../../../n-icons/TrashOutline.svelte'
  import { Interact } from '../../../store/interact'
  import { Lang } from '../../../store/lang'
  import { removePrefix, truncateText } from '../../../utils/text/text'
  import { wait } from '../../../utils/tick/tick'
  import { getAwardChain, giveAward } from '../../awards/AwardsStore'
  import { removeTrackableFromNomie } from '../../board/boardActions'

  import { PermissionsStore } from '../../my-account/PermissionsStore'
  import { openSubscriptionModal } from '../../my-account/useMyAccountModal'
  import { randomEmoji } from '../../tracker/editor/TrackerEditorStore'

  import { downloadTrackables, strToTagSafe } from '../trackable-utils'
  import { Trackable } from '../Trackable.class'
  import { InitTrackableStore, saveTrackable, TrackableStore } from '../TrackableStore'
  import TrackableEditorContext from './context/trackable-editor-context.svelte'
  import TrackableEditorPerson from './person/trackable-editor-person.svelte'

  import { openTrackableVisuals } from './TrackableVisualStore'
  import TrackableEditorTracker from './tracker/trackable-editor-tracker.svelte'
  import { getTrackerInputAsString } from '../../tracker/input/TrackerInputStore'
  import appConfig from '../../../config/appConfig'
  import { Prefs } from '../../preferences/Preferences'
  import { Device } from '../../../store/device-store'
  import CopyOutline from '../../../n-icons/CopyOutline.svelte'
  import { openTrackableEditor } from './TrackableEditorStore'

  export let trackable: Trackable
  export let id: string
  export let saveByPass: Function

  let workingTrackable: Trackable
  let canSave: boolean = false
  let ogTag: string

  let workingTag: string
  let label: string = 'Label'
  let tagExists: boolean = false

  let saving: boolean = false

  $: if (trackable && !workingTrackable) {
    workingTrackable = new Trackable(trackable)
    workingTag = workingTrackable.tag || strToTagSafe(workingTrackable.label)
    ogTag = workingTag

    if (!ogTag && !workingTrackable.emoji) {
      workingTrackable.emoji = randomEmoji()
      workingTrackable.color = randomColor()
    }
    if (workingTrackable.type == 'tracker') label = 'Tracker Label'
    if (workingTrackable.type == 'person') label = `Person's Name`
  }

  $: if (objectHash(workingTrackable)) {
    canSave = workingTrackable.canSave
    if (canSave && ogTag !== workingTag) {
      if ($TrackableStore.trackables[`${workingTrackable.prefix}${workingTag}`]) {
        canSave = false
        tagExists = true
        console.error('That tag already exists!')
      } else {
        tagExists = false
      }
    }
  }

  const generateCode = async (trackable: Trackable) => {
    try {
    } catch (e) {
      Interact.error(e.message)
    }
  }

  /**
   * Save the Working Trackable
   */
  const save = async () => {
    if (!workingTrackable.id) workingTrackable.id = `${workingTrackable.prefix}${workingTag}`
    if (!ogTag) {
      workingTrackable.tag = workingTag
    }

    saving = true
    if (saveByPass) {
      saveByPass(workingTrackable)
      close()
    } else {
      let saved = await saveTrackable({
        trackable: workingTrackable,
        known: $TrackableStore.trackables,
        permissions: $PermissionsStore,
      })
      // Toast the Place!
      close()
      InitTrackableStore()

      saving = false
      if (saved) {
        showToast({ message: `${workingTrackable.label} saved` })
        setTimeout(async () => {
          let awards = getAwardChain()
          if (awards && !awards.getById('award-creator')) {
            await wait(600)
            giveAward('award-creator')
          }
        })
      }
    } // end Save By Pass Check
  }

  /**
   * Duplicat Trackable
   * This will take the working trackable, make it a new trackable and
   * open the trackable editor modal
   */
  const duplicateTrackable = async () => {
    let starter = new Trackable(workingTrackable)
    starter.id = undefined
    starter.tag = undefined
    starter.tracker.tag = undefined
    starter.tracker.id = undefined
    starter.tracker.label = undefined
    starter.tracker._dirty = true
    closeModal(id)
    await wait(200)
    openTrackableEditor(starter)
  }

  /**
   * Edit a Tag
   * This will prompt the user if they want to change it if the trackable
   * has already been created... Why? Because you cannot go back in time and change
   * the tags used in your notes. Tags are like hashtags and cannot be changed later on.
   */
  const editTag = async () => {
    let newTag: string
    if (ogTag) {
      const confirmed = await Interact.confirm(
        'Warning about Tag Changing',
        `This trackable has already been saved. While you can save a new tag, all past data will not be updated and the old tag will still remain. The new tag will be used moving forward.`
      )

      if (confirmed) {
        await wait(200)
        newTag = await Interact.prompt('New Tag', undefined, { value: removePrefix(ogTag) })
      }
    } else {
      newTag = await Interact.prompt('New Tag', undefined, { value: removePrefix(workingTrackable.tag) })
    }
    if (newTag) {
      const safeTag = strToTagSafe(newTag)
      if ($TrackableStore.trackables[`${workingTrackable.prefix}${safeTag}`]) {
        await wait(200)
        await Interact.error(`${workingTrackable.prefix}${safeTag} already exists. Try another`)
        await wait(200)
        editTag()
      } else {
        ogTag = undefined
        workingTag = safeTag
      }
    }
  }

  const close = async () => {
    closeModal(id)
  }
</script>

<BackdropModal mainClass="bg-gray-200 dark:bg-gray-800">
  <ToolbarGrid slot="header" className="bg-gray-50 stiff dark:bg-black">
    <Button slot="left" id="cancel-button" clear primary on:click={close}>{Lang.t('general.cancel', 'Cancel')}</Button>
    <h2
      class="font-bold  text-sm flex-grow-0 line-clamp-1 text-black  dark:text-white capitalize flex items-center space-x-2"
    >
      {#if !saving}
        {workingTrackable.label} Editor
      {:else}
        <Spinner size={24} />
      {/if}
    </h2>
    <Button slot="right" id="save-button" clear primary disabled={!canSave} on:click={save}
      >{Lang.t('general.save', 'Save')}</Button
    >
  </ToolbarGrid>

  <!-- Trackable Visuals Collector 
  Avatar, Emoji, Color, Label  -->
  <section class="label-emoji-color filler overflow-y-auto  px-4 dark:text-gray-200 py-4 bg-gray-50 dark:bg-black mb-4">
    <div class="visuals-editor flex items-center space-x-4">
      <button
        class="bg-primary-500 w-20 h-20 stiff"
        style="border-radius:33%; {workingTrackable.color
          ? `background-color:${workingTrackable.color} !important;`
          : ''}"
        on:click={async () => {
          const visuals = await openTrackableVisuals(workingTrackable)
          if (visuals) {
            if (visuals.color) workingTrackable.color = visuals.color
            if (visuals.emoji) workingTrackable.emoji = visuals.emoji
            if (visuals.avatar) workingTrackable.avatar = visuals.avatar
          }
        }}
      >
        {#key workingTrackable}
          <TrackableAvatar trackable={workingTrackable} size={64} />
        {/key}
      </button>

      <!-- Lable Collection -->
      <div class="flex flex-col w-full">
        <Input
          className="outline"
          id="trackable-label-input"
          value={workingTrackable.label}
          on:input={(evt) => {
            workingTrackable.label = evt.detail
            if (!ogTag) {
              workingTag = `${strToTagSafe(workingTrackable.label)}`
              workingTrackable.tag = workingTag
            }
          }}
          placeholder={label}
          {label}
        />
        {#if ogTag || workingTag}
          <div class="tag-control flex justify-end items-center space-x-2">
            {#if tagExists}
              <div class="text-red-500 text-xs">Tag already exists</div>
            {/if}
            <button
              on:click={() => editTag()}
              class="flex items-center focus:outline-none focus:ring ring-primary-500 rounded-md"
            >
              {#if ogTag && ogTag.length}
                <span class="opacity-50 ">Tag:</span> <span>{truncateText(ogTag, $Device.size == 'lg' ? 40 : 20)}</span>
                <IonIcon icon={LockClosedSolid} size={12} />
              {:else if workingTag}
                <span class="opacity-50">Tag:</span>
                <span>{truncateText(`${workingTrackable.prefix}${workingTag}`, $Device.size == 'lg' ? 40 : 20)}</span>
                <IonIcon icon={CreateOutline} size={12} />
              {/if}
            </button>
          </div>
        {/if}
      </div>
    </div>
  </section>

  <section class="px-2 h-50vh ">
    {#if workingTrackable.type == 'context'}
      <TrackableEditorContext bind:trackable={workingTrackable} />
    {/if}
    {#if workingTrackable.type == 'person'}
      <TrackableEditorPerson bind:trackable={workingTrackable} />
    {/if}
    {#if workingTrackable.type == 'tracker'}
      <TrackableEditorTracker bind:trackable={workingTrackable} />
    {/if}
  </section>

  <section class="mt-4 bg-white dark:bg-black pb-10">
    <ListItem
      bottomLine={16}
      clickable
      on:click={() => {
        downloadTrackables([workingTrackable], `${AppVersion}`)
      }}
    >
      Share Tracker
      <IonIcon slot="right" icon={DownloadOutline} className="text-primary" />
    </ListItem>

    {#if $Prefs.betaFeatures}
      <ListItem bottomLine={16} on:click={() => generateCode(workingTrackable)}>
        <span> Generate QR Code or NFC </span>
        <IonIcon slot="right" icon={ScanOutline} className="text-primary" />
      </ListItem>
    {/if}
    {#if workingTrackable.type == 'tracker'}
      <ListItem
        bottomLine={16}
        on:click={() => {
          duplicateTrackable()
        }}
      >
        Duplicate Trackable...
        <IonIcon slot="right" icon={CopyOutline} className="text-primary-500" />
      </ListItem>
    {/if}

    <ListItem
      on:click={async () => {
        await removeTrackableFromNomie(workingTrackable)
        close()
      }}
    >
      <span class="text-red-500">Delete Trackable</span>
      <IonIcon slot="right" icon={TrashOutline} className="text-red-500" />
    </ListItem>
  </section>
</BackdropModal>
