<script lang="ts">
  import dropRight from 'lodash/dropRight'
  // Inspirated by https://codepen.io/ethanryan/details/MryqXv

  // Math will do the calculatng
  import math from '../../utils/math/math'

  import { createEventDispatcher, onMount } from 'svelte'
  import Button from '../button/button.svelte'
  import is from '../../utils/is/is'
  import { wait } from '../../utils/tick/tick'

  const dispatch = createEventDispatcher()

  let globalAnswer: any = '0' //declaring global variable here... this is bad practice
  let buffer = []
  let fontSize = 40

  export let value = 0
  export let displayFormat = undefined
  export let defaultEphemeral = true

  let tapped = false

  onMount(() => {
    if (is.truthy(value)) {
      buffer = [value]
      change()
    }
  })

  const buttons = [
    ['C', '+/-', '%', '/'],
    [7, 8, 9, '*'],
    [4, 5, 6, '-'],
    [1, 2, 3, '+'],
    ['⌫', 0, '.', null],
  ]

  function handleKeydown(evt) {
    const key = evt.key
    // Animate the keyboard
    const buttonObj = document.getElementById(`calc-button-${key}`);
    buttonObj?.classList?.add('pressing');
    // Check validity 
    const valid = buttons.find((row) => {
      return row.find((b) => `${b}` === `${key}`)
    })
    if (valid) {
      insertBuffer(key)
    } else if(`${key}` === `0`) {
      insertBuffer(0);
    } else if (key == 'Backspace') {
      insertBuffer('⌫')
    }
    // Removing keyboard pressing state
    setTimeout(()=>{
      buttonObj?.classList?.remove('pressing');
    },200)
  }

  function change() {
    if (buffer.length == 1) {
      globalAnswer = buffer[0]
    } else if (buffer.length) {
      globalAnswer = calculateBuffer()
    } else {
      globalAnswer = 0
    }
    dispatch('change', globalAnswer)
    getFontSize()
  }

  function calculateBuffer() {
    return math.calculate(buffer)
  }

  function click(input) {
    // If we should clear a default and one exists
    if (!tapped && is.truthy(value) && defaultEphemeral) {
      value = 0
      clearBuffer()
      tapped = true
    }
    insertBuffer(input)
  }

  function clearBuffer() {
    buffer = []
  }

  function isNumber(input) {
    return !isNaN(input) && input !== null
  }

  function deleteLast() {
    // buffer = _.dropRight(buffer);
    if (buffer.length) {
      let value = `${buffer[buffer.length - 1]}`
      buffer[buffer.length - 1] = dropRight(value.split('')).join('')
      change()
    }
  }

  // Insert a key or operator into the buffer
  function insertBuffer(insert) {

    // Set last buffer
    let lastBuffer = buffer.length ? buffer[buffer.length - 1] : null
    // if its a number and so is the last buffer - merge the nubmers
    if (isNumber(insert) && isNumber(lastBuffer)) {
      buffer[buffer.length - 1] = parseFloat(`${lastBuffer}${insert}`)
      change()
      // If the insert is a number and the last buffer - set the decimal
    } else if (isNumber(insert) && lastBuffer == '.') {
      let preDecimal = buffer[buffer.length - 2]
      let postDecimal = insert
      if (!math.isFloat(preDecimal)) {
        buffer[buffer.length - 2] = `${preDecimal}.${postDecimal}`
        buffer.pop()
      }
      change()
      // If the insert is a decimal - store it, but don't change anything
    } else if (isNumber(insert)) {
      buffer.push(insert)
      change()
    } else {
      switch (insert) {
        case 'C':
          buffer = []
          change()
          break
        case '⌫':
          deleteLast()
          break
        case '+/-':
          if (globalAnswer > 0) {
            buffer = [-Math.abs(globalAnswer)]
          } else {
            buffer = [Math.abs(globalAnswer)]
          }
          change()
          break
        case '%':
          buffer = [globalAnswer / 100]
          change()
          break
        default:
          if (['+', '*', '/', '-', '.'].indexOf(insert) > -1) {
            buffer.push(insert)
            change()
          }
          break
      }
    }
    buffer = buffer
  }

  async function getFontSize() {
    await wait(10)
    let len = globalAnswer.toString().length
    if (len < 10) {
      fontSize = 40
    } else if (len >= 10 && len < 18) {
      fontSize = 30
    } else {
      fontSize = 20
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />
<div class="w-full n-calculator">
  <div class="calc-screen">
    {#if displayFormat}
      <div class="preview">{displayFormat(globalAnswer)}</div>
    {/if}
    <div class="buffer">
      {#if buffer.length > 1}
        {#each buffer as bit}
          <span>{bit}</span>
        {/each}
      {/if}
    </div>
    <div class="value" style="font-size:{fontSize}px">
      {#each globalAnswer.toString().split('') as bit}
        <span class="numberUp">{bit}</span>
      {/each}
    </div>
  </div>
  <div class="buttons">
    {#each buttons as buttonRow, rIndex}
      {#each buttonRow as button, bIndex}
        {#if button !== null}
          <Button
            id="calc-button-{button}"
            shape="round"
            color="light"
            size="lg"
            delay={0}
            className="r-{rIndex} b-{bIndex}"
            on:click={() => {
              click(button)
            }}
          >
            {button}
          </Button>
        {:else}
          <span class="empty" />
        {/if}
      {/each}
    {/each}
  </div>
</div>

<style lang="postcss" global>
  .n-calculator .buttons {
    @apply grid grid-cols-4;
    @apply gap-2 lg:gap-3;
    @apply w-full;
    @apply h-full flex-grow;
    @apply items-center justify-center;
    @apply px-4;
  }

  .n-calculator {
    @apply h-full min-h-full max-h-full;
    height: 100%;
    @apply flex-grow flex-shrink;
    /* @apply flex flex-col items-center justify-center; */
    @apply p-2;
  }

  @keyframes numberUp {
    from {
      transform: translateY(8px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  .calc-screen {
    position: relative;
    display: flex;
    flex-direction: column;
    background-color: black;
    border: solid 1px rgba(255, 255, 255, 0.1);
    color: white;
    text-align: right;
    @apply rounded-lg;
    @apply py-2 px-4;
    @apply w-full;
    @apply mb-4;
  }

  .n-calculator .nbtn {
    touch-action: manipulation;
    border: none;
    @apply bg-white dark:bg-black;
    @apply rounded-xl;
    @apply w-full;
    /* @apply h-14 md:h-16; */
    @apply h-full;
    @apply flex-grow;
    @apply flex-shrink-0;
    @apply text-lg md:text-xl;
    @apply mx-auto;
    @apply text-black dark:text-white;
    @apply shadow-lg;
    @apply transition-all transform-gpu duration-100;
    min-height: 50px;
  }
  .n-calculator .nbtn:focus {
    @apply ring-4 ring-inset ring-gray-500 ring-opacity-50;
  }
  .n-calculator .nbtn:active,
  .n-calculator .nbtn.pressing {
    @apply scale-95;
    @apply shadow-md;
    @apply ring-2 ring-primary-500 ring-inset;
  }

  .calc-screen .value {
    line-height: 100%;
    height: 50px;
    text-align: right;
  }
  .calc-screen .preview {
    position: absolute;
    top: 4pt;
    left: 8pt;
    opacity: 0.8;
    color: #999;
    font-size: 0.8em;
  }
  .calc-screen .buffer {
    height: 20px;
    min-height: 22px;
    font-size: 0.8em;
    color: #999;
  }
  .numberUp {
    display: inline-block;
    animation: numberUp 0.4s ease-in-out;
    -webkit-animation: numberUp 0.4s ease-in-out;
  }
  .n-calculator .nbtn.r-0 {
    color: #fff;
    @apply bg-white dark:bg-black;
  }
  .n-calculator .nbtn.r-0.b-0 {
    color: #fff;
    @apply bg-red-500;
  }
  .n-calculator .nbtn.r-0.b-1 {
    color: #fff;
    @apply bg-gray-500;
  }
  .n-calculator .nbtn.r-0.b-2 {
    color: #fff;
    @apply bg-gray-500;
  }
  .n-calculator .nbtn.b-3 {
    color: #fff;
    @apply bg-yellow-600;
  }
  .n-calculator .nbtn.b-0.r-4 {
    background-color: transparent;
    box-shadow: none;
  }
</style>
