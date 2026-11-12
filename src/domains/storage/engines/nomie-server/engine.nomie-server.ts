import { openPopMenu, type PopMenuButton } from '../../../../components/pop-menu/usePopmenu'
import { Interact } from '../../../../store/interact'
import { switchToLocal } from '../../../settings/settings-functions'
import type { IStorage } from '../../storage'

/**
 * Storage engine that syncs data with an external Nomie Server instance.
 * Handles prompting the user for credentials and gracefully recovers when
 * the remote API becomes unavailable.
 */
let listeners: Array<() => void> = []
let apiUrl: string
let apiToken: string

const buttons: PopMenuButton[] = [
  {
    title: "Try again",
    click() {
      window.location.reload();
    }
  },
  {
    title: "Switch to Local Storage",
    click() {
      switchToLocal();
    }
  },
  {
    title: "Erase Nomie Server Config",
    click() {
      localStorage.removeItem('nomie-server-url');
      localStorage.removeItem('nomie-server-token');
      window.location.reload();
    }
  }
]

/**
 * Display a recovery prompt when the app cannot reach the configured Nomie Server.
 */
const cannotConnect = async () => {
  openPopMenu({
    id: "cannot-connect",
    title: "Unable to Connect to Nomie Server with the current Configuration",
    buttons
  })
}

/**
 * Execute an authenticated GET request against the Nomie Server API.
 */
const nsGet = async (path: string): Promise<Response> => {
  if (!apiUrl) throw new Error('Cannot nsGet - API URL not set')
  const call = await fetch(`${apiUrl}/api/${path}`, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  }).catch(e=>{throw e});
  return call
}
/**
 * Execute an authenticated DELETE request against the Nomie Server API.
 */
const nsDelete = async (path: string): Promise<Response> => {
  if (!apiUrl) throw new Error('Cannot nsDelete - API URL not set')
  const call = await fetch(`${apiUrl}/api/${path}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  })
  return call
}

/**
 * Execute an authenticated POST request against the Nomie Server API.
 */
const nsPost = async (path: string, content: string) => {
  if (!apiUrl) throw new Error('Cannot nsPost - API URL not set')
  const call = await fetch(`${apiUrl}/api/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiToken}`,
    },
    body: content,
  })
  return call
}

const validate = async (): Promise<boolean> => {
  const check = await nsGet('auth/validate')
  if (check.ok) {
    return true
  }

  await cannotConnect()
  return false
}

/**
 * Nomie Server backed implementation of the storage interface.
 */
export const NomieServierStorage: IStorage = {
  onReady(func) {
    // No need to setup just call the function
    if (listeners.indexOf(func) == -1) {
      listeners.push(func)
    }
  },
  basePath(path) {
    return path
  },
  fireReady() {
    listeners.forEach((func) => {
      func()
    })
    listeners = []
  },
  async init(options: any = {}): Promise<any> {
    try {
      apiUrl = localStorage.getItem('nomie-server-url') || options?.server?.url
      apiToken = localStorage.getItem('nomie-server-token') || options?.server?.token

      if (!apiUrl || !apiToken) {
        apiUrl = await Interact.prompt('Nomie Server URL', 'http://localhost:3011')
        apiToken = await Interact.prompt('Nomie Server API Key')
        localStorage.setItem('nomie-server-url', apiUrl)
        localStorage.setItem('nomie-server-token', apiToken)
      }

      if (!apiUrl || !apiToken) {
        throw new Error('Nomie Server requires a server object with url and token')
      }
    } catch (e:any) {

      Interact.error(e.message)

      throw e
    }

    try {
      const isValid = await validate()
      if (isValid) {
        const engine = this as any
        engine.fireReady()
      }
    } catch (e: any) {
      if (e.message == 'Unauthorized') {
        const engine = this as any
        engine.fireReady()
        Interact.error('Nomie Server API key is invalid. Please double check your settings.')
      } else {
        cannotConnect();
      }
      throw e
    }
    return this
  },
  async getProfile() {
    return {
      username: 'Local User',
    }
  },
  async put(path, content) {
    let call = await nsPost(`n6storage/${path}`, JSON.stringify(content))
    if (!call.ok) {
      console.error(`⚠️ PUT request failed for ${path}: ${call.status} ${call.statusText}`)
      throw new Error(`Failed to save ${path}: ${call.statusText}`)
    }
    return await call.json()
    // return localforage.setItem(path, JSON.stringify(content))
  },
  async get(path) {
    try {
      let call = await nsGet(`n6storage/${path}`)
      if (call.ok) {
        let content = await call.json()
        // Backend might return { data: [...] } or just [...]
        // ArrayStore expects an array, so extract data if it's wrapped
        if (content && typeof content === 'object' && 'data' in content && Array.isArray(content.data)) {
          return content.data
        }
        // If content is already an array or null/undefined, return as is
        return content || []
      } else {
        return []
      }
    } catch (e: any) {
      return []
    }
  },
  async getStrict(path) {
    const call = await nsGet(`n6storage/${path}`)
    if (call.status === 404) return null
    if (!call.ok) throw new Error(`Failed to read ${path}: ${call.status} ${call.statusText}`)
    const content = await call.json()
    if (content && typeof content === 'object' && 'data' in content && Array.isArray(content.data)) {
      return content.data
    }
    return content ?? null
  },
  async list(path?: string) {
    const remotePath = path && path.length ? path : '/'
    const call = await nsPost(`n6storage/list`, JSON.stringify({ path: remotePath }))
    const files = await call.json()
    return files
  },
  async delete(path) {
    return await nsDelete(`n6storage/${path}`)
  },
}
