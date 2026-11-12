import type { Profile, UserContext, DualInsightResponse } from './types'

function hasDetailKeywords(text?: string): boolean {
  if (!text) return false
  const keywords = ['in depth', 'in-depth', 'extensive', 'full report', 'detailed', 'comprehensive analysis', 'thorough']
  const lowerText = text.toLowerCase()
  return keywords.some(keyword => lowerText.includes(keyword))
}

export const insightProfile: Profile = {
  name: 'insight',
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt: (ctx: UserContext, prompt?: string) => {
    const contextsList = ctx.contexts
      ? Object.entries(ctx.contexts)
        .map(([key, data]: [string, any]) => `${key.substring(1)}: ${data.count} times`)
        .join(', ')
      : ''

    const locationsList = ctx.locations
      ? ctx.locations
        .map((loc: any) => {
          const name = loc.name || `${loc.lat?.toFixed(2)},${loc.lng?.toFixed(2)}`
          return `${name} (${loc.count}x)`
        })
        .join(', ')
      : ''

    const pointersList = ctx.pointers
      ? Object.entries(ctx.pointers)
        .map(([key, data]: [string, any]) => `${key.substring(1)}: ${data.count}x`)
        .join(', ')
      : ''

    const isDetailRequest = hasDetailKeywords(prompt)
    const extendedTokenGuidance = isDetailRequest
      ? '800-1000 token comprehensive analysis'
      : '200-300 token brief analysis'
    const extendedTokenDescription = isDetailRequest
      ? 'of all patterns, correlations, and implications'
      : 'focusing on the top 1-2 most significant insights'

    return `
You are a data analyst and personal insights coach for Nomie.

User summary: ${ctx.summary}
Goals: ${ctx.goals.length > 0 ? ctx.goals.join(', ') : 'No goals currently set'}

Tracked metrics: ${JSON.stringify(ctx.recentMetrics, null, 2)}

${ctx.people ? `Social interactions: ${JSON.stringify(ctx.people, null, 2)}\n` : ''}
${contextsList ? `Contexts/Environments: ${contextsList}\n` : ''}
${locationsList ? `Locations: ${locationsList}\n` : ''}
${pointersList ? `Topics/Pointers: ${pointersList}\n` : ''}

${ctx.notes ? `Recent journal entries:\n${ctx.notes}\n` : ''}

Provide thoughtful, data-driven insights about the user's habits, patterns, and well-being.
Reference specific metrics, locations, contexts, social interactions, and journal entries.
Identify trends, correlations, and actionable patterns. Consider WHERE and WHEN the user tracks.

IMPORTANT: Format your response with TWO SECTIONS using the headers below:

## SUMMARY
Provide exactly 3 lines highlighting the top 1-2 surprising patterns only.
Keep sentences short and punchy. Use specific numbers without decimals.
Focus on what's most interesting or actionable. NO elaboration.

## EXTENDED
Provide ${extendedTokenGuidance} ${extendedTokenDescription}.
Use full paragraphs with precise metrics, statistical significance, and trend directions.
Include context about temporal patterns, relationships between metrics, and actionable insights.
This section should go into detail while the SUMMARY is reserved for key highlights only.

Ensure both sections use markdown formatting for easy processing.
    `
  },
  parseResponse(raw: string): DualInsightResponse | string {
    // Check if response contains dual-level format
    const summaryMatch = raw.match(/##\s*SUMMARY\s*\n([\s\S]*?)(?=##\s*EXTENDED|\Z)/i)
    const extendedMatch = raw.match(/##\s*EXTENDED\s*\n([\s\S]*?)$/i)

    if (summaryMatch && extendedMatch) {
      // Parse as dual format
      return {
        summary: summaryMatch[1].trim(),
        extended: extendedMatch[1].trim(),
        raw
      }
    }

    // Fallback: return entire response as summary (backward compatible)
    return {
      summary: raw,
      extended: raw,
      raw
    }
  }
}
