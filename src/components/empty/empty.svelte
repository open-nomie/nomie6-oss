<script lang="ts">
  import { onMount } from 'svelte'

  import Avatar from '../avatar/avatar.svelte'
  import Button from '../button/button.svelte'
  import IonIcon from '../icon/ion-icon.svelte'

  export let emoji: string = undefined
  export let icon: any = undefined
  export let title: string = undefined
  export let description: string = undefined
  export let className: string = ''
  export let style: string = ''
  export let buttonLabel: string = undefined
  export let buttonClick: any = undefined
  export let small: boolean = false;

  let loaded: boolean = false

  onMount(() => {
    setTimeout(() => {
      loaded = true
    }, 200)
  })
</script>

<div class="empty-box {className} {loaded ? 'finish' : 'start'}" class:small={small} {style}>
  <slot name="emoji" />
  {#if emoji}
    <Avatar {emoji} size={80} className="mb-4" />
  {/if}
  {#if icon}
    <IonIcon {icon} size={80} className="mb-4 text-primary-400" />
  {/if}
  {#if title}
    <div class="my-1 text-center text-lg font-extrabold leading-tight text-gray-800 dark:text-gray-50">
      {title}
    </div>
  {/if}
  {#if description}
    <div class="text-sm text-center text-gray-500 dark:text-gray-500">
      {description}
    </div>
  {/if}
  <slot />
  {#if buttonLabel}
    <Button size="sm" className=" mt-4" primary clear on:click={buttonClick}>
      {buttonLabel}
    </Button>
  {/if}
</div>

<style global lang="postcss">
  .empty-box {
    flex-direction: column;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 300px;
    height: calc(100% - 20px);
    flex-grow: 1;
    flex-shrink: 0;
    padding: 20px;
    align-self: center;
    justify-self: center;
    max-width: 310px;
    margin-left: auto;
    margin-right: auto;
    height: auto;
  }

  .empty-box.small {
    min-height: auto !important;
    height: auto !important;
  }
  .empty-box.start {
    transition: all 0.2s ease-in-out;
    transform: translateY(100px);
    opacity: 0;
  }
  .empty-box.finish {
    transition: all 0.2s ease-in-out;
    transform: translateY(0);
    opacity: 1;
  }
</style>
