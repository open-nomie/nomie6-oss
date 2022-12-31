<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import { Lang } from '../../store/lang'
  import Button from './button.svelte'
  const emit = createEventDispatcher()
</script>

<Button
  primary
  {...$$restProps}
  on:click={(evt) => {
    emit('click', evt.detail)
  }}
>
  {Lang.t('general.close', 'Close')}
</Button>
