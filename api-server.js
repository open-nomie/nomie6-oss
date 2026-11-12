const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.API_PORT || 5002

// Enable CORS for all routes
app.use(cors())
app.use(express.json())

// Non-streaming AI endpoint
app.post('/api/ai', async (req, res) => {
  try {
    const { model, max_tokens, temperature, system, messages, apiKey } = req.body

    console.log('📨 /api/ai received:', {
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 10) : 'NONE',
      model,
      messages: messages?.length || 0
    })

    if (!apiKey) {
      console.error('❌ API key missing')
      return res.status(400).json({ error: 'API key is required' })
    }

    const payload = {
      model,
      max_tokens,
      system,
      messages
    }

    console.log('📤 Sending to Anthropic:', JSON.stringify(payload, null, 2).substring(0, 500))

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`❌ Anthropic API error (${response.status}):`)
      console.error(error)
      return res.status(response.status).json({ error })
    }

    const data = await response.json()
    console.log('✅ Success! Returning data to client')
    res.json(data)
  } catch (error) {
    console.error('❌ API error:', error.message, error)
    res.status(500).json({ error: error.message })
  }
})

// Streaming AI endpoint
app.post('/api/ai/stream', async (req, res) => {
  try {
    const { model, max_tokens, temperature, system, messages, apiKey } = req.body

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens,
        system,
        messages,
        stream: true
      })
    })

    if (!response.ok) {
      const error = await response.text()
      return res.status(response.status).json({ error })
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Access-Control-Allow-Origin', '*')

    // Stream the response body to the client
    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        res.write(chunk)
      }
      res.end()
    } catch (error) {
      console.error('Stream error:', error)
      res.end()
    }
  } catch (error) {
    console.error('Streaming API error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🤖 AI API server running on http://0.0.0.0:${PORT}`)
})
