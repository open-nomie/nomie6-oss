# AI Integration Engine - Setup & Usage Guide

The AI Integration Engine has been successfully integrated into Nomie 6. This guide covers setup, usage, and extending with new profiles.

## Files Created

### Core Engine (src/domains/ai/)
```
src/domains/ai/
├── engine.svelte.ts              # Central orchestrator with Svelte 5 reactivity
├── context-builder.ts             # Fetches and assembles user data context
├── profiles/
│   ├── types.ts                  # Shared TypeScript interfaces
│   ├── insight.ts                # Natural language conversation profile
│   ├── data.ts                   # Structured JSON datasets for charts
│   ├── advice.ts                 # Actionable recommendations
│   ├── journal.ts                # Reflection prompts
│   └── alert.ts                  # Anomaly detection
└── README.md                      # Complete technical documentation
```

### API Routes (src/routes/api/ai/)
```
src/routes/api/ai/
├── +server.ts                    # Non-streaming endpoint (POST /api/ai)
└── stream/
    └── +server.ts                # Streaming endpoint (POST /api/ai/stream)
```

### Configuration
```
.env.local.example                # Template for API key configuration
```

## Setup Steps

### User Configuration (Runtime)

Users enable and configure AI directly in the app:

1. Open **Settings > AI Integration**
2. Toggle **"AI Features Enabled"**
3. Select AI service (**Claude** or **ChatGPT**)
4. Enter their personal API key:
   - Claude: Get from [console.anthropic.com](https://console.anthropic.com/)
   - ChatGPT: Get from [platform.openai.com](https://platform.openai.com/)
5. Click **"Save Configuration"**

The API key is stored in **user preferences** (browser storage) using the **"bring your own key"** pattern. Each user controls their own API key — the app does not store or manage keys on the server.

## Available Profiles

Each profile serves a specific use case:

| Profile | Temperature | Max Tokens | Output Type | Use Case |
|---------|-------------|-----------|------------|----------|
| `insight` | 0.7 | 1000 | `string` | Natural language conversation, insights |
| `data` | 0.1 | 1000 | `ChartDataset` | Auto-generating charts from data |
| `advice` | 0.4 | 1200 | `AdviceItem[]` | Weekly tips, actionable suggestions |
| `journal` | 0.5 | 800 | `JournalPrompt` | Reflection prompts, journaling guidance |
| `alert` | 0.1 | 600 | `AlertItem[]` | Anomaly detection, pattern warnings |

## Usage Examples

### Example 1: Get Weekly Advice

```svelte
<script lang="ts">
  import { query, aiState } from '$domains/ai/engine.svelte'
  import type { AdviceItem } from '$domains/ai/profiles/types'

  let advice: AdviceItem[] = $state([])

  async function getWeeklyAdvice() {
    const res = await query<AdviceItem[]>({
      profile: 'advice',
      prompt: 'What should I focus on this week based on my metrics?',
      contextHints: {
        metrics: ['sleep', 'steps', 'mood'],
        dateRange: {
          from: '2024-06-04',
          to: '2024-06-11'
        }
      }
    })
    advice = res.content
  }
</script>

{#if $aiState.loading}
  <p>Loading suggestions...</p>
{:else if $aiState.error}
  <p class="text-red-500">{$aiState.error}</p>
{:else if advice.length > 0}
  {#each advice as item}
    <div class="p-3 border rounded">
      <h4 class="font-semibold">{item.headline}</h4>
      <p class="text-sm">{item.detail}</p>
      <span class="text-xs" class:text-red-500={item.priority === 'high'}>
        {item.priority}
      </span>
    </div>
  {/each}
{/if}

<button onclick={getWeeklyAdvice} disabled={$aiState.loading}>
  Get Weekly Advice
</button>
```

### Example 2: Stream Insights in Real-Time

```svelte
<script lang="ts">
  import { streamQuery, aiState } from '$lib/ai/engine.svelte'

  let insight = $state('')

  async function getInsight() {
    insight = ''
    try {
      await streamQuery(
        {
          profile: 'insight',
          prompt: 'How am I doing overall? Focus on trends.',
          contextHints: { metrics: ['sleep', 'mood', 'steps'] }
        },
        (chunk) => {
          insight += chunk
        }
      )
    } catch (err) {
      console.error('Error:', err)
    }
  }
</script>

<button onclick={getInsight} disabled={$aiState.loading}>
  {$aiState.loading ? 'Thinking...' : 'Get Insight'}
</button>

{#if insight}
  <div class="prose mt-4">
    {insight}
  </div>
{/if}
```

### Example 3: Generate Charts from Natural Language

```svelte
<script lang="ts">
  import { query, aiState } from '$lib/ai/engine.svelte'
  import type { ChartDataset } from '$lib/ai/profiles/types'

  let chart: ChartDataset | null = $state(null)

  async function generateChart() {
    const res = await query<ChartDataset>({
      profile: 'data',
      prompt: 'Create a chart showing my sleep quality vs heart rate variability trends',
      contextHints: {
        metrics: ['sleep', 'hrv'],
        dateRange: {
          from: '2024-05-28',
          to: '2024-06-11'
        }
      }
    })
    chart = res.content
  }
</script>

{#if chart}
  <Chart data={chart} />
{/if}

<button onclick={generateChart}>Generate AI Chart</button>
```

## Integration Points

### 1. Settings Page (User Facing)
The AI settings are already implemented in `src/domains/settings/settings-ai-list.svelte`:
- Toggle to enable/disable AI features
- Select Claude or ChatGPT
- Input and save API key per service
- Collapsible configuration panel

### 2. Engine Integration (Developer Facing)
The engine automatically:
- **Reads API key from Prefs store** when query is called
- **Passes key in request body** to server endpoint
- **Throws clear error** if AI not configured
- Integrates with Nomie stores for context:
  - **LedgerStore** — Fetches log entries for context
  - **TrackableStore** — Gets tracker metadata and goals
  - **UsageStore** — Accesses aggregate statistics

### 3. Reactive State
The `aiState` object provides reactive loading/error states:
```typescript
$aiState.loading     // true while API request in flight
$aiState.error       // null or error message
$aiState.lastResponse // cached last response
```

Components automatically re-render when state changes.

## Adding Custom Profiles

### Step 1: Create Profile File

```typescript
// src/domains/ai/profiles/myprofile.ts
import type { Profile, UserContext } from './types'

export interface MyOutputType {
  field1: string
  field2: number
}

export const myProfile: Profile = {
  name: 'myprofile',
  temperature: 0.5,
  maxTokens: 1000,
  systemPrompt: (ctx: UserContext) => `
Your instructions here.

User data:
${ctx.summary}

Metrics: ${JSON.stringify(ctx.recentMetrics, null, 2)}
  `,
  parseResponse(raw: string): MyOutputType {
    const parsed = JSON.parse(raw) as MyOutputType
    // Add validation if needed
    return parsed
  }
}
```

### Step 2: Update Types

```typescript
// src/domains/ai/profiles/types.ts
export type ProfileName = 
  | 'insight' 
  | 'data' 
  | 'advice' 
  | 'journal' 
  | 'alert' 
  | 'myprofile'  // Add here

export interface MyOutputType {
  field1: string
  field2: number
}
```

### Step 3: Register Profile

```typescript
// src/domains/ai/engine.svelte.ts
import { myProfile } from './profiles/myprofile'

const profiles: Record<ProfileName, Profile> = {
  insight: insightProfile,
  data: dataProfile,
  advice: adviceProfile,
  journal: journalProfile,
  alert: alertProfile,
  myprofile: myProfile  // Add here
}
```

### Step 4: Use in Components

```svelte
const res = await query<MyOutputType>({
  profile: 'myprofile',
  prompt: 'Your prompt here'
})
```

## Architecture Highlights

### Separation of Concerns
- **Profiles**: Pure, testable functions with no side effects
- **Context Builder**: Isolated data fetching from Nomie stores
- **Engine**: Orchestrates the lifecycle and state management
- **API Routes**: Server-only, keeps API key secure

### Type Safety
- Full TypeScript strict mode
- Each profile specifies its output type
- Components get fully typed responses

### Reactive State
- Uses Svelte 5 `$state` for automatic reactivity
- All subscribed components update when aiState changes
- No manual subscriptions needed

### Security
- API key only stored in `.env.local` (server-side)
- Browser makes requests to `/api/ai`, not directly to Anthropic
- User-provided keys stored in preferences with "bring your own key" pattern

## Troubleshooting

### "AI service not configured"
- Check `.env.local` exists and has valid `ANTHROPIC_API_KEY`
- Restart dev server after creating `.env.local`

### API Returns 401 (Unauthorized)
- API key may be invalid or revoked
- Check https://console.anthropic.com/api_keys
- Verify key is pasted correctly without whitespace

### Profile returns malformed data
- Check the `parseResponse()` function validates input
- Look at `aiState.lastResponse.raw` to inspect actual response
- Increase `maxTokens` if response seems truncated

### Context is empty or incomplete
- Ensure user has tracked at least some metrics
- Check `contextHints.metrics` match actual tracker tags
- Verify `LedgerStore` and `TrackableStore` are loaded

## Performance Considerations

### Context Assembly
The context builder fetches relevant data from stores:
- Filters to requested metrics (or all if not specified)
- Includes recent entries (last 5 for specified, last 3 for all)
- Generates natural-language summary

This is lightweight and runs client-side.

### Streaming
Use streaming (`streamQuery`) for long-form responses (chat, insights) to show progress to user.

Use non-streaming (`query`) for structured data where you need the full response at once.

### Token Usage
Monitor token usage via `maxTokens` in profiles. Lower values = lower cost, higher values = more capacity.

Default values are conservative and suitable for most use cases.

## Next Steps

1. **Test Locally**: Start dev server, test in Settings > AI Integration
2. **Add Your API Key**: Enter Claude or ChatGPT API key in settings
3. **Build Components**: Use examples above to add AI features to your domain
4. **Extend Profiles**: Create custom profiles for domain-specific use cases
5. **Monitor Usage**: Track API usage and adjust token budgets as needed

## References

- [Anthropic API Docs](https://docs.anthropic.com/)
- [src/domains/ai/README.md](./src/domains/ai/README.md) — Technical deep-dive
- [Nomie Architecture](./ARCHITECTURE.md) — App structure overview
