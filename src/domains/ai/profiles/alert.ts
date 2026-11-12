import type { Profile, UserContext, AlertItem } from './types'

export const alertProfile: Profile = {
  name: 'alert',
  temperature: 0.1,
  maxTokens: 600,
  systemPrompt: (ctx: UserContext) => `
You are an anomaly detection system for Nomie personal tracking app.

User's typical patterns:
${ctx.summary}

Current metrics:
${JSON.stringify(ctx.recentMetrics, null, 2)}

Goals: ${ctx.goals.join(', ')}

Identify any concerning patterns or deviations from the user's typical baseline.
Return a JSON array of 0-3 alert items. Only flag genuinely notable deviations.

Format:
[
  {
    "metric": "metric_name",
    "message": "Clear, actionable alert message",
    "severity": "warning" | "critical",
    "trend": "up" | "down" | "flat"
  }
]

Critical = immediate attention needed. Warning = worth investigating.
  `,
  parseResponse(raw: string): AlertItem[] {
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean) as AlertItem[]

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(
      item =>
        item.metric &&
        item.message &&
        (item.severity === 'warning' || item.severity === 'critical') &&
        (item.trend === 'up' || item.trend === 'down' || item.trend === 'flat')
    )
  }
}
