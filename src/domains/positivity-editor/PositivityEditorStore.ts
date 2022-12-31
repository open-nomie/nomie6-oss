import type { ICondition } from '../../modules/scoring/score-tracker'
import ScoreEditorModal from './positivity-editor-modal.svelte'
import type { Trackable } from '../trackable/Trackable.class'
import { openModal } from '../../components/backdrop/BackdropStore2'
import { writable } from 'svelte/store'

export type OpenScoreEditorProps = {
  show: boolean
  trackable?: Trackable
  calc?: Array<ICondition>
  onComplete?: Function
  onCancel?: Function
}

const initialState: OpenScoreEditorProps = {
  show: false,
  calc: undefined,
  trackable: undefined,
  onComplete: undefined,
  onCancel: undefined,
}
export const PositivityEditorStore = writable(initialState)

export const openScoreEditor = (props: OpenScoreEditorProps) => {
  if (props.trackable) {
    props.calc = props.trackable.tracker.score_calc || []
  }
  openModal({
    id: `score-editor-${encodeURIComponent(props.trackable?.tag)}`,
    component: ScoreEditorModal,
    componentProps: {
      props,
    },
  })
  // ScoreEditorStore.update((s) => {
  //   if (props.trackable) {
  //     s.calc = props.trackable.tracker.score_calc || []
  //   }
  //   return { ...s, ...props }
  // })
}

export const closeScoreEditor = () => {
  PositivityEditorStore.update((s) => {
    return initialState
  })
}
