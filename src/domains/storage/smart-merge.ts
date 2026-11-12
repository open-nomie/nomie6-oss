import mergeDeep from 'deepmerge'

/**
 * Smart Merge
 * Merges stored data (v1, what's on this device) with incoming data (v2, from a
 * backup or template). Scalars: incoming wins. Objects: merged deeply.
 * Arrays: merged without duplicates (see mergeArray) — never blindly concatenated,
 * so restoring or importing the same data twice is idempotent.
 */
export const smartMerge = (v1: any, v2: any): any => {
  const incoming = withoutNulls(v2)
  if (v1 === undefined || v1 === null) return incoming
  if (incoming === undefined || isEmptyPlaceholder(incoming)) return v1
  if (isEmptyPlaceholder(v1) && Array.isArray(v1) !== Array.isArray(incoming)) return incoming
  assertSameShape(v1, incoming)
  if (v1 instanceof Array) {
    return mergeArray(v1, incoming)
  } else {
    return deepMerge(v1, incoming)
  }
}

// An empty list or object carries no data, whatever its type
const isEmptyPlaceholder = (value: any): boolean =>
  (Array.isArray(value) && value.length === 0) || (isPlainObject(value) && Object.keys(value).length === 0)

// A null in a backup is "no value": it never erases a value that is on this device
const withoutNulls = (value: any): any => {
  if (Array.isArray(value)) return value.map(withoutNulls)
  if (isPlainObject(value)) {
    return Object.keys(value).reduce((clean: any, key) => {
      if (value[key] !== null) clean[key] = withoutNulls(value[key])
      return clean
    }, {})
  }
  return value
}

// A list cannot be merged with an object. Refuse, so the file is reported instead of one side being dropped
const assertSameShape = (v1: any, v2: any) => {
  if (Array.isArray(v1) !== Array.isArray(v2)) {
    throw new Error('Cannot merge a list with an object')
  }
}

// Keys that identify an item in a stored array. When an item has several,
// the last match wins (kept for compatibility with existing stored data).
const KEYS = ['_id', 'key', 'id', 'tag']

const isPlainObject = (item: any): boolean =>
  item !== null && typeof item === 'object' && !Array.isArray(item)

const fingerprint = (item: any): string => {
  try {
    return JSON.stringify(item)
  } catch (e) {
    return String(item)
  }
}

const deepMerge = (v1: any, v2: any): any => mergeDeep(v1, v2, { arrayMerge: (target, source) => mergeArray(target, source) })

/**
 * Merge two arrays without creating duplicates.
 * - Objects that share an id-like key are merged together (incoming wins on conflicts).
 * - Everything else (primitives, objects without an id) is kept once, compared by value.
 * - Order: existing items first, then new incoming items.
 */
const idKeyOf = (items: Array<any>): string | undefined => {
  const baseItem = items.find(isPlainObject)
  let id: string | undefined
  if (baseItem) {
    KEYS.forEach((idType) => {
      if (Object.prototype.hasOwnProperty.call(baseItem, idType)) id = idType
    })
  }
  return id
}

/**
 * Add only what is missing. Items that already exist (same id-like key) keep their
 * current version; new items are appended. Objects keep existing values and gain new keys.
 */
export const addMissing = (existing: any, raw: any): any => {
  const incoming = withoutNulls(raw)
  if (existing === undefined || existing === null) return incoming
  if (incoming === undefined || isEmptyPlaceholder(incoming)) return existing
  if (isEmptyPlaceholder(existing) && Array.isArray(existing) !== Array.isArray(incoming)) return incoming
  assertSameShape(existing, incoming)
  if (Array.isArray(existing) && Array.isArray(incoming)) {
    const id = idKeyOf([...existing, ...incoming])
    const keyOf = (item: any) => (id !== undefined && isPlainObject(item) && item[id] != null ? `id:${item[id]}` : fingerprint(item))
    const known = new Set(existing.map(keyOf))
    return [...existing, ...incoming.filter((item) => !known.has(keyOf(item)))]
  }
  if (isPlainObject(existing) && isPlainObject(incoming)) {
    return { ...incoming, ...existing }
  }
  return existing
}

export const mergeArray = (v1: Array<any>, v2: Array<any>): Array<any> => {
  const existing = Array.isArray(v1) ? v1 : []
  const incoming = Array.isArray(v2) ? v2 : []
  if (!existing.length && !incoming.length) return []

  const id = idKeyOf([...existing, ...incoming])

  const slotOf = (item: any): string => {
    const itemId = id !== undefined && isPlainObject(item) ? item[id] : undefined
    return itemId !== undefined && itemId !== null ? `id:${itemId}` : `value:${fingerprint(item)}`
  }
  const countSlots = (items: Array<any>): { [slot: string]: number } =>
    items.reduce((counts: { [slot: string]: number }, item) => {
      const slot = slotOf(item)
      counts[slot] = (counts[slot] || 0) + 1
      return counts
    }, {})
  const existingCounts = countSlots(existing)
  const incomingCounts = countSlots(incoming)

  const order: Array<string> = []
  const groups: { [slot: string]: Array<any> } = {}
  ;[...existing, ...incoming].forEach((item) => {
    const slot = slotOf(item)
    if (!groups[slot]) {
      groups[slot] = []
      order.push(slot)
    }
    groups[slot].push(item)
  })

  return order.flatMap((slot) => {
    const items = groups[slot]
    if (slot.startsWith('value:')) {
      // Identical items without an id are kept as many times as the larger side has them
      const copies = Math.max(existingCounts[slot] || 0, incomingCounts[slot] || 0)
      return Array.from({ length: copies }, () => items[0])
    }
    if (items.length === 1) return [items[0]]
    return [items.reduce((merged, item) => deepMerge(merged, item))]
  })
}
