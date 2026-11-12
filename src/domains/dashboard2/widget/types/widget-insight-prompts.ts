export const INSIGHT_PROMPTS = {
  patterns: `Identify the TOP patterns in my tracking data for this period.

## SUMMARY
Exactly 3 lines with specific details. Just the highlights.

## EXTENDED
Comprehensive analysis of all patterns found, with trends, timing, and actionable insights (800-1000 tokens).`,

  progress: `Summarize my progress towards my goals this period.

## SUMMARY
Exactly 3 lines with concrete examples and percentage improvements.

## EXTENDED
Detailed progress analysis with trend analysis, barrier identification, and specific recommendations (800-1000 tokens).`,

  insights: `Provide key insights about my tracked metrics this period.

## SUMMARY
Exactly 3 lines highlighting the most interesting metrics findings.

## EXTENDED
Comprehensive metric analysis with correlations, outliers, and deeper context (800-1000 tokens).`,

  recommendations: `Give actionable recommendations based on my data.

## SUMMARY
Exactly 3 lines with top 2-3 prioritized recommendations.

## EXTENDED
Detailed recommendations with reasoning, expected outcomes, and implementation guidance (800-1000 tokens).`,

  trends: `Analyze the main trends in my tracking data for this period.

## SUMMARY
Exactly 3 lines with the most significant trends and their direction.

## EXTENDED
Comprehensive trend analysis with historical context, acceleration, and predictive insights (800-1000 tokens).`,

  wellbeing: `Assess my overall wellbeing based on the data.

## SUMMARY
Exactly 3 lines covering key wellbeing indicators and overall assessment.

## EXTENDED
Detailed wellbeing analysis including correlations, risk factors, and optimization opportunities (800-1000 tokens).`,

  productivity: `Comment on my productivity trends this period.

## SUMMARY
Exactly 3 lines with peak productivity windows and main trends.

## EXTENDED
In-depth productivity analysis with pattern identification, blockers, and optimization strategies (800-1000 tokens).`,

  health: `Provide key health insights from my tracking data.

## SUMMARY
Exactly 3 lines highlighting the most important health findings.

## EXTENDED
Comprehensive health analysis with lifestyle correlations and evidence-based recommendations (800-1000 tokens).`,

  mood: `Analyze the mood patterns in my journal entries.

## SUMMARY
Exactly 3 lines with main mood patterns and key triggers.

## EXTENDED
Detailed mood analysis including emotional patterns, triggers, protective factors, and insights (800-1000 tokens).`,

  correlation: `Identify key correlations between metrics this period.

## SUMMARY
Exactly 3 lines with the strongest 2-3 correlations found.

## EXTENDED
Comprehensive correlation analysis with strength assessment and practical implications (800-1000 tokens).`,
}

export type PromptKey = keyof typeof INSIGHT_PROMPTS

export function getPromptText(key: PromptKey | string): string {
  if (key in INSIGHT_PROMPTS) {
    return INSIGHT_PROMPTS[key as PromptKey]
  }
  return key // Return custom prompt if not predefined
}

export function getPromptLabel(key: string): string {
  const labels: Record<string, string> = {
    patterns: 'Patterns',
    progress: 'Progress',
    insights: 'Insights',
    recommendations: 'Recommendations',
    trends: 'Trends',
    wellbeing: 'Wellbeing',
    productivity: 'Productivity',
    health: 'Health',
    mood: 'Mood & Emotions',
    correlation: 'Correlations',
  }
  return labels[key] || 'Custom Prompt'
}
