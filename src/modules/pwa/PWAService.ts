import type { Writable, Readable } from 'svelte/store'
import { writable, readonly } from 'svelte/store'

export interface PWAStatus {
  isSupported: boolean
  isRegistered: boolean
  updateAvailable: boolean
  isOfflineReady: boolean
  isCheckingForUpdates?: boolean
  lastCheckTime?: number
}

export class PWAService {
  private static instance: PWAService

  private registration: ServiceWorkerRegistration | null = null

  // Update checking with exponential backoff
  private baseCheckInterval: number = 15 * 60 * 1000 // 15 minutes base
  private currentCheckInterval: number = this.baseCheckInterval
  private maxBackoffInterval: number = 60 * 60 * 1000 // 1 hour max
  private backoffMultiplier: number = 1.5
  private updateCheckTimer: NodeJS.Timeout | null = null
  private failureCount: number = 0
  private lastCheckTimestamp: number = 0

  // UI state
  private isCheckingForUpdates = writable(false)
  private lastCheckTimeMs = writable<number | null>(null)

  // Public stores
  readonly needRefresh: Writable<boolean> = writable(false)
  readonly offlineReady: Writable<boolean> = writable(false)
  readonly isCheckingForUpdates: Readable<boolean>
  readonly lastCheckTimeMs: Readable<number | null>

  private constructor() {
    // Initialize readonly versions of internal stores
    this.isCheckingForUpdates = readonly(this._isCheckingForUpdates)
    this.lastCheckTimeMs = readonly(this._lastCheckTimeMs)

    // Load persisted update state
    this.loadPersistedState()
  }

  private _isCheckingForUpdates = writable(false)
  private _lastCheckTimeMs = writable<number | null>(null)

  static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService()
    }
    return PWAService.instance
  }

  /**
   * Initialize PWA registration
   * Should be called once during app startup
   */
  async initialize(): Promise<void> {
    if (this.registration) {
      return // Already initialized
    }

    // Check if we're in dev mode (vite-plugin-pwa doesn't provide virtual module in dev)
    const isDev = import.meta.env.DEV
    if (isDev) {
      console.log('[PWA] Dev mode detected - PWA features limited (full support in production build)')
      return
    }

    try {
      // Import useRegisterSW at runtime to avoid build issues
      const { useRegisterSW } = await import('virtual:pwa-register/svelte')

      const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
        onRegistered: (registration) => {
          this.registration = registration
          if (registration) {
            console.log('[PWA] Service Worker registered', {
              scope: registration.scope,
              active: !!registration.active,
              installing: !!registration.installing,
              waiting: !!registration.waiting,
            })
          }
        },
        onRegisterError: (error) => {
          console.error('[PWA] Service Worker registration error', error)
        },
      })

      // Subscribe to store changes and update our internal state
      offlineReady.subscribe((value) => {
        this.offlineReady.set(value)
      })

      needRefresh.subscribe((value) => {
        this.needRefresh.set(value)
      })

      // Store the update function for later use
      this._updateServiceWorker = updateServiceWorker

      // Start periodic update checks
      this.startUpdateChecks()
    } catch (error) {
      console.error('[PWA] Failed to initialize PWA', error)
    }
  }

  /**
   * Check for updates now (without waiting for interval)
   * Can be called manually by user or automatically on schedule
   */
  async checkForUpdates(isManual: boolean = false): Promise<boolean> {
    if (!this.registration) {
      console.warn('[PWA] Service Worker not registered, cannot check for updates')
      return false
    }

    this._isCheckingForUpdates.set(true)
    const startTime = Date.now()

    try {
      await this.registration.update()

      // Check if there's a waiting or installing SW
      const hasUpdate = !!this.registration.waiting || !!this.registration.installing
      if (hasUpdate) {
        console.log('[PWA] Update available')
        this.needRefresh.set(true)
        this.persistUpdateState()
      }

      // Reset backoff on successful check
      if (!isManual) {
        this.failureCount = 0
        this.currentCheckInterval = this.baseCheckInterval
      }

      this.lastCheckTimestamp = Date.now()
      this._lastCheckTimeMs.set(this.lastCheckTimestamp)

      console.log('[PWA] Update check completed', {
        updateAvailable: hasUpdate,
        checkDurationMs: Date.now() - startTime,
        nextCheckInMs: this.currentCheckInterval,
      })

      return hasUpdate
    } catch (error) {
      console.error('[PWA] Error checking for updates', error)

      // Implement exponential backoff for automatic checks
      if (!isManual) {
        this.failureCount++
        const newInterval = Math.min(
          this.baseCheckInterval * Math.pow(this.backoffMultiplier, this.failureCount),
          this.maxBackoffInterval
        )
        this.currentCheckInterval = newInterval
        console.log('[PWA] Update check failed, backing off', {
          failureCount: this.failureCount,
          nextCheckInMinutes: Math.round(newInterval / 60000),
        })
      }

      return false
    } finally {
      this._isCheckingForUpdates.set(false)
    }
  }

  /**
   * Apply the pending update (reload the page with new version)
   */
  async applyUpdate(): Promise<void> {
    try {
      if (this._updateServiceWorker) {
        await this._updateServiceWorker(true)
      } else {
        console.warn('[PWA] Update function not available, reloading page')
        window.location.reload()
      }
    } catch (error) {
      console.error('[PWA] Error applying update', error)
    }
  }

  /**
   * Dismiss the update notification
   */
  dismissUpdateNotification(): void {
    this.needRefresh.set(false)
    try {
      localStorage.removeItem('nomie_pwa_update_state')
    } catch (e) {
      console.warn('[PWA] Failed to clear persisted update state', e)
    }
  }

  /**
   * Dismiss the offline ready notification
   */
  dismissOfflineNotification(): void {
    this.offlineReady.set(false)
  }

  /**
   * Manually trigger an update check (resets backoff)
   * Called when user clicks "Check for updates" button
   */
  async manualCheckForUpdates(): Promise<boolean> {
    console.log('[PWA] Manual update check requested by user')
    // Reset backoff state for manual check
    this.failureCount = 0
    this.currentCheckInterval = this.baseCheckInterval
    return this.checkForUpdates(true) // true = isManual
  }

  /**
   * Get current PWA status
   */
  getStatus(): PWAStatus {
    let updateAvailable = false
    let offlineReady = false

    this.needRefresh.subscribe((value) => {
      updateAvailable = value
    })()

    this.offlineReady.subscribe((value) => {
      offlineReady = value
    })()

    let isChecking = false
    this._isCheckingForUpdates.subscribe((value) => {
      isChecking = value
    })()

    return {
      isSupported: 'serviceWorker' in navigator,
      isRegistered: !!this.registration,
      updateAvailable,
      isOfflineReady: offlineReady,
      isCheckingForUpdates: isChecking,
      lastCheckTime: this.lastCheckTimestamp,
    }
  }

  /**
   * Unregister the service worker (cleanup)
   */
  async unregister(): Promise<void> {
    if (this.updateCheckTimer) {
      clearInterval(this.updateCheckTimer)
      this.updateCheckTimer = null
    }

    if (this.registration) {
      try {
        await this.registration.unregister()
        this.registration = null
        console.log('[PWA] Service Worker unregistered')
      } catch (error) {
        console.error('[PWA] Error unregistering Service Worker', error)
      }
    }
  }

  // Private methods

  private _updateServiceWorker: ((reloadPage?: boolean) => Promise<void>) | null = null

  private startUpdateChecks(): void {
    console.log('[PWA] Starting update checks with 15-minute base interval')

    // Initial check immediately
    this.checkForUpdates()

    // Schedule periodic checks with dynamic interval (supports exponential backoff)
    const scheduleNextCheck = () => {
      if (this.updateCheckTimer) {
        clearTimeout(this.updateCheckTimer)
      }
      this.updateCheckTimer = setTimeout(() => {
        this.checkForUpdates()
        scheduleNextCheck() // Reschedule with potentially new interval
      }, this.currentCheckInterval)
    }

    scheduleNextCheck()

    // Clear timer on page unload
    window.addEventListener('beforeunload', () => {
      if (this.updateCheckTimer) {
        clearTimeout(this.updateCheckTimer)
      }
    })
  }

  /**
   * Persist update state to localStorage so it survives page reloads
   */
  private persistUpdateState(): void {
    try {
      const state = {
        updateAvailable: true,
        timestamp: Date.now(),
      }
      localStorage.setItem('nomie_pwa_update_state', JSON.stringify(state))
    } catch (e) {
      console.warn('[PWA] Failed to persist update state', e)
    }
  }

  /**
   * Load persisted update state from localStorage
   */
  private loadPersistedState(): void {
    try {
      const stored = localStorage.getItem('nomie_pwa_update_state')
      if (stored) {
        const state = JSON.parse(stored)
        if (state.updateAvailable) {
          console.log('[PWA] Restoring persisted update notification')
          this.needRefresh.set(true)
        }
        // Clean up old persisted state (older than 7 days)
        if (Date.now() - state.timestamp > 7 * 24 * 60 * 60 * 1000) {
          localStorage.removeItem('nomie_pwa_update_state')
        }
      }
    } catch (e) {
      console.warn('[PWA] Failed to load persisted update state', e)
    }
  }
}

// Export singleton instance
export const pwService = PWAService.getInstance()
