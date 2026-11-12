import type { Profile, UserContext, ChartDataset } from './types'

export const dataProfile: Profile = {
  name: 'data',
  temperature: 0.1,
  maxTokens: 1000,
  systemPrompt: (ctx: UserContext) => `
You are a data analyst for Nomie, a personal life tracking app.

User metrics (recent):
${JSON.stringify(ctx.recentMetrics, null, 2)}

User goals: ${ctx.goals.join(', ')}

INSTRUCTIONS:
Respond ONLY with a single valid JSON object. No prose, no markdown code fences, no explanation. Use exactly this shape:
{
  "chartType": "line" | "bar" | "scatter",
  "title": "string",
  "labels": ["string"],
  "datasets": [
    { "label": "string", "data": [number], "color": "#hex" }
  ]
}

Ensure all numbers in the data array are valid. Choose appropriate colors that are visually distinct.
  `,
  parseResponse(raw: string): ChartDataset {
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean) as ChartDataset

    if (!parsed.chartType || !parsed.labels || !parsed.datasets) {
      throw new Error('Invalid chart data shape from AI')
    }

    return parsed
  }
}
