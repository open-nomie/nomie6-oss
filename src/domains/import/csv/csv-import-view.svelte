<script lang="ts">
  
  import type { NLog } from './../../nomie-log/nomie-log'

  import { wait } from './../../../utils/tick/tick'
  import { Interact } from './../../../store/interact'
  import { getDateFormats } from './../../preferences/Preferences'
  import NextPrevCal from './../../../components/next-prev-cal/next-prev-cal.svelte'
  import ToggleSwitch from './../../../components/toggle-switch/toggle-switch.svelte'
  import FileUploader from './../../../components/file-uploader/file-uploader.svelte'

  import ImportLoader from '../../../modules/import/import-loader'
  import { navigate } from 'svelte-navigator'
  import { truncateText } from '../../../utils/text/text'
  import CSVRImport, { CsvTemplateStore, IImportConfig } from './csv-import-helper'
  import { onMount } from 'svelte'

  import Button from '../../../components/button/button.svelte'
  import ListItem from '../../../components/list-item/list-item.svelte'
  import Text from '../../../components/text/text.svelte'
  import { Lang } from '../../../store/lang'
  import Input from '../../../components/input/input.svelte'

  import dayjs from 'dayjs'
  import IonIcon from '../../../components/icon/ion-icon.svelte'
  import ChevronDownOutline from '../../../n-icons/ChevronDownOutline.svelte'
  import AddCircleOutline from '../../../n-icons/AddCircleOutline.svelte'
  import ListItemLog from '../../../components/list-item-log/list-item-log.svelte'
  import { showToast } from '../../../components/toast/ToastStore'
  import is from '../../../utils/is/is'
  
  import { closeModal } from '../../../components/backdrop/BackdropStore2'
  import BackdropModal from '../../../components/backdrop/backdrop-modal.svelte'
  import ToolbarGrid from '../../../components/toolbar/toolbar-grid.svelte'
import Divider from '../../../components/divider/divider.svelte'

  let stepId: string = 'home'
  let templates: Array<IImportConfig> = []
  let activeImporter: CSVRImport
  let activeMapIndex
  let previewIndex = 0
  let previewRow: Array<any>
  let refreshing = false
  let previewLog: NLog
  let listMode = 'list'
  let expandFields = false

  export let id: string = 'csv-import'

  export let fileUpload:
    | undefined
    | {
        data: string
        file: File
      }

  if (fileUpload) {
    activeImporter = activeImporter || new CSVRImport({})
    activeImporter.csv(fileUpload.data)
    activeImporter.setName(fileUpload.file.name)
    stepId = 'note'
  }

  $: if (activeImporter && activeImporter.parsed && activeImporter.parsed.data) {
    if (activeImporter.length() > 1 && previewIndex == 0) {
      previewIndex = 1
    }
    previewRow = activeImporter.parsed.data[previewIndex]
    previewLog = activeImporter.toLog(previewRow)
  }

  async function nextPreview() {
    let current = previewIndex + 0
    previewIndex == undefined
    if (current < activeImporter.length() - 1) {
      previewIndex = current + 1
    } else {
      previewIndex = 0
    }
  }
  async function previousPreview() {
    let current = previewIndex + 0
    previewIndex == undefined
    if (current !== 1) {
      previewIndex = current - 1
    } else {
      previewIndex = activeImporter.length() - 1
    }
  }

  let views = [
    {
      title: 'Import CSV',
      id: 'home',
    },
    {
      title: 'Compose Note',
      id: 'note',
    },
    {
      title: 'Template',
      id: 'template',
    },
  ]

  $: view = views.find((v) => v.id == stepId)

  function setFieldMap(name: string, index) {
    activeImporter.config.fieldMap[name] = activeMapIndex
    refresh()
  }

  const dateFormats = getDateFormats()

  const fieldMapButtons = [
    {
      title: 'End Time*',
      required: true,
      id: 'end',
      click() {
        setFieldMap('end', activeMapIndex)
      },
    },
    {
      title: 'Start Time',
      id: 'start',
      click() {
        setFieldMap('start', activeMapIndex)
      },
    },
    {
      title: 'Latitude',
      id: 'lat',
      click() {
        setFieldMap('lat', activeMapIndex)
      },
    },
    {
      title: 'Longitude',
      id: 'lng',
      click() {
        setFieldMap('lng', activeMapIndex)
      },
    },
    {
      title: 'Location Name',
      id: 'location',
      click() {
        setFieldMap('location', activeMapIndex)
      },
    },
    {
      title: 'Source',
      id: 'source',
      click() {
        setFieldMap('source', activeMapIndex)
      },
    },
  ]

  function mapField(fieldIndex) {
    activeMapIndex = fieldIndex
    Interact.popmenu({
      title: `Map ${activeImporter ? activeImporter.getHeaders()[fieldIndex] : 'Unknown'}`,
      buttons: fieldMapButtons,
      id: 'field-map',
    })
  }

  function refresh() {
    refreshing = true
    wait(100, () => {
      refreshing = false
    })
  }

  function getIndexMap(index) {
    let response = null
    if (activeImporter && activeImporter.config && activeImporter.config.fieldMap) {
      response = Object.keys(activeImporter.config.fieldMap).find((key) => {
        return activeImporter.config.fieldMap[key] == index
      })
    }
    return response
  }

  async function startImport() {
    let confirmed = await Interact.confirm(
      `Warning`,
      `This will add ${activeImporter.length()} new records to your data. Be 100% sure everything is accurate.
      If you're unsure, launch Nomie in a private browswer and test on a local only account. Also, backup if you haven't for a while.`
    )
    if (confirmed) {
      if (activeImporter.length() > 1000) {
        Interact.blocker(`Importer starting. With this many records it might freeze the UI, just give it time...`)
      } else {
        Interact.blocker(`Importer starting up...`)
      }

      let importer = new ImportLoader()
      await importer.logs(activeImporter.toLogs()).importLogs((status: any) => {
        Interact.blocker(status.message)
      })

      Interact.stopBlocker()
      showToast({ message: `Import complete` })
    }
  }

  function back() {
    if (view && view.id == 'note') {
      stepId = 'home'
    } else if (view && view.id == 'template') {
      activeImporter = undefined
      previewIndex = undefined
      stepId = 'home'
    } else {
      navigate('/settings')
    }
  }

  async function addToImporter(evt) {
    let file = evt.detail
    if (file.data) {
      activeImporter = activeImporter || new CSVRImport({})
      activeImporter.csv(file.data)
      activeImporter.setName(file.file.name)
    }
    return true
  }

  async function insertField() {
    let selectedField: any = await _selectField(`Select a field to Insert into the note`)
    if (selectedField) {
      activeImporter.config.template = `${activeImporter.config.template || ''}{f${selectedField.index}}`.trim()
    }
  }

  function _selectField(title: string) {
    return new Promise((resolve, reject) => {
      let buttons = activeImporter.getHeaders().map((header, index) => {
        return {
          title: `${header}`,
          description: `f${index}: ${truncateText(previewRow[index], 60)}`,
          click() {
            resolve({ header, index })
          },
        }
      })
      Interact.popmenu({
        id: 'field-map-menu',
        title: title,
        description: `Which field maps to ${title}?`,
        buttons,
      })
    })
  }

  async function selectField(logField: any) {
    let selectedField: any = await _selectField(`${logField.title}`)
    if (is.truthy(selectedField)) {
      activeImporter.config.fieldMap[logField.id] = selectedField.index
    }
  }

  async function openTemplate(config: IImportConfig) {
    activeImporter = new CSVRImport(config)
    stepId = 'template'
  }

  async function edit() {
    stepId = 'note'
  }

  async function remove(config: IImportConfig) {
    let confirmed = await Interact.confirm(`Remove ${config.name} Importer?`, 'You can always remake it')
    if (confirmed) {
     
      alert('TODO')
      // templates = templates.filter((template) => {
      //   return template.id !== config.id
      // })
      // await UserStore.mstore('csv_templates', templates)
      showToast({ message: 'Removed' })
    }
  }

  async function save() {
    try {
      // let found = null
      // templates = templates.map((template: IImportConfig) => {
      //   let isMatch = template.id == activeImporter.config.id
      //   if (isMatch) {
      //     found = true
      //   }
      //   return isMatch ? activeImporter.config : template
      // })
      // if (!found) {
      //   templates.push(activeImporter.config)
      // }
      await CsvTemplateStore.upsert(activeImporter.config)
      alert('Did it work?')
      showToast({ message: `Import template saved` })
    } catch (e) {
      Interact.error(e.message)
    }

    return templates
  }

  async function main() {
    await CsvTemplateStore.init()
  }
  onMount(main)
</script>

<BackdropModal className="import" showCapture={false}>
  <ToolbarGrid slot="header">
    <Button
      primary
      slot="left"
      className="text-primary-500"
      on:click={() => {
        closeModal(id)
      }}>Close</Button
    >
    <div class="ntitle main">Import CSV</div>
    <div slot="right">
      {#if view && view.id == 'note'}
        <!-- <Button color="clear" on:click={save}>Save</Button> -->
      {:else if view && view.id == 'template'}
        <Button color="clear" on:click={edit}>Edit</Button>
      {/if}
    </div>
  </ToolbarGrid>


  <main class="page page-csv-import flex-column">
    {#if activeImporter && activeImporter.name}
      <ListItem bg="light" mainClass="py-4">
        <Text size="sm" bold>{truncateText(activeImporter.name, 26, 5)}</Text>
        <Text faded size="sm">
          Records: {activeImporter.length()}, Columns: {activeImporter.parsed.data[0].length}
        </Text>
      </ListItem>
    {/if}
    {#if view && view.id == 'home'}
      <div class=" p-0 import-csv-home">
        <ListItem bg="transparent">
          <span class="text-gray-500 text-sm leading-tight"
            >Select any CSV to begin. You can then map the appropriate fields to turn a row of data into a Note within
            Nomie.</span
          >
        </ListItem>

        <ListItem>
          <FileUploader
            accept="csv"
            placeholder="CSV File"
            on:file={async (evt) => {
              await addToImporter(evt)
              stepId = 'note'
            }}
          />
        </ListItem>

        {#if $CsvTemplateStore.length}
          <hr class="divider center my-2" />
          <ListItem itemDivider compact className="bg-transparent">
            {Lang.t('csv-import.saved-templates', 'Saved Templates')}
            <div slot="right">
              {#if listMode != 'edit'}
                <Button
                  color="transparent"
                  size="sm"
                  on:click={() => {
                    listMode = 'edit'
                  }}
                >
                  {Lang.t('general.edit', 'Edit')}
                </Button>
              {:else}
                <Button
                  size="sm"
                  color="transparent"
                  className="text-red"
                  on:click={() => {
                    listMode = 'list'
                  }}
                >
                  {Lang.t('general.done', 'Done')}
                </Button>
              {/if}
            </div>
          </ListItem>

          {#each $CsvTemplateStore as template}
            <ListItem
              detail
              clickable={listMode == 'list'}
              on:click={() => {
                if (listMode == 'list') {
                  openTemplate(template)
                }
              }}
            >
              <Text bold>{template.name}</Text>
              <Text size="sm" faded>
                {template.template}{Object.keys(template.fieldMap)}
              </Text>
              <div slot="right">
                {#if listMode == 'edit'}
                  <Button
                    size="sm"
                    color="danger"
                    on:click={(evt) => {
                      remove(template)
                    }}
                  >
                    Delete
                  </Button>
                {/if}
              </div>
            </ListItem>
          {/each}
        {/if}

        <hr class="divider center my-3" />
      </div>
    {:else if view && view.id == 'note' && activeImporter}
      <div class=" p-0 import-csv-note">
        <!-- <ListItem>
          <Input type="text" bind:value={activeImporter.config.name} placeholder="Importer Name" />
        </ListItem> -->
        <ListItem>
          <span>Does this have a header row?</span>
          <div slot="right">
            <ToggleSwitch title="Header Row" bind:value={activeImporter.config.hasHeaders} />
          </div>
        </ListItem>

        {#if !activeImporter.parsed}
          <FileUploader
            accept="csv"
            label={Lang.t('csv-import.select-csv-file', 'Select CSV File...')}
            on:file={async (evt) => {
              await addToImporter(evt)
            }}
          />
        {:else}
          <div class="px-4 pt-4">
            <div class="dark:text-white opacity-60 text-sm">
              {Lang.t('csv-import.map-fields', 'Map Fields')}
            </div>
          </div>

          {#each fieldMapButtons as logField}
            <ListItem
              bottomLine={16}
              clickable
              title={`${logField.title}`}
              on:click={() => {
                selectField(logField)
              }}
            >
              {#if is.truthy(activeImporter.config.fieldMap[logField.id])}
                {#if logField.id == 'end' || logField.id == 'start'}
                  <Text size="sm" bold>
                    Parsed: {dayjs(previewRow[activeImporter.config.fieldMap[logField.id]]).format(
                      `${dateFormats.date} ${dateFormats.time}`
                    )}
                  </Text>
                {/if}
                <Text size="sm" faded>
                  {previewRow[activeImporter.config.fieldMap[logField.id]]}
                </Text>
              {/if}
              <div slot="right">
                <Button color="transparent" className="text-primary-500">
                  {#if is.truthy(activeImporter.config.fieldMap[logField.id])}
                    f{activeImporter.config.fieldMap[logField.id]}
                  {:else}<span class="text-sm font-bold">Map</span>{/if}
                  <IonIcon icon={ChevronDownOutline} size={14} className="text-primary-500 ml-2 -mr-2" />
                </Button>
              </div>
            </ListItem>
          {/each}
          <ListItem>
            <div class="dark:text-white">Note*</div>
            <Input
              type="textarea"
              placeholder={Lang.t('csv-import.compose-note', 'Compose a note for this CSV data')}
              rows={3}
              bind:value={activeImporter.config.template}
            >
              <div slot="right">
                <Button shape="round" color="transparent" on:click={insertField}>
                  <IonIcon icon={AddCircleOutline} />
                </Button>
              </div>
            </Input>
          </ListItem>
          {#if expandFields}
            {#each activeImporter.getHeaders() as header, index}
              <ListItem compact className="py-1">
                <div slot="left">
                  <Text size="xs" bold>f{index}</Text>
                </div>
                <Text size="sm">{header}</Text>
                {#if previewRow}
                  <Text size="xs">{truncateText(previewRow[index], 26)}</Text>
                {/if}
                <div slot="right">
                  {#if !refreshing}
                    {#if getIndexMap(index)}
                      {getIndexMap(index)}
                    {:else}
                      <Button
                        color="clear"
                        className="text-primary-500"
                        on:click={() => {
                          mapField(index)
                        }}
                      >
                        Assign
                        <IonIcon icon={ChevronDownOutline} className="text-primary-500" size={14} />
                      </Button>
                    {/if}
                  {/if}
                </div>
              </ListItem>
            {/each}
          {/if}
        {/if}
      </div>
    {:else if view && view.id == 'template' && activeImporter}
      <div class="">
        <ListItem className="pb-0">
          {activeImporter.config.name} Importer
        </ListItem>
        <ListItem>
          <Input
            type="textarea"
            placeholder={Lang.t('csv-import.compose-note')}
            rows={3}
            bind:value={activeImporter.config.template}
          />
        </ListItem>
        {#if !activeImporter.parsed}
          <ListItem bg="transparent">
            <Text size="sm" faded>Select the CSV to process</Text>
            <FileUploader
              accept="csv"
              label="CSV File"
              on:file={async (evt) => {
                await addToImporter(evt)
              }}
            />
          </ListItem>
        {/if}
      </div>
    {/if}
    {#if previewLog && is.truthy(previewIndex) && activeImporter.parsed}
      {#if previewLog.note && previewLog.note !== "null"}
      <Divider />
        <div class="examples bg-inverse-2 p-2 px-4">
          <div class="n-toolbar flex pl-2">
            <div class="main dark:text-white text-sm">
              Preview {previewIndex} of {activeImporter.length()}
            </div>
            <div class="filler" />
            <NextPrevCal hideCal={true} on:next={nextPreview} on:previous={previousPreview} />
          </div>
          <ListItemLog log={previewLog} />
        </div>
        <ListItem>
          <Button primary block on:click={startImport}>
            Import {activeImporter.length()} Logs...
          </Button>
        </ListItem>
      {/if}
    {/if}
  </main>
</BackdropModal>
