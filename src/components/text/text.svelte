<svelte:options runes={true} />

<script lang="ts">
  import { createEventDispatcher } from "svelte";


  const dispatch = createEventDispatcher();

  const { size, bold, center, className, color, faded, inline, lineHeightMd, medium, style, tag, truncate, truncate2, truncate3, underline, leading1, leading2, leading3 } = $props()
</script>

<style lang="postcss">
  .n-text {
	 
	 line-height: 116%;
	 white-space: normal;
	 line-height: 125%;
	 vertical-align: middle;
}
 .n-text.line-height-md {
	 line-height: 140%;
}
 .n-text.leading1 {
	 line-height: 125%;
}
 .n-text.leading2 {
	 line-height: 150%;
}
 .n-text.leading3 {
	 line-height: 180%;
}
 .n-text.xxs {
	 font-size: 60%;
}
 .n-text.xs {
	 font-size: 70%;
}
 .n-text.sm {
	 font-size: 85%;
}
 .n-text.md {
	 font-size: 100%;
}
 .n-text.lg {
	 font-size: 115%;
}
 .n-text.faded {
	 opacity: 0.6;
}
 .n-text.xl {
	 font-size: 130%;
}
 .n-text.xxl {
	 font-size: 160%;
}
 .n-text.font-weight-bold {
	 font-weight: bold;
}
 .n-text.font-weight-medium {
	 font-weight: 500;
}
 
</style>

{#if tag === 'span' || inline}
  <span
    {style}
    on:click={() => {
      dispatch('click');
    }}
    class="n-text {` ${leading1 ? 'leading1' : ''} ${leading2 ? 'leading2' : ''} ${leading3 ? 'leading3' : ''} ${size || 'sm'} ${className} text-${color} ${truncate ? 'truncate' : ''} ${truncate2 ? 'truncate-2' : ''} ${truncate3 ? 'truncate-3' : ''} ${lineHeightMd ? 'line-height-md' : ''} ${center ? 'text-center' : ''} ${underline ? 'text-underline' : ''} ${faded ? 'faded ' : ''} ${bold ? 'font-weight-bold ' : ''} ${medium ? 'font-weight-medium ' : ''}`.trim()}">
    <slot />
  </span>
{:else}
  <div
    {style}
    on:click={() => {
      dispatch('click');
    }}
    class="n-text {` ${leading1 ? 'leading1' : ''} ${leading2 ? 'leading2' : ''} ${leading3 ? 'leading3' : ''} ${size || 'sm'} ${className} text-${color} ${truncate ? 'truncate' : ''} ${truncate2 ? 'truncate-2' : ''} ${truncate3 ? 'truncate-3' : ''} ${lineHeightMd ? 'line-height-md' : ''} ${center ? 'text-center' : ''} ${underline ? 'text-underline' : ''} ${faded ? 'faded ' : ''} ${bold ? 'font-weight-bold ' : ''} ${medium ? 'font-weight-medium ' : ''}`.trim()}">
    <slot />
  </div>
{/if}
