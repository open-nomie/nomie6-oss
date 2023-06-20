<script lang="ts">
  import { navigate } from 'svelte-navigator'

  import IonIcon from '../../components/icon/ion-icon.svelte'

  import SettingsTweakList from './settings-tweak-list.svelte'

  import Container from '../../components/container/container.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'

  //Vendors

  import { onMount } from 'svelte'

  import SocialShare from '../../modules/share/share'

  // Components
  import ListItem from '../../components/list-item/list-item.svelte'
  import Spacer from '../../components/spacer/spacer.svelte'
  import List from '../../components/list/list.svelte'

  // // Containers

  import NLayout from '../../domains/layout/layout.svelte'

  // Vendors
  import dayjs from 'dayjs'

  // Stores

  import { Interact } from '../../store/interact'

  import { Lang } from '../../store/lang'
  import { Device } from '../../store/device-store'

  // Config
  import config from '../../config/appConfig'
  // Comtainers

  // Components
  import Text from '../../components/text/text.svelte'
  import Button from '../../components/button/button.svelte'

  import SettingsDataList from './settings-data-list.svelte'
  import SettingsAboutList from './settings-about-list.svelte'
  import SettingsFeaturesList from './settings-features-list.svelte'
  import { AppVersion } from '../../modules/app-version/app-version'

  import AwardsPreviewList from '../awards/components/awards-preview-list.svelte'
  import { enabledBetaFeatures, Prefs } from '../preferences/Preferences'
  import { showImportModal } from '../import-export/ImporterStore'
  import { MailOutline, MailUnreadOutline } from '../../components/icon/nicons'
  import { deleteEverything } from './settings-functions'
  // import Logo from '../../components/logo/logo.svelte'
  import { showToast } from '../../components/toast/ToastStore'

  import ChatboxOutline from '../../n-icons/ChatboxOutline.svelte'
  import Badge from '../../components/badge/badge.svelte'
  import { openTemplateManager } from '../templates/templates-svelte-helpers'
  import { openAnalytics } from '../templates/templates-svelte-helpers'
  import { openPluginsModal } from '../plugins/PluginStore'
  import PluginsMoreMenu from '../plugins/plugins-more-menu.svelte'

  export const location = undefined
  export const style = undefined

  let st = 0
  async function specialTap() {
    st = st + 1
    if (st > 9) {
      methods.unlockFeatures()
    }
  }

  let methods = {
    share() {
      SocialShare(
        `I track my life with Nomie! It's free, private, and you get to design what you track. @nomieapp`,
        'https://nomie.app'
      )
    },
    async unlockFeatures() {
      enabledBetaFeatures()
      Interact.confetti({
        show: true,
      })
      showToast({
        type: 'success',
        message: '🎁  Secret Beta Features Unlocked',
      })
    },
    locations() {
      Interact.pickLocation()
    },

    bookAge(date) {
      return dayjs(`${date}-01`).fromNow()
    },
    faq() {
      navigate('/faq')
    },
    shop() {
      navigate('/shop')
    },
  }

  // const setTimeout = setTimeout;
  onMount(() => {
    Device.scrollToTop()
  })
</script>

<NLayout pageTitle="Settings" showCapture={false}>
  <div slot="header" class="z-40">
    <Container>
      <ToolbarGrid>
        <!-- <Button
          slot="left"
          clear
          icon
          title={Lang.t('general.messages', 'Messages')}
          className={$Prefs.hideMessages ? 'hidden' : ''}
          on:click={() => {
            navigate('/messages')
          }}
        >
          <IonIcon
            icon={$MessageStore.unseen ? MailUnreadOutline : MailOutline}
            className={$MessageStore.unseen ? 'text-red-500 animate-pulse' : 'text-gray-500'}
          />
        </Button> -->

        <!-- <Logo size={22} /> -->

        <div slot="right">
          <!-- {#if !hasChatInstalled} -->
          <a
            title="Find a bug? Want to provide feedback?"
            href="https://airtable.com/shrY9p9UJjC1PMMbI"
            class="font-semibold text-black dark:text-white text-sm flex items-center space-x-2"
            target="_blank"
          >
            <span>{Lang.t('general.feedback', 'Feedback')}</span>
            <ChatboxOutline />
          </a>
          <!-- {/if} -->
        </div>
      </ToolbarGrid>
    </Container>
  </div>

  <div slot="content" class="pt-2 z-10 relative  lg:px-4">
    <Container>
      {#if $Prefs}
        <div class="page page-settings">
          <div class="p-0 pt-4">
            <div id="settings-marker" />

            <!-- <ListItem bottomLine={16} transparent>
              <div class="grid grid-cols-2 gap-2">
                <Button
                  role="menuitem"
                  className="dark:bg-gray-800 bg-gray-100 text-black dark:text-white"
                  title={`${Lang.t('settings.sign-in', 'Sign-In')}`}
                  on:click={() => {
                    openLoginModal()
                  }}
                >
                  {Lang.t('settings.sign-in', 'Sign-In')}</Button
                >
                <Button
                  role="menuitem"
                  className="dark:bg-gray-800 bg-gray-100 text-black dark:text-white"
                  title={Lang.t('settings.export', 'Export')}
                  on:click={() => openRegisterModal()}
                >
                  {Lang.t('settings.register', 'Register')}
                </Button>
              </div>
            </ListItem> -->

            <List solo outside>
              <AwardsPreviewList />
            </List>

            <!-- Sign-in and Register Block  -->

            <List solo className="mt-4">
              <ListItem detail bottomLine={16} on:click={() => openPluginsModal()} title="Plugins">
                <span slot="left">🔌</span>
              </ListItem>
              <PluginsMoreMenu />
            </List>

            <List solo className="mt-4">
              <ListItem detail bottomLine={16} on:click={() => openTemplateManager()} title="Templates">
                <span slot="left">🏭</span>
              </ListItem>
            </List>

            <List solo className="mt-4">
              <ListItem detail bottomLine={16} on:click={() => openAnalytics()} title="Analytics">
                <span slot="left">🧊</span>
              </ListItem>
            </List>

            <div id="data-marker" />
            <SettingsDataList
              on:showImporter={() => {
                showImportModal()
              }}
            />

            <SettingsFeaturesList />
            <SettingsTweakList />

            <!-- END Views -->

            <List solo className="mt-4">
              <ListItem title={Lang.t('general.questions', 'Questions')} detail>
                <span slot="left">🆘</span>
                <div slot="right">
                  <a href={`mailto:${config.support_email}?subject=Nomie ${AppVersion} `}>
                    <Badge pad className="bg-gray-300 text-black">Email</Badge>
                  </a>
                </div>
              </ListItem>
            </List>

            <div id="about-marker" />
            <SettingsAboutList />

            <Spacer gap={1} />

            <button class="w-full px-4 mt-4 mb-3 text-sm text-center " on:click={specialTap}>
              <div class="text-sm text-black dark:text-white">
                Version v{import.meta.env.PACKAGE_VERSION}
              </div>
              <div class="text-xs text-gray-800 dark:text-gray-500">
                <strong>Happy Data</strong>, LLC &copy; Copyright 2014 - {dayjs().format('YYYY')}
              </div>
            </button>
          </div>
          <!-- end container -->
        </div>
      {/if}

      <List solo className="mb-3" outside title={Lang.t('settings.danger-zone', 'Danger Zone')}>
        <ListItem detail on:click={deleteEverything} clickable>
          <Text className="text-red">
            {Lang.t('settings.destroy-all-data', 'Destroy all Data')}
          </Text>
        </ListItem>
      </List>
    </Container>
  </div>
</NLayout>

<style global lang="postcss">
  body[data-path='/settings'] .woot--bubble-holder {
    @apply block;
  }

  body[data-path='/settings'] .woot-widget-bubble img {
    /* @apply h-4 w-4;
    z-index:300 !important;
    @apply my-0 mx-2; */
    @apply hidden;
  }

  body[data-path='/settings'] .woot-widget-bubble:before {
    content: 'Need Help? 🛟';
  }
  body .woot-widget-bubble {
    height: 32px !important;
    width: auto !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center;
    background: transparent !important;
    @apply text-black dark:text-white;
    box-shadow: none !important;
    flex-wrap: nowrap;
    border-radius: 9900px;
    @apply px-2;
    @apply top-2;
    @apply -right-2;
    @apply -mr-2;
    @apply bottom-auto;
    padding-left: 10px !important;
  }
  body .woot-widget-bubble img {
  }
  body .woot-widget-bubble:hover {
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1) !important;
  }
</style>
