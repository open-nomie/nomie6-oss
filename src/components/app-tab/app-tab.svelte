<script lang="ts">
  import { Link } from 'svelte-navigator'
  import Button from '../button/button.svelte'

  export let label: string
  export let id: string
  export let link: string
  export let className: string = ''
  export let notify: any = false
</script>

<Button className="tab-wrap tab-{id} {className}" ariaLabel={label}>
  <Link to={link}>
    {#if notify}
      <div class="notify">{notify}</div>
    {/if}
    <slot />
    <div class="label whitespace-nowrap">{label}</div>
  </Link>
</Button>

<style global lang="postcss">
  .tab-wrap {
    position: relative;
    display: flex;
    flex-grow: 1;
    height: 100%;
    align-items: center;
  }
  .tab-wrap a {
    position: relative;
    @apply text-gray-600 dark:text-gray-400;
    @apply inline-flex  flex-col items-center justify-center;
    @apply relative;
    padding: 6px 10px;
    font-size: 0.7em;
    height: 100%;
    text-decoration: none;
    flex-grow: 1;
    flex-shrink: 1;
    transition: all 0.2s ease-in-out;
    min-width: 30px;
    width: 100%;
    @apply transition-all duration-200 ease-in-out;
  }
  .tab-wrap a i {
    pointer-events: none;
    font-size: 1.2em;
    transition: all 0.2s ease-in-out;
  }
  .tab-wrap a .label {
    pointer-events: none;
    margin-bottom: 0;
  }
  .tab-wrap a[aria-current='page'] {
    color: var(--color-primary-bright);
  }
  .tab-wrap a[aria-current='page'] svg {
    transition: all 0.2s ease-in-out;
  }
  .tab-wrap a[aria-current='page']:after {
    content: '';
  }
  .tab-wrap a .notify {
    @apply bg-gray-600 dark:bg-gray-400;
  }
  .tab-wrap a[aria-current='page'] .notify {
    @apply bg-primary-500 dark:text-gray-800;
  }

  .tab-wrap a .notify {
    @apply absolute;
    @apply top-0;
    @apply z-40;
    @apply text-white dark:text-gray-800;
    @apply font-semibold;
    font-size: 11px;
    @apply h-4 flex items-center justify-center;
    @apply px-1 py-1;
    @apply rounded-full;
    @apply left-1/2;
    @apply shadow-sm;
  }
  .tab-wrap a:active {
    @apply scale-95;
  }
</style>
