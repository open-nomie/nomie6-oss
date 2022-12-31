<script lang="ts">
  export let percentage = 0
  export let className = undefined
  export let style = ''
  export let barClass: string | undefined = undefined
  export let r2l: boolean = false
  export let not100Class: string = ''
  export let is100Class: string = ''
  export let title = ''
  export let color: string | undefined = undefined
</script>

<div
  class:r2l
  aria-label={title}
  {title}
  class="progress flex n-progress-bar  rounded-full  {className || 'h-6 dark:bg-gray-700 bg-gray-300'}"
  {style}
>
  <div
    class="h-full rounded-full {`${percentage}` !== '100' ? not100Class : is100Class}
    progress-bar transition-all {barClass || 'bg-primary-500'}"
    role="progressbar"
    style={`width:${percentage}%; ${color ? `background-color:${color};` : ''}`}
  />
</div>

<style lang="postcss" global>
  .n-progress-bar.r2l {
    @apply justify-end;
  }
</style>
