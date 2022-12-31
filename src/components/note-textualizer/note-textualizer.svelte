<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  // Components
  
  //Utils
  import extractor from '../../utils/extract/extract'
  
  // Modules
  import Tracker from '../../modules/tracker/TrackerClass'

  
  // Props
  export let note: string = ''
  export let trackers = {}
  export let className: string | undefined = undefined
  export let tokenClass: undefined | string = undefined
  

  const dispatch = createEventDispatcher()

  const state = {
    words: [],
    note: ``
  }

  let actual = 0

  const toggleCheckbox = (index) => {
     const check = state.words[index];
     if(check.raw == '[x]') {
      state.words[index].raw = '[]';
      state.words[index].id = '[]';
    } else {
       state.words[index].raw = '[x]';
       state.words[index].id = '[x]';
     }
     state.words = state.words;
     dispatch('noteChange', state.words.map((s=>s.raw)).join(' '))
  }

  const methods = {
    split(str) {
      return str.split(' ')
    },
    tracker_get(tag) {
      return (trackers || {})[tag] || new Tracker({ tag: tag })
    },
    textElementClick(element) {
      dispatch('textClick', element)
    },
   
    linkClick(link) {
      window.open(link, '_system')
    },
    note_to_array(str) {
      let parsed = extractor.parse(str, { includeGeneric: true }) || [];
      let matches = parsed.filter((trackableElement) => {
        return ['person', 'context', 'generic'].indexOf(trackableElement.type) > -1
      })
      actual = matches.length
      return parsed
    },
  }

  $: state.words = methods.note_to_array(note)
  
</script>

{#if actual}
  <div
    class="n-note-textualized  {className || 'leading-snug text-black dark:text-white'}
    {state.words.length > 20 ? 'text-size-sm' : ''}
    {state.words.length < 20 ? 'text-size-big' : ''}"
  >
    {#each state.words as word, index}
      
      {#if word.type === 'tracker'}
        <button
          type="button"
          class="token {tokenClass || 'default-token-class'}"
          on:click={() => {
            methods.textElementClick(word)
          }}
        >
          {` #${word.id} `}
        </button>
      {:else if word.type == 'person'}
        <button
          type="button"
          class="person token {tokenClass || 'default-token-class'}"
          on:click={() => {
            methods.textElementClick(word)
          }}
        >
          {` ${word.raw} `}
        </button>
      {:else if word.type == 'context'}
        <button
          type="button"
          class="context token {tokenClass || 'default-token-class'}"
          on:click={() => {
            methods.textElementClick(word)
          }}
        >
          {` ${word.raw} `}
        </button>
      {:else if word.type == 'link'}
        <button
          type="button"
          class="token link {tokenClass || 'default-token-class'}"
          on:click={() => {
            methods.linkClick(word.raw)
          }}
        >
          {` ${word.id} `}
        </button>
      {:else if word.type == 'line-break'}
        <br />
      {:else if word.raw == '[]'}
        <input type="checkbox" on:change={(evt)=>{
          toggleCheckbox(index);
        }} data-index={`${index}`} />
      {:else if word.raw == '[x]'}
        <input type="checkbox" on:change={(evt)=>{
          toggleCheckbox(index);
        }} data-index={`${index}`} checked />
      {:else if word.raw}
        <span>{word.raw + ' '}</span>
      {/if}
      {#if word.remainder && word.type !== 'person'}
        <span class="remainder">{word.remainder.trim()}</span>
      {/if}
    {/each}
  </div>
  {state.note}
{/if}

<style lang="postcss" global> 


  .n-note-textualized input[type=checkbox] {
    @apply cursor-pointer;
    /* @apply appearance-none; */
    @apply h-4 w-4 rounded-sm;
    @apply border border-gray-500;
    @apply mx-px;
    @apply text-center;
    font-size:10px;
  }

  .n-note-textualized.inherit {
    font-size: inherit;
    line-height: inherit;
    letter-spacing: inherit;
  }
  .n-note-textualized .tracker,
  .n-note-textualized .person,
  .n-note-textualized .context {
    padding-right: 3px;
    flex-shrink: 0;
  }

  .default-token-class {
    @apply text-black dark:text-white;
    @apply bg-primary-500 bg-opacity-20;
    @apply px-1;
    @apply my-px;
    @apply focus:ring-2 ring-primary-500;
  }
  .n-note-textualized .token {
    @apply rounded-lg mr-1 pl-1;
    @apply hover:text-primary-500;
    @apply transform transition-all duration-100;
    @apply cursor-pointer;
  }
  .n-note-textualized .token.link {
    @apply bg-transparent text-primary-500;
  }
  .n-note-textualized .remainder {
    padding-right: 5px;
    margin-left: -6px;
  }
  .n-note-textualized span {
    display: inline;
  }
</style>
