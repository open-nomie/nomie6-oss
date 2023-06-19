<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { Prefs } from '../../../preferences/Preferences'
    import { openDateOptionPopMenu, openPopMenu, PopMenuButton } from '../../../../components/pop-menu/usePopmenu'
    
    const dispatch = createEventDispatcher();

    export let current,
        values = [];

    let open = false;
    const toggle = () => (open = !open);
    let fontsize = Math.round(14 /(1400/window.innerWidth));
    if (fontsize < 10) {fontsize=10}
    let leftcolumnsize = Math.round(200 /(1400/window.innerWidth));
    if (leftcolumnsize < 65) {leftcolumnsize=65}

    let theme = $Prefs.theme;
    let cssVarStyles = "";
    if (theme == 'dark') {
    let ddicon= '#a2b1c6';
    let ddcurrent = 'black'
    let ddmenu = 'black'
    let ddactive = 'black'
    let ddfont = '#C8C8C8';
	cssVarStyles = `--ddicon:${ddicon};--ddcurrent:${ddcurrent};--ddmenu:${ddmenu};--ddactive:${ddactive};--ddfont:${ddfont}`;}
    else {
        let ddicon= '#a2b1c6';
        let ddcurrent = 'white'
        let ddmenu = 'white'
        let ddactive = '#ebf0f8'
        let ddfont = '#000000'
        cssVarStyles = `--ddicon:${ddicon};--ddcurrent:${ddcurrent};--ddmenu:${ddmenu};--ddactive:${ddactive};--ddfont:${ddfont}`;
    }
/// NEW
const showMenu = () => {
    let createlist = [];
    values.forEach(function (item, index) {
    createlist.push({"title":item,"checked":item==current,click() {
        if (current !== item) dispatch("change", (current = item));
        },})
})
    const buttons:Array<PopMenuButton> = createlist;
    
    openPopMenu({
      id:"rendere-menu",
      buttons,
    })
  }

</script>

<div class="pvtDropdown" style='{cssVarStyles}'>
    <button
        
        class={"pvtDropdownValue pvtDropdownCurrent " + (open ? "pvtDropdownCurrentOpen" : "")} style="font-size:{fontsize}px;width:{leftcolumnsize}px"
        on:click={()=>{showMenu()}}
            
    >
        <div class="pvtDropdownIcon">{open ? "×" : "..."}</div>
        {#if current}
            {current}
        {:else}
            <span>&nbsp;</span>
        {/if}
    </button>

        
</div>
