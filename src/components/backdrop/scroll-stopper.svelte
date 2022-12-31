<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  onMount(() => {
    document.body.classList.add('overflow-hidden')
  })
  onDestroy(() => {
    document.body.classList.remove('overflow-hidden')
  })
</script>
