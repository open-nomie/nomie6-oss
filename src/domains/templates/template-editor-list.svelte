<script lang="ts">
import { onMount } from 'svelte';

  import Button from '../../components/button/button.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import download from '../../modules/download/download'
  import CreateOutline from '../../n-icons/CreateOutline.svelte'
  import DownloadOutline from '../../n-icons/DownloadOutline.svelte'
  import { strToTagSafe } from '../trackable/trackable-utils'
  import { openTemplateEditor, TemplateStore } from './templates-svelte-helpers'
  import type { Template } from './templates-utils'

  const downloadTemplate = (template: Template) => {
    let filename = `${strToTagSafe(template.name)}-${template.id}.json`
    download.json(filename, JSON.stringify(template.asObject, null, 2))
  }

  onMount(()=>{
    TemplateStore.init();
    
  })
</script>

{#each $TemplateStore as template, index}
  <ListItem>
    <main>
      <h2 class="ntitle">{template.name}</h2>
      <p class="faded">
        <span class="text-gray-500">{template.description || 'No Description'}</span>
      </p>
    </main>
    <div slot="right" class="flex items-center space-x-2">
      <Button
        on:click={() => {
          openTemplateEditor(template)
        }}
        icon
        primary><IonIcon icon={CreateOutline} /></Button
      >
      <Button
        on:click={() => {
          downloadTemplate(template)
        }}
        icon
        primary><IonIcon icon={DownloadOutline} /></Button
      >
    </div>
  </ListItem>
{/each}
