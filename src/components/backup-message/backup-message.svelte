<script lang="ts">
  import { Lang } from '../../store/lang'

  import { Prefs } from '../../domains/preferences/Preferences'
  import { LaunchCount } from '../../domains/preferences/LaunchCount'
  // import { onMount } from 'svelte'
  import { backupConfirmed, BackupDaysAgo, generateBackup } from '../../domains/backup/BackupStore'
  import { onMount } from 'svelte'

  let visible: boolean = false
  let mounted: boolean = false
  let dayWarning = $Prefs.backupDays
  let lastBackupDaysBack = 0

  $: if (isNaN($BackupDaysAgo)) {
    lastBackupDaysBack = 1001
  } else {
    lastBackupDaysBack = $BackupDaysAgo
  }

  $: {
    dayWarning = $Prefs.backupDays
    if (
      mounted &&
      lastBackupDaysBack &&
      dayWarning > -1 &&
      $LaunchCount > 5 &&
      lastBackupDaysBack >= dayWarning &&
      !$Prefs.hideBackupMessage
    ) {
      visible = true
    } else {
      visible = false
    }
  }

  onMount(() => {
    setTimeout(() => {
      mounted = true
    }, 4000)
  })
</script>

{#if mounted && visible === true}
  <div class="flex text-xs space-x-1 items-center justify-center container-sm bg-red-500 text-white">
    <button
      aria-label="Backup your data"
      on:click={generateBackup}
      class="flex items-center mr-2 text-xs py-1 text-center rounded-full backup"
    >
      <!--- If it's way back - it's not really set-->
      {#if lastBackupDaysBack > 1000}
        <div class="text-red-200">
          {Lang.t('general.no-known-backups', 'No recent backups')}
        </div>
      {:else}
        <div class="text-red-200">
          {lastBackupDaysBack} days since last backup
        </div>
      {/if}
      <div class="ml-2 font-bold">
        {Lang.t('general.download-backup', 'Download Backup')}
      </div>
    </button>
    or
    <button
      class="ml-2 font-bold"
      on:click={() => {
        backupConfirmed()
      }}>Skip</button
    >
  </div>
{/if}
