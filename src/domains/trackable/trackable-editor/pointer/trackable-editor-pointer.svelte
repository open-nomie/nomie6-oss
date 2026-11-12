<svelte:options runes={true} />

<script lang="ts">
  import Input from '../../../../components/input/input.svelte'
  import ListItem from '../../../../components/list-item/list-item.svelte'

  import List from '../../../../components/list/list.svelte'
  import RadioButton from '../../../../components/radio-button/radio-button.svelte'
  import { parseNumber } from '../../../../utils/parseNumber/parseNumber'
  import type { Trackable } from '../../Trackable.class'

  let { trackable = $bindable() } = $props<{ trackable: Trackable }>()

  let reminderEnabled = $state(trackable.ptr.reminder)

  $effect(() => {
    // Sync reminder state back to trackable, preserving PointerClass structure
    trackable.ptr.reminder = reminderEnabled
  })
</script>


<List solo>
  <Input 
    type="textarea"
    label="Provide background of pointer"
    placeholder="..please enter description"
    bind:value={trackable.ptr.description}
    rows={5} 
    on:change = {(evt) => {
      trackable.ptr.description = (evt.detail)
      console.log(evt.detail)
    }} >
    
    
  </Input>
  </List>
  <div class="mb-4" />
  <List solo>
  <ListItem bottomLine={70}>
    <div>
      <h1 class="line-clamp-1">Do you want to activate a reminder for this pointer?</h1>
    </div>
    <RadioButton slot="right" bind:checked={reminderEnabled} />
  </ListItem>
</List>
<div class="mb-4" />
<List solo>
  <Input
    type="date"
    disabled={!reminderEnabled}
    label="Provide next reminder date"
    placeholder="01/01/2099"
    bind:value={trackable.ptr.reminderdate}
    rows={1}
  />
</List>
<p class="list-note">
  A pointer is literaly a point in time. You can assign pointers to individual notes to quickly find them later.
  You can aslo set a reminder date so Nomie will remind you when you anticipated to log info tagged with a specific pointer.
  Example: you can create a pointer for your yearly health checkup results (combo tracker) and let Nomie remind you to schedule 
  a next health checkup.
</p>
