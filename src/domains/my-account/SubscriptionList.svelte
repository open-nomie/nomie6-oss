<script lang="ts">
  import { getPrice, Product } from '@stripe/firestore-stripe-payments'

  import Button from '../../components/button/button.svelte'
  // import Divider from '../../components/divider/divider.svelte'

  import ListItem from '../../components/list-item/list-item.svelte'
  import List from '../../components/list/list.svelte'

  import { Interact } from '../../store/interact'

  import { getSubscriptionOptions } from '../nomie-cloud/nomie-cloud'
  import {
    firebaseAuth,
    getCustomerPortal,
    getUserNormalizedSubscriptions,
    NormalizedSubscriptionType,
    purchasePlan,
  } from '../firebase/FirebaseStore'

  import { centsToDollars } from '../../utils/math/math'
  import { onMount } from 'svelte'

  import { openPopMenu } from '../../components/pop-menu/usePopmenu'

  import IonIcon from '../../components/icon/ion-icon.svelte'
  import CheckmarkCircleOutline from '../../n-icons/CheckmarkCircleOutline.svelte'

  import { Prefs } from '../preferences/Preferences'

  import { toPrice } from './my-account-utils'

  let plans: Array<any> = []

  let ready: boolean = false

  export let outside: boolean = false
  export let solo: boolean = false
  export let title: undefined | string = undefined

  onMount(async () => {
    if (!plans.length) {
      const userSubs = await getUserNormalizedSubscriptions(firebaseAuth.currentUser.uid)
      userSubscriptions = [...userSubs].filter((sub) => sub.active)
      const subscriptionPlans = await getSubscriptionOptions()
      plans = subscriptionPlans
        .filter((plan) => {
          if (!$Prefs.betaFeatures) {
            return !plan.metadata.hasOwnProperty('beta')
          } else {
            return true
          }
        })
        .filter((p) => {
          return !isUserSubscribed(p);
        })

      ready = true
    }
  })

  let userSubscriptions: Array<NormalizedSubscriptionType> = []

  const isUserSubscribed = (plan: Product): boolean => {
    if (plan.metadata.iap_key == 'api-access') {
      return userSubscriptions.find((sub) => sub.apiAccess) ? true : false
    } else if (plan.metadata.iap_key == 'cloud-storage') {
      return userSubscriptions.find((sub) => sub.storageWrite) ? true : false
    } else {
      return false
    }
  }

  const changePlan = async () => {
    Interact.blocker('Redirecting to Payment Portal...')
    const portal: any = await getCustomerPortal()
    if (portal.data.url) {
      window.location.href = portal.data.url
    } else {
      Interact.alert(
        'Unable to get your portal link.',
        'If this continues, please contact us at support@happydata.org and we will get it worked out!'
      )
    }
    Interact.stopBlocker()
  }

  const openSubscribeOptions = (plan) => {
    openPopMenu({
      id: plan.id,
      title: plan.name,
      description: plan.description,
      buttons: plan.prices.map((price) => {
        return {
          id: price.id,
          title: `$${centsToDollars(price.unit_amount).toFixed(2)} per ${price.interval}`,
          click() {
            purchasePlan(price)
          },
        }
      }),
    })
  }
</script>

{#if plans.length}
<List {solo} {title} {outside}>
  {#if ready}
    {#each plans as plan, index}
      <ListItem
        detail
        bottomLine={20}
        clickable
        on:click={() => {
          if (isUserSubscribed(plan)) {
            changePlan()
          } else {
            openSubscribeOptions(plan)
          }
        }}
      >
        <div class="flex items-center justify-between mb-1">
          <h2 class="font-bold leanding-tight">{plan.name}</h2>
        </div>
        <div class="text-xs text-description mb-2">
          <span>{plan.description}</span>
        </div>

        {#if isUserSubscribed(plan)}
          <Button size="sm" className="-ml-3 text-green-500" clear>
            Active
            <IonIcon className="ml-1" icon={CheckmarkCircleOutline} />
          </Button>
        {:else}
          <div class="text-xs text-solid mb-1">
            {#each plan.prices
              .sort((a, b) => (a.unit_amount > b.unit_amount ? 1 : -1))
              .map((item) => {
                return toPrice(item.unit_amount, item.interval)
              }) as price, index}
              <span>{price}</span>
              {#if index < plan.prices.length - 1}
                <span class="opacity-50 px-1">or</span>
              {/if}
            {/each}
          </div>
        {/if}
      </ListItem>
    {/each}
  {/if}
</List>
{/if}

{#if userSubscriptions.length}
  <List solo outside title="My Subscriptions">
    <Button on:click={() => changePlan()} size="sm" slot="header-right" clear primary>Change</Button>
    {#each userSubscriptions as sub}
      <ListItem bottomLine={16} title={sub.name}>
        <div class="text-xs" slot="right">
          {toPrice(sub.amount, sub.interval)}
        </div>
      </ListItem>
    {/each}
  </List>
{/if}
