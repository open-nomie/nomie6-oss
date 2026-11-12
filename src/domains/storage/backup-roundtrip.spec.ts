import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Backup round-trip tests for the Nomie 6 storage archive.
 * The storage engine and the UI helpers are replaced with in-memory fakes,
 * so these tests exercise the real export, detection, merge and restore code.
 */

const memory = vi.hoisted(() => ({ files: new Map<string, any>(), failing: new Set<string>(), failingPut: new Set<string>() }))

vi.mock('./storage', () => ({
  default: {
    list: async () => Array.from(memory.files.keys()),
    get: async (path: string) => (memory.files.has(path) ? structuredClone(memory.files.get(path)) : null),
    getStrict: async (path: string) => {
      if (memory.failing.has(path)) throw new Error(`read failed: ${path}`)
      return memory.files.has(path) ? structuredClone(memory.files.get(path)) : null
    },
    put: async (path: string, content: any) => {
      if (memory.failingPut.has(path)) throw new Error(`write failed: ${path}`)
      memory.files.set(path, structuredClone(content))
    },
    convertPath: (path: string) => path,
  },
}))
vi.mock('../../store/interact', () => ({
  Interact: { blocker: vi.fn(), stopBlocker: vi.fn(), alert: vi.fn(), confirm: vi.fn(async () => true) },
}))
vi.mock('../../modules/download/download', () => ({ default: { json: vi.fn() }, selectFile: vi.fn() }))
vi.mock('../import-export/ImporterStore', () => ({
  hideImportModal: vi.fn(),
  showCSVImportModal: vi.fn(),
  showImportModal: vi.fn(),
}))
vi.mock('../trackable/TrackableStore', () => ({ MasterTrackables: {}, saveTrackable: vi.fn() }))

import { buildStorageArchive, importStorage, importStorageArchive, isStorageArchive, writeStorageArchive } from './import-export'
import { PREFERENCES_KEY } from '../backup/local-settings'
import Importer from '../../modules/import/import'
import { selectFile } from '../../modules/download/download'
import { showImportModal } from '../import-export/ImporterStore'

const reload = vi.fn()
vi.stubGlobal('window', { location: { reload } })

// A backup as made by "Generate backup" between 14 Sep 2026 and this fix (Export class format)
const septemberBackup = () => ({
  nomie: { number: 'dn6.8.0v20260928', created: '2026-10-01T10:00:00.000Z', startDate: '', endDate: '' },
  goals: [{ id: 'g1', tag: '#mood' }],
  pivots: [{ id: 'pv1' }],
  boards: [{ id: 'b1', label: 'Health', elements: ['#mood'] }],
  events: [
    { _id: 'l1', note: '#mood(7)', start: 1759312800000, end: 1759312800000 },
    { _id: 'l2', note: '#mood(5)', start: 1759399200000, end: 1759399200000 },
  ],
  trackers: { mood: { tag: 'mood', label: 'Mood' } },
  people: {},
  locations: [],
  dashboards: [{ id: 'd1', label: 'Main', widgets: [] }],
  context: [],
  pointers: [{ id: 'p1', tag: 'meds' }],
  plugins: [{ id: 'blockly' }],
})

const pickFile = (content: any, name = 'backup.json') =>
  vi.mocked(selectFile).mockResolvedValueOnce({ data: JSON.stringify(content), file: { name } as File })

class MemoryLocalStorage {
  data = new Map<string, string>()
  getItem(key: string) {
    return this.data.has(key) ? this.data.get(key)! : null
  }
  setItem(key: string, value: string) {
    this.data.set(key, String(value))
  }
  removeItem(key: string) {
    this.data.delete(key)
  }
  clear() {
    this.data.clear()
  }
}
const local = new MemoryLocalStorage()
vi.stubGlobal('localStorage', local)

// A device with data from both original and newer Daily Nomie features
const seedDevice = () => {
  memory.files.clear()
  memory.failing.clear()
  memory.failingPut.clear()
  memory.files.set('trackers.json', { mood: { tag: 'mood', label: 'Mood', type: 'range' } })
  memory.files.set('boards.json', [{ id: 'b1', label: 'Health', elements: ['#mood', '#sleep'] }])
  memory.files.set('goals.json', [{ id: 'g1', tag: '#mood', period: 'week' }])
  memory.files.set('pointers.json', [{ id: 'p1', tag: 'meds', reminder: '08:00' }])
  memory.files.set('templates.json', [{ id: 't1', name: 'My template' }])
  memory.files.set('awards.json', [{ id: 'a1', name: 'First week' }])
  memory.files.set('uom.json', { cups: { label: 'Cups' } })
  memory.files.set('plugins.json', [{ id: 'blockly', url: '/plugins/blockly' }])
  memory.files.set('data/books/2026-33', [
    { _id: 'l1', note: '#mood(7)', start: 1755684000000, end: 1755684000000 },
    { _id: 'l2', note: '#sleep(8)', start: 1755770400000, end: 1755770400000 },
  ])
  memory.files.set('data/books/2026-34', [{ _id: 'l3', note: '#mood(6)', start: 1756289200000, end: 1756289200000 }])

  local.clear()
  local.setItem(
    PREFERENCES_KEY,
    JSON.stringify({
      state: {
        theme: 'dark',
        useMetric: true,
        usePin: '1234',
        storageType: 'pouchdb',
        ai: { enabled: true, selectedService: 'claude', services: { claude: { apiKey: 'sk-ant-secret', encrypted: false } } },
      },
    })
  )
  local.setItem('timeline-settings', JSON.stringify({ compact: true }))
  local.setItem('nomie-server-token', 'server-secret')
}

const snapshot = () => structuredClone(Object.fromEntries(memory.files))

describe('storage archive detection', () => {
  it('recognises archives by shape, whatever the version string', () => {
    expect(isStorageArchive({ version: '6.7.4-dn', files: {} })).toBe(true)
    expect(isStorageArchive({ version: 'dn6.8.0v20260813', files: {} })).toBe(true)
    expect(isStorageArchive({ files: { 'trackers.json': {} } })).toBe(true)
  })

  it('rejects legacy backups, templates and junk', () => {
    expect(isStorageArchive({ nomie: { number: '5.0' }, events: [] })).toBe(false)
    expect(isStorageArchive({ type: 'template', trackables: [] })).toBe(false)
    expect(isStorageArchive({ files: [] })).toBe(false)
    expect(isStorageArchive(null)).toBe(false)
  })
})

describe('storage archive round trip', () => {
  beforeEach(seedDevice)

  it('backs up every stored file, including newer features, with counts', async () => {
    const { archive, failures } = await buildStorageArchive()
    expect(failures).toEqual([])
    expect(archive.format).toBe('nomie-storage-archive')
    expect(Object.keys(archive.files).sort()).toEqual(Array.from(memory.files.keys()).sort())
    expect(archive.counts).toEqual({ files: 10, logs: 3 })
  })

  it('never puts secrets or device-only settings in the backup', async () => {
    const { archive } = await buildStorageArchive()
    const text = JSON.stringify(archive)
    expect(text).not.toContain('sk-ant-secret')
    expect(text).not.toContain('server-secret')
    const prefs = JSON.parse(archive.local![PREFERENCES_KEY]).state
    expect(prefs.usePin).toBeUndefined()
    expect(prefs.storageType).toBeUndefined()
    expect(prefs.ai).toEqual({ enabled: true, selectedService: 'claude' })
    expect(prefs.theme).toBe('dark')
    expect(archive.local!['timeline-settings']).toBe(JSON.stringify({ compact: true }))
  })

  it('restores everything onto an empty device', async () => {
    const original = snapshot()
    const { archive } = await buildStorageArchive()
    const backupFile = JSON.parse(JSON.stringify(archive)) // as it would be read from disk

    memory.files.clear()
    local.clear()
    const { errors } = await writeStorageArchive(backupFile)

    expect(errors).toEqual([])
    expect(snapshot()).toEqual(original)
    expect(JSON.parse(local.getItem(PREFERENCES_KEY)!).state.theme).toBe('dark')
    expect(JSON.parse(local.getItem('timeline-settings')!)).toEqual({ compact: true })
  })

  it('keeps this device’s PIN, storage type and AI key when restoring settings', async () => {
    const { archive } = await buildStorageArchive()
    local.setItem(
      PREFERENCES_KEY,
      JSON.stringify({
        state: { theme: 'light', usePin: '9999', storageType: 'local', ai: { services: { claude: { apiKey: 'sk-ant-this-device' } } } },
      })
    )
    await writeStorageArchive(JSON.parse(JSON.stringify(archive)))
    const state = JSON.parse(local.getItem(PREFERENCES_KEY)!).state
    expect(state.theme).toBe('dark')
    expect(state.usePin).toBe('9999')
    expect(state.storageType).toBe('local')
    expect(state.ai).toEqual({ enabled: true, selectedService: 'claude', services: { claude: { apiKey: 'sk-ant-this-device' } } })
  })

  it('restoring the same backup onto the same data changes nothing (no duplicates)', async () => {
    const original = snapshot()
    const { archive } = await buildStorageArchive()
    const backupFile = JSON.parse(JSON.stringify(archive))

    await writeStorageArchive(backupFile)
    await writeStorageArchive(backupFile)

    expect(snapshot()).toEqual(original)
    expect(memory.files.get('boards.json')[0].elements).toEqual(['#mood', '#sleep'])
    expect(memory.files.get('data/books/2026-33')).toHaveLength(2)
  })

  it('merges a backup with data added on the device since', async () => {
    const { archive } = await buildStorageArchive()
    memory.files.get('boards.json')[0].elements.push('#water')
    memory.files.set('goals.json', [...memory.files.get('goals.json'), { id: 'g2', tag: '#water' }])

    await writeStorageArchive(JSON.parse(JSON.stringify(archive)))

    expect(memory.files.get('boards.json')[0].elements).toEqual(['#mood', '#sleep', '#water'])
    expect(memory.files.get('goals.json').map((g: any) => g.id)).toEqual(['g1', 'g2'])
  })

  it('restores a Daily Nomie archive made between 13 Aug and 14 Sep 2026 (no format field)', async () => {
    const augustArchive = {
      version: 'dn6.8.0v20260813',
      created: '2026-08-20T10:00:00.000Z',
      files: {
        'trackers.json': { mood: { tag: 'mood' } },
        'data/books/2026-33': [{ _id: 'l1', note: '#mood(7)', start: 1755684000000, end: 1755684000000 }],
      },
    }
    memory.files.clear()
    expect(isStorageArchive(augustArchive)).toBe(true)
    await writeStorageArchive(augustArchive as any)
    expect(memory.files.get('data/books/2026-33')).toHaveLength(1)
  })
})

describe('choosing the restore path for a selected file', () => {
  beforeEach(() => {
    seedDevice()
    vi.mocked(showImportModal).mockClear()
    reload.mockClear()
  })

  it('sends a Sep-Oct 2026 backup to the older import screen and leaves storage untouched', async () => {
    const before = snapshot()
    pickFile(septemberBackup())
    await importStorage()
    expect(showImportModal).toHaveBeenCalledTimes(1)
    expect(vi.mocked(showImportModal).mock.calls[0][0].nomie.number).toBe('dn6.8.0v20260928')
    expect(snapshot()).toEqual(before)
  })

  it('sends a storage archive to the v6 restore', async () => {
    const { archive } = await buildStorageArchive()
    memory.files.clear()
    pickFile({ ...JSON.parse(JSON.stringify(archive)), version: 'dn6.8.0v20260928' })
    await importStorage()
    expect(showImportModal).not.toHaveBeenCalled()
    expect(memory.files.get('data/books/2026-33')).toHaveLength(2)
    expect(reload).toHaveBeenCalled()
  })
})

describe('template install adds only what is missing', () => {
  beforeEach(seedDevice)

  it('keeps existing trackers, boards and goals as they are and adds the new ones', async () => {
    memory.files.set('trackers.json', { mood: { tag: 'mood', label: 'My mood', type: 'range', max: 10 } })
    const template = {
      version: 'template',
      files: {
        'trackers.json': {
          mood: { tag: 'mood', label: 'Mood', type: 'range', max: 5 },
          sleep: { tag: 'sleep', label: 'Sleep', type: 'range' },
        },
        'boards.json': [
          { id: 'b1', label: 'Health', elements: ['#mood', '#walk'] },
          { id: 'b2', label: 'New board', elements: ['#sleep'] },
        ],
        'goals.json': [
          { id: 'g1', tag: '#mood', period: 'day' },
          { id: 'g5', tag: '#sleep', period: 'day' },
        ],
      },
    }

    await writeStorageArchive(template as any, undefined, 'add-missing')

    expect(memory.files.get('trackers.json')).toEqual({
      mood: { tag: 'mood', label: 'My mood', type: 'range', max: 10 },
      sleep: { tag: 'sleep', label: 'Sleep', type: 'range' },
    })
    expect(memory.files.get('boards.json')).toEqual([
      { id: 'b1', label: 'Health', elements: ['#mood', '#sleep'] },
      { id: 'b2', label: 'New board', elements: ['#sleep'] },
    ])
    expect(memory.files.get('goals.json')).toEqual([
      { id: 'g1', tag: '#mood', period: 'week' },
      { id: 'g5', tag: '#sleep', period: 'day' },
    ])
  })
})

describe('restore keeps this device’s version of items that exist on both sides', () => {
  beforeEach(seedDevice)

  it('keeps the device version of a board and a setting, and adds what only the backup has', async () => {
    const { archive } = await buildStorageArchive()
    memory.files.set('boards.json', [{ id: 'b1', label: 'Health', elements: ['#mood'] }])
    local.setItem('timeline-settings', JSON.stringify({ compact: false }))

    const backupFile = JSON.parse(JSON.stringify(archive))
    backupFile.files['boards.json'] = [
      { id: 'b1', label: 'Health', elements: ['#mood', '#sleep', '#water'] },
      { id: 'b9', label: 'Backup only', elements: [] },
    ]

    await writeStorageArchive(backupFile, undefined, 'add-missing')

    expect(memory.files.get('boards.json')).toEqual([
      { id: 'b1', label: 'Health', elements: ['#mood'] },
      { id: 'b9', label: 'Backup only', elements: [] },
    ])
    expect(JSON.parse(local.getItem('timeline-settings')!)).toEqual({ compact: false })
  })

  it('uses the backup version when asked to', async () => {
    const { archive } = await buildStorageArchive()
    memory.files.set('boards.json', [{ id: 'b1', label: 'Health', elements: ['#mood'] }])
    const backupFile = JSON.parse(JSON.stringify(archive))
    backupFile.files['boards.json'] = [{ id: 'b1', label: 'Health', elements: ['#mood', '#sleep'] }]

    await writeStorageArchive(backupFile, undefined, 'merge')

    expect(memory.files.get('boards.json')[0].elements).toEqual(['#mood', '#sleep'])
  })
})

describe('template install reports failure', () => {
  beforeEach(seedDevice)

  it('returns false when a file cannot be saved, so the caller can say so', async () => {
    memory.failingPut.add('goals.json')
    const template = {
      version: 'template',
      files: {
        'goals.json': [{ id: 'g5', tag: '#sleep' }],
        'trackers.json': { sleep: { tag: 'sleep', label: 'Sleep', type: 'range' } },
      },
    }
    const installed = await importStorageArchive(template as any, { silent: true, addMissingOnly: true })
    expect(installed).toBe(false)
  })
})

describe('unreadable files', () => {
  beforeEach(seedDevice)

  it('a backup reports a file it could not read instead of leaving it out silently', async () => {
    memory.failing.add('goals.json')
    const { archive, failures } = await buildStorageArchive()
    expect(failures).toEqual(['goals.json'])
    expect(archive.files['goals.json']).toBeUndefined()
    expect(archive.files['boards.json']).toBeDefined()
  })

  it('a restore does not overwrite a file it could not read', async () => {
    const { archive } = await buildStorageArchive()
    const before = memory.files.get('goals.json')
    memory.failing.add('goals.json')
    const backupFile = JSON.parse(JSON.stringify(archive))
    backupFile.files['goals.json'] = [{ id: 'g9', tag: '#other' }]

    const { errors } = await writeStorageArchive(backupFile)

    expect(errors.map((e) => e.path)).toContain('goals.json')
    expect(memory.files.get('goals.json')).toEqual(before)
  })
})

describe('legacy importer fallback', () => {
  it('restores everything in a Sep-Oct 2026 backup (Export format)', () => {
    const backup = septemberBackup()
    expect(isStorageArchive(backup)).toBe(false)
    const importer = new Importer(backup)
    const n = importer.normalized
    expect(importer.version).toBe(6)
    expect(n.logs).toHaveLength(2)
    expect(Object.keys(n.trackers || {})).toEqual(['mood'])
    expect(n.boards).toHaveLength(1)
    expect(n.dashboards).toHaveLength(1)
    expect(n.goals).toHaveLength(1)
    expect(n.pivots).toHaveLength(1)
    expect(n.pointers).toHaveLength(1)
    expect(n.plugins).toHaveLength(1)
  })

  it('no longer drops logs when given a storage archive', () => {
    const importer = new Importer({
      version: 'dn6.8.0v20260813',
      files: {
        'trackers.json': { mood: { tag: 'mood', label: 'Mood' } },
        'data/books/2026-33': [{ _id: 'l1', note: '#mood(7)', start: 1755684000000, end: 1755684000000 }],
        'data/books/2026-34': [{ _id: 'l2', note: '#mood(6)', start: 1756289200000, end: 1756289200000 }],
      },
    })
    expect(importer.normalized.logs).toHaveLength(2)
    expect(Object.keys(importer.normalized.trackers || {})).toEqual(['mood'])
  })
})
