<script lang="ts">
  // import { RadioGroup,  RadioGroupOption } from '@rgossiaux/svelte-headlessui'
  // import type { Subscription } from '@stripe/firestore-stripe-payments'

  // import { createEventDispatcher, onMount } from 'svelte'
  // import Button from '../../components/button/button.svelte'
  // import { Lang } from '../../store/lang'
  // import { getSubscriptionOptions, stripeAmountToUSD } from './nomie-cloud'
  // import PlanFeatures from './plan-features.svelte'

  // const dispatch = createEventDispatcher()

  // export let hideButtons: boolean = false
  // export let buttonLabel: string = Lang.t('general.get-started', 'Get Started')
  // export let buttonBypass: Function = undefined

  // let subscriptionTypes: Array<any> = []
  // let selectedSubscription: any = undefined

  // const selectSubscription = (subscriptionType: Subscription) => {
  //   selectedSubscription = subscriptionType
  //   dispatch('change', selectedSubscription)
  // }

  // const buttonPressed = (sub: Subscription) => {
  //   selectSubscription(sub)
  //   if (buttonBypass) {
  //     buttonBypass(sub)
  //   }
  // }

  // onMount(async () => {
  //   subscriptionTypes = await getSubscriptionOptions()
  //   selectSubscription(subscriptionTypes[0])
  // })
</script>
<!-- 
{#if subscriptionTypes.length}
  <RadioGroup
    bind:value={selectedSubscription}
    class="plans"
    on:change={(change) => {
      selectSubscription(change.detail)
    }}
  >
    {#each subscriptionTypes as subscription, index}
      <RadioGroupOption
        on:click={() => {
          selectSubscription(subscription)
        }}
        class="plan-radio outline-none"
        let:active
        key={subscription.name}
        value={subscription}
      >
        <div class="plan-option {active || subscription == selectedSubscription ? 'selected' : 'not-selected'}">
          <div class="title ">{subscription.name}</div>
          <div class="price">
            <span class="cost">{stripeAmountToUSD(subscription.prices[0].unit_amount)}</span>
            <span>/ month</span>
          </div>
          <div class="description">
            {subscription.description}
          </div>
          <PlanFeatures {subscription} />

          {#if !hideButtons}
            <Button
              block
              on:click={() => buttonPressed(subscription)}
              className="buy-button text-white w-full {active || subscription == selectedSubscription
                ? 'primary-gradient'
                : 'bg-gray-700 dark:bg-gray-900 text-white'}">{buttonLabel}</Button
            >
          {/if}
        </div>
      </RadioGroupOption>
    
    {/each}
    
  </RadioGroup>
{:else}
  <div class="text-center flex h-20 justify-center items-center  text-gray-500 w-full">Loading Plans...</div>
{/if}

<slot name="under-plans" />

{#if selectedSubscription}
  <slot />
{/if} -->

<style global lang="postcss">
  .plans {
    @apply grid grid-cols-1 gap-4 lg:grid-cols-3 items-stretch justify-items-stretch;
  }
  .plan-option {
    @apply transition-all duration-100;
    @apply text-gray-800 dark:text-gray-200;
    @apply bg-white dark:bg-black bg-opacity-10 dark:bg-opacity-10;
    @apply rounded-2xl;
    @apply py-4 px-6;
    @apply flex flex-col;
    @apply space-y-3;
    @apply h-full;
    @apply min-h-full flex-grow flex-shrink;
    @apply my-4;
  }
  .plan-option .description {
    @apply text-xs text-gray-700 dark:text-gray-300 leading-5;
  }

  .plan-option .price .cost {
    @apply text-4xl font-semibold;
  }
  .plan-option .price span:last-child {
    @apply opacity-80 text-sm;
  }
  .plan-option.selected {
    @apply bg-white dark:bg-gray-900 shadow-2xl;
    @apply ring-8 ring-gray-500 ring-opacity-20;
  }
  .plan-option.selected .title {
    @apply text-primary-500;
    @apply font-bold;
  }
  .plan-option .buy-button {
    @apply flex-shrink-0;
    @apply flex-grow-0;
  }
  .plan-option .buy-button.not-selected {
    @apply bg-gray-800 text-white;
  }
</style>
