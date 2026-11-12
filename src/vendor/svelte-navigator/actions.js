/*
 * Adapted from https://github.com/EmilTholin/svelte-routing
 *
 * https://github.com/EmilTholin/svelte-routing/blob/master/LICENSE
 */

import { navigate as defaultNavigate } from "./history";
import { shouldNavigate, findClosest, addListener, isFunction } from "./utils";

const createAction =
	getAnchor =>
	(node, navigate = defaultNavigate) => {
		const handleClick = event => {
			const anchor = getAnchor(event);
			if (anchor && anchor.target === "" && shouldNavigate(event)) {
				event.preventDefault();
				const to = anchor.pathname + anchor.search + anchor.hash;
				navigate(to, { replace: anchor.hasAttribute("replace") });
			}
		};
		const unlisten = addListener(node, "click", handleClick);
		return { destroy: unlisten };
	};

// prettier-ignore
/**
 * A link action that can be added to <a href=""> tags rather
 * than using the <Link> component.
 *
 * Example:
 * ```html
 * <a href="/post/{postId}" use:link>{post.title}</a>
 * ```
 */
export const link = /*#__PURE__*/createAction(event => event.currentTarget); // eslint-disable-line spaced-comment, max-len

// prettier-ignore
/**
 * An action to be added at a root element of your application to
 * capture all relative links and push them onto the history stack.
 *
 * Example:
 * ```html
 * <div use:links>
 *   <Router>
 *     <Route path="/" component={Home} />
 *     <Route path="/p/:projectId/:docId" component={ProjectScreen} />
 *     {#each projects as project}
 *       <a href="/p/{project.id}">{project.title}</a>
 *     {/each}
 *   </Router>
 * </div>
 * ```
 */
export const links = /*#__PURE__*/createAction(event => { // eslint-disable-line spaced-comment
  const anchor = findClosest("A", event.target);
  if (
    anchor &&
    isFunction(anchor.hasAttribute) &&
    !anchor.hasAttribute("noroute")
  ) {
    return anchor;
  }
  return null;
});
