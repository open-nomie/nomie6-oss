import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json()
    const { apiKey, ...aiRequest } = body

    if (!apiKey) {
      return json(
        { error: 'API key not provided' },
        { status: 400 }
      )
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(aiRequest)
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', err)
      return json(
        { error: 'AI service error' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return json(data)
  } catch (err) {
    console.error('AI endpoint error:', err)
    return json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
