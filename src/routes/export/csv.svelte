<script lang="ts">
  import { CheckmarkCircle, CircleOutline } from '../../components/icon/nicons'
  import { dedupArray } from '../../utils/array/array_utils'
  import { Interact } from '../../store/interact'
  import { Lang } from '../../store/lang'
  import { LedgerStore } from '../../domains/ledger/LedgerStore'
  import { logsToCSV, logsToDetailedCSV } from '../../modules/export/csv'
  import { onMount } from 'svelte'
  import { selectTrackables } from '../../domains/trackable/trackable-selector/TrackableSelectorStore'
  import { TrackableStore, AllTrackablesAsArray } from '../../domains/trackable/TrackableStore'

  import Button from '../../components/button/button.svelte'
  import Container from '../../components/container/container.svelte'
  import dayjs from 'dayjs'
  import download from '../../modules/download/download'
  import DownloadOutline from '../../n-icons/DownloadOutline.svelte'
  import Input from '../../components/input/input.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import List from '../../components/list/list.svelte'
  import NBackButton from '../../components/back-button/back-button.svelte'
  import nid from '../../modules/nid/nid'
  import NItem from '../../components/list-item/list-item.svelte'
  import NLayout from '../../domains/layout/layout.svelte'
  import RemoveCircleOutline from '../../n-icons/RemoveCircleOutline.svelte'
  import Spinner from '../../components/spinner/spinner.svelte'
  import tick from '../../utils/tick/tick'
  import ToggleSwitch from '../../components/toggle-switch/toggle-switch.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import TrackablePill from '../../domains/trackable/trackable-pill.svelte'

  type CSVExportType = {
    type: 'column' | 'detailed'
    label: string
    description: string
    required: Array<string>
  }

  let csvTypes: Array<CSVExportType> = [
    {
      type: 'column',
      required: ['trackables'],
      label: 'Trackable Per Column',
      description: 'Each day is a row, with each trackable and its value a column',
    },
    {
      type: 'detailed',
      required: [],
      label: 'Note View',
      description: `Each Note containing any matching trackables`,
    },
  ]

  let csvType: CSVExportType = csvTypes[0]
  let generating = false
  let canSave: boolean = false
  let useAllTrackables: boolean = true

  // Set state
  let state = {
    trackables: [],
    start: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
    end: dayjs().format('YYYY-MM-DD'),
  }

  // Prepare Dynamic values
  let startDate, endDate

  // If start Changes, make sure end date is the same year
  // Searching only works year by year.
  $: if (state.start && dayjs(state.start, 'YYYY-MM-DD') !== startDate) {
    startDate = dayjs(state.start, 'YYYY-MM-DD')
    doc = []
  }

  $: if (state.end && dayjs(state.end, 'YYYY-MM-DD') !== endDate) {
    endDate = dayjs(state.end, 'YYYY-MM-DD')
    doc = []
  }

  $: {
    let needsTrackables = csvType.required.indexOf('trackables') > -1 ? true : false
    let meetsNeeds = needsTrackables ? state.trackables.length > 0 : true
    canSave = !generating && meetsNeeds
  }

  // Monitor if the user needs all known trackables or not
  let lastUseAllTrackables = !useAllTrackables
  $: if (useAllTrackables !== lastUseAllTrackables) {
    lastUseAllTrackables = useAllTrackables

    if (useAllTrackables) {
      state.trackables = $AllTrackablesAsArray
    } else {
      state.trackables = []
    }
  }

  let doc: Array<any> = []

  const methods = {
    async generateCSV(): Promise<Array<any>> {
      generating = true
      const logs = await LedgerStore.query({ start: startDate, end: endDate, fresh: true, caller: 'csv' })
      if (csvType.type === 'column') {
        generating = true
        doc = await logsToCSV(logs, state.trackables, $TrackableStore.trackables)
        generating = false
      } else {
        doc = logsToDetailedCSV(logs, state.trackables)
      }
      generating = false

      setTimeout(() => {
        const previewDom = document.querySelector('.csv-preview')
        if (previewDom) previewDom.scrollIntoView({ behavior: 'smooth' })
      }, 400)

      return doc
    },

    async download() {
      let filename = `export-${startDate.format('YYYY-M-D')}-${endDate.format('YYYY-M-D')}.${nid(6)}.${
        import.meta.env.PACKAGE_VERSION
      }.csv`

      download.csv(filename, doc.join('\r\n'))
      await tick(120)
      Interact.stopBlocker()
      generating = false
    },
    async selectTrackers() {
      const selected = await selectTrackables()
      state.trackables = dedupArray([...state.trackables, ...selected], 'tag')
      doc = []
    },
    export() {
      // Exporter()
    },
  }

  onMount(() => {})
</script>

<NLayout pageTitle="Export your Data" className="Export">
  <ToolbarGrid slot="header">
    <NBackButton slot="left" to="/" />
    <h1 class="ntitle">Export to CSV</h1>
  </ToolbarGrid>

  <Container>
    <!-- {#if $PermissionsStore.csvExport} -->
    <div class=" csv pt-4">
      <List solo className="pt-2 mb-4">
        {#each csvTypes as csvTypeLoop}
          <NItem
            clickable
            on:click={() => {
              csvType = csvTypeLoop
              doc = []
            }}
          >
            <IonIcon
              slot="left"
              icon={csvTypeLoop === csvType ? CheckmarkCircle : CircleOutline}
              className={csvTypeLoop === csvType ? 'text-primary-500' : ''}
            />
            <main>
              <h1 class="ntitle">{csvTypeLoop.label}</h1>
              <p class="text-gray-500 text-xs leading-tight">{csvTypeLoop.description}</p>
            </main>
          </NItem>
        {/each}
      </List>

      <div class="list-note">Which trackables would you like to include?</div>
      <List solo className="pt-2 mb-4">
        <NItem title={'All Official Trackables'}>
          <ToggleSwitch bind:value={useAllTrackables} title="Export all Known Trackables" slot="right" />
        </NItem>

        {#if !useAllTrackables}
          <NItem
            disabled={useAllTrackables}
            title={csvType.required.indexOf('trackables') > -1 ? 'Select Trackables (required)' : 'Trackables'}
            on:click={methods.selectTrackers}
          >
            <div class="text-primary" slot="right">
              {Lang.t('general.add', 'Add')}
            </div>
          </NItem>

          {#each state.trackables as trackable}
            <NItem>
              <TrackablePill {trackable} hideValue />
              <Button
                on:click={(evt) => {
                  state.trackables = state.trackables.filter((t) => t.tag !== trackable.tag)
                }}
                size="sm"
                type="clear"
                className="text-sm  text-red-500"
                slot="right"
              >
                <IonIcon icon={RemoveCircleOutline} /></Button
              >
            </NItem>
          {/each}
        {/if}
      </List>

      <List solo>
        <Input listItem type="date" bind:value={state.start} label={Lang.t('general.start-date', 'Start Date')} />
        <Input listItem type="date" bind:value={state.end} label={Lang.t('general.end-date', 'End Date')} />
        <div class="p-4 flex items-center space-x-2">
          <Button
            disabled={generating}
            on:click={methods.generateCSV}
            className="text-primary-50 w-full bg-primary-500"
          >
            {#if generating}
              <span class="mr-2"><Spinner size={22} /></span>
              <span>{Lang.t('general.generating', 'Generating')}...</span>
            {:else}
              <span>{Lang.t('general.preview', 'Preview')}...</span>
            {/if}
          </Button>
          {#if doc.length}
            <Button disabled={doc.length == 0} on:click={methods.download} className="bg-green-500 text-white w-full">
              <IonIcon icon={DownloadOutline} className="mr-2" />
              <span>{Lang.t('general.download', 'Download')}</span>
            </Button>
          {/if}
        </div>
      </List>

      <div class="csv-preview overflow-y-auto py-4 px-2">
        {#if doc.length > 1}
          <table class="border border-gray-500 p-2 w-full rounded-lg ">
            {#each doc.filter((d, i) => i < 10) as row}
              <tr>
                {#each row as cell}
                  <td class="cell text-xs p-2 border border-gray-500 text-gray-600 font-mono dark:text-gray-300"
                    >{cell || ''}</td
                  >
                {/each}
              </tr>
            {/each}
          </table>
        {/if}
      </div>
    </div>
  </Container>
</NLayout>
