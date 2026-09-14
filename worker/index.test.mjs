import assert from 'node:assert/strict'
import { test } from 'node:test'
import worker, { apiOrigin } from './index.js'

function env(overrides = {}) {
  return { API_ORIGIN: 'https://mp3-ytb.onrender.com', ASSETS: { fetch: async () => new Response('asset-body', { headers: { 'content-type': 'text/html' } }) }, ...overrides }
}

test('serves non-API requests from Worker Static Assets', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => { throw new Error('asset route must not call upstream') }
  try {
    const response = await worker.fetch(new Request('https://drops.giancarlocesarei.workers.dev/'), env())
    assert.equal(await response.text(), 'asset-body')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('proxies API method, query, body, Origin and streaming response unchanged', async () => {
  const originalFetch = globalThis.fetch
  let captured
  const stream = new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('chunk-1')); controller.enqueue(new TextEncoder().encode('chunk-2')); controller.close() } })
  globalThis.fetch = async request => {
    captured = request
    return new Response(stream, { status: 201, headers: { 'content-type': 'text/plain', 'set-cookie': 'drops_session=abc; HttpOnly; Secure' } })
  }
  try {
    const request = new Request('https://drops.giancarlocesarei.workers.dev/api/v1/downloads?next=%2Fitem', {
      method: 'POST',
      headers: { Origin: 'https://drops.giancarlocesarei.workers.dev', 'content-type': 'application/json' },
      body: JSON.stringify({ url: 'https://youtu.be/example' }),
    })
    const response = await worker.fetch(request, env())
    assert.equal(captured.url, 'https://mp3-ytb.onrender.com/api/v1/downloads?next=%2Fitem')
    assert.equal(captured.method, 'POST')
    assert.equal(captured.headers.get('origin'), 'https://drops.giancarlocesarei.workers.dev')
    assert.deepEqual(await captured.json(), { url: 'https://youtu.be/example' })
    assert.equal(response.status, 201)
    assert.equal(response.headers.get('set-cookie'), 'drops_session=abc; HttpOnly; Secure')
    assert.equal(await response.text(), 'chunk-1chunk-2')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('does not create an open proxy', async () => {
  const originalFetch = globalThis.fetch
  let called = false
  globalThis.fetch = async () => { called = true; return new Response('unexpected') }
  try {
    const response = await worker.fetch(new Request('https://drops.giancarlocesarei.workers.dev/?url=https://attacker.example'), env())
    assert.equal(await response.text(), 'asset-body')
    assert.equal(called, false)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('accepts only HTTPS origin configuration without path', () => {
  assert.equal(apiOrigin({ API_ORIGIN: 'https://api.example.test' }), 'https://api.example.test')
  assert.throws(() => apiOrigin({ API_ORIGIN: 'http://api.example.test' }))
  assert.throws(() => apiOrigin({ API_ORIGIN: 'https://api.example.test/route' }))
})

test('scheduled handler pings upstream /health endpoint', async () => {
  const originalFetch = globalThis.fetch
  let capturedUrl = ''
  let capturedHeaders = null
  globalThis.fetch = async (url, options) => {
    capturedUrl = String(url)
    capturedHeaders = options?.headers
    return new Response(JSON.stringify({ status: 'ok' }), { status: 200 })
  }
  try {
    await worker.scheduled({}, env())
    assert.equal(capturedUrl, 'https://mp3-ytb.onrender.com/health')
    assert.equal(capturedHeaders?.['User-Agent'], 'Drops-KeepAlive-Worker/1.0')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('handles /api/v1/curator/chat using Workers AI with streaming SSE', async () => {
  let capturedModel = ''
  let capturedOptions = null
  const fakeStream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('data: {"response":"Ciao "}\n\n'))
      controller.enqueue(new TextEncoder().encode('data: {"response":"ecco le release"}\n\n'))
      controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  const mockAi = {
    async run(model, options) {
      capturedModel = model
      capturedOptions = options
      return fakeStream
    },
  }

  const request = new Request('https://drops.giancarlocesarei.workers.dev/api/v1/curator/chat?stream=true', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Inizia la sessione' }] }),
  })

  const response = await worker.fetch(request, env({ AI: mockAi }))
  assert.equal(response.status, 200)
  assert.ok(response.headers.get('content-type')?.includes('text/event-stream'))
  assert.equal(capturedModel, '@cf/meta/llama-3.1-8b-instruct-fast')
  assert.equal(capturedOptions.stream, true)

  const text = await response.text()
  assert.ok(text.includes('data: {"text":"Ciao "}\n\n'))
  assert.ok(text.includes('data: {"text":"ecco le release"}\n\n'))
  assert.ok(text.includes('data: [DONE]\n\n'))
})

test('handles /api/v1/curator/chat using Workers AI without streaming (JSON)', async () => {
  const mockAi = {
    async run() {
      return { response: 'Ecco 3 dischi sotterranei imperdibili.' }
    },
  }

  const request = new Request('https://drops.giancarlocesarei.workers.dev/api/v1/curator/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Dammi le release' }] }),
  })

  const response = await worker.fetch(request, env({ AI: mockAi }))
  assert.equal(response.status, 200)
  const data = await response.json()
  assert.equal(data.success, true)
  assert.equal(data.reply, 'Ecco 3 dischi sotterranei imperdibili.')
})

test('falls back to upstream proxy for curator chat when no edge AI is available', async () => {
  const originalFetch = globalThis.fetch
  let upstreamCalled = false
  globalThis.fetch = async () => {
    upstreamCalled = true
    return new Response(JSON.stringify({ success: true, reply: 'from-upstream' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const request = new Request('https://drops.giancarlocesarei.workers.dev/api/v1/curator/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'test' }] }),
    })
    const response = await worker.fetch(request, env())
    assert.equal(upstreamCalled, true)
    const data = await response.json()
    assert.equal(data.reply, 'from-upstream')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('handles /api/v1/curator/listen and redirects directly to YouTube track', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url) => {
    if (String(url).includes('youtube.com/results')) {
      return new Response('<html><body><a href="/watch?v=D5LkLmxcgIQ">Link</a></body></html>', { status: 200 })
    }
    return new Response('not found', { status: 404 })
  }
  try {
    const request = new Request('https://drops.giancarlocesarei.workers.dev/api/v1/curator/listen?q=Skee+Mask+Routine')
    const response = await worker.fetch(request, env())
    assert.equal(response.status, 302)
    assert.equal(response.headers.get('location'), 'https://www.youtube.com/watch?v=D5LkLmxcgIQ')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('handles /api/v1/curator/listen with soundcloud platform and redirects to track', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url) => {
    if (String(url).includes('soundcloud.com/search')) {
      return new Response('<html><body><a href="/max-wiebenga/so-inagawa-logo-queen">Track</a></body></html>', { status: 200 })
    }
    return new Response('not found', { status: 404 })
  }
  try {
    const request = new Request('https://drops.giancarlocesarei.workers.dev/api/v1/curator/listen?q=So+Inagawa+Logo+Queen&platform=soundcloud')
    const response = await worker.fetch(request, env())
    assert.equal(response.status, 302)
    assert.equal(response.headers.get('location'), 'https://soundcloud.com/max-wiebenga/so-inagawa-logo-queen')
  } finally {
    globalThis.fetch = originalFetch
  }
})


