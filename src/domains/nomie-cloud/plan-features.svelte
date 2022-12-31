<script lang="ts">
  import type { Subscription } from '@stripe/firestore-stripe-payments'

  import IonIcon from '../../components/icon/ion-icon.svelte'

  import CheckmarkOutline from '../../n-icons/CheckmarkOutline.svelte'
  import RemoveCircleOutline from '../../n-icons/RemoveCircleOutline.svelte'
  import { Interact } from '../../store/interact'
  import { cleanSubscriptionMeta } from '../my-account/PermissionsStore'

  export let subscription: Subscription

  let metaClean: Array<{ key: string; value: any }> = []

  $: if (subscription) {
    metaClean = cleanSubscriptionMeta(subscription.metadata)
      .sort((a, b) => {
        return a.key > b.key ? 1 : -1
      })
      .sort((a, b) => {
        return a.value < b.value ? 1 : -1
      })
  }

  const whatsThis = (item: { key: string; value: any }) => {
    let title: string = item.key
    let description: string | undefined
    if (item.key === 'trackables') {
      title = `What's a Trackable?`
      description = `In Nomie, these are the unique items you'll track, monitor, and measure.  Note: manually typing notes allows you to track an infinite number of trackables, such as "had #breakfast with @mom #coffee(4)". But the limit is how many can be buttons with custom icons, colors and additional configurations.`
    } else if (item.key === 'dashboard_days_back') {
      title = `What's Dashboard Days Back?`
      description = `The maximum number of days back from which a widget can retrieve data for the dashboard.`
    } else if (item.key === 'api_slots') {
      title = `What's an API Slot?`
      description = `Each account on Nomie is limited to a certain number of API slots. When you post an API call, it is encrypted and stored in that slot until it is downloaded and decrypted by your device. That slot is freed up for another call once it has been downloaded.`
    } else if (item.key === 'goals') {
      title = `What are Goals?`
      description = `Make daily goals for accomplishing, or not doing, certain critical things in your life.`
    } else if (item.key === 'related_comparison') {
      title = `What's Related Comparison?`
      description = `Nomie will search your entire dataset for trackables that are perhaps related to one another. For example, how drinking more water might be related to peeing more.`
    } else if (item.key === 'csv_export') {
      title = `What's CSV Export?`
      description = `You can export your data in a variety of CSV formats. Note:  you can always use Nomie's backup feature to export your data in readable JSON.`
    }

    Interact.alert(title, description)
  }

  const toLabel = (str) => {
    return str.replace(/_/g, ' ')
  }
</script>

<div class="features flex-grow flex-shrink h-full ">
  <ul>
    {#each metaClean as metaItem, index}
      <li class="{metaItem.value === false ? 'line-through opacity-50' : ''} flex py-px items-center space-x-2">
        {#if metaItem.value !== false}
          <IonIcon icon={CheckmarkOutline} size={20} className="text-yellow-500" />
        {:else}
          <IonIcon icon={RemoveCircleOutline} size={20} className="text-red-500" />
        {/if}
        {#if metaItem.key === 'dashboard_days_back'}
          <span class="capitalize font-medium leading-snug text-xs lg:text-sm"
            >Dashboard Days
            {#if metaItem.value !== true && metaItem.value !== false}<span class="pl-1  text-yellow-500"
                >{metaItem.value}</span
              >{/if}
          </span>
        {:else}
          <span class="capitalize font-medium leading-snug text-xs lg:text-sm">
            <span class="underline" on:click={() => whatsThis(metaItem)}>{toLabel(metaItem.key)}</span>
            {#if metaItem.value !== true && metaItem.value !== false}<span class="pl-1  text-yellow-500"
                >{metaItem.value}</span
              >{/if}
          </span>
        {/if}
      </li>
    {/each}
  </ul>
</div>
