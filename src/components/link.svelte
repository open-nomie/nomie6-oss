<script lang="ts">
  import { Link } from 'svelte-navigator'
  export let to = ''

  function getProps({ location, href, isPartiallyCurrent, isCurrent }) {
    const isActive = href === '/' ? isCurrent : isPartiallyCurrent || isCurrent
    // The object returned here is spread on the anchor element's attributes
    if (isActive) {
      return { class: 'active' }
    }
    return {}
  }
</script>

<Link class="n-link" {to} {getProps}>
  <slot />
</Link>
