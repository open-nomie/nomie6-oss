<script lang="ts">
  import ShortcutButton from './shortcut-button.svelte'

  import { createEventDispatcher } from 'svelte'

  import type Person from 'domains/people/Person.class'
  import TrackableAvatar from '../avatar/trackable-avatar.svelte'
  export let compact: boolean = false
  export let id: string
  export let color: string
  export let person: Person
  export let hoursUsed: any | undefined = undefined
  export let value: string | number | undefined = undefined
  export let subtitle: string | number | undefined = undefined
  const dispatch = createEventDispatcher()
</script>

{#if person}
  <ShortcutButton
    {id}
    {hoursUsed}
    {compact}
    hideValue
    color={color || person.color}
    {value}
    on:more={() => {
      dispatch('more', person)
    }}
    title={(person || {}).displayName}
    {subtitle}
    on:click={() => {
      dispatch('click', person)
    }}
    on:longpress={() => {
      dispatch('longpress', person)
    }}
  >
    <div slot="emoji">
      <TrackableAvatar className="shadow-md" trackable={person.toTrackable()} size={36} />
    </div>
  </ShortcutButton>
{/if}
