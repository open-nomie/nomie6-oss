<svelte:options runes={true} />

<script lang="ts">
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import AIChat from './ai-chat.svelte'
  import Button from '../../components/button/button.svelte'

  interface Props {
    id: string
  }

  const { id } = $props<Props>()

  function closeChat() {
    closeModal(id)
  }
</script>

<BackdropModal
  className="ai-chat-modal modal-fullscreen"
  headerClass="ai-chat-header"
  mainClass="ai-chat-main flex flex-col"
>
  <div slot="header" class="ai-chat-header" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem;">
    <!-- Twinkling stars background -->
    <div class="stars-background" aria-hidden="true">
      <span class="star" style="width:6px;height:6px;top:15%;left:10%;animation-delay:0s"></span>
      <span class="star" style="width:5px;height:5px;top:25%;left:80%;animation-delay:0.5s"></span>
      <span class="star" style="width:7px;height:7px;top:75%;left:15%;animation-delay:1s"></span>
      <span class="star" style="width:5px;height:5px;top:60%;left:85%;animation-delay:1.5s"></span>
      <span class="star" style="width:6px;height:6px;top:40%;left:50%;animation-delay:2s"></span>
    </div>

    <div style="position: relative; z-index: 10; flex-shrink: 0;">
      <Button
        clear
        primary
        on:click={closeChat}
        style="color: #ffffff; font-weight: 600; text-shadow: 0 1px 3px rgba(10, 79, 128, 0.5);"
      >
        Close
      </Button>
    </div>
    <div class="header-title">
      💬 Chat with
      <img src="/images/nomie-words.svg" alt="Nomie" class="header-nomie-logo" />
    </div>
    <div style="flex-shrink: 0; width: 60px;" />
  </div>

  <div class="ai-chat-main flex-1 flex flex-col overflow-hidden">
    <AIChat />
  </div>
</BackdropModal>

<style>
  :global(.ai-chat-modal) {
    background: linear-gradient(
      135deg,
      #b8eafc 0%,
      #72d0f5 20%,
      #2aa8e0 50%,
      #1480b8 80%,
      #0a4f80 100%
    ) !important;
  }

  :global(.ai-chat-header) {
    background: linear-gradient(
      180deg,
      rgba(184, 234, 252, 0.95) 0%,
      rgba(114, 208, 245, 0.9) 30%,
      rgba(42, 168, 224, 0.85) 100%
    ) !important;
    border-bottom: 2px solid rgba(20, 128, 184, 0.5);
    position: relative;
    overflow: visible !important;
  }

  :global(.ai-chat-header .main) {
    flex: 1 !important;
    overflow: visible !important;
    white-space: normal !important;
  }

  :global(.ai-chat-header .main.title) {
    color: #0a4f80 !important;
    text-shadow: 0 2px 4px rgba(255, 255, 255, 0.5);
  }

  :global(.ai-chat-main) {
    background: linear-gradient(
      to bottom,
      rgba(42, 168, 224, 0.1),
      rgba(10, 79, 128, 0.15)
    );
    position: relative;
    overflow: hidden;
  }

  :global(.ai-chat-main)::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  .stars-background {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
    opacity: 0.6;
  }

  .star {
    position: absolute;
    background: rgba(255, 255, 255, 0.85);
    border-radius: 50%;
    animation: twinkle 2s ease-in-out infinite;
  }

  @keyframes twinkle {
    0%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.3);
    }
  }

  .header-title {
    z-index: 20;
    font-size: 1.3rem;
    font-weight: 700;
    color: #0a4f80;
    text-shadow: 0 2px 4px rgba(255, 255, 255, 0.5);
    /* Small screens: align right */
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .header-nomie-logo {
    height: 22px;
    width: auto;
    filter: brightness(0) invert(1);
    vertical-align: middle;
    display: inline-block;
    margin-top: -3px;
  }

  /* Medium screens and up: center the title */
  @media (min-width: 768px) {
    .header-title {
      left: 50%;
      right: auto;
      transform: translate(-50%, -50%);
      white-space: nowrap;
    }
  }
</style>
