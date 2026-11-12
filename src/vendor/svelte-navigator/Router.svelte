<svelte:options runes={true} />

<script context="module">
	// eslint-disable-next-line import/order
	import { createCounter, createInlineStyle, createMarkerProps } from "./utils";

	const createId = createCounter();
</script>

<script>
	/*
	 * Adapted from https://github.com/EmilTholin/svelte-routing
	 *
	 * https://github.com/EmilTholin/svelte-routing/blob/master/LICENSE
	 */

	import { getContext, setContext, onMount } from "svelte";
	import { writable } from "svelte/store";
	import { LOCATION, ROUTER } from "./contexts";
	import { globalHistory } from "./history";
	import { normalizePath } from "./paths";
	import { pick, match, normalizeLocation, parsePath } from "./routes";
	import { isSSR } from "./utils";
	import { warn, ROUTER_ID } from "./warning";
	import {
		pushFocusCandidate,
		visuallyHiddenStyle,
		createTriggerFocus,
	} from "./a11y";

	const defaultBasepath = "/";

	const { basepath = defaultBasepath, url = null, history = globalHistory, primary = true, a11y = {}, disableInlineStyles = false } = $props();

	const a11yConfig = {
		createAnnouncement: route => `Navigated to ${route.uri}`,
		announcements: true,
		...a11y,
	};

	// Remember the initial `basepath`, so we can fire a warning
	// when the user changes it later
	const initialBasepath = basepath;
	const normalizedBasepath = normalizePath(basepath);

	const locationContext = getContext(LOCATION);
	const routerContext = getContext(ROUTER);

	const isTopLevelRouter = !locationContext;
	const routerId = createId();

	const manageFocus = primary && !(routerContext && !routerContext.manageFocus);
	const announcementText = writable("");

	const shouldDisableInlineStyles = routerContext
		? routerContext.disableInlineStyles
		: disableInlineStyles;

	const routes = writable([]);
	const activeRoute = writable(null);
	// Used in SSR to synchronously set that a Route is active.
	let hasActiveRoute = false;

	// Nesting level of router.
	// We will need this to identify sibling routers, when moving
	// focus on navigation, so we can focus the first possible router
	const level = isTopLevelRouter ? 0 : routerContext.level + 1;

	// If we're running an SSR we force the location to the `url` prop
	const getInitialLocation = () =>
		normalizeLocation(
			isSSR ? parsePath(url) : history.location,
			normalizedBasepath,
		);
	const location = isTopLevelRouter
		? writable(getInitialLocation())
		: locationContext;
	const prevLocation = writable($location);

	const triggerFocus = createTriggerFocus(
		a11yConfig,
		announcementText,
		location,
	);

	const createRouteFilter = routeId => routeList =>
		routeList.filter(routeItem => routeItem.id !== routeId);

	function registerRoute(route) {
		if (isSSR) {
			// In SSR we should set the activeRoute immediately if it is a match.
			// If there are more Routes being registered after a match is found,
			// we just skip them.
			if (hasActiveRoute) {
				return;
			}

			const matchingRoute = match(route, $location.pathname);
			if (matchingRoute) {
				hasActiveRoute = true;
				// Return the match in SSR mode, so the matched Route can use it immediatly.
				// Waiting for activeRoute to update does not work, because it updates
				// after the Route is initialized
				return matchingRoute; // eslint-disable-line consistent-return
			}
		} else {
			routes.update(prevRoutes => {
				// Remove an old version of the updated route,
				// before pushing the new version
				const nextRoutes = createRouteFilter(route.id)(prevRoutes);
				nextRoutes.push(route);
				return nextRoutes;
			});
		}
	}

	function unregisterRoute(routeId) {
		routes.update(createRouteFilter(routeId));
	}

	if (!isTopLevelRouter && basepath !== defaultBasepath) {
		warn(
			ROUTER_ID,
			'Only top-level Routers can have a "basepath" prop. It is ignored.',
			{ basepath },
		);
	}
	$effect(() => {
		if (basepath !== initialBasepath) {
			warn(ROUTER_ID, 'You cannot change the "basepath" prop. It is ignored.');
		}
	})

	// This reactive statement will be run when the Router is created
	// when there are no Routes and then again the following tick, so it
	// will not find an active Route in SSR and in the browser it will only
	// pick an active Route after all Routes have been registered.
	$effect(() => {
		const bestMatch = pick($routes, $location.pathname);
		activeRoute.set(bestMatch);
	})

	// Manage focus and announce navigation to screen reader users
	$effect(() => {
		if (isTopLevelRouter) {
			const hasHash = !!$location.hash;
			// When a hash is present in the url, we skip focus management, because
			// focusing a different element will prevent in-page jumps (See #3)
			const shouldManageFocus = !hasHash && manageFocus;
			// We don't want to make an announcement, when the hash changes,
			// but the active route stays the same
			const announceNavigation =
				!hasHash || $location.pathname !== $prevLocation.pathname;
			triggerFocus(shouldManageFocus, announceNavigation);
		}
	})

	// Queue matched Route, so top level Router can decide which Route to focus.
	// Non primary Routers should just be ignored
	$effect(() => {
		if (manageFocus && $activeRoute && $activeRoute.primary) {
			pushFocusCandidate({ level, routerId, route: $activeRoute });
		}
	})

	if (isTopLevelRouter) {
		// The topmost Router in the tree is responsible for updating
		// the location store and supplying it through context.
		onMount(() => {
			const unlisten = history.listen(changedHistory => {
				const normalizedLocation = normalizeLocation(
					changedHistory.location,
					normalizedBasepath,
				);
				prevLocation.set($location);
				location.set(normalizedLocation);
			});

			return unlisten;
		});

		setContext(LOCATION, location);
	}

	setContext(ROUTER, {
		activeRoute,
		registerRoute,
		unregisterRoute,
		manageFocus,
		level,
		id: routerId,
		history: isTopLevelRouter ? history : routerContext.history,
		basepath: isTopLevelRouter ? normalizedBasepath : routerContext.basepath,
		disableInlineStyles: shouldDisableInlineStyles,
	});
</script>

<div
	{...createMarkerProps(shouldDisableInlineStyles)}
	data-svnav-router={routerId}
/>

<slot />

{#if isTopLevelRouter && manageFocus && a11yConfig.announcements}
	<div
		role="status"
		aria-atomic="true"
		aria-live="polite"
		data-svnav-announcer
		{...createInlineStyle(shouldDisableInlineStyles, visuallyHiddenStyle)}
	>
		{$announcementText}
	</div>
{/if}
