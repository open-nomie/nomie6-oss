<svelte:options runes={true} />

<script lang="ts">
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import Text from '../../components/text/text.svelte'
  import Button from '../../components/button/button.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { CloseOutline } from '../../components/icon/nicons'
  import AIChat from './ai-chat.svelte'

  interface Props {
    id: string
  }

  const { id } = $props<Props>()

  function closeChat() {
    closeModal(id)
  }
</script>

<BackdropModal
  className="ai-chat-modal-compliant modal-fullscreen"
  mainClass="ai-chat-main flex flex-col"
>
  <header slot="header" class="ai-chat-header-compliant">
    <!-- Twinkling stars background -->
    <div class="stars-background" aria-hidden="true">
      <span class="star" style="width:6px;height:6px;top:15%;left:10%;animation-delay:0s"></span>
      <span class="star" style="width:5px;height:5px;top:25%;left:80%;animation-delay:0.5s"></span>
      <span class="star" style="width:7px;height:7px;top:75%;left:15%;animation-delay:1s"></span>
      <span class="star" style="width:5px;height:5px;top:60%;left:85%;animation-delay:1.5s"></span>
      <span class="star" style="width:6px;height:6px;top:40%;left:50%;animation-delay:2s"></span>
    </div>

    <ToolbarGrid>
      <Button
        slot="left"
        clear
        icon
        on:click={closeChat}
        className="text-white dark:text-gray-100 relative z-10"
      >
        <IonIcon icon={CloseOutline} className="text-white dark:text-gray-100" size={24} />
      </Button>

      <div slot="main" class="flex items-center justify-center gap-2 relative z-10">
        <Text bold size="md" className="text-white dark:text-gray-100">
          💬 Chat with
        </Text>
        <img src="/images/nomie-words.svg" alt="Nomie" class="header-nomie-logo" />
      </div>

      <div slot="right" />
    </ToolbarGrid>
  </header>

  <div class="ai-chat-main-compliant flex-1 flex flex-col overflow-hidden">
    <AIChat />
  </div>
</BackdropModal>

<style lang="postcss">
  :global(.ai-chat-modal-compliant) {
    background: linear-gradient(
      135deg,
      #b8eafc 0%,
      #72d0f5 20%,
      #2aa8e0 50%,
      #1480b8 80%,
      #0a4f80 100%
    ) !important;
  }

  :global(.dark .ai-chat-modal-compliant) {
    background: linear-gradient(
      135deg,
      #0a4f80 0%,
      #1480b8 20%,
      #2aa8e0 50%,
      #1a5a8f 80%,
      #052840 100%
    ) !important;
  }

  :global(.ai-chat-header-compliant) {
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

  :global(.dark .ai-chat-header-compliant) {
    background: linear-gradient(
      180deg,
      rgba(10, 79, 128, 0.95) 0%,
      rgba(20, 128, 184, 0.9) 30%,
      rgba(42, 168, 224, 0.85) 100%
    ) !important;
    border-bottom: 2px solid rgba(42, 168, 224, 0.5);
  }

  :global(.ai-chat-main-compliant) {
    background: linear-gradient(
      to bottom,
      rgba(42, 168, 224, 0.1),
      rgba(10, 79, 128, 0.15)
    );
    position: relative;
    overflow: hidden;
  }

  :global(.dark .ai-chat-main-compliant) {
    background: linear-gradient(
      to bottom,
      rgba(10, 79, 128, 0.2),
      rgba(5, 40, 64, 0.3)
    );
  }

  :global(.ai-chat-main-compliant)::before {
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

  .header-nomie-logo {
    height: 22px;
    width: auto;
    filter: brightness(0) invert(1);
    vertical-align: middle;
    display: inline-block;
    margin-top: -3px;
  }
</style>
