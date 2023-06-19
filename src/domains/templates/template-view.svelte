<script lang="ts">
  import { Prefs } from './../preferences/Preferences'
  import Title from './../../components/title/title.svelte'
  import Button from '../../components/button/button.svelte'

  import TrackablePill from '../trackable/trackable-pill.svelte'
  import { Trackable } from '../trackable/Trackable.class'
  import type { Template } from './templates-utils'
  import { useTemplate } from './templates-svelte-helpers'

  export let template: Template
</script>

<div class="template-view">
  <div class="grid grid-cols-1 mb-2 gap-2 items-center">
    <h1 class="text-2xl lg:text-4xl font-bold lg:col-span-8 text-solid">
      {template.name}
    </h1>
  </div>
  {#if template.description}
    <p class="text-sm text-gray-500 dark:text-gray-400">
      <span>{template.description}</span>
    </p>
  {/if}

  <Button
    on:click={() => useTemplate(template)}
    shape="rounded"
    color="primary"
    size="sm"
    className="w-full max-w-xs my-4">Use this Template</Button
  >
  <hr class="mt-2 mb-4 dark:border-gray-700" />
  {#if template.trackables.length}
    <section>
      <Title className="mb-2">Trackables</Title>
      <div class="flex flex-wrap">
        {#each template.trackables as trackable}
          <TrackablePill solid hideValue size={32} trackable={new Trackable(trackable)} className="m-1" />
        {/each}
      </div>
    </section>
  {/if}
  {#if template.boards.length}
    <section>
      <Title className="mb-2">Tabs</Title>

      <div class="flex flex-wrap">
        {#each template.boards as board}
          <div class="pill">
            <div class="ntitle">{board.label}</div>
            <div class="text-xs text-gray-500 whitespace-nowrap">
              {board.elements.length} trackables
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}
  {#if template.dashboards.length}
    <section>
      <Title className="mb-2">Dashboards</Title>

      <div class="flex flex-wrap">
        {#each template.dashboards as board}
          <div class="pill">
            <div class="ntitle">{board.label}</div>
            <div class="text-xs text-gray-500 whitespace-nowrap">
              {board.widgets.length} widgets
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}
  {#if template.goals.length}
    <section>
      <Title className="mb-2">Goals</Title>

      <div class="flex flex-wrap">
        {#each template.goals as goal}
          <div class="pill">
            <div class="ntitle">{goal.tag} {goal.comparison} {goal.target}</div>
            <div class="text-xs text-gray-500 whitespace-nowrap" />
          </div>
        {/each}
      </div>
    </section>
  {/if}
  {#if template.pivots.length}
    <section>
      <Title className="mb-2">Pivots</Title>

      <div class="flex flex-wrap">
        {#each template.pivots as pivot}
          <div class="pill">
            <div class="ntitle">{pivot.emoji}{pivot.tag}</div>
            <div class="text-xs text-gray-500 whitespace-nowrap" />
          </div>
        {/each}
      </div>
    </section>
  {/if}
</div>

<style scoped>
  .template-view section {
    @apply mb-2;
  }
</style>
