<script lang="ts">
  import Avatar from '../../../components/avatar/avatar.svelte'
  import BackdropModal from '../../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../../components/backdrop/BackdropStore2'

  import ButtonGroup from '../../../components/button-group/button-group.svelte'

  import Button from '../../../components/button/button.svelte'

  import ColorPicker from '../../../components/color-picker/color-picker.svelte'
  import EmojiSelector from '../../../components/emoji-selector/EmojiSelector.svelte'
  import IonIcon from '../../../components/icon/ion-icon.svelte'
  import Input from '../../../components/input/input.svelte'
  import List from '../../../components/list/list.svelte'

  import Toolbar from '../../../components/toolbar/toolbar.svelte'
  import ImageUploader from '../../../components/uploader/image-uploader.svelte'
  import { objectHash } from '../../../modules/object-hash/object-hash'
  import ArrowBack from '../../../n-icons/ArrowBack.svelte'
  import { wait } from '../../../utils/tick/tick'
  import { getTrackableVisuals } from '../trackable-utils'
  import type { Trackable } from '../Trackable.class'

  export let id: string
  export let trackable: Trackable
  export let onComplete: Function
  // export let onCancel: Function

  let emojiOrColor: 'color' | 'emoji' | 'image' = 'emoji'

  let color: string
  let emoji: string
  let avatar: string

  let ready: boolean = true

  const refresh = async () => {
    ready = false
    await wait(2)
    ready = true
  }

  const manualEmoji = () => {
    const multiEmoji = prompt('Want multiple emojis? Do it here:', trackable.emoji)
    if (multiEmoji) {
      trackable.emoji = multiEmoji
    }
  }

  const removeImage = () => {
    trackable.avatar = undefined
    avatar = undefined
  }

  let lastTrackableHash = ''
  $: if (trackable && objectHash(trackable) !== lastTrackableHash) {
    lastTrackableHash = objectHash(trackable)
    const visuals = getTrackableVisuals(trackable)
    color = visuals.color
    emoji = visuals.emoji
    avatar = visuals.avatar
  }

  const close = () => {
    onComplete({
      emoji,
      avatar,
      color,
    })

    closeModal(id)
  }
</script>

<BackdropModal className="" mainClass="bg-white dark:bg-gray-900">
  <header slot="header" class="bg-gray-200 dark:bg-black">
    <Toolbar>
      <Button
        clear
        primary
        icon
        on:click={() => {
          close()
        }}
      >
        <IonIcon icon={ArrowBack} />
      </Button>

      <ButtonGroup
        id="visualizer-btn-group"
        buttons={[
          {
            label: 'Emoji',
            active: emojiOrColor === 'emoji',
            click() {
              emojiOrColor = 'emoji'
            },
          },
          {
            label: 'Color',
            active: emojiOrColor === 'color',
            click() {
              emojiOrColor = 'color'
            },
          },
          {
            label: 'Image',
            active: emojiOrColor === 'image',
            click() {
              emojiOrColor = 'image'
            },
          },
        ]}
      />
      <div slot="right" />
    </Toolbar>
    <section aria-label="Preview" class="px-4 py-2">
      <div class="p-4 text-center rounded-lg relative" style="background-color:{color}">
        {#if ready}
          <Avatar
            {emoji}
            on:click={() => {
              manualEmoji()
            }}
            src={avatar}
            className="bg-white p-5 rounded-xl shadow-lg"
            size={80}
          />
        {/if}

        {#if avatar}
          <button
            on:click={() => {
              removeImage()
              refresh()
              // fireChange()
            }}
            class="text-xs absolute top-2 right-3 py-1 px-3 rounded-full bg-black text-white"
          >
            Remove Image
          </button>
        {/if}
      </div>
    </section>
  </header>
  {#if emojiOrColor === 'emoji'}
    <EmojiSelector
      on:emoji={(evt) => {
        emoji = evt.detail
      }}
    />
  {:else if emojiOrColor === 'color'}
    <ColorPicker
      grid={true}
      value={color}
      on:color={(evt) => {
        color = evt.detail
      }}
    />
  {:else if emojiOrColor === 'image'}
    <div class="p-5 flex flex-col space-y-2">
      <ImageUploader
        label="Select Image..."
        className="w-full"
        on:image={(evt) => {
          avatar = evt.detail
          setTimeout(() => {
            avatar = evt.detail
          }, 10)
          refresh()
          // fireChange()
        }}
      />
      <div class="text-center pt-4 text-xs text-gray-500">Or provide a url to the image</div>
      <div class="bg-white dark:bg-black rounded-md">
        <Input listItem type="url" bind:value={avatar} placeholder="URL to image" />
      </div>
    </div>
  {/if}
</BackdropModal>
