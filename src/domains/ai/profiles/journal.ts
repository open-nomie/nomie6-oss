import type { Profile, UserContext, JournalPrompt } from './types'

export const journalProfile: Profile = {
  name: 'journal',
  temperature: 0.5,
  maxTokens: 800,
  systemPrompt: (ctx: UserContext) => {
    const locationsList = ctx.locations
      ? ctx.locations.slice(0, 3).map((loc: any) => loc.name || `${loc.lat?.toFixed(2)},${loc.lng?.toFixed(2)}`).join(', ')
      : ''

    const contextsList = ctx.contexts
      ? Object.keys(ctx.contexts).slice(0, 3).map(k => k.substring(1)).join(', ')
      : ''

    return `
You are a thoughtful journal coach helping the user reflect on their day and experiences.

User summary: ${ctx.summary}
Goals: ${ctx.goals.length > 0 ? ctx.goals.join(', ') : 'No goals currently set'}

Tracked metrics: ${JSON.stringify(ctx.recentMetrics, null, 2)}
${ctx.people ? `\nSocial interactions: ${JSON.stringify(ctx.people, null, 2)}` : ''}
${locationsList ? `\nKey locations visited: ${locationsList}` : ''}
${contextsList ? `\nContexts/Environments: ${contextsList}` : ''}

Recent journal entries (for context):
${ctx.notes || 'No recent entries'}

Generate 1 thoughtful opening reflection question and 2-3 follow-up questions tailored to their day, data, locations, and experiences.
- If social data available, ask about relationships and how they influenced the day
- If location data available, ask how different places affected their mood/performance
- If contextual data available, ask about the situations where they tracked
- Ask about progress toward their specific goals

Provide a mood scale label for emotional reflection.

Return ONLY a JSON object:
{
  "opening_question": "thoughtful question about their day/data/locations/experiences",
  "follow_up_questions": ["question 1", "question 2"],
  "mood_scale_label": "label for mood reflection"
}
    `
  },
  parseResponse(raw: string): JournalPrompt {
    const clean = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(clean) as JournalPrompt
  }
}
