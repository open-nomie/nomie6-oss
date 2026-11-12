/**
 * OpenRouter.ai Service
 * Unified API for accessing multiple LLMs through OpenRouter
 */

interface OpenRouterMessage {
  role: 'user' | 'assistant'
  content: string
}

interface OpenRouterResponse {
  id: string
  model: string
  choices: Array<{
    message: {
      content: string
    }
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
  }
}

interface QueryResult {
  content: string
  model: string
}

function getOpenRouterErrorMessage(status: number, errorData: any): string {
  const baseMessage = errorData?.error?.message || 'Unknown error from OpenRouter'

  switch (status) {
    case 402:
      return `OpenRouter account setup needed: ${baseMessage}. Your account doesn't have credits enabled yet. Go to openrouter.ai/settings/credits and add a payment method (free models won't charge - this just unlocks your account). Then try again.`
    case 401:
      return `OpenRouter authentication failed: Invalid or expired API key. Check your API key in Settings > AI Integration.`
    case 429:
      return `OpenRouter rate limited: Too many requests (20 requests/min limit). Wait a moment and try again.`
    case 500:
      return `OpenRouter server error: The service is temporarily unavailable. Try again in a moment.`
    default:
      return `OpenRouter API error (${status}): ${baseMessage}`
  }
}

export async function queryOpenRouter(
  apiKey: string,
  messages: OpenRouterMessage[],
  options: {
    model?: string
    maxTokens?: number
    temperature?: number
  } = {}
): Promise<string> {
  const {
    model = 'openrouter/free', // OpenRouter free tier - auto-selects best available free model
    maxTokens = 1024,
    temperature = 0.7
  } = options

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://nomie.dailynomie.com',
        'X-Title': 'Nomie - Personal Analytics'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      const errorMessage = getOpenRouterErrorMessage(response.status, errorData)
      throw new Error(errorMessage)
    }

    const data: OpenRouterResponse = await response.json()

    const responseContent = data.choices?.[0]?.message?.content
    
    if (!responseContent) {
      const finishReason = data.choices?.[0]?.finish_reason
      if (finishReason === 'length') {
        throw new Error('OpenRouter response was cut off due to token limit. The response is too large for the free model. Try using fewer days or simplify your request.')
      }
      console.error('OpenRouter response:', JSON.stringify(data, null, 2))
      throw new Error(`Invalid response from OpenRouter API: no content generated (finish_reason: ${finishReason})`)
    }

    return {
      content: responseContent,
      model: data.model
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('OpenRouter API call failed:', message)
    throw new Error(message)
  }
}

export async function streamOpenRouter(
  apiKey: string,
  messages: OpenRouterMessage[],
  onChunk: (text: string) => void,
  options: {
    model?: string
    maxTokens?: number
    temperature?: number
  } = {},
  onModel?: (model: string) => void
): Promise<void> {
  const {
    model = 'openrouter/free', // OpenRouter free tier - auto-selects best available free model
    maxTokens = 1024,
    temperature = 0.7
  } = options

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://nomie.dailynomie.com',
        'X-Title': 'Nomie - Personal Analytics'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      const errorMessage = getOpenRouterErrorMessage(response.status, errorData)
      throw new Error(errorMessage)
    }

    if (!response.body) {
      throw new Error('No response body from OpenRouter')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue

        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6))
            // Extract model info from first response
            if (onModel && json.model) {
              onModel(json.model)
              onModel = undefined // Only call once
            }
            const chunk = json.choices?.[0]?.delta?.content
            if (chunk) {
              onChunk(chunk)
            }
          } catch (e) {
            // Ignore JSON parse errors in streaming
          }
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim() && buffer.trim() !== 'data: [DONE]') {
      try {
        const json = JSON.parse(buffer.trim().slice(6))
        const chunk = json.choices?.[0]?.delta?.content
        if (chunk) {
          onChunk(chunk)
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('OpenRouter streaming failed:', message)
    throw new Error(message)
  }
}
