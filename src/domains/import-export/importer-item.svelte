<script lang="ts">
  import ListItem from '../../components/list-item/list-item.svelte'
  import Spinner from '../../components/spinner/spinner.svelte'

  import { createEventDispatcher } from 'svelte'
  import { Lang } from '../../store/lang'
  import Button from '../../components/button/button.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { CheckmarkCircle } from '../../components/icon/nicons'

  export let emoji = '🙃'
  export let title = 'Unknown'
  export let status
  export let count = '0'

  const dispatch = createEventDispatcher()
</script>

<ListItem bottomLine={48}>
  <span slot="left">{emoji}</span>
  <main class="flex items-center space-x-2">
    <h1 class="ntitle">
      {title}
    </h1>
    <span class="text-xs font-semibold  px-2 rounded-full bg-gray-300 dark:bg-gray-700">{count || '0'}</span>
  </main>
  <slot />
  <div slot="right" class="flex items-center space-x-2">
    {#if status.running}
      <Spinner size={24} />
    {:else if status.done}
      <IonIcon icon={CheckmarkCircle} className="text-primary-500" />
    {:else}
      <Button
        clear
        primary
        on:click={() => {
          dispatch('import')
        }}
      >
        {Lang.t('import.import', 'Import')}
      </Button>
    {/if}
  </div>
</ListItem>
