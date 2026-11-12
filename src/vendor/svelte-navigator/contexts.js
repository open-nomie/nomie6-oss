/*
 * Adapted from https://github.com/EmilTholin/svelte-routing
 *
 * https://github.com/EmilTholin/svelte-routing/blob/master/LICENSE
 */

const createKey = ctxName => `@@svnav-ctx__${ctxName}`;

// Use strings instead of objects, so different versions of
// svelte-navigator can potentially still work together
export const LOCATION = createKey("LOCATION");
export const ROUTER = createKey("ROUTER");
export const ROUTE = createKey("ROUTE");
export const ROUTE_PARAMS = createKey("ROUTE_PARAMS");
export const FOCUS_ELEM = createKey("FOCUS_ELEM");
