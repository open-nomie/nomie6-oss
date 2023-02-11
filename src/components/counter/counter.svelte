<script lang="ts">
  import LetterTicker from '../letter-ticker/letter-ticker.svelte'
  import { onMount } from 'svelte'

  export let started = undefined
  export let initialDuration = 0
  export let lg = undefined
  export let className = ''
  export let color = 'var(--color-red)'
  export let filled = false

  onMount(() => {
    if (started) {
      methods.init()
    }
  })

  $: value = '00:00:00'

  const methods = {
    init() {
      setInterval(() => {
        let ms = initialDuration*1000 + new Date().getTime() - started
        value = methods.secondsToTime(methods.msToSecond(ms))
      }, 1000)
      let ms = initialDuration*1000 + new Date().getTime() - started
      value = methods.secondsToTime(methods.msToSecond(ms))
    },
    normalizeTime(time) {
      return (time + '').length === 1 ? time.padStart(2, '0') : time
    },
    secondsToTime(secondsVar) {
      let seconds = secondsVar.toFixed(0)
      let minutes = Math.floor(parseInt(seconds) / 60).toString()
      let hours = ''

      if (parseInt(minutes) > 59) {
        hours = this.normalizeTime(Math.floor(parseInt(minutes) / 60).toString())
        minutes = this.normalizeTime((parseInt(minutes) - parseInt(hours) * 60).toString())
      }
      seconds = this.normalizeTime(Math.floor(parseInt(seconds) % 60).toString())

      minutes = this.normalizeTime(minutes)

      if (hours !== '') {
        hours = parseInt(hours)
        return `${hours}:${minutes}:${seconds}`
      }
      return `00:${minutes}:${seconds}`
    },

    msToSecond(ms) {
      return ms / 1000
    },
  }
</script>

<div
  class="n-counter {className}
  {lg ? 'large' : 'small'}
  {filled ? 'filled' : ''}"
  style={`color:${filled ? '#FFF' : color}; background-color:${filled ? color : ''}`}
>
  <LetterTicker text={value} />
</div>

<style lang="postcss">
  .n-counter {
    @apply font-bold;
    @apply flex;
    @apply items-center;
  }
  .n-counter.large {
    display: flex;
    padding: 12px;
    font-size: 40px;
    flex-grow: 1;
    text-align: center;
    justify-content: center;
    align-content: center;
    min-height: 50px;
    height: 50px;
    color: var(--color-inverse-2);
  }
  .n-counter.filled {
    border-radius: 4px;
    padding: 1px 6px;
  }
</style>
