<script lang="ts">
  import ListItem from '../../components/list-item/list-item.svelte'
  import List from '../../components/list/list.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { AddSquareOutline, ShareOutline } from '../../components/icon/nicons'
  import Container from '../../components/container/container.svelte'
</script>

<Container className="filler  flex items-center justify-center  flex-col px-2 slide-location -mt-14">
  <p class="px-10 mb-10 text-center text-xl leading-tight text-gray-800 dark:text-gray-200 font-bold">
    🔥 WAIT! For the best experience, install me on your iOS homescreen! 📲
  </p>

  <div class="px-2">
    <List solo>
      <ListItem bottomLine={48}>
        <span slot="left" class="text-lg font-extrabold"> 1. </span>
        Tap Safari's Share Icon
        <IonIcon slot="right" icon={ShareOutline} className="text-gray-500" />
      </ListItem>
      <ListItem bottomLine={48}>
        <span slot="left" class="text-lg font-extrabold"> 2. </span>
        Scroll to & select <strong>"Add to Home Screen"</strong>
        <IonIcon slot="right" icon={AddSquareOutline} className="text-gray-500" />
      </ListItem>
      <ListItem>
        <span slot="left" class="text-lg font-extrabold"> 3. </span>
        When added, go to your Home Screen and launch Nomie 6
      </ListItem>
    </List>
  </div>
</Container>
