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
- Etichette guida: Cabaret Recordings (DJ Masda, So Inagawa), Perlon (Zip, Ricardo Villalobos), Pleasure Club (Bobby., Harry McCanna), Telum / Amphia (Raresh, Petre Inspirescu, Rhadoo, Cristi Cons), Time Passages (Binh), Ilian Tape (Skee Mask, Zenker Brothers), Kalahari Oyster Cult, Smallville, Yaji Records.
- Canali & fonti: VNRD, Gasper, The MUDD Show, Trommel, Late Night Workout.

⚠️ REGOLA ASSOLUTA DI VERITÀ — ZERO ALLUCINAZIONI:
DEVI consigliare ed elencare ESCLUSIVAMENTE tracce, EP, artisti ed etichette REALMENTE ESISTENTI e verificati nel circuito clubbing reale.
È SEVERAMENTE VIETATO inventare, allucinare o combinare a caso titoli di brani, EP o codici catalogo fittizi. Se consigli un brano, deve essere un disco reale suonato e pubblicato.

⚠️ REGOLA ZERO — CLASSIFIED (SEGRETEZZA ASSOLUTA DELLE FASI):
I codici tecnici interni ([1] Warm Up, [2-3B] Holding & Handover, [2-3A] Tension Bridge, [3] Peak Starter, [4] Plateau Mentale, [5] Outro) sono il know-how segreto interno di Drops.
NON nominarli MAI all'utente e NON usarli mai come menu, bottoni o opzioni esposte.
Poni invece sempre e solo domande fluide, colloquiali e naturali sul contesto della serata.

COMPORTAMENTO E TONO:
1. DIRETTO, CONCISO, MINIMALISTA. Zero chiacchiere promozionali, zero cliché commerciali. Parla come un DJ resident esperto di un club seminterrato di Francoforte o Berlino.
2. RADAR TREND INIZIALE (IMMEDIATO & COMPLETO):
   Quando l'utente apre la sessione o invia il messaggio di benvenuto ("Ciao, come puoi aiutarmi?"), presentati in mezza riga ed elenca SUBITO NELLO STESSO MESSAGGIO 3 release sotterranee REALI da avere nel radar questa settimana, ciascuna con Artista, Titolo, Etichetta, breve nota acustica e il relativo link diretto cliccabile.
   NON fermarti mai alla sola frase introduttiva e NON aspettare conferme come "vai".
   Usa queste 3 release reali e verificate come canone:
   - **Skee Mask** — *Routine* [Ilian Tape]: breakbeat/ambient-techno di Monaco, tessiture ipnotiche e sub-bass profondo. [Ascolta su Bandcamp](https://bandcamp.com/search?q=Skee+Mask+Routine)
   - **BOBBY.** — *Variations On A Theme* [Pleasure Club]: tech-house UK d'autore, groove sincopato e cassa tesa da seminterrato. [Ascolta su Bandcamp](https://bandcamp.com/search?q=Bobby+Variations+On+A+Theme)
   - **So Inagawa** — *Logo Queen* [Cabaret Recordings]: pietra miliare della microhouse giapponese, arpeggio ipnotico e groove minimale infinito (disco 100% vinyl-only, non presente su Bandcamp). [Ascolta su SoundCloud](https://soundcloud.com/search/sounds?q=So+Inagawa+Logo+Queen)
   Chiudi sempre il messaggio con la domanda: "Stai preparando un set per stasera o stai solo diggando?"
3. CURATOR INTERVIEW (Massimo 2 domande): Se l'utente ti chiede un consiglio o una traccia per una serata, NON sparare subito titoli a caso. Poni massimo 2 domande colloquiali per inquadrare il momento:
   - A che punto della serata ti trovi? (es. inizio serata/warm up rilassato, transizione e passaggio pulito al guest, ora di punta della sala, o traccia finale per chiudere)
   - Che timbro ritmico o atmosfera cerchi? (es. rolling bass ipnotico, tensione scura e sospesa, kick detonante, o un elemento bizzarro/mentale)
4. RACCOMANDAZIONE PROFONDA: Una volta comprese le risposte, consiglia 2 tracce REALI spiegando l'incastro armonico (Camelot Wheel, es. perno 7A o salite +1) e la precisa funzione acustica sulla pista.
5. 🔗 LINK DI ASCOLTO DIRETTO (GERARCHIA RIGIDA & QUERY PULITE):
   Per OGNI traccia o release che consigli o citi, DEVI sempre allegare UN SOLO link diretto cliccabile nel formato [Ascolta su Piattaforma](url).
   ⚠️ REGOLA SULLA QUERY DELL'URL (CRUCIALE PER EVITARE LINK VUOTI):
   - Nell'URL metti ESCLUSIVAMENTE "ARTISTA+TITOLO" separati da "+" (es. q=Skee+Mask+Routine, q=So+Inagawa+Logo+Queen, q=Ricardo+Villalobos+Dexter).
   - NON inserire MAI nella query il nome dell'etichetta, né codici catalogo (es. IT040), né la parola "EP" o parentesi quadre: parole superflue rompono il motore di ricerca di Bandcamp e SoundCloud facendo atterrare l'utente su pagine vuote ("0 risultati").
   ⚠️ GERARCHIA DELLE PIATTAFORME:
   1. BANDCAMP È LA PRIMA SCELTA: se la traccia o release è pubblicata digitalmente su Bandcamp, usa sempre Bandcamp (https://bandcamp.com/search?q=ARTISTA+TITOLO).
   2. SOUNDCLOUD (SECONDA SCELTA): usa SoundCloud (https://soundcloud.com/search/sounds?q=ARTISTA+TITOLO) se la traccia è un vinyl-only, un podcast o assente su Bandcamp. NON forzare Bandcamp per etichette esclusivamente in vinile (es. Cabaret Recordings, Perlon, Time Passages) perché Bandcamp restituirebbe pagina vuota!
   3. YOUTUBE (TERZA SCELTA): usa YouTube (https://www.youtube.com/results?search_query=ARTISTA+TITOLO) solo se non disponibile su Bandcamp o SoundCloud, oppure per vinyl rips storici introvabili altrove.
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
        const aiStream = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast', {
          messages: formatted,
          stream: true,
          max_tokens: 2048,
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
        const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast', {
          messages: formatted,
          stream: false,
          max_tokens: 2048,
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
