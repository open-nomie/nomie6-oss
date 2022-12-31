<script lang="ts">
  //svelte
  import { createEventDispatcher } from 'svelte'

  import Button from '../../components/button/button.svelte'

  // Props
  export let value = ''

  // Consts
  const dispatch = createEventDispatcher()

  // Methods
  const select = (num) => () => (value += num)
  const clear = () => (value = '')
  const submit = (event) => {
    setTimeout(() => {
      dispatch('submit')
      event.stopPropagation()
    }, 10)
  }
</script>

<div class="keypad">
  <Button delay={0} color="clear" on:click={select(1)}>1</Button>
  <Button delay={0} color="clear" on:click={select(2)}>2</Button>
  <Button delay={0} color="clear" on:click={select(3)}>3</Button>
  <Button delay={0} color="clear" on:click={select(4)}>4</Button>
  <Button delay={0} color="clear" on:click={select(5)}>5</Button>
  <Button delay={0} color="clear" on:click={select(6)}>6</Button>
  <Button delay={0} color="clear" on:click={select(7)}>7</Button>
  <Button delay={0} color="clear" on:click={select(8)}>8</Button>
  <Button delay={0} color="clear" on:click={select(9)}>9</Button>
  <Button delay={0} color="clear" disabled={!value} on:click={clear}>Clear</Button>
  <Button delay={0} color="clear" on:click={select(0)}>0</Button>
  <Button delay={0} color="clear" disabled={!value} on:click={submit}>Submit</Button>
</div>

<style lang="postcss" global>
  .keypad {
    display: grid;
    grid-template-columns: repeat(3, 5em);
    grid-template-rows: repeat(4, 3em);
    grid-gap: 0.5em;
    @apply justify-center;
  }
  .keypad button {
    color: #fff;
  }
  .keypad button:hover {
    color: #fff;
  }
</style>
