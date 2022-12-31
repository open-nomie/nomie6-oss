export const getElementPosition = (
  elem: HTMLElement
): { top: number; left: number; eleHeight: number; eleWidth: number } | undefined => {
  if (elem) {
    const box: DOMRect = elem.getBoundingClientRect()

    const body = document.body
    const docEl = document.documentElement

    const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop
    const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft

    const clientTop = docEl.clientTop || body.clientTop || 0
    const clientLeft = docEl.clientLeft || body.clientLeft || 0

    const top = box.top + scrollTop - clientTop
    const left = box.left + scrollLeft - clientLeft

    return { top: Math.round(top), left: Math.round(left), eleHeight: box.height, eleWidth: box.width }
  }
  return undefined
}
