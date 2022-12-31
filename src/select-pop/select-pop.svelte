<script lang="ts">
import { createEventDispatcher } from 'svelte';

  import IonIcon from '../components/icon/ion-icon.svelte'
  import { openPopMenu, PopMenuButton } from '../components/pop-menu/usePopmenu'
import CheckmarkOutline from '../n-icons/CheckmarkOutline.svelte';

  import ChevronDownOutline from '../n-icons/ChevronDownOutline.svelte'

  export let className: string = ''
  export let value: any
  export let options: Array<{ key: string | number; value: any, selected?: boolean }> = []
  export let placeholder: string = ''
  export let id: string

  const emit = createEventDispatcher();
  const showMenu = () => {
    const buttons:Array<PopMenuButton> = options.map((option) => {
      return {
        title: option.value,
        icon: option.selected ? CheckmarkOutline : undefined,
        click() {
          emit('change', option)
        },
      }
    })
    openPopMenu({
      id,
      buttons,
    })
  }
</script>

<button on:click={showMenu} class="select-pop {$$restProps.class || ''} {className || ''}" {...$$restProps}>
  <span class="mr-4 font-medium">{value || placeholder}</span>
  <IonIcon icon={ChevronDownOutline} size={16} />
</button>


<style lang="postcss">
  .select-pop {
    @apply flex items-center;
  }
</style>