<script lang="ts">
  import Dot from '../../components/dot/dot.svelte'
  import Empty from '../../components/empty/empty.svelte'
  import { MessageStore } from './MessageStore'

  import { onMount, onDestroy } from 'svelte'

  import dayjs from 'dayjs'
  import Layout from '../layout/layout.svelte'

  import ListItem from '../../components/list-item/list-item.svelte'
  import List from '../../components/list/list.svelte'
  import BackButton from '../../components/back-button/back-button.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import Container from '../../components/container/container.svelte'
  import { getDateFormats } from '../preferences/Preferences'

  const dateFormats = getDateFormats()

  onMount(() => {
    MessageStore.loadMessages()
  })

  onDestroy(() => {
    MessageStore.rememberSeenDate()
  })
</script>

<Layout>
  <header slot="header">
    <ToolbarGrid>
      <div slot="left" class="items-center flex">
        <BackButton to="/settings" />
      </div>
      <h1 class="ntitle">Messages</h1>
    </ToolbarGrid>
  </header>
  <main class="h-full bg-gray-100 dark:bg-gray-800">
    <Container className="p-4 lg:py-4 ">
      {#if $MessageStore.messages.length === 0}
        <Empty title="No recent messages" emoji="🦙" />
      {/if}
      <List solo>
        {#each $MessageStore.messages as message, index}
          <ListItem
            clickable
            on:click={() => MessageStore.readMessage(message)}
            className={message.unseen ? 'bg-primary-50 dark:bg-primary-900' : ''}
          >
            <h2
              class="{message.unseen ? 'font-bold ' : 'font-medium'}
              leading-snug"
            >
              {#if message.unseen}
                <Dot size={10} className="bg-primary-500 mr-1" />
              {/if}
              {message.subject}
            </h2>

            <p class="text-xs text-gray-500">
              {dayjs(message.created).format(dateFormats.date)}
            </p>
          </ListItem>
        {/each}
      </List>
    </Container>
  </main>
</Layout>

<style global>
  .prose img {
    @apply rounded-lg;
  }
  .prose a {
    @apply text-primary-500;
  }
</style>
