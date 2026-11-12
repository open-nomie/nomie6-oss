<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from 'svelte'
  import { navigate } from '../../vendor/svelte-navigator'

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

  const { path = "" } = $props()

  let browserTitle = $state('File Browser')
  let browserPath = $state([])
  let browserTree = $state({})
  let browserFiles = $state([])
  let browserAnimateForward = $state(false)
  let browserAnimateBack = $state(false)
  let browserFile = $state(null)
  let browserLoading = $state(true)
  let browserEdit = $state(false)
  let browserShowMassEditor = $state(false)

  let fileContent = $state()
  let editor = $state()
  let lastPath = $state(null)

  $effect(() => {
    if (path !== lastPath) {
      init(path)
    }
  })

  async function init(pathStr = '') {
    browserFile = null
    browserEdit = false
    lastPath = pathStr
    let normalizedPath = pathStr || ''
    if (normalizedPath.substr(0, 1) == '/') {
      normalizedPath = normalizedPath.substring(1)
    }
    normalizedPath = normalizedPath.replace(/\/\//g, '/')
    let ogPath = normalizedPath ? normalizedPath.split('/').filter(p => p) : []

    if (ogPath.length > 0) {
      let fileName = ogPath[ogPath.length - 1]
      if (isFile(fileName)) {
        browserFile = fileName
        browserPath = ogPath.slice(0, -1)
        readFile()
      } else {
        browserPath = ogPath
        browserFiles = extractFiles()
      }
    } else {
      // Root path - show all files
      browserPath = []
      browserFiles = extractFiles()
      browserTitle = 'File Browser'
    }

    browserLoading = false
  }
  function cancelEdits() {
    browserEdit = false
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
        const filePath = browserPath.length ? `${browserPath.join('/')}/${browserFile}` : browserFile
        await Storage.put(filePath, payload)
        showToast({
          message: 'File Saved',
          buttonLabel: 'Reload',
          timeout: 2500,
          buttonClick() {
            // Navigate to file browser and reload to refresh all stores
            navigate('/files')
            setTimeout(() => window.location.reload(), 100)
          },
        })
      } catch (e) {
        Interact.error(e.message)
      }
    }
  }

  async function back() {
    // If viewing a file, return to list view
    if (browserFile) {
      browserFile = null
      browserEdit = false
      fileContent = null
      // Navigate to the correct URL for current directory
      if (browserPath.length) {
        navigate(`/files/${browserPath.join('/')}`)
      } else {
        navigate('/files')
      }
      return
    }

    // If in a subdirectory, go back to parent directory
    if (browserPath.length) {
      const parentPath = browserPath.slice(0, -1)
      if (parentPath.length) {
        navigate(`/files/${parentPath.join('/')}`)
      } else {
        navigate('/files')
      }
    } else {
      // At root, go to settings
      navigate('/settings')
    }
  }

  function extractFiles() {
    if (browserPath.length) {
      let obj = { ...browserTree }
      browserPath.forEach((name) => {
        if (obj.hasOwnProperty(name)) {
          obj = obj[name]
        }
      })
      return Object.keys(obj)
    } else {
      return Object.keys(browserTree)
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
    browserLoading = true
    Storage.getEngine().onReady(async () => {
      let files = await Storage.list()
      browserTree = Treeify(files)
      browserFiles = extractFiles()
      browserLoading = false
    })
    await Storage.init()
  })

  async function deleteFile(file) {
    let filepath = `${browserPath.join('/')}`
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
    // If viewing a file, download it with its actual filename
    if (browserFile) {
      let filename = browserFile
      let filePath = browserPath.length ? `${browserPath.join('/')}/${browserFile}` : browserFile
      let content = await Storage.get(filePath)
      Downloader.json(filename, content)
    } else {
      // If in a directory, download the directory contents (not supported, show error)
      Interact.alert('Error', 'Cannot download directories, only files.')
    }
  }

  function isFile(name) {
    const filesArray = ['last-usage', 'nomie-capture']
    if (name.split('.').length > 1) {
      return true
    } else if (filesArray.indexOf(name) > -1) {
      return true
    } else if (browserPath[browserPath.length - 1] == 'books') {
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
    browserEdit = true
    await tick(200)
    editor = document.getElementById('file-editor')
    editor.addEventListener('onkeydown', onKeyPress)
  }

  function getPath(file) {
    let path
    if (browserPath.length == 1) {
      let root = browserPath[0]
      if (root.substr(0, 1) == '/') {
        root = root.substr(1, root.length - 2)
      }
      path = `/files/${root}/${file}`
    } else {
      path = `/files/${browserPath.join('/')}/${file}`
    }
    return path.replace('//', '/')
  }
</script>

{#if !browserFile}
  <NLayout className="n-file-browser">
    <ToolbarGrid slot="header">
      <BackButton on:click={() => back()} slot="left" />
      <h1 class="ntitle">{browserTitle}</h1>
    </ToolbarGrid>
    <div class="content n-panel vertical scroll-y" style="overflow: hidden;">
      <div style="overflow-y: auto; height: 100%; position: relative; z-index: 0;">
        <List className="mt-2" solo role="menu" style="position: relative; z-index: 0;">
          {#if browserLoading}
            <div class="p-4 n-panel h-20 flex items-center justify-center">
              <NSpinner size={30} />
            </div>
          {/if}
          {#each browserFiles as file}
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
              browserShowMassEditor = true
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
      <h1 class="ntitle">{browserFile}</h1>
      <div slot="right" class="flex items-center space-x-2">
        <Button
          icon
          on:click={() => {
            download(browserFile)
          }}
        >
          <IonIcon icon={DownloadOutline} className="text-primary-500" />
        </Button>
        <Button
          icon
          on:click={() => {
            deleteFile(browserFile)
          }}
        >
          <IonIcon icon={TrashOutline} className="text-red-500" />
        </Button>
      </div>
    </ToolbarGrid>

    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex filler pb-12">
      {#if fileContent}
        {#if !browserEdit}
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
          {#if browserEdit}
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

{#if browserShowMassEditor}
  <!-- <MassEditor
    on:close={() => {
      browserShowMassEditor = false
    }}
    show={browserShowMassEditor}
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
