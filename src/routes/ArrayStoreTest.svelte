<script lang="ts">
  import ListItem from '../components/list-item/list-item.svelte'
  import Layout from '../domains/layout/layout.svelte'

  import { Interact } from '../store/interact'
  import { createKVStore } from '../store/KVStore'
  import { TestItem } from '../utils/test/TestItem'

  let message: string | undefined = undefined

  const testStore = createKVStore('/samples-kv.json', {
    label: 'Tester',
    key: 'id',
    itemInitializer: (item) => {
      return new TestItem(item)
    },
    itemSerializer: (item) => {
      return item
    },
  })
  testStore.init()

  const add = async () => {
    let name = message
    message = undefined
    return await testStore.upsert(new TestItem({ name }))
  }
  const remove = async (item: TestItem) => {
    return await testStore.remove(item)
  }
  const edit = async (item: TestItem) => {
    const newText = await Interact.prompt('New Name', '', { value: item.name })
    item.name = newText
    return await testStore.upsert(item)
  }
</script>

<Layout>
  <div class="dark:text-white p-5">Test Array Store</div>

  <div class="bg-green-500">
    <input type="text" class="p-2 text-lg" placeholder="message" bind:value={message} />
    <button
      on:click={() => {
        add()
      }}>Save</button
    >
  </div>
  <div class="items">
    {#each Object.keys($testStore).map((key) => $testStore[key]) as item}
      <ListItem>
        {item.name}
        <button
          slot="left"
          class="text-primary-500"
          on:click={() => {
            edit(item)
          }}>Edit</button
        >
        <button
          slot="right"
          on:click={() => {
            remove(item)
          }}>Remove</button
        >
      </ListItem>
    {/each}
  </div>
</Layout>
