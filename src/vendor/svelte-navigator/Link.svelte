<svelte:options runes={true} />

<script>
	/*
	 * Adapted from https://github.com/EmilTholin/svelte-routing
	 *
	 * https://github.com/EmilTholin/svelte-routing/blob/master/LICENSE
	 */

	import { createEventDispatcher } from "svelte";
	import {
		useLocation,
		useResolve,
		useHistory,
		usePreflightCheck,
	} from "./hooks";
	import { shouldNavigate, isFunction } from "./utils";
	import { startsWith } from "./paths";
	import { LINK_ID } from "./warning";
	import { parsePath, stringifyPath } from "./routes";

	const { replace = false, state = {}, getProps = null, to, ...rest } = $props();

	const location = useLocation();
	const dispatch = createEventDispatcher();
	const resolve = useResolve();
	const { navigate } = useHistory();

	// We need to pass location here to force re-resolution of the link,
	// when the pathname changes. Otherwise we could end up with stale path params,
	// when for example an :id changes in the parent Routes path
	let href = $derived(resolve(to, $location));
	let isPartiallyCurrent = $derived(startsWith($location.pathname, href));
	let isCurrent = $derived(href === $location.pathname);
	let isExactCurrent = $derived(parsePath(href) === stringifyPath($location));
	let ariaCurrent = $derived(isCurrent ? { "aria-current": "page" } : {});
	let props = $derived((() => {
		if (isFunction(getProps)) {
			const dynamicProps = getProps({
				location: $location,
				href,
				isPartiallyCurrent,
				isCurrent,
			});
			return { ...rest, ...dynamicProps };
		}
		return rest;
	})());

	function onClick(event) {
		dispatch("click", event);

		if (shouldNavigate(event)) {
			event.preventDefault();
			// Don't push another entry to the history stack when the user
			// clicks on a Link to the page they are currently on.
			const shouldReplace = isExactCurrent || replace;
			navigate(href, { state, replace: shouldReplace });
		}
	}
</script>

<a {href} {...ariaCurrent} on:click={onClick} {...props}>
	<slot />
</a>
