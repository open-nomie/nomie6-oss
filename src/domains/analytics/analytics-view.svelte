<svelte:options runes={true} />

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
    import Spinner from '../../components/spinner/spinner.svelte';

    let notenoughdata = $state(false);
    let plotlyRenderers = $state({});
    let renderers = $state(undefined);
    let loaded = $state(false);
    let pivotconfig = $state(new PivotClass());
    let loading = $state(true);
    let workingPivotId = $state("0");
    let workingPivotTag = $state("Initiati0nPiv0t");
    let workingPivotEmoji = $state("🐣");
    let workingPivotDefault = $state(false);
    let workingPivotDays = $state(90);
    let workingPivotSearchTerm = $state(new Object({"enabled":true,"terms":""}));
    let { derivedAttributes, cols, rows, vals, sorters, valueFilter } = PivotData.defaultProps;
    let fontsize = $state(Math.round(16 /(1400/window.innerWidth)));
    if (fontsize <9) {fontsize=9}

    let initialized = $state(false);

    $effect(() => {
        if (!initialized) {
            // create Plotly renderers via dependency injection
            plotlyRenderers = PlotlyRenderers(Plotly);
            loaded = false;
            renderers = { ...TableRenderers, ...plotlyRenderers };
            initialzePivotsPage();
            initialized = true;
            // getData() will be called from selectPivot() after pivot is selected
        }
    });

    let grouping = $state(true);
    let compactRows = $state(true);
    let rowGroupBefore = $state(true);
    let colGroupBefore = $state(false); 
    let rendererName = $state("Table");
    let aggregatorName = $state("Count");
    let hiddenAttributes = $state([]);
    let hiddenFromAggregators = $state([]);
    let hiddenFromDragDrop = $state([]);
    let unusedOrientationCutoff = $state(85);
    let menuLimit = $state(500);
    
    let tempdata = $state([]);
    let data = $state([]);
    let getConfig = $state(false);
    let pivots: Array<PivotClass> = $state([]);
    let menushow = $state(true);
    let countpivots = $state(0);
    let isLoadingData = $state(false);

    let options = $derived.by(() => ({
        "rows": rows,
        "cols": cols,
        "vals": vals,
        data,
        "valueFilter": valueFilter,
        "sorters": sorters,
        derivedAttributes,
    }));

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
    else if (lastcount == countpivots && workingPivotId !== "0") {
        lastcount=countpivots;
        let pvt  = {"detail":$PivotStore.find(element => element.id == workingPivotId)};
        if (pvt.detail) {
            selectPivot(pvt)
        }
    }

  }, 200)

    async function getConfiguration(){
        console.log('[Pivot] getConfiguration() called - preparing to save', {
            rows: rows,
            cols: cols,
            rowsDuplicates: rows?.filter((item, index) => rows.indexOf(item) !== index),
            colsDuplicates: cols?.filter((item, index) => cols.indexOf(item) !== index),
        });
        getConfig = true;
        setTimeout(()=>{
            console.log('[Pivot] getConfiguration() complete, getConfig=false');
            getConfig=false
        },10)
    }

    async function getData(){
        // Prevent concurrent getData() calls which can cause race conditions
        if (isLoadingData) {
            return;
        }
        isLoadingData = true;

        loaded = false;
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
        data = await bringItTogether(tempdata)

        // Add search term attributes to consolidated data
        if (workingPivotSearchTerm.enabled == true){
            data = await addSearchAttributesToConsolidatedData(data, searches)
        }

        loaded = true;
        isLoadingData = false;
        }
        }
        else {
            clearInterval(timeout);
            notenoughdata = true
            isLoadingData = false;
        }}, 100);
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

    async function addSearchAttributesToConsolidatedData(consolidatedData, searchTerms) {
        // Create a copy of the data so we don't mutate the original
        let result = consolidatedData.map(item => ({...item}));

        for (let termIndex in searchTerms) {
            let term = searchTerms[termIndex];
            if (term !== "") {
                let daysBack = workingPivotDays;
                let date = new Date();
                let end = dayjs(date || new Date()).endOf('day');
                let start = dayjs(date).subtract(daysBack, 'days');
                let queryResults = await LedgerStore.query({ search: escapeRegExp(term), start, end });

                var emoji = "🕵🏻‍♂️";
                var searchAttr = emoji + term;

                // Build a map of date -> count
                var countMap = {};
                queryResults.forEach((qr) => {
                    var shortdate = qr.start.toISOString().slice(0, 10);
                    if (!countMap[shortdate]) {
                        countMap[shortdate] = 0;
                    }
                    countMap[shortdate]++;
                });

                // Add search attribute to each record in result
                result.forEach((item) => {
                    item[searchAttr] = countMap[item.ShortDate] || 0;
                });
            }
        }

        return result;
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

    $effect(() => {
        if ($PivotStore) {
            initialzePivotsPage()
        }
    })

    const createPivot = () => {
        const pivot = new PivotClass({tag:"New Pivot"})
        openPivotEditor(pivot)
    }

    const savePivot = async () => {
        console.log('[Pivot] savePivot() called');
        await getConfiguration();
        let newPivot = new PivotClass(JSON.parse(JSON.stringify(pivotconfig)));
        newPivot.data = [];
        newPivot.options.data = [];
        console.log('[Pivot] About to save pivot to store', {
            pivotId: newPivot.id,
            pivotTag: newPivot.tag,
            rows: newPivot.options.rows,
            cols: newPivot.options.cols,
            rowsDuplicates: newPivot.options.rows?.filter((item, index) => newPivot.options.rows.indexOf(item) !== index),
            colsDuplicates: newPivot.options.cols?.filter((item, index) => newPivot.options.cols.indexOf(item) !== index),
        });
        Interact.blocker(`Saving ${newPivot.emoji}${newPivot.tag} pivot...`)
        try {
            await PivotStore.upsert(newPivot)
        } catch (e) {
            Interact.error(e.message)
            return
        } finally {
            Interact.stopBlocker()
        }
        console.log('[Pivot] savePivot() complete - pivot saved');
        showToast({ message: 'Pivot Saved' })
    }

    const selectPivot = (pvt) => {
        console.log('[Pivot] selectPivot() called', {
            pivotId: pvt.detail.id,
            pivotTag: pvt.detail.tag,
            rowsLoaded: pvt.detail.options?.rows,
            colsLoaded: pvt.detail.options?.cols,
        });
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
        // Sync pivot configuration from stored options
        if (pvt.detail.options) {
            cols = pvt.detail.options.cols || cols;
            rows = pvt.detail.options.rows || rows;
            vals = pvt.detail.options.vals || vals;
            sorters = pvt.detail.options.sorters || sorters;
            valueFilter = pvt.detail.options.valueFilter || valueFilter;
            derivedAttributes = pvt.detail.options.derivedAttributes || derivedAttributes;
            console.log('[Pivot] After loading configuration', {
                rowsState: rows,
                colsState: cols,
                rowsDuplicates: rows?.filter((item, index) => rows.indexOf(item) !== index),
                colsDuplicates: cols?.filter((item, index) => cols.indexOf(item) !== index),
            });
        }
        getData();
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
        // options is now derived, so no need to assign
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
    {#if isLoadingData}
    <div class="flex items-center justify-center py-12">
        <div class="flex flex-col items-center space-y-4">
            <Spinner size={48} />
            <div class="text-xs dark:text-gray-400 text-gray-600">Loading data...</div>
        </div>
    </div>
    {:else if notenoughdata}
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
  


