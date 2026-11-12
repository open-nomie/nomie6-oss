<svelte:options runes={true} />

<script>
  /**
   * NomieAiButton — round 3D AI-insights button
   *
   * Props:
   *   size      — px value or CSS length (default: '64px')
   *   label     — tooltip / aria-label text  (default: 'AI insights')
   *   onclick   — callback when clicked
   *
   * Usage examples:
   *   <NomieAiButton size="20vw" />                    <!-- 1/5 of mobile width -->
   *   <NomieAiButton size="64px" onclick={goToInsights} />
   *   <NomieAiButton size="clamp(44px, 8vw, 96px)" /> <!-- fluid responsive -->
   */

  let {
    size = '64px',
    label = 'AI insights',
    onclick = () => {}
  } = $props()
</script>

<button
  class="nomie-ai-btn"
  style="--btn-size: {size}"
  aria-label={label}
  {onclick}
>
  <!-- Pulse rings -->
  <span class="pulse-ring" aria-hidden="true"></span>
  <span class="pulse-ring" aria-hidden="true"></span>

  <!-- Main sphere -->
  <span class="sphere">
    <!-- Top-left specular highlight -->
    <span class="shine" aria-hidden="true"></span>

    <!-- Twinkling stars (visible on hover) -->
    <span class="stars" aria-hidden="true">
      <span class="star" style="width:6%;height:6%;top:20%;left:70%;animation-delay:0s"></span>
      <span class="star" style="width:4%;height:4%;top:65%;left:20%;animation-delay:0.5s"></span>
      <span class="star" style="width:4%;height:4%;top:32%;left:14%;animation-delay:1s"></span>
    </span>

    <!-- Elephant eye -->
    <span class="eye-wrap">
      <span class="eye-white">
        <span class="pupil"></span>
      </span>
    </span>
  </span>

  <!-- Hover label - hidden -->
  <!-- <span class="ai-label" aria-hidden="true">{label}</span> -->
</button>

<style>
  .nomie-ai-btn {
    /* ─── Size token — override via the `size` prop ──────────────── */
    --btn-size: 64px;
    --eye-size: calc(var(--btn-size) * 0.28);

    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--btn-size);
    height: var(--btn-size);
    border-radius: 50%;
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
    outline: none;
    -webkit-tap-highlight-color: transparent;
  }

  /* ─── 3D Sphere ──────────────────────────────────────────────────── */
  .sphere {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(
      circle at 38% 32%,
      #b8eafc 0%,
      #72d0f5 18%,
      #2aa8e0 42%,
      #1480b8 68%,
      #0a4f80 88%,
      #07304f 100%
    );
    box-shadow:
      0 calc(var(--btn-size) * 0.08) calc(var(--btn-size) * 0.22) rgba(7, 40, 80, 0.65),
      0 calc(var(--btn-size) * 0.02) calc(var(--btn-size) * 0.06) rgba(7, 40, 80, 0.4),
      inset 0 calc(var(--btn-size) * -0.06) calc(var(--btn-size) * 0.14) rgba(0, 0, 0, 0.35),
      inset 0 calc(var(--btn-size) * 0.02) calc(var(--btn-size) * 0.06) rgba(255, 255, 255, 0.15);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    position: relative;
    overflow: hidden;
  }

  /* ─── Specular highlight ─────────────────────────────────────────── */
  .shine {
    position: absolute;
    top: 6%;
    left: 20%;
    width: 30%;
    height: 22%;
    background: radial-gradient(
      ellipse,
      rgba(255, 255, 255, 0.92) 0%,
      rgba(255, 255, 255, 0.4) 40%,
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 50%;
    transform: rotate(-25deg);
    pointer-events: none;
  }

  /* ─── Elephant eye ───────────────────────────────────────────────── */
  .eye-wrap {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: var(--eye-size);
    height: var(--eye-size);
  }

  .eye-white {
    width: 100%;
    height: 100%;
    border-radius: 50% 50% 50% 50% / 55% 55% 45% 45%;
    background: radial-gradient(circle at 40% 35%, #ffffff 60%, #d8eef8 100%);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pupil {
    width: 55%;
    height: 55%;
    border-radius: 50%;
    background: radial-gradient(
      circle at 35% 30%,
      #3a3a4a 0%,
      #0a0a12 70%,
      #000 100%
    );
    box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.2);
    position: relative;
  }

  /* Pupil catchlight */
  .pupil::after {
    content: '';
    position: absolute;
    top: 15%;
    left: 20%;
    width: 28%;
    height: 28%;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.78);
  }

  /* ─── Twinkling stars (AI sparkle, shown on hover) ───────────────── */
  .stars {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    overflow: hidden;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .star {
    position: absolute;
    background: rgba(255, 255, 255, 0.92);
    border-radius: 50%;
    animation: twinkle 2s ease-in-out infinite;
  }

  /* ─── Pulse rings ────────────────────────────────────────────────── */
  .pulse-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid rgba(42, 168, 224, 0.45);
    animation: pulse-out 2.6s ease-out infinite;
    pointer-events: none;
  }

  .pulse-ring:nth-child(2) {
    animation-delay: 0.9s;
  }

  /* ─── Hover label ────────────────────────────────────────────────── */
  .ai-label {
    position: absolute;
    bottom: -22px;
    left: 50%;
    transform: translateX(-50%);
    font-size: clamp(9px, calc(var(--btn-size) * 0.15), 12px);
    font-weight: 500;
    color: #1a80b6;
    white-space: nowrap;
    letter-spacing: 0.04em;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }

  /* ─── Interaction states ─────────────────────────────────────────── */
  .nomie-ai-btn:hover .sphere {
    transform: scale(1.05);
    box-shadow:
      0 calc(var(--btn-size) * 0.1) calc(var(--btn-size) * 0.28) rgba(7, 40, 80, 0.75),
      0 calc(var(--btn-size) * 0.03) calc(var(--btn-size) * 0.08) rgba(7, 40, 80, 0.45),
      inset 0 calc(var(--btn-size) * -0.06) calc(var(--btn-size) * 0.14) rgba(0, 0, 0, 0.35),
      inset 0 calc(var(--btn-size) * 0.02) calc(var(--btn-size) * 0.06) rgba(255, 255, 255, 0.15);
  }

  .nomie-ai-btn:hover .stars { opacity: 1; }
  .nomie-ai-btn:hover .ai-label { opacity: 1; }
  .nomie-ai-btn:active .sphere { transform: scale(0.96); }

  /* Focus-visible ring for keyboard nav */
  .nomie-ai-btn:focus-visible .sphere {
    outline: 3px solid #2aa8e0;
    outline-offset: 3px;
  }

  /* ─── Keyframes ──────────────────────────────────────────────────── */
  @keyframes pulse-out {
    0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.55; }
    100% { transform: translate(-50%, -50%) scale(1.65); opacity: 0; }
  }

  @keyframes twinkle {
    0%, 100% { opacity: 0.25; transform: scale(1); }
    50%       { opacity: 1;    transform: scale(1.5); }
  }
</style>
