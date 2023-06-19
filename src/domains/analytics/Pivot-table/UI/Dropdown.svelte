<script>
    import { clickOutside } from "./utils";
    import { createEventDispatcher } from "svelte";
    import { Prefs } from '../../../preferences/Preferences'
    
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


</script>

<div class="pvtDropdown" use:clickOutside on:outside={() => (open = false)} style='{cssVarStyles}'>
    <button
        on:click|stopPropagation={toggle}
        class={"pvtDropdownValue pvtDropdownCurrent " + (open ? "pvtDropdownCurrentOpen" : "")} style="font-size:{fontsize}px;width:{leftcolumnsize}px"
    >
        <div class="pvtDropdownIcon">{open ? "×" : "▾"}</div>
        {#if current}
            {current}
        {:else}
            <span>&nbsp;</span>
        {/if}
    </button>

    {#if open}
        <div class="pvtDropdownMenu" style="z-index: 100">
            {#each values as r (r)}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div style="font-size:{fontsize-2}px"
                    role="button"
                    on:click|stopPropagation={() => {
                        if (current !== r) dispatch("change", (current = r));
                        toggle();
                    }}
                    class="pvtDropdownValue"
                    class:pvtDropdownActiveValue={r === current}
                >
                    {r}
                </div>
            {/each}
        </div>
    {/if}
</div>
