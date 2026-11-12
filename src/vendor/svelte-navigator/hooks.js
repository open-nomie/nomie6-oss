import { getContext, onDestroy, tick } from "svelte";
import { derived, get, writable } from "svelte/store";
import { LOCATION, ROUTER, ROUTE, ROUTE_PARAMS, FOCUS_ELEM } from "./contexts";
import { resolveLink, match, normalizeLocation } from "./routes";
import { isNumber } from "./utils";
import {
	fail,
	createLabel,
	USE_FOCUS_ID,
	ROUTER_ID,
	USE_LOCATION_ID,
	ROUTE_ID,
	USE_RESOLVE_ID,
	USE_RESOLVABLE_ID,
	USE_NAVIGATE_ID,
	USE_MATCH_ID,
	USE_PARAMS_ID,
} from "./warning";

/**
 * Check if a component or hook have been created outside of a
 * context providing component
 * @param {number} componentId
 * @param {*} props
 * @param {string?} ctxKey
 * @param {number?} ctxProviderId
 */
export function usePreflightCheck(
	componentId,
	props,
	ctxKey = ROUTER,
	ctxProviderId = ROUTER_ID,
) {
	const ctx = getContext(ctxKey);
	if (!ctx) {
		fail(
			componentId,
			label =>
				`You cannot use ${label} outside of a ${createLabel(ctxProviderId)}.`,
			props,
		);
	}
}

const toReadonly = ctx => {
	const { subscribe } = getContext(ctx);
	return { subscribe };
};

/**
 * Access the current location via a readable store.
 * @returns {import("svelte/store").Readable<{
    pathname: string;
    search: string;
    hash: string;
    state: {};
  }>}
 *
 * @example
  ```html
  <script>
    import { useLocation } from "svelte-navigator";

    const location = useLocation();

    $: console.log($location);
    // {
    //   pathname: "/blog",
    //   search: "?id=123",
    //   hash: "#comments",
    //   state: {}
    // }
  </script>
  ```
 */
export function useLocation() {
	usePreflightCheck(USE_LOCATION_ID);
	return toReadonly(LOCATION);
}

/**
 * @typedef {{
    path: string;
    fullPath: string;
    uri: string;
    params: {};
  }} RouteMatch
 */

/**
 * @typedef {import("svelte/store").Readable<RouteMatch|null>} RouteMatchStore
 */

/**
 * Access the history of top level Router.
 */
export function useHistory() {
	const { history } = getContext(ROUTER);
	return history;
}

/**
 * Access the base of the parent Route.
 */
export function useRouteBase() {
	const route = getContext(ROUTE);
	return route ? derived(route, _route => _route.base) : writable("/");
}

/**
 * Resolve a given link relative to the current `Route` and the `Router`s `basepath`.
 * It is used under the hood in `Link` and `useNavigate`.
 * You can use it to manually resolve links, when using the `link` or `links` actions.
 *
 * @returns {(path: string) => string}
 *
 * @example
  ```html
  <script>
    import { link, useResolve } from "svelte-navigator";

    const resolve = useResolve();
    // `resolvedLink` will be resolved relative to its parent Route
    // and the Routers `basepath`
    const resolvedLink = resolve("relativePath");
  </script>

  <a href={resolvedLink} use:link>Relative link</a>
  ```
 */
export function useResolve() {
	usePreflightCheck(USE_RESOLVE_ID);
	const routeBase = useRouteBase();
	const { basepath: appBase } = getContext(ROUTER);
	/**
	 * Resolves the path relative to the current route and basepath.
	 *
	 * @param {string} path The path to resolve
	 * @returns {string} The resolved path
	 */
	const resolve = path => resolveLink(path, get(routeBase), appBase);
	return resolve;
}

/**
 * Resolve a given link relative to the current `Route` and the `Router`s `basepath`.
 * It is used under the hood in `Link` and `useNavigate`.
 * You can use it to manually resolve links, when using the `link` or `links` actions.
 *
 * @returns {import("svelte/store").Readable<string>}
 *
 * @example
  ```html
  <script>
    import { link, useResolvable } from "svelte-navigator";

    // `resolvedLink` will be resolved relative to its parent Route
    // and the Routers `basepath`.
    const resolvedLink = useResolvable("relativePath");
  </script>

  <a href={$resolvedLink} use:link>Relative link</a>
  ```
 */
export function useResolvable(path) {
	usePreflightCheck(USE_RESOLVABLE_ID);
	const routeBase = useRouteBase();
	const { basepath: appBase } = getContext(ROUTER);
	return derived(routeBase, _routeBase =>
		resolveLink(path, _routeBase, appBase),
	);
}

/**
 * A hook, that returns a context-aware version of `navigate`.
 * It will automatically resolve the given link relative to the current Route.
 * It will also resolve a link against the `basepath` of the Router.
 *
 * @example
  ```html
  <!-- App.svelte -->
  <script>
    import { link, Route } from "svelte-navigator";
    import RouteComponent from "./RouteComponent.svelte";
  </script>

  <Router>
    <Route path="route1">
      <RouteComponent />
    </Route>
    <!-- ... -->
  </Router>

  <!-- RouteComponent.svelte -->
  <script>
    import { useNavigate } from "svelte-navigator";

    const navigate = useNavigate();
  </script>

  <button on:click="{() => navigate('relativePath')}">
    go to /route1/relativePath
  </button>
  <button on:click="{() => navigate('/absolutePath')}">
    go to /absolutePath
  </button>
  ```
  *
  * @example
  ```html
  <!-- App.svelte -->
  <script>
    import { link, Route } from "svelte-navigator";
    import RouteComponent from "./RouteComponent.svelte";
  </script>

  <Router basepath="/base">
    <Route path="route1">
      <RouteComponent />
    </Route>
    <!-- ... -->
  </Router>

  <!-- RouteComponent.svelte -->
  <script>
    import { useNavigate } from "svelte-navigator";

    const navigate = useNavigate();
  </script>

  <button on:click="{() => navigate('relativePath')}">
    go to /base/route1/relativePath
  </button>
  <button on:click="{() => navigate('/absolutePath')}">
    go to /base/absolutePath
  </button>
  ```
 */
export function useNavigate() {
	usePreflightCheck(USE_NAVIGATE_ID);
	const resolve = useResolve();
	const { navigate } = useHistory();
	/**
	 * Navigate to a new route.
	 * Resolves the link relative to the current route and basepath.
	 *
	 * @param {string|number} to The path to navigate to.
	 *
	 * If `to` is a number we will navigate to the stack entry index + `to`
	 * (-> `navigate(-1)`, is equivalent to hitting the back button of the browser)
	 * @param {Object} options
	 * @param {*} [options.state]
	 * @param {boolean} [options.replace=false]
	 */
	const navigateRelative = (to, options) => {
		// If to is a number, we navigate to the target stack entry via `history.go`.
		// Otherwise resolve the link
		const target = isNumber(to) ? to : resolve(to);
		return navigate(target, options);
	};
	return navigateRelative;
}

/**
 * Use Svelte Navigators matching without needing to use a Route.
 * Returns a readable store with the potential match,
 * that changes, when the location changes.
 *
 * The provided path will be resolved relatively,
 * as you're used to with all paths in Svelte Navigator
 *
 * @param {string} path The path, to match against.
 * It works just like a Route path
 * @returns {RouteMatchStore} The matched route.
 * Returns `null`, when nothing could be matched
 *
 * @example
  ```html
  <script>
    import { useMatch } from "svelte-navigator";

    const relativeMatch = useMatch("relative/path/:to/*somewhere");
    const absoluteMatch = useMatch("/absolute/path/:to/*somewhere");

    $: console.log($relativeMatch.params.to);
    $: console.log($absoluteMatch.params.somewhere);
  </script>
  ```
 */
export function useMatch(path) {
	usePreflightCheck(USE_MATCH_ID);
	const location = useLocation();
	const resolve = useResolve();
	const { basepath: appBase } = getContext(ROUTER);
	const resolvedPath = resolve(path);
	const { pathname: fullPath } = normalizeLocation(
		{ pathname: resolvedPath },
		appBase,
	);
	return derived(location, loc => match({ fullPath, path }, loc.pathname));
}

/**
 * Access the parent Routes matched params and wildcards
 * @returns {import("svelte/store").Readable<{
     [param: string]: any;
   }>} A readable store containing the matched parameters and wildcards
 *
 * @example
  ```html
  <!--
    Somewhere inside <Route path="user/:id/*splat" />
    with a current url of "/myApp/user/123/pauls-profile"
  -->
  <script>
    import { useParams } from "svelte-navigator";

    const params = useParams();

    $: console.log($params); // -> { id: "123", splat: "pauls-profile" }
  </script>

  <h3>Welcome user {$params.id}! bleep bloop...</h3>
  ```
 */
export function useParams() {
	usePreflightCheck(USE_PARAMS_ID, null, ROUTE, ROUTE_ID);
	return toReadonly(ROUTE_PARAMS);
}

/**
 * Provide a custom element to focus, when the parent route is visited.
 * It returns the `registerFocus` function you can call manually with an
 * Element or use as a Svelte action via the `use` directive.
 *
 * @example
  ```html
  <!-- Using `registerFocus` as a Svelte action: -->
  <!-- Somewhere inside a Route -->
  <script>
    import { useFocus } from "svelte-navigator";

    const registerFocus = useFocus();
  </script>

  <h1>Don't worry about me...</h1>
  <p use:registerFocus>Here, look at me!</p>
  ```
  * @example
  ```html
  <!-- Calling `registerFocus` manually: -->
  <!-- Somewhere inside a Route -->
  <script>
    import { onMount } from "svelte";
    import { useFocus } from "svelte-navigator";

    const registerFocus = useFocus();

    let focusElement;

    onMount(() => registerFocus(focusElement))
  </script>

  <h1>Don't worry about me...</h1>
  <p bind:this={focusElement}>Here, look at me!</p>
  ```
  * @example
  ```html
  <!-- Using `registerFocus` asyncronously: -->
  <!-- Somewhere inside a Route -->
  <script>
    import { onMount } from "svelte";
    import { useFocus } from "svelte-navigator";

    const registerFocus = useFocus();

    const lazyImport = import("./MyComponent.svelte").then(module => module.default);
  </script>

  {#await lazyImport then MyComponent}
    <MyComponent {registerFocus} />
  {/await}

  <!-- MyComponent.svelte -->
  <script>
    export let registerFocus;
  </script>

  <h1 use:registerFocus>Hi there!</h1>
  ```
 */
export function useFocus() {
	usePreflightCheck(USE_FOCUS_ID, null, ROUTE, ROUTE_ID);
	const location = useLocation();
	const focusElement = getContext(FOCUS_ELEM);

	let resolve;
	const unsubscribe = location.subscribe(() => {
		const lazyElement = new Promise(_resolve => {
			resolve = _resolve;
		});
		focusElement.set(lazyElement);
	});

	onDestroy(unsubscribe);

	return node => {
		let unmounted = false;
		const innerUnsubscribe = location.subscribe(() => {
			tick().then(() => {
				if (!unmounted) {
					resolve(node);
				}
			});
		});
		return {
			destroy() {
				unmounted = true;
				innerUnsubscribe();
			},
		};
	};
}
