<script lang="ts">
  import { onMount } from 'svelte'
  import SvelteMarkdown from 'svelte-markdown'

  import Button from '../button/button.svelte'
  import Empty from '../empty/empty.svelte'
  import IonIcon from '../icon/ion-icon.svelte'
  import { CloseOutline } from '../icon/nicons'

  import Spinner from '../spinner/spinner.svelte'

  import type { MarkdownModalStoreProps } from './MarkdownModalStore'
  import { closeModal } from '../backdrop/BackdropStore2'
  import BackdropModal from '../backdrop/backdrop-modal.svelte'
  import ToolbarGrid from '../toolbar/toolbar-grid.svelte'
  import { composeEmail } from '../../utils/text/text'

  let loading: boolean = true
  let content: string

  export let id: string
  export let props: MarkdownModalStoreProps

  const getContent = async () => {
    loading = true
    const call = await fetch(props.path)
    const data = await call.text()
    content = data
    loading = false
  }

  onMount(() => {
    getContent()
  })

  const close = () => {
    closeModal(id)
  }
</script>

<BackdropModal className="min-h-75vh">
  <ToolbarGrid slot="header" className="dark:bg-gray-900 bg-white">
    <Button slot="left" primary icon on:click={close}>
      <IonIcon icon={CloseOutline} size={28} />
    </Button>
    <h2 class="text-black dark:text-white text-sm line-clamp-1 font-bold text-center">{props.title}</h2>
    <Button
      slot="right"
      primary
      size="sm"
      clear
      on:click={() => {
        composeEmail('support@happydata.org', `RE: ${props.title}`, '')
      }}
    >
      <span class="text-sm">Reply</span>
    </Button>
  </ToolbarGrid>

  <div class="min-h-full pt-4 pb-6 bg-white dark:bg-gray-900">
    {#if loading}
      <Empty>
        <Spinner size={32} />
      </Empty>
    {/if}
    <div class="prose sm px-4 dark:text-white max-w-screen-lg mx-auto">
      <SvelteMarkdown source={content} />
    </div>
  </div>
</BackdropModal>

<style lang="postcss" global>
  .prose {
  }
  .prose h1 {
    @apply text-2xl;
  }
  .prose h1,
  .prose h2,
  .prose h3,
  .prose h4,
  .prose h5 {
    @apply leading-tight;
    @apply font-bold;
    @apply dark:text-white;
  }
  .prose code {
    @apply dark:text-white font-mono;
    @apply bg-gray-500 bg-opacity-20;
  }
  .prose p {
    @apply dark:text-gray-200;
  }
  .prose strong {
    @apply dark:text-white font-bold;
  }
  .prose img {
    @apply shadow-2xl;
    @apply rounded-lg;
    @apply ring-2 ring-gray-400 ring-opacity-20;
  }
</style>
