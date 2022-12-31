<script lang="ts">
  // https://github.com/stephane-vanraes/svelte-progresscircle/edit/master/src/index.svelte

  export let value: number = 0
  export let max: number = 100
  export let size: number = 100
  export let color: string | undefined = undefined
  export let backgroundColor: string | undefined = undefined
  export let showValue: boolean = true
  export let className: string = ''
  export let style: string = ''

  $: progressPath = () => {
    if (value <= 0) {
      return ''
    } else if (value >= max) {
      return 'M50,5A45 45 0 1 1 49.9999 5'
    } else {
      const angle = Math.PI * 2 * (value / max)
      const x = 50 + Math.cos(angle - Math.PI / 2) * 45
      const y = 50 + Math.sin(angle - Math.PI / 2) * 45

      let path = 'M50,5'

      if (angle > Math.PI) {
        path += 'A45 45 0 0 1 50 95'
      }

      path += `A45 45 0 0 1 ${x} ${y}`

      return path
    }
  }
</script>

<div
  class="progress-circle {className}"
  style="--progress-size:{size}px; {color
    ? `--progress-active:${color};`
    : '--progress-active: var(--color-primary);'} {backgroundColor
    ? `--progress-background:${backgroundColor};`
    : '--progress-background: var(--color-solid-200);'} {style}"
>
  <svg viewBox="0 0 100 100" style="height:{size}px; width:{size}px;">
    <path d="M50,5A45 45 0 1 1 49.9999 5" />
    <path d={progressPath()} />
  </svg>
  {#if showValue}
    <div class="slot">
      <slot>
        <span>
          {(value || 0).toFixed(0)}
        </span>
      </slot>
    </div>
  {/if}
</div>

<style global lang="postcss">
  .progress-circle {
    --progress-active-width: 10px;
    --progress-background-width: 9px;

    @apply flex-grow-0;
    @apply flex-shrink-0;

    color: var(--color-solid-900);

    height: var(--progress-size) !important;
    width: var(--progress-size) !important;
  }

  .progress-circle span {
    @apply absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: calc(var(--progress-size) * 0.3) !important;
  }

  .progress-circle svg {
    @apply absolute;
    @apply h-full;
    @apply w-full;
    fill: transparent;
    stroke-linecap: round;
  }

  .progress-circle svg path:first-child {
    stroke: var(--progress-background);
    stroke-width: var(--progress-background-width);
  }

  .progress-circle svg path:last-child {
    stroke: var(--progress-active);
    stroke-width: var(--progress-active-width);
  }
</style>
