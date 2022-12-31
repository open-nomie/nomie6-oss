<script lang="ts">
  import type { Trackable } from '../../domains/trackable/Trackable.class'

  import Avatar from './avatar.svelte'

  export let trackable: Trackable
  export let className: string = ''
  export let style: string = ''
  export let size: number = 32
</script>

{#if trackable}
  <Avatar
    {size}
    {className}
    {style}
    src={trackable.avatar}
    emoji={trackable.emoji}
    label={trackable.label}
    color={trackable.color}
  />
{:else}
  <Avatar {size} {className} {style} label="Unknown" color="#666666" />
{/if}
