<svelte:options runes={true} />

<script lang="ts">
  import { streamQuery, aiState } from './engine.svelte'
  import type { AIResponse } from './profiles/types'
  import { marked } from 'marked'
  import dayjs from 'dayjs'
  import { Prefs } from '../preferences/Preferences'

  interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    loading?: boolean
  }

  let messages = $state<ChatMessage[]>([])
  let inputText = $state('')
  let scrollContainer: HTMLElement | null = null
  let inputField: HTMLTextAreaElement | null = null

  let providerInfo = $derived.by(() => {
    const selectedService = $Prefs.ai?.selectedService || 'claude'
    const service = $Prefs.ai?.services?.[selectedService]
    
    let provider = ''
    let model = ''
    
    if (selectedService === 'claude') {
      provider = 'Claude'
      model = 'claude-opus-4-8'
    } else if (selectedService === 'openrouter') {
      provider = 'OpenRouter'
      // Use actual model from response if available, otherwise show endpoint
      model = aiState.actualModel || 'openrouter/free'
    }
    
    return { provider, model }
  })

  function scrollToBottom() {
    if (scrollContainer) {
      // Multiple timing attempts to ensure scroll happens
      scrollContainer.scrollTop = scrollContainer.scrollHeight

      requestAnimationFrame(() => {
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        }
      })

      setTimeout(() => {
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        }
      }, 50)
    }
  }

  $effect(() => {
    // Trigger on messages length change
    messages.length
    scrollToBottom()
  })

  $effect(() => {
    // Focus input field when response is complete (not loading)
    if (!aiState.loading && inputField) {
      inputField.focus()
    }
  })

  async function sendMessage() {
    if (!inputText.trim()) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputText,
      timestamp: new Date()
    }

    messages.push(userMessage)
    inputText = ''

    const assistantMessageId = `msg-${Date.now() + 1}`
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      loading: true
    }

    messages.push(assistantMessage)

    try {
      let fullResponse = ''
      const messageIndex = messages.length - 1

      // Build conversation history from previous messages (excluding the current loading message)
      const conversationHistory = messages.slice(0, -1).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))

      await streamQuery(
        {
          profile: 'chat',
          prompt: userMessage.content
        },
        (chunk) => {
          fullResponse += chunk
          // Update the message in the array directly and reassign to trigger reactivity
          messages[messageIndex].content = fullResponse
          messages[messageIndex].loading = false
          messages = messages
          // Scroll on every chunk
          scrollToBottom()
        },
        conversationHistory
      )
    } catch (err) {
      const messageIndex = messages.length - 1
      const errorMsg = (err as Error).message

      // Format error message for OpenRouter account setup
      if (errorMsg.includes('openrouter.ai/settings/credits')) {
        messages[messageIndex].content = `⚠️ **Account Setup Required**\n\n${errorMsg}`
      } else {
        messages[messageIndex].content = `❌ Error: ${errorMsg}`
      }

      messages[messageIndex].loading = false
      messages = messages
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }
</script>

<div class="flex flex-col h-full relative">
  <!-- Twinkling stars background -->
  <div class="stars-bg" aria-hidden="true">
    <span class="star" style="width:5px;height:5px;top:10%;left:10%;animation-delay:0s"></span>
    <span class="star" style="width:4px;height:4px;top:20%;left:85%;animation-delay:0.5s"></span>
    <span class="star" style="width:6px;height:6px;top:70%;left:20%;animation-delay:1s"></span>
    <span class="star" style="width:4px;height:4px;top:50%;left:80%;animation-delay:1.5s"></span>
    <span class="star" style="width:5px;height:5px;top:30%;left:50%;animation-delay:2s"></span>
  </div>

  <!-- Messages Container -->
  <div bind:this={scrollContainer} class="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
    {#if messages.length === 0}
      <div class="flex items-center justify-center h-full text-center">
        <div>
          <p class="text-5xl mb-6">💬</p>
          <p class="font-bold text-2xl" style="color: #0a4f80; text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);">Start a conversation</p>
          <div class="text-base mt-3 font-semibold flex items-center justify-center gap-2 flex-wrap px-4" style="color: #ffffff; text-shadow: 0 1px 3px rgba(10, 79, 128, 0.5);">
            <span>Ask</span>
            <img src="/images/nomie-words.svg" alt="Nomie" style="height: 18px; width: auto; filter: brightness(0) invert(1); vertical-align: middle; display: inline-block; margin-top: -2px;" />
            <span>about your tracking data, goals, and insights</span>
          </div>
        </div>
      </div>
    {/if}

    {#each messages as message (message.id)}
      <div class={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div
          class={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg break-words backdrop-blur-sm border ${
            message.role === 'user'
              ? 'bg-blue-500 text-white rounded-br-none border-blue-400'
              : 'bg-white/80 dark:bg-white/10 text-gray-900 dark:text-white rounded-bl-none border-white/30'
          }`}
          style="backdrop-filter: blur(10px);"
        >
          {#if message.loading}
            <div class="flex items-center gap-2">
              <span class="animate-pulse">●●●</span>
            </div>
          {:else if message.role === 'assistant'}
            <div class="text-sm leading-relaxed markdown-content">
              {@html marked.parse(message.content)}
            </div>
          {:else}
            <p class="text-sm leading-relaxed">{message.content}</p>
          {/if}
          <p class={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-700 dark:text-gray-300'}`}>
            {dayjs(message.timestamp).format('HH:mm')}
          </p>
        </div>
      </div>
    {/each}
  </div>

  <!-- Input Container -->
  <div class="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 relative z-20 bg-white dark:bg-gray-900">
    <div class="flex gap-2 items-end">
      <textarea
        bind:this={inputField}
        bind:value={inputText}
        on:keydown={handleKeydown}
        placeholder="Ask about your tracking data..."
        disabled={aiState.loading}
        class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
        rows={1}
      />
      <button
        on:click={sendMessage}
        disabled={!inputText.trim() || aiState.loading}
        class="ai-send-btn flex-shrink-0"
        title={aiState.loading ? 'Waiting for response...' : 'Send message'}
      >
        <span class="send-icon">{aiState.loading ? '⏳' : '✉️'}</span>
      </button>
    </div>
    {#if aiState.error}
      <div class="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
        <p class="text-red-700 dark:text-red-300 text-sm leading-tight whitespace-pre-wrap">
          {#if aiState.error.includes('openrouter.ai/settings/credits')}
            <span class="font-semibold block mb-1">🔗 OpenRouter Setup Needed</span>
          {/if}
          {aiState.error}
        </p>
      </div>
    {/if}

    <div class="mt-1 text-right text-gray-400 dark:text-gray-500" style="font-size: 0.625rem;">
      {providerInfo.provider}
      {#if providerInfo.model}
        • <span class="font-mono">{providerInfo.model}</span>
      {/if}
    </div>
  </div>
</div>

<style>
  textarea {
    max-height: 120px;
  }

  .stars-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    overflow: hidden;
  }

  .star {
    position: absolute;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 50%;
    animation: twinkle 2.5s ease-in-out infinite;
  }

  @keyframes twinkle {
    0%, 100% {
      opacity: 0.2;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.2);
    }
  }

  .ai-send-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      #2aa8e0 0%,
      #1480b8 50%,
      #0a4f80 100%
    );
    box-shadow: 0 4px 12px rgba(10, 79, 128, 0.4);
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  .ai-send-btn:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(10, 79, 128, 0.6);
  }

  .ai-send-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .ai-send-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .send-icon {
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :global(.markdown-content p) {
    margin: 0.4rem 0;
  }

  :global(.markdown-content strong) {
    font-weight: 600;
  }

  :global(.markdown-content em) {
    font-style: italic;
  }

  :global(.markdown-content ul),
  :global(.markdown-content ol) {
    margin: 0.4rem 0;
    padding-left: 1.25rem;
  }

  :global(.markdown-content li) {
    margin: 0.2rem 0;
  }

  :global(.markdown-content code) {
    background: rgba(0, 0, 0, 0.1);
    padding: 0.1rem 0.3rem;
    border-radius: 2px;
    font-family: monospace;
    font-size: 0.9em;
  }

  :global(.markdown-content pre) {
    background: rgba(0, 0, 0, 0.15);
    padding: 0.75rem;
    border-radius: 4px;
    overflow-x: auto;
    margin: 0.4rem 0;
  }

  :global(.markdown-content pre code) {
    background: none;
    padding: 0;
  }

  :global(.markdown-content h1),
  :global(.markdown-content h2),
  :global(.markdown-content h3) {
    margin: 0.5rem 0 0.3rem 0;
    font-weight: 600;
  }

  :global(.markdown-content blockquote) {
    border-left: 3px solid rgba(0, 0, 0, 0.2);
    padding-left: 0.75rem;
    margin: 0.4rem 0;
    opacity: 0.8;
  }
</style>
