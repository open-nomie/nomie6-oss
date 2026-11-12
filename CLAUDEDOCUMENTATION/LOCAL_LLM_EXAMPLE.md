# Local LLM Testing Guide for Nomie AI Integration

This guide provides sample prompts and data structures from the Nomie AI engine that you can use to test locally with your LLM.

## Available AI Profiles

Nomie uses 7 different AI profiles:
1. **insight** - Data-driven personal insights and pattern analysis
2. **data** - Statistical analysis and trend detection
3. **advice** - Goal-oriented recommendations
4. **journal** - Narrative analysis of journal entries
5. **alert** - Alert suggestions based on metrics
6. **narrative** - Story-telling based on logs
7. **chat** - Conversational Q&A

## Example 1: Insight Profile (Most Common)

### System Prompt Template
```
You are a data analyst and personal insights coach for Nomie.

User summary: [USER_SUMMARY]
Goals: [GOALS_LIST]

Tracked metrics: [METRICS_JSON]

[Optional: Social interactions: [PEOPLE_JSON]]
[Optional: Contexts/Environments: [CONTEXTS_LIST]]
[Optional: Locations: [LOCATIONS_LIST]]
[Optional: Topics/Pointers: [POINTERS_LIST]]

[Optional: Recent journal entries:
[JOURNAL_ENTRIES]]

Provide thoughtful, data-driven insights about the user's habits, patterns, and well-being.
Reference specific metrics, locations, contexts, social interactions, and journal entries.
Identify trends, correlations, and actionable patterns. Consider WHERE and WHEN the user tracks.

IMPORTANT: Format your response with TWO SECTIONS using the headers below:

## SUMMARY
Provide exactly 3 lines highlighting the top 1-2 surprising patterns only.
Keep sentences short and punchy. Use specific numbers without decimals.
Focus on what's most interesting or actionable. NO elaboration.

## EXTENDED
Provide 200-300 token brief analysis focusing on the top 1-2 most significant insights.
Use full paragraphs with precise metrics, statistical significance, and trend directions.
Include context about temporal patterns, relationships between metrics, and actionable insights.
This section should go into detail while the SUMMARY is reserved for key highlights only.

Ensure both sections use markdown formatting for easy processing.
```

### Sample Data (JSON)
```json
{
  "summary": "Active user tracking mood, exercise, sleep, and work productivity over the past month with strong evening exercise habits and variable sleep patterns.",
  "goals": [
    "Sleep 8 hours per night",
    "Exercise 5x per week",
    "Maintain positive mood (7+/10)"
  ],
  "recentMetrics": {
    "#mood": {
      "label": "Mood",
      "count": 28,
      "recent": [7, 8, 6, 7, 8],
      "aggregated": 7.1,
      "aggregationType": "average"
    },
    "#exercise": {
      "label": "Exercise",
      "count": 18,
      "recent": [45, 60, 30, 50, 60],
      "aggregated": 49.2,
      "aggregationType": "average"
    },
    "#sleep": {
      "label": "Sleep Hours",
      "count": 28,
      "recent": [6.5, 7, 8, 6, 7.5],
      "aggregated": 7.1,
      "aggregationType": "average"
    },
    "#work-productivity": {
      "label": "Work Productivity",
      "count": 20,
      "recent": [8, 7, 8, 9, 7],
      "aggregated": 7.8,
      "aggregationType": "average"
    },
    "@john": {
      "label": "John",
      "count": 5,
      "recent": [1, 1, 1, 1, 1],
      "aggregated": 5,
      "aggregationType": "sum"
    },
    "@emma": {
      "label": "Emma",
      "count": 3,
      "recent": [1, 1, 1],
      "aggregated": 3,
      "aggregationType": "sum"
    }
  },
  "people": {
    "@john": {
      "count": 5,
      "name": "John"
    },
    "@emma": {
      "count": 3,
      "name": "Emma"
    }
  },
  "contexts": {
    "#work": {
      "count": 12
    },
    "#home": {
      "count": 10
    },
    "#gym": {
      "count": 8
    }
  },
  "pointers": {
    "#health": {
      "count": 20
    },
    "#productivity": {
      "count": 12
    }
  },
  "locations": [
    {
      "name": "Home",
      "lat": 40.7128,
      "lng": -74.0060,
      "count": 15
    },
    {
      "name": "Work",
      "lat": 40.7580,
      "lng": -73.9855,
      "count": 12
    },
    {
      "name": "Gym",
      "lat": 40.7614,
      "lng": -73.9776,
      "count": 8
    }
  ],
  "notes": "2024-06-10: Felt great after 60min workout #mood(8) #exercise(60) #sleep(8) #work-productivity(8)\n2024-06-11: Tired morning, only 6.5hrs sleep #mood(6) #sleep(6.5) #work-productivity(7) with @john\n2024-06-12: Back to form, morning jog + evening gym session #exercise(45) #mood(7) #sleep(7.5) #work-productivity(8)\n2024-06-13: Late night work, poor sleep quality #sleep(6) #work-productivity(9) #mood(7)\n2024-06-14: Weekend vibes, good workout and mood #exercise(60) #mood(8) @emma visited"
}
```

### Sample User Prompt
```
Give me insights about my last 2 weeks of tracking. I want to understand my patterns better.
```

### Expected Response Format
The AI should respond with:
```
## SUMMARY
- Exercise inversely correlates with sleep: 60-min workouts precede 6-7 hr nights, likely due to evening routines
- Work productivity peaks (8-9) during low-sleep nights, suggesting caffeine compensation
- Social interactions (@john, @emma) occur on high-mood days (7-8), indicating social mood boost

## EXTENDED
Over the past two weeks, you've maintained a 7.1/10 average mood despite variable sleep (6-8 hours). 
The data reveals an interesting pattern: your highest work productivity scores (8-9) actually occur on nights 
after shorter sleep (6-6.5 hours), suggesting you may be compensating with focus when fatigued. 

Your exercise routine shows strong commitment with an average of 49 minutes per session, 18 tracked sessions 
in 28 days. However, a weak inverse correlation exists between exercise intensity and sleep duration—your 
longest workouts (60 min) tend to occur on evenings before 6-7 hour sleep nights.

Most notably, social interactions with John and Emma cluster on your highest-mood days (7-8/10), suggesting 
meaningful social connection contributes significantly to emotional well-being. Consider scheduling social 
activities strategically on days when mood naturally trends lower.
```

---

## Example 2: Simple Data Profile (Minimal Data)

### System Prompt
```
Analyze the following user metrics and provide key statistics and trends.

Tracked data:
- #exercise: 18 times, avg 49 min
- #mood: 28 times, avg 7.1/10
- #sleep: 28 times, avg 7.1 hours

Provide a concise statistical summary with 2-3 key observations about the data patterns.
```

### Sample User Prompt
```
What are the key trends in my exercise data?
```

---

## Example 3: Chat Profile (Conversational)

### System Prompt
```
You are a personal wellness coach for Nomie. The user has been tracking their metrics and would like 
to have a conversation about their data and well-being.

Recent tracking data:
- Exercise: averaging 49 minutes, 18 sessions in past month
- Mood: averaging 7.1/10
- Sleep: averaging 7.1 hours
- Goals: Sleep 8 hours, Exercise 5x/week, Maintain mood 7+

Recent activities and notes indicate strong exercise routine with variable sleep. User has been tracking 
interactions with John and Emma on high-mood days.

Answer user questions about their patterns, provide coaching on goals, and have a supportive conversation.
```

### Sample User Prompt
```
How can I improve my sleep quality? I notice some nights I only get 6 hours.
```

---

## Testing with Local LLM

### Option 1: Using Ollama (Recommended)
```bash
# Pull a model
ollama pull llama2
# or use a longer-context model like mistral
ollama pull mistral

# Test with curl
curl http://localhost:11434/api/generate -d '{
  "model": "mistral",
  "prompt": "[SYSTEM_PROMPT]\n\n[USER_PROMPT]",
  "stream": false
}'
```

### Option 2: Using LM Studio
1. Download and open LM Studio
2. Load a model (7B or larger recommended)
3. Start the local server (default: http://localhost:1234)
4. Use the chat interface with the prompts above

### Option 3: Using vLLM
```bash
python -m vllm.entrypoints.openai.api_server \
  --model mistralai/Mistral-7B-Instruct-v0.1 \
  --tensor-parallel-size 1

# Test with curl (OpenAI-compatible API)
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistral-7b",
    "messages": [
      {"role": "system", "content": "[SYSTEM_PROMPT]"},
      {"role": "user", "content": "[USER_PROMPT]"}
    ],
    "max_tokens": 500,
    "temperature": 0.7
  }'
```

---

## Key Parameters

- **Temperature**: 0.7 (for insight/chat profiles) - balances creativity with consistency
- **Max Tokens**: 200-1200 depending on profile
  - Insight: 1200
  - Data: 500
  - Chat: 800
  - Advice: 600

---

## Data Structure Notes

The context builder extracts data using a **tokenization system**:
- `#tracker-tag` = Tracker metrics (numbers or counts)
- `@person-tag` = Person/social metrics
- `!context-tag` = Contexts/environments
- `^pointer-tag` = Topics/tags

Example log entry parsing:
```
"Felt great after 60min workout #mood(8) #exercise(60) #sleep(8) #work-productivity(8)"

Results in:
{
  "#mood": 8,
  "#exercise": 60,
  "#sleep": 8,
  "#work-productivity": 8
}
```

---

## Testing Checklist

- [ ] Test with minimal data (just 3-4 metrics)
- [ ] Test with rich data (10+ metrics + people + locations)
- [ ] Test with different prompt lengths (short vs detailed requests)
- [ ] Verify response parsing (check for ## SUMMARY and ## EXTENDED sections)
- [ ] Test temperature settings (0.5 vs 0.7 vs 0.9)
- [ ] Measure token usage and inference time
- [ ] Test streaming vs non-streaming responses

---

## Next Steps for Integration

Once you've tested locally and are satisfied with the output:

1. Update `src/domains/ai/engine.svelte.ts` to support local LLM endpoints
2. Add LLM configuration to settings (API endpoint, model name)
3. Create an `llm-local.ts` profile alongside Claude profiles
4. Update the query function to route to local endpoint based on preferences

