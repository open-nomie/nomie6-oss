<script lang="ts">
  export let size: number = 10
  export let className: string = ''
</script>

<div
  class="dot z-20 inline-flex rounded-full {className}"
  style="width:{size}px; height:{size}px" />
