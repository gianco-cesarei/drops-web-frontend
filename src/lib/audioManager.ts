import { api } from '../api'

export interface TrackLike {
  id?: string | number
  title?: string
  filename?: string
  artist?: string
  status?: string
  isAvailable?: boolean
  audioUrl?: string
  sourceUrl?: string
  source?: string
}

/**
 * Verifies whether a track is actually downloaded / available and has a valid audio resource.
 */
export function isAvailableTrack(track: TrackLike | null | undefined): boolean {
  if (!track) return false
  const title = (track.title || track.filename || '').trim()
  if (!title) return false

  // Check explicit availability boolean
  if (track.isAvailable === false) return false

  // Check invalid/failed status
  const status = typeof track.status === 'string' ? track.status.toLowerCase().trim() : ''
  if (status === 'failed' || status === 'error' || status === 'unavailable' || status === 'invalid' || status === 'broken') {
    return false
  }

  // Check audio resource validity if present
  const audioUrl = (track.audioUrl || track.sourceUrl || '').trim()
  if (audioUrl) {
    const invalidMarkers = ['invalid', 'broken', 'null', 'undefined', 'error', 'failed']
    if (invalidMarkers.includes(audioUrl.toLowerCase())) return false
  }

  return true
}

export interface CorsCheckResult {
  ok: boolean
  url: string
  error?: string
}

/**
 * Performs backend deployment check and 3 CORS controls (Origin, Access-Control-Allow-Origin, Content-Type)
 * before playing real downloaded audio tracks.
 */
export async function verifyAndResolveBackendAudioUrl(
  id: string,
  providedUrl?: string
): Promise<CorsCheckResult> {
  // If track is local object URL or blob, skip backend check
  if (providedUrl && (providedUrl.startsWith('blob:') || providedUrl.startsWith('data:'))) {
    return { ok: true, url: providedUrl }
  }

  try {
    const directFileUrl = api.fileUrl(id)
    const targetUrl = providedUrl || directFileUrl

    // 1. Check if backend endpoint responds cleanly (Backend Deployed Check)
    let res: Response | null = null
    try {
      res = await fetch(targetUrl, {
        method: 'HEAD',
        headers: {
          Accept: 'application/json, audio/*',
        },
      })
    } catch {
      // Retry with GET if HEAD is not supported by CORS/Worker
      try {
        res = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            Range: 'bytes=0-1',
            Accept: 'application/json, audio/*',
          },
        })
      } catch {
        res = null
      }
    }

    if (!res) {
      return {
        ok: false,
        url: '',
        error: 'Backend /file-url non raggiungibile o non deployato.',
      }
    }

    if (!res.ok && (res.status === 404 || res.status >= 500)) {
      return {
        ok: false,
        url: '',
        error: `Backend /file-url non deployato o non disponibile (HTTP ${res.status}).`,
      }
    }

    // 2. Controllo CORS 1 & 2: Origin e Access-Control-Allow-Origin
    const acao = res.headers.get('access-control-allow-origin')
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : ''
    const corsPassed = !acao || acao === '*' || (currentOrigin && (acao.includes(currentOrigin) || currentOrigin.includes(acao)))

    if (!corsPassed) {
      return {
        ok: false,
        url: '',
        error: 'Controllo CORS (Access-Control-Allow-Origin) fallito per la risorsa audio.',
      }
    }

    // 3. Controllo CORS 3: Content-Type
    const contentType = (res.headers.get('content-type') || '').toLowerCase()
    const isAudioType =
      contentType.includes('audio/') ||
      contentType.includes('application/octet-stream') ||
      contentType.includes('application/json') ||
      contentType.includes('application/x-mpegurl') ||
      contentType === '' // Some Workers return empty content-type on HEAD

    if (!isAudioType) {
      return {
        ok: false,
        url: '',
        error: `Controllo Content-Type fallito: il server ha restituito "${contentType}".`,
      }
    }

    const resolved = await api.resolveFileUrl(id)
    return { ok: true, url: resolved || targetUrl }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Errore smentito o rete non disponibile'
    return {
      ok: false,
      url: '',
      error: `Verifica CORS / Backend fallita: ${message}`,
    }
  }
}

const registeredAudioElements = new Set<HTMLAudioElement>()

/**
 * Ensures single-instance global playback by pausing all active HTMLAudioElement instances
 * across the document when a track starts.
 */
export function stopAllOtherAudioExcept(activeElement?: HTMLAudioElement | null) {
  if (typeof window === 'undefined') return

  // 1. Notify global listeners to pause synth / external players
  window.dispatchEvent(new CustomEvent('drops-stop-all-audio', { detail: { activeElement } }))

  // 2. Query all DOM audio elements
  const domAudioElements = Array.from(document.querySelectorAll('audio'))
  domAudioElements.forEach((el) => {
    if (el !== activeElement && !el.paused) {
      try {
        el.pause()
      } catch {
        /* ignore */
      }
    }
  })

  // 3. Pause registered programmatically created Audio elements
  registeredAudioElements.forEach((el) => {
    if (el !== activeElement && !el.paused) {
      try {
        el.pause()
      } catch {
        /* ignore */
      }
    }
  })
}

export function registerAudioElement(el: HTMLAudioElement) {
  registeredAudioElements.add(el)
}

export function unregisterAudioElement(el: HTMLAudioElement) {
  registeredAudioElements.delete(el)
}
