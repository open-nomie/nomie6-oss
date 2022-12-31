import { createLSStore } from '../../store/LSStore'
import type { TimelineFilterProps } from './timeline-utils'
import TimelineModal from "./timeline-modal.svelte";
import { openModal } from '../../components/backdrop/BackdropStore2';
import { md5 } from '../../modules/nid/nid';
export const TimelineOptionsStore = createLSStore('timeline-settings', {
  default: {
    notes: true,
    maps: false,
    trackables: false,
    context: false,
  },
})

/**
 * It opens a modal with a component called `TimelineModal` and passes it a prop called `filters`
 * @param {TimelineFilterProps} props - TimelineFilterProps - this is the type of the props that will
 * be passed to the modal component.
 */
export function openTimelineModal(props:TimelineFilterProps) {
  openModal({
    id: `timeline-modal-${md5(props.search)}`,
    component: TimelineModal,
    componentProps: {
      filters: props
    }
  })
}