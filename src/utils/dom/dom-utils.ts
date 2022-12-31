export function toElement(_ele: Element): Element {
  if (_ele instanceof Element) {
    return _ele
  } else {
    return window.document.body
  }
}

export type PositionMap = {
  readonly x: number
  readonly y: number
  readonly height: number
  readonly width: number
  readonly top: number
  readonly topP: number
  readonly left: number
  readonly leftP: number
  readonly element?: Element
  readonly dir: 'x' | 'y' | undefined
}

export function getElementPositionMap(_ele?: Element): PositionMap {
  if (_ele) {
    const element = toElement(_ele)
    const bounding = element.getBoundingClientRect()
    return {
      x: bounding.x,
      y: bounding.y,
      height: bounding.height,
      width: bounding.width,
      top: Math.abs(bounding.top),
      topP: (Math.abs(bounding.top) - window.innerHeight) / Math.abs(bounding.top),
      left: bounding.left,
      leftP: (Math.abs(bounding.left) - window.innerWidth) / Math.abs(bounding.left),
      element,
      dir: bounding.x > bounding.y ? 'x' : 'y',
    }
  } else {
    // Didn't find the element default to this
    return {
      x: 0,
      y: 0,
      height: 0,
      width: 0,
      top: 0,
      topP: 0,
      left: 0,
      leftP: 0,
      element: undefined,
      dir: undefined,
    }
  }
}
