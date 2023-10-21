<script lang="ts">
  import Logo from '../../components/logo/logo.svelte'
  import { openPrivacyPolicy, openTermsOfService } from '../../components/markdown-modal/MarkdownModalStore'
  import { Prefs } from '../preferences/Preferences'
</script>

<div class="flex flex-col px-6 py-4 min-h-fill justify-center items-center -mt-4">
  <div class="max-w-xl flex items-center justify-center flex-col space-y-4">
    <Logo size={32} />
    {#if !$Prefs.storageType}
      <p class="text-2xl leading-none font-extrabold  text-center md:text-3xl text-black dark:text-white">
        Daily Journal for short attention spans.
      </p>
    {:else}
      <p class="text-2xl leading-none font-extrabold  text-center md:text-3xl text-black dark:text-white">
        👋 Nomie has been updated.
      </p>
    {/if}
    <div>
      <p style="font-size:0.6rem" class="mt-4  lg:text-sm  text-center text-gray-700 dark:text-gray-400">
        Nomie is a super fast, and super private way to journal, collect your life's data, and reflect on your life's
        direction.
      </p>
    </div>
    <!-- <p class="text-center flex items-center justify-center">
    <button class="text-xs bg-primary-200 dark:bg-primary-800 text-primary rounded-sm px-2 py-px" on:click={()=>showHowItWorks()} className="text-solid bg-primary" pad>How it works</button>
  </p> -->
    <!-- <br /><br />Learn more <a
    class=" text-primary-500 "
    href="https://docs.nomie.app"
    target="docs">Docs</a
  >,
  <a
    class=" text-primary-500 "
    href="https://reddit.com/r/nomie"
    target="docs">Reddit</a
  >,
  <a
    class=" text-primary-500 "
    href="https://tiktok.com/@nomieapp"
    target="docs">Tiktok</a
  > -->
  </div>
</div>
