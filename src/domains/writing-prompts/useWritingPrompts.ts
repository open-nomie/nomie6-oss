import { closeModal, openModal } from "../../components/backdrop/BackdropStore2";
import NPaths from "../../paths";
import { createArrayStore } from "../../store/ArrayStore";
import { openLogEditor } from "../nomie-log/LogEditorStore"
import WritingPromptModal from "./writing-prompt-modal.svelte";


import prompts2 from "./writing-prompts-v2.json";
import nid from "../../modules/nid/nid";
import { dateToDayPart, DayPartUnit } from "../../modules/time/time";
import type { PopMenuButton } from "../../components/pop-menu/usePopmenu";
import math from "../../utils/math/math";
import { wait } from "../../utils/tick/tick";
import ShuffleOutline from "../../n-icons/ShuffleOutline.svelte";
import { CreateOutline } from "../../components/icon/nicons";

export const openWritingPrompt = (prompt: WritingPrompt) => {
  // const startingPrompt:any = prompt || shuffle(prompts2)[0];
  // prompt = new WritingPrompt(startingPrompt);
  openLogEditor({
    note: `#prompt ${prompt.text}
`
  })
}



export const getPromptMenu = (): Array<PopMenuButton> => {
  const userPrompts = WritingPromptStore.rawState() as Array<WritingPrompt>;
  const timeOfDay = dateToDayPart(new Date());
  return [
    ...userPrompts.filter((p) => {
      return p.time === timeOfDay;
    }).map((prompt) => {
      return {
        title: prompt.text,
        click: () => {
          openWritingPrompt(prompt);
        }
      }
    }),
    {
      icon: ShuffleOutline,
      divider: true,
      title: "Prompt Me...",
      click: () => {
        const userNowPrompts = userPrompts.filter(p => p.time === timeOfDay);
        let writingPrompt: WritingPrompt;
        const total = [...userNowPrompts, ...StaticWritingPrompts];
        writingPrompt = math.random(total);
        openWritingPrompt(writingPrompt);
      }
    },
    // { 
    //   title: "Prompts...",
    //   icon: CreateOutline,
    //   click() {
    //     openWritingPromptModal({
    //       canEdit: false,
    //       onSelect: async (writingPrompt)=>{
    //         openWritingPrompt(writingPrompt);
    //         await wait(200);
    //         closeWritingPromptModal();

    //       },
    //       activeTimeframe: timeOfDay
    //     });
    //   }
    // }
  ]
}

export const closeWritingPromptModal = () => {
  closeModal('writing-prompt-modal')
}

export const openWritingPromptModal = (props?: any) => {
  openModal({
    id: 'writing-prompt-modal',
    component: WritingPromptModal,
    componentProps: props || {}
  })
}

export type WritingPromptType = {
  time: DayPartUnit | 'any',
  text: string
  id?: string
}

export const StaticWritingPrompts = prompts2 as Array<WritingPromptType>;
export class WritingPrompt implements WritingPromptType {
  time: DayPartUnit | 'any'
  text: string
  id: string
  constructor(starter: WritingPromptType | undefined) {
    this.time = starter?.time || 'any';
    this.text = starter?.text || "";
    this.id = starter?.id || nid();
  }
}

export const WritingPromptStore = createArrayStore(NPaths.storage.writingPrompts(), {
  label: 'Writing Prompts',
  key: 'id',
  itemInitializer: (item) => {
    return new WritingPrompt(item)
  },
  itemSerializer: (item: Location) => {
    return JSON.parse(JSON.stringify(item))
  },
})