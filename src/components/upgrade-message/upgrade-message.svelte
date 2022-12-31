<script lang="ts">
  import { openSubscriptionModal } from '../../domains/my-account/useMyAccountModal'
  import Empty from '../empty/empty.svelte'
</script>

<Empty
  title="Upgrade Needed"
  description="A subscription is required to use Nomie's encrypted storage."
  buttonClick={() => openSubscriptionModal()}
  buttonLabel="See Upgrade Options..."
/>
