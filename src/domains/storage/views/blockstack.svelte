<script lang="ts">
  import NItem from '../list-item/list-item.svelte'

  import { Lang } from '../../store/lang'
  import { Interact } from '../../store/interact'
  import Text from '../text/text.svelte'
  import Button from '../button/button.svelte'

  const methods = {
    async signOut() {
      let confirmed = await Interact.confirm(
        'Remove Blockstack Account from Nomie?',
        'Your data in blockstack will be fine, but you will need to reconnect.'
      )
      if (confirmed) {
        // UserStore.signout()
      }
    },
  }
</script>

<div class="blockstack stoage-option">
  <NItem truncate bottomLine={12}>
    <div slot="left">🔌</div>
    <!-- {$UserStore.profile.username || 'Connected'} -->
    <div slot="right">
      <Button type="clear" size="sm" on:click={methods.signOut}>
        <Text size="sm" className="text-primary-500">{Lang.t('settings.sign-out', 'Sign Out')}</Text>
      </Button>
    </div>
  </NItem>
</div>
