<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import EmojiList from './EmojiList.svelte'
  import EmojiSearch from './EmojiSearch.svelte'
  import EmojiSearchResults from './EmojiSearchResults.svelte'
  import VariantPopup from './VariantPopup.svelte'

  import emojiData from './data/emoji-light'
  import ButtonGroup from '../button-group/button-group.svelte'
  import Panel from '../panel/panel.svelte'

  export let maxRecents = 50
  export let autoClose = true

  let variantsVisible = false

  let variants
  let currentEmoji
  let searchText
  let recentEmojis = JSON.parse(localStorage.getItem('recent-emojis')) || []

  const dispatch = createEventDispatcher()

  const emojiCategories = {}
  emojiData.forEach((emoji) => {
    let categoryList = emojiCategories[emoji.c]
    if (!categoryList) {
      categoryList = emojiCategories[emoji.c] = []
    }
    categoryList.push(emoji)
  })

  const categoryOrder = ['People', 'Nature', 'Eat', 'Activities', 'Places', 'Objects', 'Symbols', 'Flags']

  const categoryIcons = {
    People: '😀',
    Nature: '🐹',
    Eat: '🍟',
    Activities: '⚽️',
    Places: '🏘',
    Objects: '💡',
    Symbols: '🎵',
    Flags: '🏴‍☠️',
  }

  function onKeyDown(event) {
    if (event.key === 'Escape') {
      // hidePicker();
    }
  }

  function showEmojiDetails(event) {
    currentEmoji = event.detail
  }

  function onEmojiClick(event) {
    // Does it have Variants?
    if (event.detail.v.length) {
      variants = [...[event.detail.e], ...event.detail.v]
      variantsVisible = true
    } else {
      dispatch('emoji', event.detail.e)
      saveRecent(event.detail)
    }
  }

  function onVariantClick(event) {
    dispatch('emoji', event.detail)
    saveRecent({
      e: event.detail,
    })
    hideVariants()

    if (autoClose) {
      // hidePicker();
    }
  }

  function saveRecent(emoji) {
    recentEmojis = [emoji, ...recentEmojis.filter((recent) => recent.e !== emoji.e)].slice(0, maxRecents)
    localStorage.setItem('recent-emojis', JSON.stringify(recentEmojis))
  }

  function hideVariants() {
    // We have to defer the removal of the variants popup.
    // Otherwise, it gets removed before the click event on the body
    // happens, and the target will have a `null` parent, which
    // means it will not be excluded and the clickoutside event will fire.
    setTimeout(() => {
      variantsVisible = false
    })
  }

  let selectedIndex = 1
  let selectedCategory = 'People'
</script>

<svelte:body on:keydown={onKeyDown} />

<div class="  flex px-2 lg:px-4 flex-col overflow-hidden h-full" on:keydown={onKeyDown}>
  <EmojiSearch bind:searchText />
  <ButtonGroup
    scrollable
    className="text-xl overscroll-y-auto my-2"
    buttons={[
      ...[
        {
          label: '⏰',
          active: selectedIndex == 0,
          click() {
            selectedIndex = 0
            selectedCategory = undefined
          },
        },
      ],
      ...categoryOrder.map((category, index) => {
        return {
          active: selectedIndex == index + 1,
          label: categoryIcons[category],
          click() {
            selectedIndex = index + 1
            selectedCategory = category
          },
        }
      }),
    ]}
  />

  <Panel className="w-full h-full ">
    {#if searchText}
      <EmojiSearchResults {searchText} on:emojihover={showEmojiDetails} on:emojiclick={onEmojiClick} />
    {:else if !selectedCategory}
      <EmojiList emojis={recentEmojis} on:emojihover={showEmojiDetails} on:emojiclick={onEmojiClick} />
    {:else}
      <EmojiList
        emojis={emojiCategories[selectedCategory]}
        on:emojihover={showEmojiDetails}
        on:emojiclick={onEmojiClick}
      />
    {/if}
  </Panel>

  <section aria-label="search Emojis" />

  <!-- {#if searchText}
    <EmojiSearchResults {searchText} on:emojihover={showEmojiDetails} on:emojiclick={onEmojiClick} />
  {:else}
    <div class="text-black svelte-emoji-picker__emoji-tabs dark:text-gray-200">
      <ButtonGroup
        className="text-xl overscroll-y-auto"
        buttons={[
          ...[
            {
              label: '⏰',
              active: selectedIndex == 0,
              click() {
                selectedIndex = 0
                selectedCategory = undefined
              },
            },
          ],
          ...categoryOrder.map((category, index) => {
            return {
              active: selectedIndex == index + 1,
              label: categoryIcons[category],
              click() {
                selectedIndex = index + 1
                selectedCategory = category
              },
            }
          }),
        ]}
      />

      <section class="py-4">
        {#if !selectedCategory}
          <EmojiList
            name="Recently Used"
            emojis={recentEmojis}
            on:emojihover={showEmojiDetails}
            on:emojiclick={onEmojiClick}
          />
        {:else}
          <EmojiList
            name={selectedCategory}
            emojis={emojiCategories[selectedCategory]}
            on:emojihover={showEmojiDetails}
            on:emojiclick={onEmojiClick}
          />
        {/if}
      </section>
    </div>
  {/if} -->

  {#if variantsVisible}
    <VariantPopup {variants} on:emojiclick={onVariantClick} on:close={hideVariants} />
  {/if}
</div>

<style lang="postcss" global>
  .svelte-emoji-picker {
    background: var(--color-solid-0);
    @apply h-auto;
    @apply w-auto;
    @apply flex-grow;
    @apply flex-shrink;
    @apply max-w-full;
    @apply m-0;
    @apply shadow-md;
    @apply p-2;
    color: var(--color-solid-900);
  }

  .svelte-emoji-picker__emoji-tabs {
    padding: 0.25em;
    height: auto;
  }

  .svelte-emoji-picker__emoji-tabs .svelte-tabs ul.svelte-tabs__tab-list {
    display: flex;
  }

  .svelte-emoji-picker__emoji-tabs .svelte-tabs li.svelte-tabs__tab {
    flex-grow: 1;
  }

  .svelte-tabs__tab-list {
    border-bottom: solid 1px var(--color-solid-100) !important;
  }
</style>
