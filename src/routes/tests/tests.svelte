<script lang="ts">
  import Scroller from '../../components/scroller/scroller.svelte'

  import dayjs from 'dayjs'

  import Calendar4 from '../../components/calendar4/calendar4.svelte'
  import List from '../../components/list/list.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'

  import Layout from '../../domains/layout/layout.svelte'
  import { Prefs } from '../../domains/preferences/Preferences'
  import Input from '../../components/input/input.svelte'
  import Divider from '../../components/divider/divider.svelte'
  import Button from '../../components/button/button.svelte'
</script>

<Layout>
  <ToolbarGrid slot="header" className="shadow-md">
    <h1 class="ntitle">UI Tests N6</h1>
  </ToolbarGrid>
  <main class="p-4">
    <Button className="bg-primary-500" size="lg">Ripple Test</Button>

    <div class="h-12" />

    <List solo className="mb-5">
      <Input listItem placeholder="Name" />
      <Divider left={16} />
      <Input listItem placeholder="Address" />
    </List>
    <List solo className="mb-5">
      <Scroller
        snapToItem="start"
        direction="x"
        let:firstPosItem
        start="start"
        let:centerPosItem
        let:item
        scrollToIndex={6}
        on:change={(evt) => {}}
        items={Array(20)
          .fill(0)
          .map((d, i) => i)}
        itemClass=""
      >
        <div class="item  p-2 P " style="width:10vw">
          <div class="text-center {item === centerPosItem ? 'bg-green-400' : 'bg-blue-500'} rounded-lg h-10">
            {item}
          </div>
        </div>
      </Scroller>

      <div class="h-80 bg-green-800 max-h-80 flex flex-col">
        <Scroller
          snapToItem="end"
          start="center"
          direction="y"
          let:firstPosItem
          let:centerPosItem
          let:item
          items={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
          itemClass=""
        >
          <div class="item p-2">
            <div class="text-center {item === centerPosItem ? 'bg-green-400' : 'bg-blue-500'} h-12 rounded-lg">
              {item}}
            </div>
          </div>
        </Scroller>
      </div>
    </List>
    <List solo>
      <Calendar4
        weekStarts={$Prefs.weekStarts}
        date={new Date()}
        days={[
          {
            date: dayjs().subtract(2, 'day').toDate(),
            value: 24,
            max: 24,
            positivity: -1,
          },
          {
            date: new Date(),
            value: 12,
            max: 24,
          },
        ]}
      />
    </List>
  </main>
</Layout>
