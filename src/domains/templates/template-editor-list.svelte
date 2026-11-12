<svelte:options runes={true} />

<script lang="ts">
import { onMount } from 'svelte';

  import Button from '../../components/button/button.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import download from '../../modules/download/download'
  import CreateOutline from '../../n-icons/CreateOutline.svelte'
  import DownloadOutline from '../../n-icons/DownloadOutline.svelte'
  import RemoveOutline from '../../n-icons/RemoveCircleOutline.svelte'
  import CheckmarkCircleOutline from '../../n-icons/CheckmarkCircleOutline.svelte'
  import { strToTagSafe } from '../trackable/trackable-utils'
  import { openTemplateEditor, TemplateStore, useTemplate } from './templates-svelte-helpers'
  import type { Template } from './templates-utils'
  import { showToast } from '../../components/toast/ToastStore'

  const downloadTemplate = (template: Template) => {
    let filename = `${strToTagSafe(template.name)}-${template.id}.json`
    download.json(filename, JSON.stringify(template.asObject, null, 2))
  }

  const removeTemplate = async (template: Template) => {

   await TemplateStore.remove(template)
   showToast({ message: 'Template removed' })
 }

 $effect(() => {
   if ($TemplateStore) {
     TemplateStore.init();
   }
 })

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
      <Button
        on:click={() => {
          removeTemplate(template)
        }}
        icon
        primary><IonIcon icon={RemoveOutline} /></Button
      >
      <Button
        on:click={() => {
          useTemplate(template, 'template-manager')
        }}
        icon
        primary><IonIcon icon={CheckmarkCircleOutline} /></Button
      >
    </div>
  </ListItem>
{/each}
