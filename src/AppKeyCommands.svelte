<script lang="ts">
  import { openUnisearch } from './domains/search/UnisearchStore'

  const onKeyDown = (evt) => {
    if (evt.key == 'p' && evt.metaKey) {
      openUnisearch()
      evt.preventDefault()
    }
  }
</script>

<svelte:window on:keydown={onKeyDown} />
