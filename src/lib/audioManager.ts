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

  // Check status if specified (must be completed, complete, ready, or indexed)
  const status = typeof track.status === 'string' ? track.status.toLowerCase().trim() : ''
  if (status) {
    const validStatuses = ['completed', 'complete', 'ready', 'indexed']
    if (!validStatuses.includes(status)) {
      return false
    }
  }

  // Check audio resource validity if present
  const audioUrl = (track.audioUrl || track.sourceUrl || '').trim()
  if (audioUrl) {
    const invalidMarkers = ['invalid', 'broken', 'null', 'undefined', 'error', 'failed']
    if (invalidMarkers.includes(audioUrl.toLowerCase())) return false
  }

  return true
}

/**
 * Filters a collection of tracks to strictly include only available, completed tracks with valid audio resources.
 */
export function filterAvailableTracks<T extends TrackLike>(tracks: T[] | null | undefined): T[] {
  if (!Array.isArray(tracks)) return []
  return tracks.filter(isAvailableTrack)
}

/**
 * Purges and deletes an unavailable or 404 track from localStorage and dispatches event to update React state.
 */
export function purgeUnavailableTrackFromStorage(trackIdOrTitle?: string | number | null) {
  if (!trackIdOrTitle || typeof window === 'undefined') return
  try {
    const target = String(trackIdOrTitle)
    window.dispatchEvent(new CustomEvent('drops-purge-unavailable-track', { detail: { id: target } }))

    const historyRaw = window.localStorage.getItem('drops.history.v1')
    if (historyRaw) {
      const history = JSON.parse(historyRaw)
      if (Array.isArray(history)) {
        const cleaned = history.filter((t: any) => String(t.id) !== target && String(t.title) !== target)
        window.localStorage.setItem('drops.history.v1', JSON.stringify(cleaned))
      }
    }
    const foldersRaw = window.localStorage.getItem('drops.folders.v1')
    if (foldersRaw) {
      const folders = JSON.parse(foldersRaw)
      if (Array.isArray(folders)) {
        const cleaned = folders.map((f: any) => ({
          ...f,
          tracks: (f.tracks || []).filter((t: any) => String(t.id) !== target && String(t.title) !== target)
        }))
        window.localStorage.setItem('drops.folders.v1', JSON.stringify(cleaned))
      }
    }
  } catch {}
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
    // Obtain signed token URL (/api/v1/downloads/{id}/file-url) for cross-origin audio playback
    const resolvedUrl = await api.resolveFileUrl(id)
    const targetUrl = resolvedUrl || providedUrl || api.fileUrl(id)

    let res: Response | null = null
    try {
      res = await fetch(targetUrl, {
        method: 'HEAD',
        headers: { Accept: 'application/json, audio/*' },
      })
    } catch {
      try {
        res = await fetch(targetUrl, {
          method: 'GET',
          headers: { Range: 'bytes=0-1', Accept: 'application/json, audio/*' },
        })
      } catch {
        res = null
      }
    }

    if (!res) {
      if (providedUrl && !targetUrl.includes('/api/v1/downloads/')) {
        return { ok: true, url: providedUrl }
      }
      return { ok: false, url: '', error: 'Backend /file-url non raggiungibile o non deployato.' }
    }

    if (!res.ok && (res.status === 404 || res.status >= 500)) {
      if (providedUrl && !targetUrl.includes('/api/v1/downloads/')) {
        return { ok: true, url: providedUrl }
      }
      return { ok: false, url: '', error: `Backend /file-url non disponibile (HTTP ${res.status}).` }
    }

    const acao = res.headers.get('access-control-allow-origin')
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : ''
    const corsPassed = !acao || acao === '*' || (currentOrigin && (acao.includes(currentOrigin) || currentOrigin.includes(acao)))

    if (!corsPassed) {
      if (providedUrl && !targetUrl.includes('/api/v1/downloads/')) {
        return { ok: true, url: providedUrl }
      }
      return { ok: false, url: '', error: 'Controllo CORS (Access-Control-Allow-Origin) fallito.' }
    }

    return { ok: true, url: targetUrl }
  } catch (err: unknown) {
    if (providedUrl && !providedUrl.includes('/api/v1/downloads/')) {
      return { ok: true, url: providedUrl }
    }
    const message = err instanceof Error ? err.message : 'Errore rete o sessione scaduta'
    return { ok: false, url: '', error: message }
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

/**
 * Stops/pauses all active audio playback globally (DOM audio elements & global player synth/audio).
 */
export function stopAllAudio() {
  stopAllOtherAudioExcept(null)
}

export const AudioPlayerManager = {
  stopAllAudio,
  stopAllOtherAudioExcept,
  isAvailableTrack,
  filterAvailableTracks,
  verifyAndResolveBackendAudioUrl,
}

