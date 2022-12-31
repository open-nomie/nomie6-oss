<script lang="ts">
  import ProgressBar from '../../components/progress-bar/progress-bar.svelte'
  import dayjs from 'dayjs'

  import Avatar from '../../components/avatar/avatar.svelte'

  import ButtonGroup from '../../components/button-group/button-group.svelte'
  import Button from '../../components/button/button.svelte'
  import Calendar from '../../components/calendar/calendar.svelte'

  import Card from '../../components/card/card.svelte'

  import Divider from '../../components/divider/divider.svelte'

  import Input from '../../components/input/input.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import List from '../../components/list/list.svelte'
  import PositivityBar from '../../components/positivity-bar/positivity-bar.svelte'
  import PositivitySelector from '../../components/positivity-selector/positivity-selector.svelte'
  import Row from '../../components/row/row.svelte'
  import Spinner from '../../components/spinner/spinner.svelte'

  import Text from '../../components/text/text.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'

  import Empty from '../../components/empty/empty.svelte'
  import Layout from '../../domains/layout/layout.svelte'

  import { Device } from '../../store/device-store'
  import { Interact } from '../../store/interact'
  import ImageCapture from '../../components/image-capture.svelte'
  import FileUploader from '../../components/file-uploader/file-uploader.svelte'

  import { TrackableStore } from '../../domains/trackable/TrackableStore'

  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { ChevronUpOutline } from '../../components/icon/nicons'

  import NLog from '../../domains/nomie-log/nomie-log'
  import logsToTrackableUsage from '../../domains/usage/usage-utils'
  import type { TrackableUsageMap } from '../../domains/usage/trackable-usage.class'
  import ScoreNote from '../../modules/scoring/score-note'

  import TrackableUsageCalendar from '../../domains/calendar-view/trackableUsageCalendar.svelte'
  import Calendar4 from '../../domains/calendar-view/Calendar4.svelte'
  import { Prefs } from '../../domains/preferences/Preferences'
  import { TrackerStore } from '../../domains/tracker/TrackerStore'

  const fakeNotes = [
    { note: 'hello #mood(6)', date: dayjs().toDate() },
    { note: 'hello #mood(1)', date: dayjs().add(1, 'day').toDate() },
    { note: 'hello #mood(3)', date: dayjs().add(3, 'day').toDate() },
    { note: 'hello #mood(8)', date: dayjs().add(4, 'day').toDate() },
    { note: 'hello #mood(5)', date: dayjs().add(7, 'day').toDate() },
  ].map((d) => {
    let log = new NLog({ note: d.note, end: d.date })
    log.score = ScoreNote(log.note, log.end, $TrackerStore)
    return log
  })
  let tu: TrackableUsageMap
  $: tu = logsToTrackableUsage(fakeNotes, { trackables: $TrackableStore.trackables })
  // let date = dayjs()
</script>

<Layout>
  <header slot="header">
    <ToolbarGrid>
      <div slot="main">
        <Text bold center>Nomie UI Test {$Device.platform}</Text>
      </div>
    </ToolbarGrid>
  </header>

  <div class="p-4">
    <Text size="sm" faded className="mb-4">
      A set of base components for quick testing... I should be using Storybook, but have yet to do so.
    </Text>

    <List title="Calendar4 B" outside solo className="mb-4 p-2 bg-gray-200">
      <Calendar4
        weekStarts={$Prefs.weekStarts}
        date={new Date()}
        days={[
          {
            date: new Date(),
            value: 12,
            max: 24,
          },
        ]}
      />
    </List>

    <List title="Trackable Usage Calendar" outside solo className="mb-4 p-2 bg-gray-200">
      <TrackableUsageCalendar trackable={tu['#mood'].trackable} />
    </List>

    <List title="Calendar2" outside solo className="mb-4 p-2 bg-gray-200">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
        <!-- <Calendar2
          firstDayOfWeek={$Prefs.weekStarts}
          date={new Date()}
          trackable={$TrackableStore.trackables['#mood']}
          logs={[]}
        />
        <div class="grid grid-cols-2 lg:grid-cols-1">
          <Calendar2
            size="sm"
            firstDayOfWeek={$Prefs.weekStarts}
            date={dayjs().subtract(1, 'month').toDate()}
            trackable={$TrackableStore.trackables['#mood']}
            logs={[]}
          />
          <Calendar2
            size="sm"
            firstDayOfWeek={$Prefs.weekStarts}
            date={dayjs().subtract(2, 'month').toDate()}
            trackable={$TrackableStore.trackables['#mood']}
            logs={[]}
          />
        </div> -->
      </div>
    </List>

    <List className="p-4 ">
      <FileUploader />

      <ImageCapture />
    </List>

    <List className="p-4 ">
      <ProgressBar percentage={50} />
    </List>

    <List title="Swiper Test">
      <!-- <Swipeable
        on:right={() => {
          Interact.alert('Right!', 'You swiped right')
        }}
        on:left={() => {
          Interact.alert('Left!', 'You swiped left')
        }}
      >
        <div class="p-3 bg-solid text-inverse">Swipe me</div>
        <div slot="left">I'm left</div>
        <div slot="right">I'm right</div>
      </Swipeable> -->
    </List>

    <List title="Title Inset" outside>
      <ListItem clickable>Item 1</ListItem>
      <ListItem clickable>Item 2</ListItem>
    </List>

    <List title="Title Not">
      <ListItem clickable>Item 1</ListItem>
      <ListItem clickable>Item 2</ListItem>
    </List>

    <Card title="Form Elements" className="p-2">
      <Input type="select" label="Option Name">
        <option>Option 1</option>
        <option>Option 2</option>
      </Input>
    </Card>

    <Card title="Avatar Emoji" pad className="mb-3">
      <Row className="px-2">
        <Avatar size={50} emoji="🌮🙆" />
        <Avatar size={50} emoji="🧁" />
        <Avatar size={50} emoji="🩰🥈🥇" />
        <Avatar size={50} emoji="BC" />
      </Row>
    </Card>

    <Card title="Avatar Label" pad>
      <Row className="mb-3">
        <Avatar label="Will Reed" size={62} />
        <Avatar label="Bob Ross" size={48} />
        <Avatar label="Frank Mark 3ie" size={36} />
        <Avatar label="Lilly Pilly" size={24} />
        <Avatar label="Dezzy Man" size={20} />
        <Avatar label="Tiny" size={16} />
      </Row>
    </Card>

    <hr class="my-3 divider center" />

    <hr class="my-2 divider center" />

    <Card title="Confetti" className="mb-3" pad>
      <Button
        block
        on:click={() => {
          Interact.confetti({
            title: '🚚 Oh yea!',
            message: 'Nice job my friend!',
            timeout: 5000,
          })
        }}
      >
        Test
      </Button>
    </Card>

    <Card title="Inputs" pad className="mb-3">
      <Input type="text" placeholder="My Label" value="Normal" />
      <Input type="text" solo placeholder="My Label" value="Solo" />
      <Input
        type="textarea"
        rows="2"
        solo
        placeholder="My Label"
        label="Textarea"
        value="A set of base components for quick testing... I should be using
        Storybook, but have yet to do so."
      />
    </Card>
    <Card title="List Item Inputs" className="mb-3">
      <Input type="text" listItem placeholder="My Label" value="List Item" />
      <Divider inset />
      <Input type="text" listItem placeholder="Phone Number" value="444-444-4444" />
      <Divider inset />
      <Input type="textarea" rows={4} listItem placeholder="My Label" value="List Item" />
    </Card>

    <Card title="Empty" pad>
      <Empty title="Nothing Found" description="You could do something else" emoji="😂" />
    </Card>

    <hr class="my-2 divider center" />

    <Text size="lg" leading3 className="mb-2">Positivity</Text>

    <Card title="Posivity Selector" pad className="mb-3">
      <PositivitySelector size="sm" className="mb-2" />
      <PositivitySelector size="md" className="mb-2" />
      <PositivitySelector size="lg" className="mb-2" />
    </Card>

    <Card title="PositivityBar" pad>
      <PositivityBar size="sm" />
    </Card>

    <hr class="my-2 divider center" />

    <Text size="lg" leading3>Date Time Bar</Text>

    <hr class="my-2 divider center" />

    <Text size="lg" leading3 className="mb-2">Streaks</Text>

    <!-- <Card pad className="mb-2" title="Streak Week">
      <Streak term="#mood" view="week" />
    </Card>
    <Card pad className="mb-2" title="Streak Month & Quater">
      <Streak term="#mood" />
      <Streak term="#mood" view="quarter" />
    </Card>
    <Card pad className="mb-2" title="Streak Year">
      <Streak term="#mood" view="year" />
    </Card> -->
    <!-- <Streak term="#cider" view="quarter" />
    <Streak term="#sleep OR #mood" view="year" /> -->

    <hr class="my-2 divider center" />

    <Text size="lg" leading3 className="mb-2">Calendar</Text>

    <Card className="mb-2" title="<Calendar />">
      <Calendar />
    </Card>

    <Text size="lg" leading3 className="my-2">Buttons</Text>
    <hr class="my-2 divider center" />
    <Button size="lg">Large Button</Button>
    <hr class="my-2 divider center" />
    <Button size="md" shape="round" color="danger">Medium Button</Button>
    <hr class="my-2 divider center" />
    <Button size="sm">Small Button</Button>
    <hr class="my-2 divider center" />
    <Button size="xs">XSmall Button</Button>
    <hr class="my-2 divider center" />
    <Button block color="light">
      <Spinner size={14} />
      Button Block
    </Button>
    <hr class="my-2 divider center" />
    <div class="flex">
      <Button icon className="mr-2" color="primary">
        <IonIcon icon={ChevronUpOutline} />
      </Button>
      <Button size="sm" icon className="mr-2">
        <IonIcon icon={ChevronUpOutline} />
      </Button>
      <Button size="xs" shape="round" color="dark" className="mr-2">
        <IonIcon icon={ChevronUpOutline} />
      </Button>
      <Button size="xs" shape="round" color="light" className="mr-2">
        <IonIcon icon={ChevronUpOutline} />
      </Button>
      <Button size="sm" shape="round" color="danger" className="mr-2">
        <IonIcon icon={ChevronUpOutline} />
      </Button>
      <Button size="md" shape="round" color="success" className="mr-2">
        <IonIcon icon={ChevronUpOutline} />
      </Button>
      <Button size="lg" shape="round" color="orange" className="mr-2">
        <IonIcon icon={ChevronUpOutline} />
      </Button>
    </div>

    <hr class="my-2 divider" />

    <Button text>Text</Button>
    <Button text size="sm" color="success">Text Sm</Button>
    <Button text size="xs">Text XS</Button>

    <hr class="my-2 divider" />
    <ButtonGroup>
      <Button>Button 0</Button>
      <Button className="active">Button 1</Button>
      <Button>Button 2</Button>
    </ButtonGroup>
  </div>
</Layout>
