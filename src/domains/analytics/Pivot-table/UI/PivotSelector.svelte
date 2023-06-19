<script lang="ts">
  import { onMount } from 'svelte'

  import HScroller from '../../../../components/h-scroller/h-scroller.svelte'
  import Avatar from '../../../../components/avatar/avatar.svelte'
  import { PivotClass } from '../../pivot-class'
  import { createEventDispatcher } from 'svelte';

  export let pivots: Array<PivotClass> = []
  
  const dispatch = createEventDispatcher();
  let mounted = false
  $: if ( mounted) {
    setTimeout(() => {
      const ele = document.querySelector('.pivot-selector .active-pivot')
      if (ele) {
        ele.scrollIntoView()
      }
    }, 300)
  }

  const select = (selectedId) => {
    let Id = selectedId
    dispatch('selectpivot', Id);

  }

  const newPivot = () => {
    dispatch('newpivot')
  }


  $: if (mounted && !pivots.length) {
    //pivots = [{tag:"test1",config:"testingconfig1",emoji:"🫣"},{tag:"test1",config:"testingconfig1",emoji:"👌"}]
  }

  const savePivot = () => {
    dispatch("save")
  }

  
  const deletePivot = () => {
    dispatch("delete")
  }

  const editPivot = () => {
    dispatch("edit")
  }

  const copyPivot = () => {
    dispatch("copy")
  }

  const setDefault =(selectedId) => {
    let Id = selectedId
    dispatch('setdefault', Id);
  }

  onMount(() => {
    mounted = true
  })
</script>

<HScroller
  className="items-start justify-start"
  wrapperClass="snap-scroll-x flex   space-x-4 px-4 pivot-selector py-2 "
>
  <button
      class="flex flex-col self-start focus:outline-none p-1 rounded-xl"
      aria-label={`${"new"} pivot`}
      on:click={() => {
        newPivot()
      }}
    >
      <div
        class="w-10 h-10 lg:h-14 mb-1 lg:w-14 transition-all duration-100 transform stiff flex items-center justify-center dark:bg-gray-900 dark:text-gray-400 shadow-md rounded-xl"
      >
        
          <Avatar size={30} emoji={"➕"} />
        
      </div>
      <div class="text-gray-700 filler w-full line-clamp-2 dark:text-gray-300 text-center text-xxs pt-2 leading-tight">
        {"New"}
      </div>
    </button>
    <button
      class="flex flex-col self-start focus:outline-none p-1 rounded-xl"
      aria-label={`${"save"} pivot`}
      on:click={() => {
        savePivot()
      }}
    >
    <div
    class="w-10 h-10 lg:h-14 mb-1 lg:w-14 transition-all duration-100 transform stiff flex items-center justify-center dark:bg-gray-900 dark:text-gray-400 shadow-md rounded-xl"
  >
    
      <Avatar size={30} emoji={"💾"} />
    
  </div>
      <div class="text-gray-700 filler w-full line-clamp-2 dark:text-gray-300 text-center text-xxs pt-2 leading-tight">
        {"Save"}
      </div>
    </button>
    <button
      class="flex flex-col self-start focus:outline-none p-1 rounded-xl"
      aria-label={`${"duplicate"} pivot`}
      on:click={() => {
        copyPivot()
      }}
    >
    <div
    class="w-10 h-10 lg:h-14 mb-1 lg:w-14 transition-all duration-100 transform stiff flex items-center justify-center dark:bg-gray-900 dark:text-gray-400 shadow-md rounded-xl"
  >
    
      <Avatar size={30} emoji={"🪞"} />
    
  </div>
      <div class="text-gray-700 filler w-full line-clamp-2 dark:text-gray-300 text-center text-xxs pt-2 leading-tight">
        {"Copy"}
      </div>
    </button>
    <button
      class="flex flex-col self-start focus:outline-none p-1 rounded-xl"
      aria-label={`${"edit"} pivot`}
      on:click={() => {
        editPivot()
      }}
    >
    <div
    class="w-10 h-10 lg:h-14 mb-1 lg:w-14 transition-all duration-100 transform stiff flex items-center justify-center dark:bg-gray-900 dark:text-gray-400 shadow-md rounded-xl"
  >
    
      <Avatar size={30} emoji={"✍🏼"} />
    
  </div>
      <div class="text-gray-700 filler w-full line-clamp-2 dark:text-gray-300 text-center text-xxs pt-2 leading-tight">
        {"Edit"}
      </div>
    </button>
    <button
      class="flex flex-col self-start focus:outline-none p-1 rounded-xl"
      aria-label={`${"delete"} pivot`}
      on:click={() => {
        deletePivot()
      }}
    >
    <div
    class="w-10 h-10 lg:h-14 mb-1 lg:w-14 transition-all duration-100 transform stiff flex items-center justify-center dark:bg-gray-900 dark:text-gray-400 shadow-md rounded-xl"
  >
    
      <Avatar size={30} emoji={"🗑️"} />
    
  </div>
      <div class="text-gray-700 filler w-full line-clamp-2 dark:text-gray-300 text-center text-xxs pt-2 leading-tight">
        {"Delete"}
      </div>
    </button>
    <div
    class="w-10 h-10 lg:h-14 mb-6 lg:w-14 transition-all duration-100 transform stiff flex items-center justify-center dark:text-gray-500 text-5xl"
  >
    
      ||
    
  </div>
  {#each pivots as pivot, index}
    <button
      class="flex flex-col self-start focus:outline-none p-1 rounded-xl"
      aria-label={`${pivot.tag} pivot`}
      on:click={() => {
        select(pivot)
      }}
    >
    {#if pivot.default}
    <span  class="inset-0 object-right-top -mr-10 lg:-mr-14 -mt-2 z-10">
      <div class="inline-flex items-center px-1 py-0.3 border-2 border-none rounded-full text-xxs font-semibold text-white leading-3 bg-green-500">
        {pivot.days}
      </div>
    </span>
    
      <div
        class="w-10 h-10 lg:h-14 mb-1 -mt-4 lg:w-14 transition-all duration-100 transform stiff flex items-center justify-center dark:bg-gray-900 dark:text-gray-400 shadow-md rounded-xl"
      >
      
          <Avatar size={30} emoji={pivot.emoji} />
        
      </div>
      
      <div class="text-gray-700 filler w-full line-clamp-2 dark:text-gray-300 text-center text-xxs pt-2 leading-tight">
        {pivot.tag}
      </div>
      {:else}
      <span class="inset-0 object-right-top -mr-10 lg:-mr-14 -mt-2 z-10" on:click|preventDefault|stopPropagation={()=>{setDefault(pivot)}} on:keypress>
        <div class="inline-flex items-center px-1 py-0.3 border-2 border-none rounded-full text-xxs font-semibold text-black leading-3 bg-yellow-400">
          {pivot.days}
        </div>
      </span>
      
        <div
          class="w-10 h-10 lg:h-14 mb-1 -mt-4 lg:w-14 transition-all duration-100 transform stiff flex items-center justify-center dark:bg-gray-900 dark:text-gray-400 shadow-md rounded-xl"
        >
        
            <Avatar size={30} emoji={pivot.emoji} />
          
        </div>
        
        <div class="text-gray-700 filler w-full line-clamp-2 dark:text-gray-300 text-center text-xxs pt-2 leading-tight">
          {pivot.tag}
        </div>
      {/if}
    </button>
  {/each}
</HScroller>

<style lang="postcss" global>
  .pivot-selector .active-pivot {
    @apply bg-primary-500 text-white;
    @apply ring ring-inset ring-white;
  }
</style>
