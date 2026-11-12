Svelte 4 → 5 Migration: Avoiding Infinite Loops
Infinite loops after the official migration script are a very common pain point. They usually stem from how Svelte 5's fine-grained reactivity (runes) differs fundamentally from Svelte 4's compiler-driven reactivity. Here are the main approaches and fixes:

Why the Loops Happen
The migration script converts $: reactive statements to $derived or $effect, but the semantics are different:
* Svelte 4 $: ran statements after the component updated, in a topologically sorted order
* Svelte 5 $effect runs after the DOM updates and tracks every reactive value it reads — if the effect also writesto a reactive value it reads, you get an infinite loop

Alternative Approaches
1. Audit $effect → replace with $derived wherever possible
The migration script is overly aggressive converting $: to $effect. Most read-only computations should be $derived, not $effect:
// ❌ Causes infinite loop — effect reads AND writes `count`
$effect(() => {
  doubled = count * 2; // writes to `doubled`, but if doubled is $state...
});

// ✅ Use $derived instead
let doubled = $derived(count * 2);
Rule of thumb: if a $: block only computes a value (no side effects like fetch, console, DOM), convert it to $derived.

2. Use $effect.pre or untrack() to break dependency cycles
When you genuinely need an effect that writes state, use untrack() to prevent Svelte from tracking reads inside it:
import { untrack } from 'svelte';

$effect(() => {
  const current = someSignal; // tracked
  untrack(() => {
    // reads/writes here are NOT tracked — breaks the loop
    otherState = computeSomething(current);
  });
});

3. Avoid writing to $state inside $effect that reads the same state
// ❌ Classic loop: effect reads `items`, writes `total`, but total feeds back
let items = $state([]);
let total = $state(0);

$effect(() => {
  total = items.reduce((s, i) => s + i.price, 0); // don't do this
});

// ✅ total should just be $derived
let total = $derived(items.reduce((s, i) => s + i.price, 0));

4. Replace two-way binding loops with explicit event handlers
Svelte 5 is stricter about two-way bindings interacting with reactive state:
<!-- ❌ Can loop if `value` is derived/computed -->
<input bind:value={computedThing} />

<!-- ✅ Separate read and write -->
<input value={computedThing} oninput={e => rawSource = e.target.value} />

5. Migrate incrementally with a compatibility shim
Instead of migrating everything at once, use svelte/legacy compatibility imports to keep components in "Svelte 4 mode" while you migrate file by file:
// In unconverted components, you can still use legacy store/reactive patterns
// and migrate to runes one component at a time using:
// <svelte:options runes={true} />  ← opt in per-file
This lets you find which specific components cause loops rather than debugging the whole app.

6. Use $effect.tracking() to debug
Add this snippet to suspect effects to understand what's being tracked:
$effect(() => {
  console.log('tracking?', $effect.tracking()); // true inside effects
  console.log('running effect');
  // your logic
});
Also, Svelte 5 logs the loop culprit in dev mode — the console error usually names the specific signal causing the cycle.

Recommended Migration Strategy
Step	Action
1	Add <svelte:options runes={true} /> per-file instead of all at once
2	Run the migration script on one file
3	Replace all $effect that only compute values with $derived
4	Wrap unavoidable write-in-effect patterns with untrack()
5	Replace two-way bindings on computed values with explicit handlers
6	Move to the next file only when the current one is loop-free