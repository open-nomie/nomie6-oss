export function partial(Component, partialProps = {}) {
    return new Proxy(Component, {
        construct(target, [options], newTarget) {
            options.props = { ...options.props, ...partialProps };
            return Reflect.construct(target, [options], newTarget);
        },
    });
}

export function clickOutside(node) {
    function handleClick(event) {
        if (node && !node.contains(event.target) && !event.defaultPrevented) {
            node.dispatchEvent(new CustomEvent('outside', node));
        }
    }

    document.addEventListener('click', handleClick, true);

    return {
        destroy() {
            document.removeEventListener('click', handleClick, true);
        },
    };
}

export function clickClose(node, selector) {
    const element = node.querySelector(selector);

    function handleClick(event) {
        if (!event.defaultPrevented) {
            node.dispatchEvent(new CustomEvent('close', element));
        }
    }

    element.addEventListener('click', handleClick, true);

    return {
        destroy() {
            element.removeEventListener('click', handleClick, true);
        },
    };
}

export function delta(newObj, oldObj) {
    return Object.keys(newObj).reduce(function (diff, key) {
        return oldObj[key] === newObj[key]
            ? diff
            : {
                  ...diff,
                  [key]: newObj[key],
              };
    }, {});
}
