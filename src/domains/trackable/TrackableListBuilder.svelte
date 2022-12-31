<script lang="ts">
  import { AllTrackables, TrackableStore } from './TrackableStore'
  import { getTrackerInputAsString } from '../tracker/input/TrackerInputStore'
  import { MenuOutline, SearchIcon } from '../../components/icon/nicons'
  import { selectTrackables } from './trackable-selector/TrackableSelectorStore'
  import { showToast } from '../../components/toast/ToastStore'
  import { strToToken, Token, tokenizeLite } from '../../modules/tokenizer/lite'
  import { tokenToTrackable } from '../../modules/tokenizer/tokenToTrackable'
  import { Trackable } from './Trackable.class'
  import { wait } from '../../utils/tick/tick'

  import Badge from '../../components/badge/badge.svelte'
  import Button from '../../components/button/button.svelte'
  import Divider from '../../components/divider/divider.svelte'
  import Input from '../../components/input/input.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import List from '../../components/list/list.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import SortableList2 from '../../components/sortable-list/sortable-list2.svelte'
  import TrackableAvatar from '../../components/avatar/trackable-avatar.svelte'

  export let value: string = ''
  export let className: string = ''

  let trackables: Array<Trackable> = []
  let manualAdd: string = ''
  let ready: boolean = true

  let lastValueHash: any
  $: if (value && value !== lastValueHash) {
    lastValueHash = value
    trackables = tokenizeLite(`${value || ''}`).map((token) => {
      return tokenToTrackable(token, $AllTrackables)
    })
  }

  // Adding a token to the trackables array.
  async function addToken(token: Token) {
    const trackable = tokenToTrackable(token, $AllTrackables)
    if (!trackables.find((t) => t.tag == trackable.tag)) {
      trackables.push(trackable)
      trackables = trackables
      update()
    }
  }

  // Adding a trackable to the trackables array.
  async function addTrackable(trackable?: Trackable) {
    if (!trackables.includes(trackable)) {
      trackables.push(trackable)
      trackables = trackables
    }
  }

  // A function that allows the user to select trackables from a list of trackables.
  async function pickTrackables() {
    let picked = await selectTrackables()
    picked.forEach((trackable) => {
      addTrackable(trackable)
    })
    update()
  }

  // Converting the trackables array into a string that can be used as a note.
  function trackablesToNote() {
    let note = trackables
      .map((trackable) => {
        return trackable.getNoteValue(trackable.value, false)
      })
      .join(' ')

    return note
  }

  // Updating the value of the trackable list builder.
  async function update() {
    value = trackablesToNote()
    ready = false
    await wait(10)
    ready = true
  }

  // Removing a trackable from the trackables array.
  async function remove(trackable: Trackable) {
    trackables = trackables.filter((d: Trackable) => {
      return d.tag !== trackable.tag
    })
    update()
  }

  // Adding a token to the trackables array.
  const addManualItem = () => {
    const token = strToToken(manualAdd)
    if (token && token.type !== 'generic') {
      addToken(token)
      manualAdd = ''
    } else {
      showToast({
        message: `${manualAdd} is not valid`,
      })
    }
  }

  // Updating the default value of a tracker.
  const updateDefault = async (trackable: Trackable) => {
    if (trackable.tracker) {
      const value = await getTrackerInputAsString({
        tracker: trackable.tracker,
        trackables: $TrackableStore.trackables,
        allowSave: false,
      })

      if (value) {
        const updatedTokens = trackables.map((t, index) => {
          if (t.tag == trackable.tag) {
            t.value = value.value
            t.tracker.default = value.value
          }
          return t
        })

        trackables = updatedTokens
        update()
      }
    }
  }
</script>

<div class="trackable-list-builder-bound">
  <List solo className="mb-2">
    <Input
      listItem
      className="px-4 py-0"
      label="Add"
      placeholder="e.g. #mood or @mom"
      on:enter={addManualItem}
      bind:value={manualAdd}
    >
      <div slot="right" class="flex ml-1">
        {#if manualAdd.length > 2}
          <Button
            size="sm"
            icon
            color="success"
            className="mr-2"
            on:click={() => {
              addManualItem()
            }}>+</Button
          >
        {/if}
        <Button size="sm" icon color="primary" className="mr-2" on:click={pickTrackables}>
          <IonIcon icon={SearchIcon} size={14} />
        </Button>
      </div>
    </Input>
  </List>

  {#if ready && trackables.length}
    <SortableList2
      key="id"
      direction="y"
      sortable={true}
      {className}
      items={trackables}
      on:update={(evt) => {
        if (evt.detail.length) {
          trackables = evt.detail.map((rawTrackable) => {
            return new Trackable(rawTrackable)
          })
          update()
        }
      }}
      let:item
    >
      <ListItem compact bottomLine={62}>
        <div slot="left">
          <Button size="sm" icon color="danger" className="mr-4 text-white bg-red-500" on:click={() => remove(item)}>
            -
          </Button>
          <TrackableAvatar trackable={item} size={24} />
        </div>
        {item.label}
        <div slot="right" class="flex items-center space-x-2">
          {#if item.type == 'tracker' && item.tracker}
            <Badge on:click={() => updateDefault(item)} pad value={item.formatValue(item.tracker.default)} />
          {/if}
          <IonIcon icon={MenuOutline} className="text-gray-500" />
        </div>
      </ListItem>
      <Divider inset />
    </SortableList2>
  {/if}
</div>
