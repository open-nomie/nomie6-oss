# API Key Security Enhancement Guide

## Current Implementation Analysis

**Current Storage Method:** Browser localStorage (plaintext)

**Current Flow:**
```
User Input → Prefs Store → SideStore → localStorage (plaintext JSON)
                                          ↓
                                    DevTools visible
                                    Exportable via localStorage
```

**Security Issues:**
1. ❌ Keys stored in plaintext in localStorage
2. ❌ Accessible via browser DevTools console
3. ❌ Exportable if someone gains access to the device
4. ❌ Not encrypted in browser memory
5. ❌ Could be exposed if localStorage is compromised
6. ❌ Keys sent directly from browser to Anthropic API

---

## Recommended Solutions

### Option 1: Browser Encryption (Best for PWA)
Use Web Crypto API to encrypt keys at rest in localStorage.

**Pros:**
- Works in browser, no server needed
- Keys encrypted at rest
- Keys decrypted only when needed
- No changes to backend

**Cons:**
- Encryption key must also be stored somewhere (chicken-egg problem)
- Requires user password for true security

**Implementation:**
```typescript
// crypto-storage.ts
export async function encryptAPIKey(apiKey: string, password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(apiKey)
  
  // Derive key from password
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  
  const derivedKey = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode('nomie-salt'), iterations: 100000, hash: 'SHA-256' },
    passwordKey,
    256
  )
  
  const key = await crypto.subtle.importKey('raw', derivedKey, 'AES-GCM', false, ['encrypt'])
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)
  
  // Store IV + encrypted data as base64
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.length)
  
  return btoa(String.fromCharCode(...combined))
}

export async function decryptAPIKey(encrypted: string, password: string): Promise<string> {
  const encoder = new TextEncoder()
  const combined = new Uint8Array(atob(encrypted).split('').map(c => c.charCodeAt(0)))
  
  const iv = combined.slice(0, 12)
  const encryptedData = combined.slice(12)
  
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  
  const derivedKey = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode('nomie-salt'), iterations: 100000, hash: 'SHA-256' },
    passwordKey,
    256
  )
  
  const key = await crypto.subtle.importKey('raw', derivedKey, 'AES-GCM', false, ['decrypt'])
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedData
  )
  
  return new TextDecoder().decode(decrypted)
}
```

**Integration:**
- Add PIN/password requirement for AI settings
- Encrypt on save: `encryptAPIKey(apiKey, userPin)`
- Decrypt on load: `decryptAPIKey(storedEncrypted, userPin)`
- Pin required only once per session

---

### Option 2: Server-Side Proxy (Best for Production)
Move API calls through your backend instead of direct browser access.

**Architecture:**
```
Browser → Your Server → Anthropic API
  ↓
  (encrypted token or cookie-based session)
```

**Pros:**
- API key never exposed to browser or client
- Full control over API usage
- Can add rate limiting, logging, usage tracking
- Better for enterprise deployments

**Cons:**
- Requires backend infrastructure
- Additional latency
- Backend must handle Anthropic credentials securely

**Implementation Outline:**
```typescript
// Server-side (e.g., src/routes/api/ai/+server.ts)
export async function POST({ request }) {
  // 1. Get user from session (don't trust client)
  const userId = getSessionUserId(request)
  
  // 2. Load API key from secure backend storage (environment variable, vault, etc)
  const apiKey = process.env.ANTHROPIC_API_KEY
  
  // 3. Call Anthropic API on server
  const body = await request.json()
  const response = await fetch('https://api.anthropic.com/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  
  return response
}

// Client-side (browser)
// Just call your proxy endpoint, never touches API key
const response = await fetch('/api/ai', {
  method: 'POST',
  body: JSON.stringify({ prompt, profile })
})
```

---

### Option 3: Hybrid Approach (Recommended for Nomie)
Combine encryption + environment variables.

**For Development:**
```bash
# .env.local
VITE_ANTHROPIC_API_KEY=sk-ant-...
```
- Key in env var, never in code
- User's .env.local is gitignored
- Good for testing

**For Production/PWA:**
1. User enters API key in settings (one-time)
2. Key encrypted with their PIN/password
3. Decrypted in memory only when needed
4. Only sent to official Anthropic endpoints
5. Consider option to proxy through official Nomie backend

---

## Quick Implementation: Encrypt with PIN

Here's a practical solution you can implement now:

### 1. Update Preferences Type
```typescript
export type AIConfig = {
  enabled?: boolean
  selectedService?: AIServiceType
  encrypted?: boolean  // NEW: indicates if key is encrypted
  services?: {
    claude?: AIServiceConfig & { encrypted?: boolean }
    chatgpt?: AIServiceConfig & { encrypted?: boolean }
  }
}
```

### 2. Update AI Settings Component
```svelte
<script>
  import { Prefs } from '../../preferences/Preferences'
  
  let showKeyInput = false
  let tempKey = ''
  let error = ''
  
  async function saveEncryptedKey() {
    if (!tempKey) return
    
    try {
      // Get PIN from user (use existing PIN if available)
      const pin = $Prefs.usePin || await promptForPin()
      
      const encrypted = await encryptAPIKey(tempKey, pin)
      
      Prefs.update(p => {
        p.ai.services[p.ai.selectedService].apiKey = encrypted
        p.ai.services[p.ai.selectedService].encrypted = true
        return p
      })
      
      tempKey = ''
      showKeyInput = false
    } catch (e) {
      error = 'Failed to encrypt key: ' + e.message
    }
  }
</script>

<div>
  {#if $Prefs.ai?.services?.[$Prefs.ai?.selectedService]?.encrypted}
    <p class="text-green-600">✓ API key is encrypted</p>
    <button on:click={() => showKeyInput = true}>Update Key</button>
  {:else}
    <p class="text-yellow-600">⚠ API key is stored in plaintext</p>
    <button on:click={() => showKeyInput = true}>Add/Update Key</button>
  {/if}
  
  {#if showKeyInput}
    <input bind:value={tempKey} type="password" placeholder="Enter API Key" />
    <button on:click={saveEncryptedKey}>Save Encrypted</button>
    <button on:click={() => showKeyInput = false}>Cancel</button>
  {/if}
  
  {#if error}
    <p class="text-red-600">{error}</p>
  {/if}
</div>
```

### 3. Update Engine to Decrypt
```typescript
// engine.svelte.ts
export async function query<T = string>(req: AIRequest): Promise<AIResponse<T>> {
  const prefs = get(Prefs)
  const service = prefs.ai?.services?.[prefs.ai?.selectedService || 'claude']
  
  let apiKey = service?.apiKey
  
  // Decrypt if encrypted
  if (service?.encrypted && prefs.usePin) {
    try {
      apiKey = await decryptAPIKey(apiKey, prefs.usePin)
    } catch (e) {
      throw new Error('Failed to decrypt API key. Please check your PIN.')
    }
  }
  
  if (!apiKey) {
    throw new Error('API key not configured')
  }
  
  // Rest of function...
}
```

---

## Security Checklist

- [ ] API keys never logged to console
- [ ] API keys never exposed in network requests (except to official API)
- [ ] Consider using environment variables for development
- [ ] Encrypt sensitive keys if storing in browser
- [ ] Use HTTPS only for API communication
- [ ] Consider server-side proxy for production
- [ ] Document security model for users
- [ ] Add warning if using plaintext keys
- [ ] Regular security audits

---

## Recommendations by Use Case

| Use Case | Recommendation |
|----------|-----------------|
| Personal/Development | Encryption with PIN (Option 1) |
| Small Team PWA | Environment variables + Encryption |
| Enterprise Deploy | Server-side Proxy (Option 2) |
| Maximum Privacy | Local-only Encryption (Option 1) |
| Maximum Security | Server-side Proxy (Option 2) |

---

## Implementation Priority

1. **Phase 1 (Immediate):** Add visual indicator showing if key is encrypted
2. **Phase 2 (Short-term):** Implement encryption with PIN using Web Crypto API
3. **Phase 3 (Medium-term):** Add environment variable support for development
4. **Phase 4 (Long-term):** Implement optional server-side proxy for production deployments

---

## References

- [Web Crypto API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [PBKDF2 Key Derivation](https://owasp.org/www-community/attacks/Dictionary_attack)
- [AES-GCM Encryption](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [Anthropic API Security](https://docs.anthropic.com/claude/reference/api-overview#authentication)
