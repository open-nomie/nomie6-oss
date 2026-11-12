import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json()
    const { apiKey, ...aiRequest } = body

    if (!apiKey) {
      return new Response('API key not provided', { status: 400 })
    }

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'messages-2023-12-15'
      },
      body: JSON.stringify({ ...aiRequest, stream: true })
    })

    if (!upstream.ok) {
      const err = await upstream.text()
      console.error('Anthropic streaming error:', err)
      return new Response('AI service error', { status: upstream.status })
    }

    return new Response(upstream.body, {
      headers: { 'Content-Type': 'text/event-stream' }
    })
  } catch (err) {
    console.error('Streaming endpoint error:', err)
    return new Response('Internal server error', { status: 500 })
  }
}
