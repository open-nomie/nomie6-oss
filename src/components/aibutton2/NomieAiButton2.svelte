<svelte:options runes={true} />

<script lang="ts">
  /**
   * NomieAiButton — AI insights button with animated ripple rings
   *
   * Props:
   *   size      — any CSS length (default: '64px')
   *   label     — aria-label + hover tooltip (default: 'AI insights')
   *   onclick   — callback when clicked
   *
   * Usage:
   *   <NomieAiButton onclick={() => goto('/insights')} />
   *   <NomieAiButton size="20vw" />
   *   <NomieAiButton size="clamp(44px, 8vw, 96px)" label="AI inzichten" />
   */
  let {
    size = '64px',
    label = 'AI insights',
    onclick = () => {}
  } = $props()
</script>

<button
  class="nomie-ai-btn"
  style="--s: {size}"
  aria-label={label}
  {onclick}
>
  <span class="ring" aria-hidden="true"></span>
  <span class="ring" aria-hidden="true"></span>
  <span class="ring" aria-hidden="true"></span>

  <svg class="eye" viewBox="0 0 100 62" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="nomie-sclera" cx="50%" cy="46%" r="52%">
        <stop offset="0%"   stop-color="#e8f6fd"/>
        <stop offset="100%" stop-color="#a8d8ef"/>
      </radialGradient>
      <radialGradient id="nomie-iris" cx="40%" cy="36%" r="58%">
        <stop offset="0%"   stop-color="#72d0f5"/>
        <stop offset="38%"  stop-color="#2a9fd4"/>
        <stop offset="72%"  stop-color="#1565a0"/>
        <stop offset="100%" stop-color="#0d3d6e"/>
      </radialGradient>
      <radialGradient id="nomie-pupil" cx="36%" cy="32%" r="62%">
        <stop offset="0%"   stop-color="#2a3a4a"/>
        <stop offset="65%"  stop-color="#060c14"/>
        <stop offset="100%" stop-color="#000000"/>
      </radialGradient>
      <clipPath id="nomie-eyeclip">
        <path d="M50,1 C74,1 97,22 99,31 C97,40 74,61 50,61 C26,61 3,40 1,31 C3,22 26,1 50,1Z"/>
      </clipPath>
    </defs>

    <!-- sclera -->
    <path
      d="M50,1 C74,1 97,22 99,31 C97,40 74,61 50,61 C26,61 3,40 1,31 C3,22 26,1 50,1Z"
      fill="url(#nomie-sclera)"
    />
    <!-- upper lid shadow -->
    <path
      d="M50,1 C74,1 97,22 99,31"
      stroke="#0a3a6e" stroke-opacity="0.18" stroke-width="7"
      fill="none" clip-path="url(#nomie-eyeclip)" stroke-linecap="round"
    />
    <!-- iris -->
    <circle cx="50" cy="31" r="17" fill="url(#nomie-iris)"/>
    <!-- pupil -->
    <circle cx="50" cy="31" r="9.5" fill="url(#nomie-pupil)"/>
    <!-- catchlights -->
    <circle cx="44" cy="25" r="3.2" fill="rgba(255,255,255,0.9)"/>
    <circle cx="56" cy="35" r="1.4" fill="rgba(255,255,255,0.45)"/>
    <!-- outer edge -->
    <path
      d="M50,1 C74,1 97,22 99,31 C97,40 74,61 50,61 C26,61 3,40 1,31 C3,22 26,1 50,1Z"
      fill="none" stroke="#1480b8" stroke-opacity="0.35" stroke-width="1.5"
    />
  </svg>
</button>

<style>
  .nomie-ai-btn {
    --s: 64px;

    position: relative;
    width: var(--s);
    height: calc(var(--s) * 0.62);
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
    outline: none;
    -webkit-tap-highlight-color: transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    /* room for the ripple rings to expand into */
    margin: calc(var(--s) * 0.4);
  }

  /* ─── Ripple rings ───────────────────────────────────────────────── */
  .ring {
    position: absolute;
    top: 50%;
    left: 50%;
    width: var(--s);
    height: var(--s);
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 2px solid rgba(42, 168, 224, 0.5);
    animation: ripple 2.6s ease-out infinite;
    pointer-events: none;
  }

  .ring:nth-child(2) { animation-delay: 0.87s; }
  .ring:nth-child(3) { animation-delay: 1.74s; }

  /* ─── Eye SVG ────────────────────────────────────────────────────── */
  .eye {
    width: var(--s);
    height: calc(var(--s) * 0.62);
    transition: transform 0.15s ease, filter 0.15s ease;
    filter: drop-shadow(0 calc(var(--s) * 0.05) calc(var(--s) * 0.12) rgba(7, 40, 80, 0.45));
    position: relative;
    z-index: 1;
  }

  /* ─── Interaction states ─────────────────────────────────────────── */
  .nomie-ai-btn:hover .eye {
    transform: scale(1.07);
    filter: drop-shadow(0 calc(var(--s) * 0.08) calc(var(--s) * 0.18) rgba(7, 40, 80, 0.65));
  }

  .nomie-ai-btn:active .eye {
    transform: scale(0.94);
  }

  .nomie-ai-btn:focus-visible .eye {
    outline: 3px solid #2aa8e0;
    outline-offset: 4px;
    border-radius: 4px;
  }

  /* ─── Keyframes ──────────────────────────────────────────────────── */
  @keyframes ripple {
    0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.6; }
    100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0;   }
  }
</style>
