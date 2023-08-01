<script lang="ts">
  import type { AlertType } from '../../store/interact'
  import { closeModal } from '../backdrop/BackdropStore2'
  import DateTimeBar from '../date-time-bar/date-time-bar.svelte'
  import Alertbox from './alertbox.svelte'

  export let id: string
  export let payload: AlertType

  const ifOnEnter = (e, func) => {
    if (e.charCode === 13) {
      func()
    }
  }
</script>

<Alertbox {id} {payload}>
  <div class="px-2 pt-1">
    {#if payload.valueType == 'textarea'}
      <textarea
        name="value"
        title="input value"
        placeholder={payload.placeholder}
        bind:value={payload.value}
        class="mt-2 form-control"
        style="min-height:200px;"
      />
    {:else if payload.valueType == 'number'}
      <input
        name="value"
        pattern="[0-9]*"
        inputmode="numeric"
        title="input value "
        on:keypress={(evt) => {
          ifOnEnter(evt, () => {
            payload.onInteract(payload)
            closeModal(id)
          })
        }}
        placeholder={payload.placeholder}
        bind:value={payload.value}
        on:focus={this.select}
        type="number"
        class="h-10 mt-2 form-control stiff"
      />
    {:else if payload.valueType == 'datetime'}
      <DateTimeBar
        opened
        calendarPosition="top"
        bind:date={payload.value}
        on:change={(evt) => {
          payload.value = evt.detail.toDate()
        }}
      />
    {:else}
      <input
        title="input value"
        on:keypress={(evt) => {
          ifOnEnter(evt, () => {
            payload.onInteract(payload)
            closeModal(id)
          })
        }}
        name="value"
        placeholder={payload.placeholder}
        bind:value={payload.value}
        class="h-10 mt-2 form-control"
      />
    {/if}
  </div>
</Alertbox>
