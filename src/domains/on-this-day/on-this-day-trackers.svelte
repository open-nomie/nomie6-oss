<svelte:options runes={true} />

<script lang="ts">
  import dayjs from 'dayjs'
  import type { Dayjs } from 'dayjs'

  import Container from '../../components/container/container.svelte'
  import Text from '../../components/text/text.svelte'
  import { Lang } from '../../store/lang'
  import { LedgerStore } from '../ledger/LedgerStore'
  import { uomSymbol } from '../uom/uom-utils'

  /**
   * On This Day - Tracker Values
   * A table of the trackers logged on this day in earlier years.
   * Rows are trackers, columns are years, and "-" marks a year without a value.
   */

  const maxYears = 5

  const { date = new Date() } = $props<{ date?: Date | Dayjs }>()

  type YearColumn = { key: string; year: string; values: Map<string, string> }
  type TrackerRow = { tag: string; cells: Array<string> }

  let columns: Array<YearColumn> = $state([])
  let rows: Array<TrackerRow> = $state([])

  // The years are counted back from the day being viewed
  const loadColumns = async (viewed: Dayjs): Promise<Array<YearColumn>> => {
    const today = viewed
    const firstDate = await LedgerStore.getFirstDate()
    const yearsDiff = today.diff(firstDate, 'year')
    const results: Array<YearColumn> = []

    for (let y = 1; y <= Math.min(yearsDiff, maxYears); y++) {
      const day = today.subtract(y, 'year')
      const logs = await LedgerStore.getDay(day)

      // Later logs win when a tracker is logged more than once that day
      const values = new Map<string, string>()
      logs
        .sort((a, b) => (a.end > b.end ? 1 : -1))
        .forEach((log) => {
          log.elements.forEach((token) => {
            if (token.type === 'tracker' && token.value !== undefined && token.value !== '') {
              const symbol = uomSymbol(token.uom)
              values.set(token.id, `${token.value}${symbol ? ` ${symbol}` : ''}`)
            }
          })
        })

      // Years without any tracker values are left out of the table
      if (values.size) {
        results.push({ key: day.format('YYYY-MM-DD'), year: day.format('YYYY'), values })
      }
    }
    return results
  }

  /**
   * One row per tracker used in any of the years, with a cell per year
   */
  const buildRows = (cols: Array<YearColumn>): Array<TrackerRow> => {
    const tags = new Set<string>()
    cols.forEach((col) => col.values.forEach((_, tag) => tags.add(tag)))
    return [...tags].sort().map((tag) => ({
      tag,
      cells: cols.map((col) => col.values.get(tag) ?? '-'),
    }))
  }

  // Reload whenever the viewed day changes; ignore results from days already left
  let latestLoad = 0
  $effect(() => {
    const viewed = dayjs(date)
    const load = ++latestLoad
    loadColumns(viewed).then((cols) => {
      if (load !== latestLoad) return
      columns = cols
      rows = buildRows(cols)
    })
  })
</script>

{#if rows.length}
  <section class="mt-3 bg-primary-500 bg-opacity-20">
    <Container className="px-4 pb-4">
      <div class="py-3 text-center">
        <Text bold>{Lang.t('on-this-day.trackers', 'Trackers on this day')}</Text>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-gray-900 dark:text-gray-100">
          <thead>
            <tr>
              <th class="text-left font-medium py-2 pr-2">Tracker</th>
              {#each columns as col (col.key)}
                <th class="text-right font-medium py-2 pl-2 whitespace-nowrap">{col.year}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each rows as row (row.tag)}
              <tr class="border-t border-black border-opacity-10">
                <td class="py-2 pr-2 text-left">#{row.tag}</td>
                {#each row.cells as cell}
                  <td class="py-2 pl-2 text-right font-medium whitespace-nowrap">{cell}</td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </Container>
  </section>
{/if}
