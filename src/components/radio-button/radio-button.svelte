<script lang="ts">
  export let checked: boolean = false
  export let className: string = ''
  export let sm: boolean = false
</script>

<input type="checkbox" class:sm bind:checked class="n-radio {className}" />

<style lang="postcss" global>
  .n-radio {
    @apply appearance-none;
    @apply flex-grow-0 flex-shrink-0;
    @apply w-6 h-6;
    @apply border-2 border-gray-800 dark:border-gray-200;
    @apply rounded-full;
  }
  .n-radio.sm {
    @apply h-4 w-4;
  }
  .n-radio:checked {
    @apply bg-primary-500;
    @apply ring-4 dark:ring-gray-800 ring-gray-200 ring-inset;
  }
</style>
