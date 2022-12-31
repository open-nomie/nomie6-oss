<script lang="ts">
  //Vendors

  // Modules

  // Components

  import NItem from '../components/list-item/list-item.svelte'
  import NBackButton from '../components/back-button/back-button.svelte'
  // containers

  import NLayout from '../domains/layout/layout.svelte'

  // config
  import faq from '../config/faq'
</script>

<NLayout className="faq" pageTitle="Common Questions about Nomie" showTabs={false}>
  <div slot="header" class="n-toolbar-grid">
    <div class="left">
      <NBackButton />
    </div>
    <div class="main title">Q&A</div>
    <div class="right" />
  </div>

  <div class="min-h-full bg-gray-200 dark:bg-gray-800">
    {#each faq as q}
      <div class="my-3">
        <NItem className="solo py-3 bg-white dark:bg-gray-900">
          <div class="mb-1 font-bold leading-tight">{q.question}</div>
          <p class="leading-tight text-gray-700 dark:text-gray-300 font-sm">
            {q.answer}
          </p>
        </NItem>
      </div>
    {/each}
  </div>
</NLayout>
