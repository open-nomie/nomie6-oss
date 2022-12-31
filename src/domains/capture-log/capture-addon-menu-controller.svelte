<script lang="ts">


import Button from "../../components/button/button.svelte";
import IonIcon from "../../components/icon/ion-icon.svelte";
import CreateOutline from "../../n-icons/CreateOutline.svelte";
import SettingsOutline from "../../n-icons/SettingsOutline.svelte";

import { openPluginsModal } from "../plugins/PluginStore";
import { openWritingPromptModal } from "../writing-prompts/useWritingPrompts";


export let id:string; 
export let closeEvent:()=>void;


</script>
<div class="w-full flex space-x-2">
  <Button clear primary on:click={openPluginsModal}>
    <IonIcon size={16} icon={SettingsOutline} slot="left" />
    <span class="pl-2 text-xs text-center leading-tight">Plugins</span>
  </Button>
  <Button clear primary on:click={openWritingPromptModal}>
    <IonIcon size={16} icon={CreateOutline} slot="left" />
    <span class="pl-2  whitespace-pre text-xs text-center leading-tight">Prompts</span>
  </Button>
</div>