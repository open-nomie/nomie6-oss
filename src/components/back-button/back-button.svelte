<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { navigate } from 'svelte-navigator'

  import { Device } from '../../store/device-store'
  import { Lang } from '../../store/lang'

  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { ArrowBack } from '../icon/nicons'

  export let to: string | undefined = undefined
  export let back: Function | undefined = undefined
  export let label: string | undefined = undefined

  const dispatch = createEventDispatcher()
  const onClick = (event) => {
    if (document.referrer.match(document.location.origin)) {
      history.back()
    } else if (back) {
      back(event)
    } else if (to) {
      navigate(to)
    }
    dispatch('click', event)
  }
</script>

<button
  class="{$Device.width < 399 ? 'nbtn-icon circle' : 'clear'} flex items-center text-primary-500"
  on:click={(evt) => onClick(evt)}
>
  <IonIcon icon={ArrowBack} className="text-primary-500" />
  {#if $Device.width > 400}
    <span class="ml-2 text-primary-500">
      {label || Lang.t('general.back', 'Back')}
    </span>
  {/if}
</button>
