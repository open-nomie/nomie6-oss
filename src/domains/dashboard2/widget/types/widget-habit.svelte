<svelte:options runes={true} />

<script lang="ts">
  import type { TrackableUsage } from '../../../usage/trackable-usage.class'
  import type { WidgetClass } from '../widget-class'
  import math from '../../../../utils/math/math'
  import { round } from 'lodash'

  const { widget = $bindable(), usage = $bindable(), trackable = $bindable(undefined), logs = $bindable(undefined) } = $props()
  // export let trackable: Trackable

  let datacheck = $state(false)
  let habitlabel1 = $state("")
  let habitlabel2 = $state("")
  let param1 = $state("")
  let param2 = $state("")
  let percentage1 = $state("")
  let percentage2 = $state("")

  if (usage) {
    datacheck = true;
  }

  const countOccurrences = (arr, val) =>
  arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

  if (usage) {
  let totalvalues = usage.values.length;
  let truevalues = countOccurrences(usage.values,1)
  habitlabel1 = usage.trackable.tracker?.habitChoice[0] || "Achieved"
  habitlabel2 = usage.trackable.tracker?.habitChoice[1] || "Missed"
  param1 = truevalues.toString() + " (" + round((round(truevalues/totalvalues,2)*100)).toString() +"%)"
  param2 =(totalvalues-truevalues).toString() + " (" + round((round((totalvalues-truevalues)/totalvalues,2)*100)).toString() +"%)"
  percentage1 = (round(truevalues/totalvalues,2)*100).toString()
  percentage2 = (round((totalvalues-truevalues)/totalvalues,2)*100).toString()
  if (truevalues == 0) {param1 = ""}
  if (totalvalues-truevalues ==0) {param2 = ""}
  }
  


</script>

<div class="value px-4 flex flex-col items-center h-full justify-center {widget.includeAvg ? 'value-sm' : ''}">
  <div class="current dark:text-white h-full w-full flex items-center justify-center flex-col">
   
    {#if datacheck}
      <!-- start pie chart -->    
<div class="piechart" style=" --param-1: '{param1}'; --param-2: '{param2}'; --perc-1: {percentage1}%; --perc-2: {percentage2}%">
	<span class="name">{usage.trackable.tracker?.emoji}</span>
</div>
<!-- end pie chart -->

<!-- start legend-->
<div class="legend">
	<span class="legend-item-two">
		<small>{habitlabel1}</small>
	</span>
	<span class="legend-item-one">
		<small>{habitlabel2}</small>
	</span>
	
</div>
<!-- end legend -->
  {:else}
  <div style="font-size:small">
  <p>Not Enough Data</p>
  </div>
  {/if}
  </div>
 
</div>

<style global lang="postcss">
 
  .dashboard-widget.type-value .widget-main {
    @apply items-center;
    @apply justify-center;
    /* @apply bg-pink-500; */
    @apply flex;
    @apply flex-col;
  }
  .value .current {
    @apply text-2xl lg:text-4xl;
    @apply text-center;
    @apply font-bold;
  }
  .piechart {
    position: relative;
    margin: 5px auto 0;
    width: 115px;
    height: 120px;
    border-radius: 50%;
    background-image: conic-gradient(red 0% var(--perc-2), green var(--perc-2) 100%);
    
}
.piechart:before {
	content: var(--param-1);
    position: absolute;
    top: 0px;
    left: -30px;
    width: 100px;
    height: 200px;
    
    font-size: xx-small;
}
.piechart:after {
	content:var(--param-2);
    position: absolute;
    top: 0%;
    left: 35px;
    width: 100px;
    height: 200px;
    
    font-size: xx-small;
}
.piechart .name{
    width: 50px;
    height: 50px;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    outline: 10px solid rgb(255 255 255 / 30%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.7rem;
    background-color: lightskyblue;
}

.legend{
    position: relative;
    margin: 10px auto 0;
    width: 115px;
    display: flex;
}
.legend > span{
	position:relative;
    flex-grow: 1;
    padding-left: 5px;
    font-size: x-small;
}
.legend > span.legend-item-one:before{
    content: "";
    position: absolute;
    top: 20%;
    transform: translateY(-20%);
    left: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background:red;
    outline: 2px solid rgb(255 186 28 / 30%);
}
.legend > span.legend-item-two:before{
    content: "";
    position: absolute;
    top: 20%;
    transform: translateY(-20%);
    left: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: green;
    outline: 2px solid rgb(255 186 28 / 30%);
}
.legend > span.legend-item-three:before{
    content: "";
    position: absolute;
    top: 20%;
    transform: translateY(-50%);
    left: 0;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #4bd985;
    outline: 5px solid rgb(75 217 133 / 30%);
}
</style>
