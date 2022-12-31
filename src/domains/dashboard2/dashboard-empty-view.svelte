<script lang="ts">
  import Empty from '../../components/empty/empty.svelte'

  import { Lang } from '../../store/lang'
  import { createNewWidget } from './widget/widget-editor/useWidgetEditorModal'
</script>

<Empty
  className="mt-6"
  title={Lang.t('dashboard.empty-dashboard', 'Empty Dashboard')}
  description={Lang.t(
    'dashboard.starter-message',
    'Mix and match charts, notes, and other widgets to create your own custom views of your life.'
  )}
  buttonLabel={Lang.t('dashboard.add-a-widget', 'Add a Widget...')}
  buttonClick={() => {
    createNewWidget()
  }}
/>
