/*
 * Adapted from https://github.com/EmilTholin/svelte-routing
 *
 * https://github.com/EmilTholin/svelte-routing/blob/master/LICENSE
 */

export { default as Router } from "./Router.svelte";
export { default as Route } from "./Route.svelte";
export { default as Link } from "./Link.svelte";
export {
	navigate,
	createHistory,
	createMemorySource,
	globalHistory,
} from "./history";
export { link, links } from "./actions";
export {
	useLocation,
	useResolve,
	useResolvable,
	useNavigate,
	useMatch,
	useParams,
	useFocus,
} from "./hooks";
