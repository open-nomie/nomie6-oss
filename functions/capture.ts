import fetch from 'node-fetch'
import { Handler } from '@netlify/functions'

/**
 * > This function is a proxy for the Nomie Cloud API. It's purpose is to allow you to use the Nomie
 * Cloud API without exposing your API Key to the public
 * @param event - The event that triggered the function.
 * @param context - The context object is a standard AWS Lambda object that contains information about
 * the invocation, function, and execution environment.
 * @returns The response from the API call
 */
const handler: Handler = async (event, context) => {
  const api_endpoint = `https://us-central1-nomie-a47b7.cloudfunctions.net/capture`

  const CORSHeader = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  }

  if (event.httpMethod !== 'POST') {
    // To enable CORS
    return {
      statusCode: 200, // <-- Important!
      headers: CORSHeader,
      body: 'Cors',
    }
  } else {
    const payload = JSON.parse(event.body) || {}
    const key =
      payload.key || payload.api_key || event.headers['api_key'] || event.headers['api-key'] || event.headers['API-KEY']
    const env =
      payload.env || event.headers['api-env'] || event.headers['API-ENV'] || process.env.VITE_APP_FIRESTORE_ROOT
    const headers = {
      'Content-Type': 'application/json',
      charset: 'utf-8',
      'api-key': key,
      'api-env': env,
    }
    try {
      const call = await fetch(api_endpoint, {
        method: 'POST',
        headers: headers,
        body: event.body,
      })
      let response = await call.json()
      return {
        statusCode: 200,
        headers: CORSHeader,
        body: JSON.stringify(response),
      }
    } catch (e) {
      return {
        statusCode: e.statusCode || 500,
        body: JSON.stringify({
          error: e.message,
        }),
      }
    }
  }
}

export { handler }
