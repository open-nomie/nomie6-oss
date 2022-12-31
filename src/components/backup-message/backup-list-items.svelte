<script lang="ts">
  import { generateBackup } from '../../domains/backup/BackupStore'
  import SelectPop from '../../select-pop/select-pop.svelte'
  import { Lang } from '../../store/lang'
  import ListItem from '../list-item/list-item.svelte'
  import List from '../list/list.svelte'
  import { Prefs } from './../../domains/preferences/Preferences'


  let backupOptions: Array<any> = []
  let selectedBackupLabel: string = ''
  let daysToBackup = $Prefs.backupDays || 7

  $: if ($Prefs.backupDays) {
    daysToBackup = $Prefs.backupDays
  }

  $: {
    backupOptions = [
      {
        key: -1,
        value: 'Never',
        selected: `${daysToBackup}` == '-1',
      },
      {
        key: 1,
        value: 'Daily',
        selected: `${daysToBackup}` == '1',
      },
      {
        key: 3,
        value: 'Every Few Days',
        selected: `${daysToBackup}` == '3',
      },
      {
        key: 7,
        value: 'Weekly',
        selected: `${daysToBackup}` == '7',
      },
      {
        key: 14,
        value: 'Every Other Week',
        selected: `${daysToBackup}` == '14',
      },
    ]
    selectedBackupLabel = (backupOptions.find((s) => s.selected) || {}).value
  }
</script>

<List solo>
  <ListItem
    bottomLine={16}
    detail
    title={Lang.t('general.backup-now', 'Backup Data')}
    on:click={() => {
      generateBackup()
    }}
  />
  <ListItem bottomLine={16} title={Lang.t('settings.backup-reminder', 'Backup Reminder')}>
    <div slot="right">
      <SelectPop
        id="start-page"
        value={selectedBackupLabel}
        on:change={(evt) => {
          $Prefs.backupDays = evt.detail.key
        }}
        options={backupOptions}
      />
    </div>
  </ListItem>
</List>
