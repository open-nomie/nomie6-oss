<svelte:options runes={true} />

<script lang="ts">
  import { Link } from '../vendor/svelte-navigator'

  function getProps({ location, href, isPartiallyCurrent, isCurrent }) {
    const isActive = href === '/' ? isCurrent : isPartiallyCurrent || isCurrent
    // The object returned here is spread on the anchor element's attributes
    if (isActive) {
      return { class: 'active' }
    }
    return {}
  }

  const { to } = $props()
</script>

<Link class="n-link" {to} {getProps}>
  <slot />
</Link>
