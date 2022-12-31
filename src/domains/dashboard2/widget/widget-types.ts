import {
  BarChartSolid,
  CalendarOutline,
  ChatboxOutline,
  HighLowIcon,
  MapOutline,
  PieChartOutline,
  PulseOutline,
  SparklesOutline,
  TextOutline,
  ThermometerIcon,
} from '../../../components/icon/nicons'
import CheckmarkCircleOutlineSvelte from '../../../n-icons/CheckmarkCircleOutline.svelte'
import type { PluginClass } from '../../plugins/plugin-helpers'

export type IWidgetTypeUnit = 'timeframe' | 'cond-style' | 'token' | 'tokens'

export type IWidgetType = {
  id: string
  label: string
  requires: Array<IWidgetTypeUnit>
  optional: Array<IWidgetTypeUnit>
  image?: string
  icon?: any
  emoji?: string
  data?: any
}

export const getWidgetTypes = ($PluginStore:Array<PluginClass>):Array<IWidgetType> => {
    const allWidgetTypes = [...widgetTypes];
    $PluginStore.filter(p=>{
      return p.active && p.addToWidgets
    }).forEach((plugin:PluginClass)=>{
      allWidgetTypes.push({
        id: `plugin`,
        label: plugin.name,
        requires: [],
        optional: [],
        emoji: plugin.emoji,
        data: {
          pluginId: plugin.id
        }
      })
    })
    return allWidgetTypes;
}


export const widgetTypes: Array<IWidgetType> = [
  {
    label: 'Display Value',
    id: 'value',
    requires: ['timeframe', 'token'],
    optional: ['cond-style'],
    image: '/images/widget-types/display-value.svg',
    icon: ThermometerIcon,
  },
  {
    label: 'Latest Note',
    id: 'note',
    requires: ['timeframe', 'token'],
    optional: [],
    image: '/images/widget-types/latest-note.svg',
    icon: ChatboxOutline,
  },
  {
    label: 'Bar Chart',
    id: 'barchart',
    requires: ['timeframe', 'token'],
    optional: [],
    image: '/images/widget-types/bar-chart.svg',
    icon: BarChartSolid,
  },
  {
    label: 'Line Chart',
    id: 'linechart',
    requires: ['timeframe', 'token'],
    optional: [],
    image: '/images/widget-types/line-chart.svg',
    icon: PulseOutline,
  },

  {
    label: 'Min / Max',
    id: 'min-max',
    requires: ['timeframe', 'token'],
    optional: [],
    image: '/images/widget-types/min-max.svg',
    icon: HighLowIcon,
  },
  {
    label: 'Map',
    id: 'map',
    requires: ['timeframe', 'token'],
    optional: [],
    image: '/images/widget-types/map.svg',
    icon: MapOutline,
  },
  {
    label: 'Todos',
    id: 'todos',
    requires: ['timeframe'],
    optional: [],
    image: '/images/widget-types/latest-note.svg',
    icon: CheckmarkCircleOutlineSvelte,
  },
  {
    label: 'Mind, Body, Spirit',
    id: 'focus',
    requires: ['timeframe'],
    optional: [],
    image: '/images/widget-types/bar-chart.svg',
    icon: SparklesOutline,
  },

  // This is not complete
  // {
  //   label: "What Time",
  //   id: "what-time",
  //   requires: ["timeframe", "element"],
  //   optional: [],
  // },
  {
    label: 'Positivity Chart',
    id: 'positivity',
    requires: ['timeframe'],
    // optional: ['token'],
    optional: [],
    image: '/images/widget-types/positivity-pie.svg',
    icon: BarChartSolid,
  },
  {
    label: 'Last Used',
    id: 'last-used',
    requires: ['token'],
    optional: ['cond-style'],
    image: '/images/widget-types/last-used.svg',
    icon: CalendarOutline,
  },
  {
    label: 'Just Text',
    id: 'text',
    requires: [],
    optional: [],
    image: '/images/widget-types/just-text.svg',
    icon: TextOutline,
  },
]
