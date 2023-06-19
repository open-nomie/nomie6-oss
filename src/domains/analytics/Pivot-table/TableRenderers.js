import TsvExportRenderer from './TSVExportRenderer.svelte';
import TableRenderer from './TableRenderer.svelte';
import { partial } from './UI/utils';

export default {
    Table: TableRenderer,
    'Table Heatmap': partial(TableRenderer, { opts: { heatmapMode: 'full' } }),
    'Table Col Heatmap': partial(TableRenderer, { opts: { heatmapMode: 'col' } }),
    'Table Row Heatmap': partial(TableRenderer, { opts: { heatmapMode: 'row' } }),
    TsvExport: TsvExportRenderer,
};
