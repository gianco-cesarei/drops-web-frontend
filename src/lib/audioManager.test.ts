import { describe, expect, it, vi, afterEach } from 'vitest'
import {
  isAvailableTrack,
  verifyAndResolveBackendAudioUrl,
  stopAllOtherAudioExcept,
  registerAudioElement,
  unregisterAudioElement,
} from './audioManager'

describe('audioManager', () => {
  describe('isAvailableTrack', () => {
    it('ritorna true per tracce valide e scaricate', () => {
      expect(isAvailableTrack({ id: '1', title: 'Minimal Flow', isAvailable: true })).toBe(true)
      expect(isAvailableTrack({ id: '2', filename: 'Track_01.mp3' })).toBe(true)
    })

    it('ritorna false se la traccia è nulla, non ha titolo/filename, o è contrassegnata non disponibile', () => {
      expect(isAvailableTrack(null)).toBe(false)
      expect(isAvailableTrack({})).toBe(false)
      expect(isAvailableTrack({ id: '1', title: '' })).toBe(false)
      expect(isAvailableTrack({ id: '2', title: 'Track', isAvailable: false })).toBe(false)
    })

    it('ritorna false se lo status è failed, error, o unavailable', () => {
      expect(isAvailableTrack({ id: '1', title: 'Track 1', status: 'failed' })).toBe(false)
      expect(isAvailableTrack({ id: '2', title: 'Track 2', status: 'error' })).toBe(false)
      expect(isAvailableTrack({ id: '3', title: 'Track 3', status: 'unavailable' })).toBe(false)
    })

    it('ritorna false se audioUrl o sourceUrl indicano risorsa corrotta/non valida', () => {
      expect(isAvailableTrack({ id: '1', title: 'Track 1', audioUrl: 'invalid' })).toBe(false)
      expect(isAvailableTrack({ id: '2', title: 'Track 2', sourceUrl: 'broken' })).toBe(false)
    })
  })

  describe('verifyAndResolveBackendAudioUrl', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('accetta URL locali blob/data senza chiamare il backend', async () => {
      const res = await verifyAndResolveBackendAudioUrl('1', 'blob:http://localhost/123')
      expect(res.ok).toBe(true)
      expect(res.url).toBe('blob:http://localhost/123')
    })

    it('blocca la riproduzione se il backend /file-url non è deployato (fetch throw o 404)', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error / Not deployed')))

      const res = await verifyAndResolveBackendAudioUrl('trk-1', 'https://drops.app/api/v1/downloads/trk-1/file')
      expect(res.ok).toBe(false)
      expect(res.error).toMatch(/non raggiungibile o non deployato/i)
    })

    it('blocca la riproduzione se i controlli CORS o Content-Type falliscono', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({
          'access-control-allow-origin': 'https://unauthorized-domain.com',
          'content-type': 'text/html',
        }),
      }))

      const res = await verifyAndResolveBackendAudioUrl('trk-1', 'https://drops.app/api/v1/downloads/trk-1/file')
      expect(res.ok).toBe(false)
      expect(res.error).toMatch(/CORS/i)
    })

    it('approva la riproduzione se il backend risponde con successo e passa i 3 controlli CORS', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({
          'access-control-allow-origin': '*',
          'content-type': 'audio/mpeg',
        }),
      }))

      const res = await verifyAndResolveBackendAudioUrl('trk-1', 'https://drops.app/api/v1/downloads/trk-1/file')
      expect(res.ok).toBe(true)
      expect(res.url).toBeDefined()
    })
  })

  describe('stopAllOtherAudioExcept', () => {
    it('mette in pausa tutti gli elementi audio diversi da quello attivo', () => {
      const el1 = { paused: false, pause: vi.fn() } as unknown as HTMLAudioElement
      const el2 = { paused: false, pause: vi.fn() } as unknown as HTMLAudioElement

      registerAudioElement(el1)
      registerAudioElement(el2)

      stopAllOtherAudioExcept(el1)

      expect(el1.pause).not.toHaveBeenCalled()
      expect(el2.pause).toHaveBeenCalled()

      unregisterAudioElement(el1)
      unregisterAudioElement(el2)
    })
  })
})
