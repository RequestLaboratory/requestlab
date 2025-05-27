// CORS proxy worker for handling API requests
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return handleCorsPreflight(request)
  }

  // Get the target URL from the query parameter
  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')
  
  if (!targetUrl) {
    return new Response('Missing target URL', { status: 400 })
  }

  try {
    // Create a new request to the target URL
    const newRequest = new Request(targetUrl, {
      method: request.method,
      headers: new Headers(request.headers),
      body: request.body,
      redirect: 'follow'
    })

    // Remove headers that might cause issues
    newRequest.headers.delete('origin')
    newRequest.headers.delete('referer')
    newRequest.headers.delete('host')
    newRequest.headers.delete('x-forwarded-proto')
    newRequest.headers.delete('x-forwarded-for')
    newRequest.headers.delete('x-forwarded-host')

    // Add the target host as the host header
    const targetUrlObj = new URL(targetUrl)
    newRequest.headers.set('host', targetUrlObj.host)

    // Make the request to the target URL
    const response = await fetch(newRequest)

    // Create a new response with the target response's body and status
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers)
    })

    // Add CORS headers
    newResponse.headers.set('Access-Control-Allow-Origin', '*')
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    newResponse.headers.set('Access-Control-Allow-Headers', '*')
    newResponse.headers.set('Access-Control-Max-Age', '86400')

    return newResponse
  } catch (error) {
    return new Response(`Error: ${error.message}`, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain'
      }
    })
  }
}

function handleCorsPreflight(request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400'
    }
  })
} 