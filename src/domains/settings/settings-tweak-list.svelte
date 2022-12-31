<script lang="ts">
  import ListItem from '../../components/list-item/list-item.svelte'

  import NToggle from '../../components/toggle-switch/toggle-switch.svelte'
  import { Lang } from '../../store/lang'

  import ButtonGroup from '../../components/button-group/button-group.svelte'

  import List from '../../components/list/list.svelte'

  import { Prefs } from '../preferences/Preferences'
  import Avatar from '../../components/avatar/avatar.svelte'
</script>

<!--
  *******************************************
  TWEAKS VIEW
  *******************************************
-->
<!-- Use Location -->

<!-- <ListItem bottomLine={42} title={Lang.t('settings.base-font-size', 'Text Size')}>
    <Avatar slot="left"  className="-ml-1" emoji="🅰" />
    <div slot="right">
      <ButtonGroup>
        {#each ['xs', 'sm', 'md', 'lg', 'xl'] as size, index}
          <Button
            ariaLabel={`${size} font size`}
            className={`${fontSize === size ? 'active' : ''}`}
            on:click={() => {
              methods.changeFontSize(size)
            }}>
            <div style="font-size:{9 + index * 2}px;">A</div>
          </Button>
        {/each}

      </ButtonGroup>
    </div>
  </ListItem> -->

<!-- <hr class="my-1 divider center" /> -->

<!-- <hr class="my-1 divider center" /> -->

<List solo outside title={Lang.t('settings.locale', 'Locale')} className="pb-2">
  <!-- 24 Hour -->

  <!-- firstDayOfWeek -->
  <ListItem bottomLine={42} title={Lang.t('settings.unit-system,', 'Units')}>
    <Avatar slot="left" emoji="📐" className="-ml-1 mr-2" size={22} />
    <div slot="right">
      <ButtonGroup
        buttons={[
          {
            label: Lang.t('settings.imperial', 'Imperial'),
            active: $Prefs.useMetric == false,
            click() {
              $Prefs.useMetric = false
            },
          },
          {
            label: Lang.t('settings.metric', 'Metric'),
            active: $Prefs.useMetric == true,
            click() {
              $Prefs.useMetric = true
            },
          },
        ]}
      />
    </div>
  </ListItem>

  <ListItem bottomLine={42} title={Lang.t('settings.week-starts', 'Week Starts')}>
    <Avatar slot="left" emoji="🗓" className="-ml-1 mr-2" size={22} />
    <div slot="right">
      <ButtonGroup
        bind:value={$Prefs.weekStarts}
        buttons={[
          {
            label: Lang.t('settings.sun', 'Sun'),
            value: 'sunday',
          },
          {
            label: Lang.t('settings.mon', 'Mon'),
            value: 'monday',
          },
        ]}
      />
    </div>
  </ListItem>

  <ListItem bottomLine={42} title={Lang.t('settings.24-hour-clock', '24 hour clock')}>
    <Avatar slot="left" emoji="⌚️" className="-ml-1 mr-2" size={22} />
    <div slot="right">
      <NToggle title="24 Hour Mode" bind:value={$Prefs.use24hour} />
    </div>
  </ListItem>

  <!-- Language -->
  <ListItem bottomLine={42} title={Lang.t('settings.language', 'Language')}>
    <Avatar slot="left" emoji="🌎" className="-ml-1 mr-2" size={22} />
    <div slot="right">
      <select
        title="Select a Language"
        class="nselect clear"
        bind:value={$Lang.lang}
        on:change={(event) => {
          Lang.setLang($Lang.lang)
        }}
      >
        {#each Lang.getLangs() as lang}
          <option value={lang.key}>{lang.label}</option>
        {/each}
      </select>
    </div>
  </ListItem>
</List>
<!-- 
  <ListItem bottomLine={42} title={Lang.t('settings.translate-nomie', 'Help Translate Nomie')} to="/lang" detail>
    <Avatar slot="left"  emoji="🌍" className="-ml-1 mr-2" size={22}/>
  </ListItem> -->
