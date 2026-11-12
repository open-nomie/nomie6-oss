# AI Integration Engine

The AI Integration Engine provides a modular, profile-driven system for integrating Claude AI into Nomie. Every AI interaction is orchestrated through a single engine that handles context assembly, API communication, and typed response delivery.

## Architecture

```
src/domains/ai/
├── engine.svelte.ts         # Central orchestrator with Svelte 5 reactivity
├── context-builder.ts        # Assembles user data context from stores
├── profiles/
│   ├── types.ts             # Shared interfaces and output types
│   ├── insight.ts           # Natural language conversation
│   ├── data.ts              # Structured JSON datasets for charts
│   ├── advice.ts            # Actionable recommendations
│   ├── journal.ts           # Reflection prompts
│   └── alert.ts             # Anomaly detection
src/routes/api/ai/
├── +server.ts               # Non-streaming API endpoint
└── stream/
    └── +server.ts           # Streaming endpoint for real-time responses
```

## Setup

### User Setup (No Server Configuration Needed)

The AI engine uses the **"bring your own key"** pattern:

1. Each user enters their own API key in **Settings > AI Integration**
2. Keys are stored in browser localStorage via Nomie preferences
3. Keys are passed to the server only when making API requests
4. The server never stores keys — it proxies them to Anthropic

This means:
- ✅ No server-side secrets management needed
- ✅ Users control their own API keys
- ✅ Multiple users can use different services (Claude vs ChatGPT)
- ✅ No shared quotas or rate limiting between users

## Usage

### Basic Query (Non-Streaming)

```svelte
<script lang="ts">
  import { query, aiState } from '$domains/ai/engine.svelte'
  import type { AdviceItem } from '$domains/ai/profiles/types'

  async function getAdvice() {
    const res = await query<AdviceItem[]>({
      profile: 'advice',
      prompt: 'What should I focus on this week?',
      contextHints: {
        metrics: ['sleep', 'steps', 'mood'],
        dateRange: { from: '2024-06-04', to: '2024-06-11' }
      }
    })
    console.log(res.content)
  }
</script>

{#if $aiState.loading}
  <Spinner />
{:else if $aiState.error}
  <ErrorMessage>{$aiState.error}</ErrorMessage>
{/if}

<button onclick={getAdvice}>Get Weekly Advice</button>
```

### Streaming Query (Real-Time Tokens)

```svelte
<script lang="ts">
  import { streamQuery, aiState } from '$domains/ai/engine.svelte'

  let response = $state('')

  async function streamInsight() {
    response = ''
    await streamQuery(
      {
        profile: 'insight',
        prompt: 'How am I doing overall?',
        contextHints: { metrics: ['sleep', 'mood', 'steps'] }
      },
      (chunk) => {
        response += chunk
      }
    )
  }
</script>

<button onclick={streamInsight} disabled={$aiState.loading}>
  {$aiState.loading ? 'Generating...' : 'Get Insight'}
</button>

{#if response}
  <div>{response}</div>
{/if}
```

## Profiles

### `insight` (Conversation)
Natural language responses about user's data. High temperature (0.7) for varied, conversational tone.
- **Output:** `string` (prose)
- **Use Case:** Chat, insights, personalized advice in prose

### `data` (Structured Data)
Generates JSON datasets suitable for charts. Low temperature (0.1) for deterministic, valid JSON.
- **Output:** `ChartDataset`
- **Use Case:** Auto-generating charts from user queries

### `advice` (Recommendations)
Actionable, prioritized suggestions. Medium temperature (0.4) for focused but creative recommendations.
- **Output:** `AdviceItem[]`
- **Use Case:** Weekly tips, goal-oriented suggestions

### `journal` (Reflection)
Personalized journaling prompts. Medium temperature (0.5) for creative but consistent prompts.
- **Output:** `JournalPrompt`
- **Use Case:** Daily reflection, journaling guidance

### `alert` (Anomalies)
Detects unusual patterns in user data. Low temperature (0.1) for precise anomaly detection.
- **Output:** `AlertItem[]`
- **Use Case:** Alerts for metric deviations, pattern warnings

## Adding a New Profile

1. Create a new profile file in `src/domains/ai/profiles/`:

```typescript
// src/domains/ai/profiles/mycustom.ts
import type { Profile, UserContext } from './types'

export const myProfile: Profile = {
  name: 'mycustom',
  temperature: 0.5,
  maxTokens: 1000,
  systemPrompt: (ctx: UserContext) => `
Your system prompt with context:
${ctx.summary}
Data: ${JSON.stringify(ctx.recentMetrics, null, 2)}
  `,
  parseResponse(raw: string): MyCustomType {
    return JSON.parse(raw) as MyCustomType
  }
}
```

2. Add the type to `src/domains/ai/profiles/types.ts`:

```typescript
export type ProfileName = 'insight' | 'data' | 'advice' | 'journal' | 'alert' | 'mycustom'

export interface MyCustomType {
  // your output shape
}
```

3. Register in `src/domains/ai/engine.svelte.ts`:

```typescript
import { myProfile } from './profiles/mycustom'

const profiles: Record<ProfileName, Profile> = {
  // ... existing profiles
  mycustom: myProfile
}
```

4. Use in components:

```svelte
const res = await query<MyCustomType>({
  profile: 'mycustom',
  prompt: 'Your prompt...'
})
```

## Context Hints

The `contextHints` parameter controls what data the engine fetches:

```typescript
contextHints?: {
  metrics?: string[]           // Specific metric tags to include
  dateRange?: {
    from: string              // ISO date string
    to: string
  }
  component?: string          // Optional caller label for logging
}
```

If `metrics` is not specified, the engine includes all tracked metrics with recent entries.

## State Management

The `aiState` object is reactive and updates all subscribed components:

```typescript
aiState.loading    // boolean - true while request is in flight
aiState.error      // string | null - error message if request failed
aiState.lastResponse // AIResponse | null - cached last response
```

## API Endpoints

### `POST /api/ai`
Non-streaming requests. Returns full response in one call.

**Request body:**
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 1000,
  "temperature": 0.7,
  "system": "system prompt...",
  "messages": [{ "role": "user", "content": "..." }]
}
```

### `POST /api/ai/stream`
Streaming requests for real-time token delivery via Server-Sent Events.

Same request format; response is SSE stream with `content_block_delta` events.

## Security

### "Bring Your Own Key" Model

This engine uses a zero-server-secret approach:

- **User Keys:** Stored in browser localStorage via Nomie preferences
- **No Server Storage:** Server never stores or caches API keys
- **Key Transmission:** Keys are passed in request bodies only when needed
- **Server Proxy:** Server endpoint accepts key in request, uses it once, discards it
- **User Control:** Users manage their own API keys; they never touch the app's infrastructure

### Why This Approach?

1. **Privacy:** Users' API keys never leave their device except in the request
2. **Scalability:** No key management backend needed
3. **Cost Control:** Each user manages their own API quota
4. **Simplicity:** No secrets management, no rotation, no vault needed
5. **Multi-Service:** Different users can use different AI services

## Testing Profiles

Profiles are pure functions with no external dependencies, making them easy to unit test:

```typescript
import { dataProfile } from '$domains/ai/profiles/data'

const mockContext = {
  recentMetrics: { sleep: [7.2, 6.8, 7.5] },
  goals: ['Improve sleep'],
  summary: 'Tracking sleep daily.'
}

const prompt = dataProfile.systemPrompt(mockContext)
const parsed = dataProfile.parseResponse('{ "chartType": "line", ... }')
```

## Error Handling

Both `query()` and `streamQuery()` throw on error after setting `aiState.error`. Always wrap in try-catch or handle via error state:

```svelte
{#if $aiState.error}
  <div class="error">
    {$aiState.error}
    <button onclick={retry}>Retry</button>
  </div>
{/if}
```

## Future Extensions

The engine is designed for extensibility:

- **Caching:** Add response caching layer in context-builder based on prompt + context hash
- **Logging:** Add request/response logging for monitoring usage per user
- **Custom Temperature Overrides:** Allow components to override profile temperature
- **Fallback Profiles:** Define degraded behavior if API is unavailable
- **Key Rotation Prompt:** Remind users when API key may be compromised
- **Usage Analytics:** Track which profiles users prefer, success rates
