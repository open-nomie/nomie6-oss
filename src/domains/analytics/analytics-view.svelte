<script lang="ts">
      
      import escapeRegExp from 'lodash/escapeRegExp'
      import PivotTableUI from "./Pivot-table/PivotTableUI.svelte";
    import Container from '../../components/container/container.svelte'
    //import TableRenderers from "svelte-pivottable/TableRenderers";
    import TableRenderers from "./Pivot-table/TableRenderers";
    import Plotly from "plotly.js-dist-min";
    //import PlotlyRenderers from "svelte-pivottable/PlotlyRenderers";
    import PlotlyRenderers from "./Pivot-table/PlotlyRenderers";
    import { TrackableStore , AllTrackablesAsArray } from '../trackable/TrackableStore'
    import { tokenToTrackable } from '../../modules/tokenizer/tokenToTrackable'
    import { strToToken } from '../../modules/tokenizer/lite'
    import List from '../../components/list/list.svelte'
    import Empty from '../../components/empty/empty.svelte'
    import Button from '../../components/button/button.svelte'
    import dayjs from 'dayjs'
    import { LedgerStore, queryToTrackableUsage } from '../ledger/LedgerStore'
    import { onMount } from 'svelte'
    import PivotSelector from "./Pivot-table/UI/PivotSelector.svelte";
    import debounce from 'lodash/debounce'
    import { Interact } from '../../store/interact'
    import { PivotStore, openPivotEditor} from './PivotStore'
    import { PivotClass } from './pivot-class'
    import { PivotData } from './Pivot-table/Utilities';
    import { showToast } from '../../components/toast/ToastStore'
    import { CubeOutline } from '../../components/icon/nicons'
    import { EyeSolid } from '../../components/icon/nicons'
    import { EyeClosedSolid } from '../../components/icon/nicons'
    import IonIcon from "../../components/icon/ion-icon.svelte";

    let notenoughdata = false;
    let plotlyRenderers = {};
    let renderers;
    let loaded = false;
    let pivotconfig = new PivotClass;
    let loading = true;
    let workingPivotId = "0";
    let workingPivotTag = "Initiati0nPiv0t";
    let workingPivotEmoji = "🐣";
    let workingPivotDefault = false;
    let workingPivotDays = 90;
    let workingPivotSearchTerm = new Object({"enabled":true,"terms":""})
    let { derivedAttributes, cols, rows, vals, sorters, valueFilter } = PivotData.defaultProps;
    let fontsize = Math.round(16 /(1400/window.innerWidth));
    if (fontsize <9) {fontsize=9}

    onMount(async () => {
        // create Plotly renderers via dependency injection
        plotlyRenderers = PlotlyRenderers(Plotly);
        loaded = false;
        renderers = { ...TableRenderers, ...plotlyRenderers };
        initialzePivotsPage();
        getData();
        
        
    });

    let grouping = true;
    let compactRows = true;
    let rowGroupBefore = true;
    let colGroupBefore = false; 
    let rendererName = "Table";
    let aggregatorName = "Count";
    let hiddenAttributes = [];
    let hiddenFromAggregators = [];
    let hiddenFromDragDrop = [];
    let unusedOrientationCutoff = 85;
    let menuLimit = 500;
    
    let tempdata = [];
    let data = [];
    let getConfig = false;
    let pivots: Array<PivotClass> = [];
    let menushow = true;
    let countpivots = 0;

    let options = {
        "rows": rows,
        "cols": cols,
        "vals": vals,
        data,
        "valueFilter": valueFilter,
        "sorters": sorters,
        derivedAttributes,
    };

    const initialzePivotsPage = debounce(() => {
        let lastcount = countpivots;
    try {
        if ($PivotStore.length) {
            countpivots = $PivotStore.length;
        loading = true
        pivots = [...$PivotStore]
        }
        if (!$PivotStore.length) {
            countpivots = 0
            pivots = [...$PivotStore]}
      loading = false
    } catch (e) {
      Interact.error(e.message)
      loading = false
    }
    if (countpivots == 0) {
        lastcount = 0;
        deselectAll();
    }
    if (lastcount < countpivots) {
        lastcount=countpivots;
        let pvt = {"detail":$PivotStore[($PivotStore.length-1)]};
        let defaultpivot = $PivotStore.find(x => x.default === true);
        if (defaultpivot) {pvt = {"detail":defaultpivot}}
         selectPivot(pvt)
    }
    else if (lastcount > countpivots) {
        lastcount=countpivots;
        deselectAll();
    }
    else if (lastcount = countpivots) {
        lastcount=countpivots;
        let pvt  = {"detail":$PivotStore.find(element => element.id == workingPivotId)};
        selectPivot(pvt)
    }

  }, 200)

    async function getConfiguration(){
        getConfig = true;
        setTimeout(()=>{getConfig=false
            },10)
    }

    async function getData(){
        loaded = false;
        let message = "Loading Data...";
        if (workingPivotDays > 270) {message = `> 270 days, be patience..`}
        Interact.blocker(message)
        let trackables;
        let searches = workingPivotSearchTerm.terms.split(';');
        var timeout = setInterval(async function() {
            trackables = $AllTrackablesAsArray;

            if (trackables.length && $LedgerStore.books) {
            if(/[#@+]/.test(trackables[0].id)) {
                clearInterval(timeout);
                
        tempdata = [];
        var i;
        
        for (i in trackables) {
            if (trackables[i].id != undefined){
                let usage = await getUsage(trackables[i].id)
                await addUsage2Data(usage,trackables[i].id)
            }
        }
        if (workingPivotSearchTerm.enabled == true){
            for (i in searches) {
                await addSearch2Data(searches[i])
            }}

        data = await bringItTogether(tempdata)
        options.data = data;
        loaded = true;
        Interact.stopBlocker()
        }
        }
        else {
            clearInterval(timeout);
            Interact.stopBlocker()
            notenoughdata = true}}, 100);
    }

       
    async function getUsage(tag) { 
        
        const trackable = tokenToTrackable(strToToken(tag), $TrackableStore.trackables)
        let daysBack =  workingPivotDays;
        let date = new Date()
        let groupByDay = true
        const dateRange = {
            end: dayjs(date),
            start: dayjs(date).subtract(daysBack, 'days'),
        }
        
        const trackableUsage = await queryToTrackableUsage(trackable, dateRange, $TrackableStore.trackables)
        
        
        const usage = groupByDay ? trackableUsage.byDay : trackableUsage
        usage.dates = usage.dates.map((djs) => djs.toDate())
        return usage;       
    }

    async function addUsage2Data(usage,trackable){
        var i;
        var values = usage.values;
        for (i in values) {
            var shortdate = await determineShortDate(usage.dates[i])
            var day = await determineDay(usage.dates[i])
            var dayperiod = await determineDayPeriod(usage.dates[i])
            var emoji = usage.trackable.emoji
            if (usage.trackable.type == "person") {emoji = "😎"}
            if (emoji == undefined) {emoji = "🐘"}
            var trackablename = emoji+trackable.slice(1);
            tempdata.push({ "Date":usage.dates[i],[trackablename]:values[i],"ShortDate":shortdate,"Day":day,"DayPeriod":dayperiod})
    
        }
    }

    async function determineShortDate(date){
        var shortdate = date.toISOString().slice(0,10);
        //var shortdate = date.toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"})
        return shortdate
    }

    async function determineDay(date){
    // determine Day
        var days = ['7.Sunday', '1.Monday', '2.Tuesday', '3.Wednesday', '4.Thursday', '5.Friday', '6.Saturday'];
        var day = days[date.getDay()]
        return day;    
    }

    async function determineDayPeriod(date){
        // determine phase of Day
        var curHr = date.getHours()
            var time = null;
            if (curHr < 12) {
                time = "Morning";
            } else if (curHr < 18) {
                time = "Afternoon";
            } else {
                time = "Evening";
            }  
        return time
    }

    async function addSearch2Data(term){
        
        let daysBack =  workingPivotDays;
        let date = new Date()
        let end = dayjs(date || new Date()).endOf('day')
        let start = dayjs(date).subtract(daysBack, 'days')
        let results = await LedgerStore.query({ search: escapeRegExp(term), start, end })
        

        //loop through results and add to array
        var consolidated = []
        var i;
        for (i in results) {
            results[i].shortdate = results[i].start.toISOString().slice(0,10);
            var countfortoday  = results.filter(result => result.start.toISOString().slice(0,10) === results[i].start.toISOString().slice(0,10));
            consolidated = consolidated.filter(consol => consol.shortdate != results[i].start.toISOString().slice(0,10));
            var shortdate = await determineShortDate(results[i].start)
            var day = await determineDay(results[i].start)
            var dayperiod = await determineDayPeriod(results[i].start)
            var emoji = "🕵🏻‍♂️"
            var search = emoji+term;
            consolidated.push({ "Date":results[i].start,[search]:countfortoday.length,"ShortDate":shortdate,"Day":day,"DayPeriod":dayperiod})
    
        }  
        let j;
        for (j in consolidated){
            tempdata.push(consolidated[j])
        }
    }

    async function bringItTogether(data){
        var output = [];

        data.forEach(function(item) {
        var existing = output.filter(function(v, i) {
            return v.ShortDate == item.ShortDate;
        });
        if (existing.length) {
            var existingIndex = output.indexOf(existing[0]);
            output[existingIndex]  = {...output[existingIndex],...item};
            
        } else {
            output.push(item);
        }
        });
        return output;
    }
   

    // CRUDS START

    
    $: if ($PivotStore) {
        initialzePivotsPage()
  }

    const createPivot = () => {
        const pivot = new PivotClass({tag:"New Pivot"})
        openPivotEditor(pivot)
    }

    const savePivot = async () => {
        await getConfiguration();
        let newPivot = pivotconfig;
        newPivot.data = [];
        newPivot.options.data = [];
        Interact.blocker(`Saving ${newPivot.emoji}${newPivot.tag} pivot...`)
        await PivotStore.upsert(newPivot)
        Interact.stopBlocker()
        showToast({ message: 'Pivot Saved' })
    }

    const selectPivot = (pvt) => {
        let historyperiodchanged = true;
        let searchtermschanged = true;
        workingPivotId = pvt.detail.id;
        workingPivotTag = pvt.detail.tag;
        workingPivotEmoji = pvt.detail.emoji;
        workingPivotDefault = pvt.detail.default;
        let Delta = workingPivotDays-pvt.detail.days;
        if (Delta === 0) {
            historyperiodchanged = false}
        workingPivotDays = pvt.detail.days || 90;
        if (workingPivotSearchTerm.terms == pvt.detail.searchterm.terms && workingPivotSearchTerm.enabled == pvt.detail.searchterm.enabled ) {searchtermschanged = false}
        workingPivotSearchTerm = pvt.detail.searchterm || {"enabled":false,"terms":""}
        grouping = pvt.detail.grouping;
        compactRows = pvt.detail.compactRows;
        rowGroupBefore = pvt.detail.rowGroupBefore;
        colGroupBefore = pvt.detail.colGroupBefore; 
        rendererName = pvt.detail.rendererName;
        aggregatorName = pvt.detail.aggregatorName;
        options = pvt.detail.options;
        options.data = data;
        if (historyperiodchanged == true || searchtermschanged == true) {
            getData();
        }
    }

    const setDefault = async (pvt) => {
        let allPivots = $PivotStore;
        const changeDefault = allPivots.map(obj => {
            obj.default = false;
            obj.options.data = [];
            if (obj.id == pvt.detail.id) {
                return {...obj, default: true};
            }
            return obj})
            await PivotStore.upsertMany(changeDefault)
    }


    const editPivot = async() => {
        await getConfiguration();
        let editPivot = pivotconfig;
        const pivot = new PivotClass(editPivot)
        openPivotEditor(pivot)
    }

    const deselectAll = () => {
        workingPivotId = "0";
        workingPivotTag = "Initiati0nPiv0t";
        workingPivotEmoji = "🐣";
        workingPivotDays = 90;
        workingPivotSearchTerm = {enabled:false,terms:""}
        workingPivotDefault = false;
        let { derivedAttributes, cols, rows, vals, sorters, valueFilter } = PivotData.defaultProps;
        grouping = true;
        compactRows = true;
        rowGroupBefore = true;
        colGroupBefore = false; 
        rendererName = "Table";
        aggregatorName = "Count";
        hiddenAttributes = [];
        hiddenFromAggregators = [];
        hiddenFromDragDrop = [];
        unusedOrientationCutoff = 85;
        menuLimit = 500;
        options = {
        "rows": rows,
        "cols": cols,
        "vals": vals,
        data,
        "valueFilter": valueFilter,
        "sorters": sorters,
        derivedAttributes,
    };
    }

    const deletePivot = async () => {
    const confirmed = await Interact.confirm('Delete this pivot?', 'You can always recreate it later.')
    if (confirmed) {
      await PivotStore.remove(new PivotClass({id:workingPivotId}))
      
    }
    }

    const copyPivot = async () => {
        await getConfiguration();
        let copyPivot = pivotconfig;
        copyPivot.id = undefined;
        copyPivot.tag = copyPivot.tag+"(copy)"
        copyPivot.default = false;
        const pivot = new PivotClass(copyPivot)
        openPivotEditor(pivot)
    }
    
    
    const showMenu = () => {
        menushow = true;
    }

    const hideMenu = () => {
        menushow = false;
    }
   
</script>


    <Container className="py-1 shadow shadow-black/10 dark:shadow-black/40 bg-white filler dark:bg-black rounded-md" size="xl" >
        {#if !notenoughdata}
        <div>
            {#if !menushow}
            <Button icon on:click={showMenu}>
                <IonIcon className="text-primary-500" icon={EyeSolid} size={32} />
              </Button>
            {:else}
            <Button icon on:click={hideMenu}>
                <IonIcon className="text-primary-500" icon={EyeClosedSolid} size={32} />
              </Button>
            {/if}
        </div>
        {#if menushow}

        <PivotSelector pivots={pivots} on:setdefault={setDefault} on:selectpivot={selectPivot} on:newpivot={createPivot} on:save={savePivot} on:delete={deletePivot} on:edit={editPivot} on:copy={copyPivot}></PivotSelector>
        
        {/if}
        {/if}

    </Container>
    {#if notenoughdata}
    <List transparent className="max-w-md mx-auto">
        <Empty icon={CubeOutline} title="Not Enough Data">
            <div class="my-0 text-center text-lg font-normal leading-tight text-gray-800 dark:text-gray-50">
                Not enough Data to create Pivots.
              </div>
        </Empty>
      </List>
    {/if}
    {#if loaded}
{#if workingPivotTag === "Initiati0nPiv0t"}
    <List transparent className="max-w-md mx-auto">
      <Empty icon={CubeOutline} title="No pivot Selected">
          <Button on:click={createPivot} className="mt-2" clear primary>Create a New Pivot →</Button>
      </Empty>
    </List>
  {:else}
  <div class="my-0 text-center text-lg font-normal leading-tight text-gray-800 dark:text-gray-50">
    Active Pivot: {workingPivotEmoji} {workingPivotTag}
  </div>
    <Container className="py-4 shadow shadow-black/10 dark:shadow-black/40 bg-white filler dark:bg-black rounded-md" size="xl" >
<div class="row text-center my-1 text-center text-xs font-normal leading-tight text-gray-800 dark:text-gray-50">
    <fieldset class="col-md-6" >
        <label class=" checkbox-inline" style="text-transform: capitalize;font-size:{fontsize}px">
            <input type="checkbox" bind:checked={grouping} /> Grouping
        </label>

        <label class=" checkbox-inline" style="text-transform: capitalize;font-size:{fontsize}px">
            <input type="checkbox" bind:checked={compactRows} disabled={!grouping}/> Compact Rows
        </label>

        <label class=" checkbox-inline" style="text-transform: capitalize;font-size:{fontsize}px">
            <input type="checkbox" bind:checked={rowGroupBefore} disabled={!grouping}/> Rows totals above
        </label>
        <label class=" checkbox-inline" style="text-transform: capitalize;font-size:{fontsize}px">
            <input type="checkbox" bind:checked={colGroupBefore} disabled={!grouping}/> Cols totals before
        </label>
    </fieldset>
</div>
   
    <div class="scrolling-wrapper">
        <div class="px-4 grid grid-cols-1 gap-3">
            <PivotTableUI
            {...options} {renderers} {grouping} {compactRows} {rowGroupBefore} {colGroupBefore} {rendererName} {aggregatorName} {hiddenAttributes} {hiddenFromAggregators} {hiddenFromDragDrop} {unusedOrientationCutoff} {menuLimit} {workingPivotId} {workingPivotTag} {workingPivotEmoji} {workingPivotDefault} {workingPivotDays} {workingPivotSearchTerm} bind:pivotconfig={pivotconfig} bind:getConfig={getConfig}/>
        </div>
    </div>
      </Container>
{/if}      
{/if}    
  


