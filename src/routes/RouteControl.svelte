<svelte:options runes={true} />

<script lang="ts">
  import { useLocation } from '../vendor/svelte-navigator'

  const location = useLocation()

  $effect(() => {
    document.body.dataset.path = `${$location.pathname}`;
  })

</script>
