<svelte:options runes={true} />

<script lang="ts">
  import NFileBrowser from '../components/file-browser/file-browser.svelte'
  let { path = null } = $props()
</script>

<NFileBrowser path={path.replace('//', '/')} />
