<script lang="ts">
  import dayjs from 'dayjs'

  export let variable: Object

  let type: string = 'string'
  $: if (variable) {
    if (variable instanceof Array) {
      type = 'array'
    }
    if (variable instanceof Date) {
      type = 'date'
    } else if (typeof variable === 'object') {
      type = 'object'
    } else {
      type = typeof variable
    }
  }
</script>

<div class="nd-object my-px text-xs  bg-gray-500 bg-opacity-20 border-gray-400 py-1 px-2 rounded-md {type}">
  {#if variable}
    {#each Object.keys(variable) as key}
      <div class="values grid grid-cols-2">
        <div class="font-bold px-2 line-clamp-1 text-blue-500 text-right text-xs">{key}</div>
        {#if typeof variable[key] === 'string' || typeof variable[key] === 'number'}
          <div>{variable[key]}</div>
        {:else if variable[key] instanceof Date}
          <div class="date font-mono text-indigo-500">
            {dayjs(variable[key]).format('ddd MMM Do YYYY h:mm a')}
          </div>
        {:else}
          <svelte:self variable={variable[key]} />
        {/if}
      </div>
    {/each}
  {:else}
    null
  {/if}
</div>

<style global lang="postcss">
  .nd-object.string {
    @apply text-indigo-700;
  }
  .nd-object.array {
    @apply text-pink-500;
  }
</style>
