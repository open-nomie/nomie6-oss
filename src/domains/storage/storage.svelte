<script lang="ts">
  // Svelte
  import { navigate } from 'svelte-navigator'

  // Modules
  import Storage from './storage'

  // Components
  import NItem from '../../components/list-item/list-item.svelte'

  // Stores
  import { Interact } from '../../store/interact'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { ChevronForwardOutline } from '../../components/icon/nicons'

  const state = {
    showFiles: false,
    files: [],
  }

  const methods = {
    initialize() {
      state.files = []
      return Storage.list().then((files) => {
        state.files = files.sort((a, b) => {
          return a > b ? 1 : -1
        })
        return state.files
      })
    },
    addFilesRef(name) {
      if (state.files.indexOf(name) == -1) {
        state.files.push(name)
      }
    },

    deleteFile(file) {
      Interact.confirm(
        `Holup! Delete ${file}?`,
        `This can cause serious problems if you don't know what you're doing.`,
        'Yes, Delete'
      ).then((res) => {
        if (res === true) {
          Storage.delete(file).then(() => {
            setTimeout(() => {
              methods.initialize()
            })
          })
        }
      })
    },
  }

  // onMount(() => {
  //   // methods.initialize();
  // });
</script>

<div class="n-storage">
  <div class="list">
    <NItem
      title="Browse Storage..."
      on:click={() => {
        navigate('/files')
      }}
      className="clickable"
    >
      <span slot="right">
        <IonIcon icon={ChevronForwardOutline} className="text-gray-500" />
      </span>
    </NItem>
  </div>
</div>
