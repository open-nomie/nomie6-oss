<script>
    import { Prefs } from '../../../preferences/Preferences'
    export let horizUnused;
    let theme = $Prefs.theme;
    let cssVarStyles = "";
    if (theme == 'dark') {
    let bgdark= '#000000';
    let border = '#2A303C';
    let fontcolor = "#ffffff"
	cssVarStyles = `--bg:${bgdark};--border:${border};--fontcolor:${fontcolor}`;}
    else {
        let bglight= '#ffffff';
        let border = '#CCCCCC';
        let fontcolor = "#000000"
	cssVarStyles = `--bg:${bglight};--border:${border};--fontcolor:${fontcolor}`;
    }



</script>
<style>
    .scrolling-wrapper {
   overflow-x: scroll;
     overflow-y: hidden;
     white-space: nowrap;
     max-width: 100%;
    }
     
   
   </style>

{#if horizUnused}
    <table class="pvtUi" style='{cssVarStyles}'>
        <tbody>
            <tr>
                <td class="pvtRenderers"><slot name="rendererCell" /></td>
                <td class="pvtAxisContainer pvtUnused pvtHorizList"><slot name="unusedAttrsCell" /></td>
            </tr>
            <tr>
                <td class="pvtVals"><slot name="aggregatorCell" /></td>
                <td class="pvtAxisContainer pvtHorizList pvtCols"><slot name="colAttrsCell" /></td>
            </tr>
            <tr>
                <td class="pvtAxisContainer pvtVertList pvtRows"><slot name="rowAttrsCell" /></td>
                <div class="scrolling-wrapper">
                <td class="pvtOutput"><slot name="outputCell" /></td></div>
            </tr>
        </tbody>
    </table>
{:else}
    <table class="pvtUi">
        <tbody>
            <tr>
                <td class="pvtRenderers"><slot name="rendererCell" /></td>
                <td class="pvtVals"><slot name="aggregatorCell" /></td>
                <td class="pvtAxisContainer pvtHorizList pvtCols"><slot name="colAttrsCell" /></td>
            </tr>
            <tr>
                <td class="pvtAxisContainer pvtUnused pvtVertList"><slot name="unusedAttrsCell" /></td>
                <td class="pvtAxisContainer pvtVertList pvtRows"><slot name="rowAttrsCell" /></td>
                <td class="pvtOutput"><slot name="outputCell" /></td>
            </tr>
        </tbody>
    </table>
{/if}
