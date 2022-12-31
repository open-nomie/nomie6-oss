<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { hideMenuBlocker, showMenuBlocker } from './useDropmenu'

  onMount(() => {
    showMenuBlocker()
  })
  onDestroy(() => {
    hideMenuBlocker()
  })
</script>
