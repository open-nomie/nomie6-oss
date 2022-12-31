<script lang="ts">
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-navigator'

  import NSpinner from '../spinner/spinner.svelte'
  import NItem from '../list-item/list-item.svelte'

  import NLayout from '../../domains/layout/layout.svelte'

  // Utils and Modules
  import Downloader from '../../modules/download/download'
  import tick from '../../utils/tick/tick'

  import Storage from '../../domains/storage/storage'

  import { Interact } from '../../store/interact'

  import Button from '../button/button.svelte'
  import { Lang } from '../../store/lang'
  import ToggleSwitch from '../toggle-switch/toggle-switch.svelte'
  import Text from '../text/text.svelte'
  // import MassEditor from '../../domains/nomie-log/log-mass-editor/mass-editor.svelte'
  import BackButton from '../back-button/back-button.svelte'
  import List from '../list/list.svelte'

  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import { Prefs } from '../../domains/preferences/Preferences'
  import IonIcon from '../icon/ion-icon.svelte'
  import { DownloadOutline, TrashOutline } from '../icon/nicons'
  import { showToast } from '../toast/ToastStore'

  const state = {
    title: 'File Browser',
    path: [],
    tree: {},
    files: [],
    animateForward: false,
    animateBack: false,
    file: null,
    loading: true,
    edit: false,
    showMassEditor: false,
  }

  let fileContent
  let editor

  // Not working
  export let path = undefined
  // Old fashion way is working

  let lastPath = null

  $: if (path && path !== lastPath) {
    init()
  }

  async function init() {
    state.file = null
    state.edit = false
    lastPath = path
    if (path.substr(0, 1) == '/') {
      path = path.replace('/', '')
    }
    path = path.replace(/\/\//g, '/')
    let ogPath = path.split('/')
    if (ogPath.length > 0) {
      let fileName = ogPath[ogPath.length - 1]
      if (isFile(fileName)) {
        state.file = fileName
        state.path = ogPath
        readFile()
      } else {
        state.path = ogPath

        state.files = extractFiles()
      }
    }
    state.title = ogPath.join('/')
    state.path = ogPath
  }
  function cancelEdits() {
    state.edit = false
  }
  async function saveChanges() {
    if (!editor) {
      editor = document.getElementById('file-editor')
    }
    let value
    if (editor) {
      value = editor.value
      try {
        let payload = JSON.parse(value)
        editor.value = JSON.stringify(payload, null, 2)
        await Storage.put(state.path.join('/'), payload)
        showToast({
          message: 'File Saved',
          buttonLabel: 'Reload',
          timeout: 2500,
          buttonClick() {
            window.location.href = window.location.href
          },
        })
      } catch (e) {
        Interact.error(e.message)
      }
    }
  }

  async function back() {
    if (!state.path.length) {
      navigate('/settings')
    } else {
      state.path.pop()
      await tick(10)
      state.files = extractFiles()
      // await tick(100)
      init()
    }
    // if (state.path.length) {
    //   state.path.pop();
    //   await tick(10);
    //   state.files = extractFiles();
    // } else {
    //   history.back();
    // }
  }

  function extractFiles() {
    if (state.path.length) {
      let obj = { ...state.tree }
      state.path.forEach((name) => {
        if (obj.hasOwnProperty(name)) {
          obj = obj[name]
        }
      })
      return Object.keys(obj)
    } else {
      return Object.keys(state.tree)
    }
  }

  /**
   * From https://joelgriffith.net/array-reduce-is-pretty-neat/
   */
  function Treeify(files) {
    var fileTree = {}

    if (files instanceof Array === false) {
      throw new Error('Expected an Array of file paths, but saw ' + files)
    }

    function mergePathsIntoFileTree(prevDir, currDir, i, filePath) {
      if (i === filePath.length - 1) {
        prevDir[currDir] = 'file'
      }

      if (!prevDir.hasOwnProperty(currDir)) {
        prevDir[currDir] = {}
      }

      return prevDir[currDir]
    }

    function parseFilePath(filePath) {
      var fileLocation = filePath.split('/')
      if (fileLocation.length === 1) {
        return (fileTree[fileLocation[0]] = 'file')
      }
      fileLocation.reduce(mergePathsIntoFileTree, fileTree)
    }
    files.forEach(parseFilePath)
    return fileTree
  }

  onMount(async () => {
    state.loading = true
    Storage.getEngine().onReady(async () => {
      let files = await Storage.list()
      state.tree = Treeify(files)
      state.files = extractFiles()
      state.loading = false
    })
    await Storage.init()
  })

  async function deleteFile(file) {
    let filepath = `${state.path.join('/')}`
    let confirm = await Interact.confirm(
      `Really delete ${file}?`,
      `This can cause serious issues if you don't know what you're doing. File to delete: ${filepath}`,
      'Yes, Delete'
    )
    if (confirm) {
      await Storage.delete(filepath)
      showToast({ message: 'Deleted' })
      back()
    }
  }

  async function readFile() {
    const profileRoot = Storage.getEngine().basePath()

    let content = await Storage.get(path.replace(`${profileRoot}/`, ''))
    if (content) {
      fileContent = JSON.stringify(content, null, 2)
    }
    return fileContent
  }

  async function download(file) {
    let filename = state.path[state.path.length - 1]
    let content = await Storage.get(state.path.join('/'))
    Downloader.json(filename, content)
  }

  function isFile(name) {
    const filesArray = ['last-usage', 'nomie-capture']
    if (name.split('.').length > 1) {
      return true
    } else if (filesArray.indexOf(name) > -1) {
      return true
    } else if (state.path[state.path.length - 1] == 'books') {
      return true
    } else {
      return false
    }
  }

  function onKeyPress(e) {
    var keyCode = e.code

    if (e.keyCode === 9) {
      // tab was pressed

      // get caret position/selection
      var val = this.value,
        start = this.selectionStart,
        end = this.selectionEnd

      // set textarea value to: text before caret + tab + text after caret
      this.value = (val || '').substring(0, start) + '\t' + (val || '').substring(end)

      // put caret at right position again
      this.selectionStart = this.selectionEnd = (start || 0) + 1

      // prevent the focus lose
      return false
    }
  }

  async function editFile() {
    state.edit = true
    await tick(200)
    editor = document.getElementById('file-editor')
    editor.addEventListener('onkeydown', onKeyPress)
  }

  function getPath(file) {
    let path
    if (state.path.length == 1) {
      let root = state.path[0]
      if (root.substr(0, 1) == '/') {
        root = root.substr(1, root.length - 2)
      }
      path = `/files/${root}/${file}`
    } else {
      path = `/files/${state.path.join('/')}/${file}`
    }
    return path.replace('//', '/')
  }
</script>

{#if !state.file}
  <NLayout className="n-file-browser">
    <ToolbarGrid slot="header">
      <BackButton on:click={() => back()} slot="left" />
      <h1 class="ntitle">{state.title}</h1>
    </ToolbarGrid>
    <div class="content n-panel vertical scroll-y">
      <div class="">
        <List className="mt-2" solo role="menu">
          {#if state.loading}
            <div class="p-4 n-panel h-20 flex items-center justify-center">
              <NSpinner size={30} />
            </div>
          {/if}
          {#each state.files as file}
            {#if !isFile(file)}
              <NItem
                bottomLine
                detail
                on:click={() => {
                  navigate(getPath(file))
                }}
              >
                {file}
                <div slot="left">
                  <span class="text-md">🗂</span>
                </div>
              </NItem>
            {:else}
              <NItem
                bottomLine
                detail
                on:click={() => {
                  navigate(getPath(file))
                }}
              >
                {file}
                <div slot="left">
                  <span class="text-md">📝</span>
                </div>
              </NItem>
            {/if}
          {/each}
        </List>
        <NItem className="bg-transparent mt-2" title={Lang.t('settings.allow-file-editing', 'Allow file editing')}>
          <Text size="sm" faded>
            Edit data files.
            <span class="text-red">Use with caution.</span>
          </Text>
          <div slot="right">
            <ToggleSwitch bind:value={$Prefs.allowFileEdit} />
          </div>
        </NItem>
        {#if $Prefs.allowFileEdit}
          <!-- <Divider center />
          <NItem
            className="bg-transparent"
            title="{Lang.t('settings.find-and-replace', 'Find and Replace')}..."
            on:click={() => {
              state.showMassEditor = true
            }}
          >
            <span slot="left">🕵️‍♂️</span>
          </NItem> -->
        {/if}
      </div>
    </div>
  </NLayout>
{:else}
  <NLayout className="n-file-browser" showTabs={false}>
    <ToolbarGrid>
      <BackButton on:click={back} slot="left" />
      <h1 class="ntitle">{state.file}</h1>
      <div slot="right" class="flex items-center space-x-2">
        <Button
          icon
          on:click={() => {
            download(state.file)
          }}
        >
          <IonIcon icon={DownloadOutline} className="text-primary-500" />
        </Button>
        <Button
          icon
          on:click={() => {
            deleteFile(state.file)
          }}
        >
          <IonIcon icon={TrashOutline} className="text-red-500" />
        </Button>
      </div>
    </ToolbarGrid>

    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex filler pb-12">
      {#if fileContent}
        {#if !state.edit}
          <pre class="text-gray-800 dark:text-gray-200">{fileContent}</pre>
        {:else}
          <textarea id="file-editor" class="min-h-screen" autocapitalize="off" autocorrect="off">{fileContent}</textarea
          >
        {/if}
      {:else}
        <div class="p-4 n-panel h-20 flex items-center justify-center">
          <NSpinner size={30} />
        </div>
      {/if}
    </div>

    <div slot="footer">
      {#if $Prefs.allowFileEdit}
        <div class=" px-2 pt-1 pb-2 flex">
          {#if state.edit}
            <Button clear primary block on:click={cancelEdits}>Cancel</Button>
            <Button primary block on:click={saveChanges}>Save Changes</Button>
          {:else}
            <Button clear primary block on:click={editFile}>Edit</Button>
          {/if}
        </div>
      {/if}
    </div>
  </NLayout>
{/if}

{#if state.showMassEditor}
  <!-- <MassEditor
    on:close={() => {
      state.showMassEditor = false
    }}
    show={state.showMassEditor}
  /> -->
{/if}

<style lang="postcss" global>
  textarea#file-editor {
    font-family: 'Courier New', Courier, monospace;
    min-height: calc(100% - 0px);
    width: 100%;
    border: none;
    @apply bg-gray-200 dark:bg-gray-800;
    @apply text-black dark:text-white;
    padding: 16px;
    background: url(/images/editor-background.png);
    background-attachment: local;
    background-repeat: no-repeat;
    padding-left: 35px;
    padding-top: 10px;
    font-size: 11px;
    line-height: 150%;
  }

  .code-view {
    @apply bg-gray-200 dark:bg-gray-800;
    @apply text-black dark:text-white;
  }
  pre {
    font-size: 12px;
    padding: 10px;
  }
</style>
