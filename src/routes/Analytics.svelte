<script lang="ts">
  import Layout from '../domains/layout/layout.svelte'

  import AnalyticsView from '../domains/analytics/analytics-view.svelte'
  import type { Dayjs } from 'dayjs'
  import dayjs from 'dayjs'
  import NextPrevCal from '../components/next-prev-cal/next-prev-cal.svelte'

  import Toolbar from '../components/toolbar/toolbar.svelte'
  import { getDateFormats } from '../domains/preferences/Preferences'

  let endDate: Dayjs = dayjs()
  let startDate: Dayjs = dayjs().subtract(90, 'days')

  $: startDate = endDate.subtract(90, 'days')

  const dateFormats = getDateFormats()

  const previousPeriod = () => {
    endDate = endDate.subtract(90, 'days')
  }
  const nextPeriod = () => {
    endDate = endDate.add(90, 'days')
  }
</script>

<Layout pageTitle="My Analytics">
  <Toolbar slot="header">
    <h1 class="ntitle w-full">
      <NextPrevCal
        className=" items-center justify-center"
        on:next={nextPeriod}
        on:previous={previousPeriod}
        hideCal={true}
      >
        {startDate.format(dateFormats.tinyDate)} <span class="font-normal px-2">to</span>
        {endDate.format(dateFormats.tinyDate)}
        {endDate.format('YYYY')}
      </NextPrevCal>
    </h1>
  </Toolbar>
  <AnalyticsView {endDate} {startDate} />
</Layout>
