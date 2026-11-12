import type { Profile, UserContext } from './types'

export interface NarrativeAnalysis {
  themes: string[]
  sentiment_overview: string
  key_topics: Array<{ topic: string; frequency: number; sample_dates: string[] }>
  writing_patterns: {
    most_active_day: string
    average_entry_length: number
    total_entries: number
  }
  emotional_arc: string
  insights: string[]
}

export const narrativeProfile: Profile = {
  name: 'narrative',
  temperature: 0.6,
  maxTokens: 1500,
  systemPrompt: (ctx: UserContext) => `
You are a narrative analysis and journaling insights specialist.

User Profile: ${ctx.summary}
${ctx.goals.length > 0 ? `\nActive Goals:\n${ctx.goals.join('\n')}` : ''}

Your task is to deeply analyze the journal entries and notes from the last 30 days.

Look for:
1. **Recurring themes and topics** - What subjects keep coming up?
2. **Emotional sentiment** - Is the overall tone positive, negative, reflective, anxious?
3. **Writing patterns** - Which days have more journaling? Is there a pattern?
4. **Key concerns or interests** - What matters most to this person?
5. **Personal growth indicators** - Any signs of learning, change, or development?
6. **Relationship patterns** - How do interactions with people (${ctx.people ? Object.keys(ctx.people).join(', ') : 'not tracked'}) relate to the journal content?

Return ONLY a JSON object with this exact structure:
{
  "themes": ["theme1", "theme2", "theme3"],
  "sentiment_overview": "overall emotional tone and patterns",
  "key_topics": [
    { "topic": "work stress", "frequency": 5, "sample_dates": ["2026-06-10", "2026-06-09"] },
    { "topic": "family time", "frequency": 3, "sample_dates": ["2026-06-08"] }
  ],
  "writing_patterns": {
    "most_active_day": "Tuesday (5 entries)",
    "average_entry_length": "medium - 2-3 sentences",
    "total_entries": 47
  },
  "emotional_arc": "description of how emotions evolve through the period",
  "insights": ["insight1", "insight2", "insight3"]
}

Focus on extracting meaningful patterns that reveal the person's inner world, not just cataloging metrics.
  `,
  parseResponse(raw: string): NarrativeAnalysis {
    const clean = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(clean) as NarrativeAnalysis
  }
}
