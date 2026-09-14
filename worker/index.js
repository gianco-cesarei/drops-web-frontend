const DEFAULT_API_ORIGIN = 'https://mp3-ytb.onrender.com'
const WORKER_ORIGIN = 'https://drops.giancarlocesarei.workers.dev'

function apiOrigin(env) {
  const configured = String(env.API_ORIGIN || DEFAULT_API_ORIGIN).trim()
  try {
    const origin = new URL(configured)
    if (origin.protocol !== 'https:' || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) {
      throw new Error('API_ORIGIN must be an HTTPS origin without path')
    }
    return origin.origin
  } catch {
    throw new Error('Invalid API_ORIGIN')
  }
}

function shouldProxy(pathname) {
  return pathname.startsWith('/api/')
}

function upstreamRequest(request, env, pathname) {
  const url = new URL(request.url)
  const target = new URL(pathname + url.search, apiOrigin(env))
  const headers = new Headers(request.headers)
  headers.set('X-Forwarded-Host', url.host)
  headers.set('X-Forwarded-Proto', url.protocol.replace(':', ''))
  const init = {
    method: request.method,
    headers: headers,
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body
    init.duplex = 'half'
  }
  return new Request(target, init)
}

const CURATOR_CHAT_PATH = '/api/v1/curator/chat'
const CURATOR_STREAM_PATH = '/api/v1/curator/stream'

const UNDERGROUND_BRAIN_PROMPT = `Sei 'Drops Curator', l'intelligenza artificiale e mentore musicale underground di Drops.
Il tuo compito è guidare digger e DJ nella selezione di musica elettronica di nicchia e di altissimo livello artistico.

DNA ARTISTICO & IDENTITÀ SONORA:
- Riferimenti cardine: Microhouse & Minimal europea/rumena/giapponese (ritmiche elastiche, sub-bass avvolgenti), Early 90s Progressive & Proto-Trance underground (arpeggi ipnotici, pad nostalgici, zero drop dozzinali), New Beat / UK Tech-House d'autore.
- Etichette guida: Cabaret Recordings (DJ Masda, So Inagawa), Perlon (Zip, Ricardo Villalobos), Pleasure Club (Bobby., Harry McCanna), Telum / Amphia (Raresh, Petre Inspirescu, Rhadoo, Cristi Cons), Time Passages (Binh), Bosconi Records, Yaji Records, MDR.
- Canali & fonti: VNRD, Gasper, The MUDD Show, Trommel, Late Night Workout.

⚠️ REGOLA ZERO — CLASSIFIED (SEGRETEZZA ASSOLUTA DELLE FASI):
I codici tecnici interni ([1] Warm Up, [2-3B] Holding & Handover, [2-3A] Tension Bridge, [3] Peak Starter, [4] Plateau Mentale, [5] Outro) sono il know-how segreto interno di Drops.
NON nominarli MAI all'utente e NON usarli mai come menu, bottoni o opzioni esposte.
Poni invece sempre e solo domande fluide, colloquiali e naturali sul contesto della serata.

COMPORTAMENTO E TONO:
1. DIRETTO, CONCISO, MINIMALISTA. Zero chiacchiere promozionali, zero cliché commerciali. Parla come un DJ resident esperto di un club seminterrato di Francoforte o Berlino.
2. RADAR TREND INIZIALE: Se l'utente saluta o apre la sessione, accoglilo brevemente e mostra subito 3 release calde/sold-out da tenere d'occhio (es. Bosconi Bosco058/059, Telum, Pleasure Club, Cabaret, Time Passages).
3. CURATOR INTERVIEW (Massimo 2 domande): Se l'utente ti chiede un consiglio o una traccia per una serata, NON sparare subito titoli a caso. Poni massimo 2 domande colloquiali per inquadrare il momento:
   - A che punto della serata ti trovi? (es. inizio serata/warm up rilassato, transizione e passaggio pulito al guest, ora di punta della sala, o traccia finale per chiudere)
   - Che timbro ritmico o atmosfera cerchi? (es. rolling bass ipnotico, tensione scura e sospesa, kick detonante, o un elemento bizzarro/mentale)
4. RACCOMANDAZIONE PROFONDA: Una volta comprese le risposte, consiglia 2 tracce spiegando l'incastro armonico (Camelot Wheel, es. perno 7A o salite +1) e la precisa funzione acustica sulla pista.
`

function isCuratorPath(pathname) {
  return pathname === CURATOR_CHAT_PATH || pathname === CURATOR_STREAM_PATH
}

function createSSETransform(extractor) {
  let buffer = ''
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  return new TransformStream({
    transform(chunk, controller) {
      buffer += typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data:')) continue
        const dataStr = trimmed.slice(5).trim()
        if (dataStr === '[DONE]') {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          continue
        }
        try {
          const parsed = JSON.parse(dataStr)
          const text = extractor(parsed)
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        } catch {
          // ignore unparseable line
        }
      }
    },
    flush(controller) {
      if (buffer.trim().startsWith('data:')) {
        const dataStr = buffer.trim().slice(5).trim()
        if (dataStr !== '[DONE]') {
          try {
            const parsed = JSON.parse(dataStr)
            const text = extractor(parsed)
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          } catch {}
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
    },
  })
}

async function handleCuratorEdge(request, env, url) {
  const hasWorkersAI = Boolean(env.AI && typeof env.AI.run === 'function')
  const hasGeminiKey = Boolean(env.GEMINI_API_KEY && String(env.GEMINI_API_KEY).trim())

  if (!hasWorkersAI && !hasGeminiKey) {
    return null // Fallback to upstream proxy
  }

  let body
  try {
    body = await request.clone().json()
  } catch {
    return new Response(JSON.stringify({ success: false, reply: 'Invalid JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const rawMessages = Array.isArray(body?.messages) ? body.messages : []
  const isStream =
    request.headers.get('accept')?.includes('text/event-stream') ||
    Boolean(body?.stream) ||
    url.searchParams.get('stream') === 'true' ||
    url.pathname === CURATOR_STREAM_PATH

  if (hasWorkersAI) {
    const formatted = [
      { role: 'system', content: UNDERGROUND_BRAIN_PROMPT },
      ...rawMessages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: String(m.content || ''),
      })),
    ]

    try {
      if (isStream) {
        const aiStream = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: formatted,
          stream: true,
          max_tokens: 1024,
          temperature: 0.4,
        })
        const transformedStream = aiStream.pipeThrough(
          createSSETransform((parsed) => parsed?.response || '')
        )
        return new Response(transformedStream, {
          headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
          },
        })
      } else {
        const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: formatted,
          stream: false,
          max_tokens: 1024,
          temperature: 0.4,
        })
        return Response.json({
          success: true,
          reply: result?.response || '',
        }, {
          headers: { 'Access-Control-Allow-Origin': '*' },
        })
      }
    } catch (err) {
      console.warn('[WorkersAI] Inference error, falling back:', err?.message || err)
      if (!hasGeminiKey) return null
    }
  }

  if (hasGeminiKey) {
    const contents = rawMessages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: String(m.content || '') }],
    }))
    const geminiPayload = {
      systemInstruction: {
        parts: [{ text: UNDERGROUND_BRAIN_PROMPT }],
      },
      contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
      },
    }

    try {
      if (isStream) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${env.GEMINI_API_KEY}`
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiPayload),
        })
        if (!res.ok || !res.body) {
          return null
        }
        const transformedStream = res.body.pipeThrough(
          createSSETransform((parsed) => parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '')
        )
        return new Response(transformedStream, {
          headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
          },
        })
      } else {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiPayload),
        })
        if (!res.ok) return null
        const data = await res.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
        return Response.json({ success: true, reply: text }, {
          headers: { 'Access-Control-Allow-Origin': '*' },
        })
      }
    } catch (err) {
      console.warn('[Gemini] Edge fetch error:', err?.message || err)
      return null
    }
  }

  return null
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (isCuratorPath(url.pathname)) {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Accept',
          },
        })
      }
      if (request.method === 'POST') {
        const edgeRes = await handleCuratorEdge(request, env, url)
        if (edgeRes) return edgeRes
      }
    }

    if (shouldProxy(url.pathname) || url.pathname === '/health') {
      let upstream
      try {
        upstream = await fetch(upstreamRequest(request, env, url.pathname), { redirect: 'manual' })
      } catch {
        return new Response('API upstream unavailable', { status: 502 })
      }
      return upstream
    }

    return env.ASSETS.fetch(request)
  },

  async scheduled(event, env, ctx) {
    try {
      const target = new URL('/health', apiOrigin(env))
      const res = await fetch(target.toString(), {
        headers: {
          'User-Agent': 'Drops-KeepAlive-Worker/1.0',
          Accept: 'application/json',
        },
      })
      console.log(`[KeepAlive] Pinged ${target.origin}/health - status: ${res.status}`)
    } catch (err) {
      console.warn('[KeepAlive] Ping failed:', err && err.message ? err.message : err)
    }
  },
}

export { DEFAULT_API_ORIGIN, WORKER_ORIGIN, apiOrigin, shouldProxy, upstreamRequest, handleCuratorEdge, isCuratorPath, UNDERGROUND_BRAIN_PROMPT }
