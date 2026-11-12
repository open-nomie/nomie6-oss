<svelte:options runes={true} />

<script lang="ts">
  import type { Trackable } from '../../domains/trackable/Trackable.class'

  import Avatar from './avatar.svelte'


  const { trackable, className, style, size } = $props()
</script>

{#if trackable}
  {#if trackable.type == "tracker"}
  <Avatar
    {size}
    {className}
    {style}
    src={trackable.tracker.avatar}
    emoji={trackable.tracker.emoji}
    label={trackable.tracker.label}
    color={trackable.tracker.color}
  />
  {:else if trackable.type == "person"}
  <Avatar
    {size}
    {className}
    {style}
    src={trackable.person.avatar}
    emoji={trackable.person.emoji}
    label={trackable.person.label}
    color={trackable.person.color}
  />
  {:else if trackable.type == "context"}
  <Avatar
    {size}
    {className}
    {style}
    src={trackable.ctx.avatar}
    emoji={trackable.ctx.emoji}
    label={trackable.ctx.label}
    color={trackable.ctx.color}
  />
  {:else if trackable.type == "pointer"}
  <Avatar
    {size}
    {className}
    {style}
    src={trackable.ptr.avatar}
    emoji={trackable.ptr.emoji}
    label={trackable.ptr.label}
    color={trackable.ptr.color}
  />
  {/if}
{:else}
  <Avatar {size} {className} {style} label="Unknown" color="#666666" />
{/if}
