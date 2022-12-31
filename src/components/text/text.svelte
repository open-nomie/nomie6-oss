<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let size = "md";
  export let bold = false;
  export let center = false;
  export let className = "";
  export let color = "";
  export let faded = false;
  export let inline = false;
  export let lineHeightMd = false;
  export let medium = false;
  export let style = "";
  export let tag = "div";
  export let truncate = false;
  export let truncate2 = false;
  export let truncate3 = false;
  export let underline = false;
  export let leading1 = false;
  export let leading2 = false;
  export let leading3 = false;

  const dispatch = createEventDispatcher();
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
