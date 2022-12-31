<script lang="ts">
  import Modal2 from '../../../components/modal/modal2.svelte'
  import Panel from '../../../components/panel/panel.svelte'
  import ToolbarGrid from '../../../components/toolbar/toolbar-grid.svelte'
  import { LibraryManagerStore, saveLibraryTracker } from './LibraryManagerStore'
  import type { LibraryTrackerType } from './LibraryManagerStore'
  import Button from '../../../components/button/button.svelte'
  import IonIcon from '../../../components/icon/ion-icon.svelte'
  import { CloseOutline, CopyOutline, PencilOutline, TrashOutline } from '../../../components/icon/nicons'
  import List from '../../../components/list/list.svelte'
  import Input from '../../../components/input/input.svelte'
  import Divider from '../../../components/divider/divider.svelte'

  import TrackerClass from '../../../modules/tracker/TrackerClass'
  import { Lang } from '../../../store/lang'
  import { objectHash } from '../../../modules/object-hash/object-hash'

  import ListItem from '../../../components/list-item/list-item.svelte'

  import Avatar from '../../../components/avatar/avatar.svelte'

  import { firebaseAuth } from '../../firebase/FirebaseStore'
  import { Interact } from '../../../store/interact'
  import { editTracker } from '../../tracker/editor/TrackerEditorStore'
  import { selectTrackables } from '../../trackable/trackable-selector/TrackableSelectorStore'
  import { closeModal } from '../../../components/backdrop/BackdropStore2'
  import { openTrackableEditor } from '../../trackable/trackable-editor/TrackableEditorStore'
  import { Trackable } from '../../trackable/Trackable.class'

  let workingLibTracker: LibraryTrackerType
  let showDom: boolean = false
  let trackers: Array<TrackerClass> = []

  export let id: string

  let lastHash = ''
  $: if (objectHash($LibraryManagerStore.libraryTracker) !== lastHash) {
    lastHash = objectHash($LibraryManagerStore.libraryTracker)
    workingLibTracker = Object.assign({}, $LibraryManagerStore.libraryTracker)
    trackers = [...trackers, ...workingLibTracker.trackers.map((t) => new TrackerClass(t))]

    setTimeout(() => {
      showDom = true
    }, 100)
  }

  $: canSave = workingLibTracker && trackers?.length > 0 && workingLibTracker.title && workingLibTracker.tags

  const selectTrackers = async () => {
    const trks = await selectTrackables('tracker')

    trackers = [...trackers, ...trks.map((t) => t.tracker)]
  }

  const remove = (tracker: TrackerClass) => {
    trackers = trackers.filter((t) => t !== tracker)
  }

  const save = async () => {
    const pack: LibraryTrackerType = {
      title: workingLibTracker.title,
      trackers: trackers.map((t) => t.asObject),
      tags: workingLibTracker.tags,
      uid: firebaseAuth.currentUser?.uid,
      _id: workingLibTracker._id,
    }
    try {
      await saveLibraryTracker(pack)
      close()
      Interact.confetti({ timeout: 2000 })
    } catch (e) {
      Interact.error(e.message)
    }
  }

  const createTracker = () => {
    openTrackableEditor(new Trackable({ type: 'tracker', tracker: new TrackerClass({}) }), (trackable) => {
      trackers.push(trackable.tracker)
      trackers = trackers
    })
  }

  const close = () => {
    closeModal(id)
  }
</script>

<Modal2 visible={showDom} id="library-tracker-editor" on:close={() => close()}>
  <Panel className="bg-gray-100 dark:bg-gray-800 h-full">
    <ToolbarGrid slot="header">
      <Button icon slot="left" on:click={() => close()}>
        <IonIcon icon={CloseOutline} className="text-primary-500" />
      </Button>
      <h1 class="ntitle line-clamp-1 w-full">{workingLibTracker.title || 'Create a Library Tracker'}</h1>
      <Button primary clear slot="right" on:click={() => save()} disabled={!canSave}>
        {Lang.t('general.save', 'Save')}
      </Button>
    </ToolbarGrid>
    <main class="p-2 space-y-6 ">
      <List solo>
        <Input
          listItem
          bind:value={workingLibTracker.title}
          type="text"
          label="Library Tracker Label"
          placeholder="Library Tracker Label"
        />
        <Divider center />
        <Input
          listItem
          type="text"
          label="Tags"
          value={workingLibTracker.tags.join(',')}
          on:input={(evt) => {
            workingLibTracker.tags = evt.detail.split(',').map((t) => t.trim())
          }}
          placeholder="Tags. e.g: food, drink, health"
        />
      </List>

      <div class="wrap">
        <List title="Trackers" outside solo>
          <div slot="header-left" class="flex space-x-2">
            <Button size="sm" type="clear" className="w-full text-primary-500 " on:click={() => selectTrackers()}
              >Select...</Button
            >
            <Button size="sm" primary clear on:click={() => createTracker()}>Create</Button>
          </div>
          {#if trackers.length === 0}
            <div class="text-sm py-4 text-center text-gray-500">No trackers selected</div>
          {/if}
          {#each trackers as tracker}
            <ListItem compact>
              <div slot="left">
                <Button
                  size="sm"
                  icon
                  color="danger"
                  className="mr-2 text-white bg-red-500"
                  on:click={() => {
                    remove(tracker)
                  }}
                >
                  <IonIcon icon={TrashOutline} />
                </Button>
                <Avatar size={30} src={tracker?.avatar} emoji={tracker?.emoji} />
              </div>
              {tracker.label}
              <div slot="right" class="flex items-center space-x-2">
                <Button
                  on:click={() => {
                    const temp = tracker.asObject
                    delete temp._id
                    delete temp.tag
                    temp._dirty = true
                    const newTracker = new TrackerClass(temp)
                    trackers.push(newTracker)
                    trackers = trackers
                  }}
                  shape="round"
                  className="bg-gray-200 dark:bg-gray-800"
                  icon><IonIcon size={20} icon={CopyOutline} /></Button
                >
                <Button
                  on:click={() => {
                    editTracker(tracker, {
                      onSave(updatedTracker) {
                        tracker = updatedTracker
                      },
                    })
                  }}
                  shape="round"
                  className="bg-gray-200 dark:bg-gray-800"
                  icon><IonIcon size={20} icon={PencilOutline} /></Button
                >
              </div>
            </ListItem>
          {/each}
        </List>
      </div>
    </main>
  </Panel>
</Modal2>
