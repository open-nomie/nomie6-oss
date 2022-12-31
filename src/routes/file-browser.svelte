<script lang="ts">
  import NFileBrowser from '../components/file-browser/file-browser.svelte'
  export let path = null
</script>

<NFileBrowser path={path.replace('//', '/')} />
