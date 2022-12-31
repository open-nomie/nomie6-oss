<script lang="ts">
  import Avatar from '../avatar/avatar.svelte'

  export let avatar = null
  export let emoji = null
  export let username = null
  export let size = 102
  export let color = '#000'
  export let className = ''
  export let style = ''
  export let radius = 0
</script>

<div
  class="n-ball {className}"
  style="width:{size}px; height:{size}px; {radius ? `border-radius:${size * radius}px; overflow:hidden;` : ''}
  {style}"
>
  {#if avatar}
    <Avatar src={avatar} size={size * 0.5} />
  {:else if emoji}
    <Avatar {emoji} {color} size={size * 0.5} />
  {:else if username}
    <Avatar label={username} {color} size={size * 0.5} />
  {/if}
</div>

<style global lang="postcss">
  .n-ball {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .n-ball.frame {
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.16);
    border-radius: 32%;
    overflow: hidden;
  }
  .n-ball .n-avatar {
    border-radius: 32%;
  }

  .n-ball .emolen-3 {
    width: 100% !important;
  }
  .n-ball .emolen-2 {
    width: 100% !important;
  }
</style>
