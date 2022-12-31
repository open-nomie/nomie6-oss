import type { IPeople, ITrackers } from '../../modules/import/import'

export type autoCompleteDataTypes = {
  trackers: ITrackers
  context: any
  people: IPeople
}

export const autoCompleteSearch = (searchTag, type = 'tracker', elements: autoCompleteDataTypes): Array<any> => {
  // Search for Trackers
  try {
    if (type == 'tracker') {
      let tkrs = Object.keys(elements.trackers || {})
        .map((tag) => {
          return elements.trackers[tag]
        })
        .filter((trk) => {
          return trk.tag.search(searchTag.replace('#', '')) > -1
        })
      return tkrs.length ? tkrs : []

      // Search for People
    } else if (type === 'person') {
      try {
        let people = Object.keys(elements.people || []).filter(
          (person) => person.toLowerCase().search(searchTag.replace('@', '')) > -1
        )
        return people.length
          ? people.map((username) => {
              return {
                tag: username,
                emoji: '👤',
                type: 'person',
              }
            })
          : []
      } catch (e) {
        console.error(`Error Caught ${e.message}`)
      }

      return []

      // Search for Context
    } else if (type === 'context') {
      let context = elements.context.filter((term) => {
        let text = searchTag.replace('+', '').toLowerCase()
        term = term.toLowerCase()
        return term.search(text.toLowerCase()) > -1
      })
      return context.length
        ? context.map((c) => {
            return { tag: c, emoji: '💡', type: 'context' }
          })
        : []
    }
  } catch (e) {}
}
