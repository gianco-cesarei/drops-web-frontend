import React, { useEffect, useRef, useState } from 'react'

export interface ActiveTrack {
  id?: string
  title: string
  artist: string
  bpm?: number
  genre?: string
  coverUrl?: string
  audioUrl?: string
}

declare global {
  interface Window {
    __drops_play_track?: (track: ActiveTrack) => void
  }
}

const FADE_SECONDS = 1.4

export default function GlobalAudioPlayer() {
  const [activeTrack, setActiveTrack] = useState<ActiveTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [usingSynth, setUsingSynth] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(180)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)

  // Single-deck Web Audio graph:  source -> EQ(low>mid>high) -> program(fade) -> master(volume) -> destination
  const ctxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const programRef = useRef<GainNode | null>(null)
  const eqLowRef = useRef<BiquadFilterNode | null>(null)
  const eqMidRef = useRef<BiquadFilterNode | null>(null)
  const eqHighRef = useRef<BiquadFilterNode | null>(null)
  const eqInRef = useRef<GainNode | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const usingGraphRef = useRef<boolean>(false)
  const fadeEnabledRef = useRef<boolean>(false)

  // Synth engine
  const synthGainRef = useRef<GainNode | null>(null)
  const noiseRef = useRef<AudioBuffer | null>(null)
  const schedRef = useRef<number | null>(null)
  const stepRef = useRef<number>(0)

  const vol = () => (isMuted ? 0 : Math.max(0, Math.min(1, volume / 100)))

  const ensureAudioEl = (): HTMLAudioElement => {
    if (!audioRef.current) {
      const a = new Audio()
      a.crossOrigin = 'anonymous'
      a.preload = 'auto'
      a.addEventListener('timeupdate', onTimeUpdate)
      a.addEventListener('ended', onEnded)
      a.addEventListener('error', onError)
      audioRef.current = a
    }
    return audioRef.current
  }

  const ensureGraph = (): AudioContext | null => {
    if (ctxRef.current) {
      if (ctxRef.current.state === 'suspended') ctxRef.current.resume().catch(() => {})
      return ctxRef.current
    }
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      const ctx = new AC()
      const master = ctx.createGain(); master.gain.value = vol()
      const program = ctx.createGain(); program.gain.value = 1
      const low = ctx.createBiquadFilter(); low.type = 'lowshelf'; low.frequency.value = 120
      const mid = ctx.createBiquadFilter(); mid.type = 'peaking'; mid.frequency.value = 1000; mid.Q.value = 1
      const high = ctx.createBiquadFilter(); high.type = 'highshelf'; high.frequency.value = 5000
      const eqIn = ctx.createGain()
      eqIn.connect(low); low.connect(mid); mid.connect(high); high.connect(program); program.connect(master); master.connect(ctx.destination)
      const sg = ctx.createGain(); sg.gain.value = 0.85; sg.connect(eqIn)
      ctxRef.current = ctx
      masterRef.current = master; programRef.current = program
      eqLowRef.current = low; eqMidRef.current = mid; eqHighRef.current = high
      eqInRef.current = eqIn; synthGainRef.current = sg
      // wire the media element once
      const a = ensureAudioEl()
      try {
        const src = ctx.createMediaElementSource(a)
        src.connect(eqIn)
        sourceRef.current = src
      } catch {
        sourceRef.current = null
      }
      return ctx
    } catch {
      return null
    }
  }

  const fadeProgram = (to: number, seconds: number) => {
    const ctx = ctxRef.current, prog = programRef.current
    if (!ctx || !prog) return
    const now = ctx.currentTime
    prog.gain.cancelScheduledValues(now)
    prog.gain.setValueAtTime(prog.gain.value, now)
    prog.gain.linearRampToValueAtTime(to, now + Math.max(0.01, seconds))
  }

  // ---- Media element events ----
  const onTimeUpdate = () => {
    const a = audioRef.current
    if (!a || !a.duration || isNaN(a.duration)) return
    setCurrentTime(a.currentTime)
    setDuration(a.duration)
    if (fadeEnabledRef.current) {
      const remaining = a.duration - a.currentTime
      if (remaining <= FADE_SECONDS && remaining > 0.15) fadeProgram(0, remaining)
    }
  }
  const onEnded = () => { setIsPlaying(false); window.dispatchEvent(new CustomEvent('drops-track-ended')) }
  const onError = () => {
    const a = audioRef.current
    const url = a?.getAttribute('data-src') || ''
    if (url && usingGraphRef.current) {
      // Likely a CORS block (crossOrigin) or 404 -> retry once without the graph so audio still plays (EQ inert)
      usingGraphRef.current = false
      const plain = a as HTMLAudioElement
      plain.crossOrigin = ''
      plain.src = url
      plain.play().then(() => setIsPlaying(true)).catch(() => { setUsingSynth(true); startSynth(180); setIsPlaying(true) })
    }
  }

  const playReal = (track: ActiveTrack) => {
    const url = track.audioUrl as string
    const ctx = ensureGraph()
    const a = ensureAudioEl()
    stopSynth()
    setUsingSynth(false)
    usingGraphRef.current = !!ctx && !!sourceRef.current
    a.setAttribute('data-src', url)
    a.src = url
    a.currentTime = 0
    if (programRef.current && ctx) {
      if (fadeEnabledRef.current) { programRef.current.gain.setValueAtTime(0.0001, ctx.currentTime); fadeProgram(1, FADE_SECONDS) }
      else programRef.current.gain.setValueAtTime(1, ctx.currentTime)
    } else {
      a.volume = vol()
    }
    a.play().then(() => setIsPlaying(true)).catch(() => {
      // Autoplay/format rejection -> synth so there is always feedback
      setUsingSynth(true); startSynth(track.bpm || 124, track.title || track.id || ''); setIsPlaying(true)
    })
  }

  // ---- Synth groove (offline / demo fallback, routed through the same EQ) ----
  const stopSynth = () => { if (schedRef.current != null) { window.clearInterval(schedRef.current); schedRef.current = null } }
  const startSynth = (bpm: number, seedStr = '') => {
    const ctx = ensureGraph()
    if (!ctx || !synthGainRef.current) return
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    stopSynth()
    stepRef.current = 0
    const out = synthGainRef.current
    const now0 = ctx.currentTime
    out.gain.cancelScheduledValues(now0)
    if (fadeEnabledRef.current) { out.gain.setValueAtTime(0.0001, now0); out.gain.linearRampToValueAtTime(0.85, now0 + FADE_SECONDS) }
    else out.gain.setValueAtTime(0.85, now0)
    if (!noiseRef.current) {
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate)
      const ch = buf.getChannelData(0)
      for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1
      noiseRef.current = buf
    }
    let seed = 0
    for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0
    const roots = [49.0, 55.0, 58.27, 61.74, 65.41, 73.42, 82.41, 98.0]
    const root = roots[seed % roots.length]
    const patterns = [[0, 0, 7, 5], [0, 7, 3, 10], [0, 5, 3, 7], [0, 3, 5, 3], [0, 0, 5, 8], [0, 10, 7, 5]]
    const pat = patterns[(seed >> 3) % patterns.length]
    const notes = pat.map((n) => root * Math.pow(2, n / 12))
    const waves: OscillatorType[] = ['sawtooth', 'square', 'triangle']
    const wave = waves[(seed >> 6) % waves.length]
    const hatFreq = 6000 + (seed % 5) * 900
    const beat = 60 / (bpm && bpm > 40 ? bpm : 124)
    const scheduleBeat = () => {
      const c = ctxRef.current
      if (!c) return
      const t = c.currentTime + 0.03
      const step = stepRef.current
      const kick = c.createOscillator(); const kg = c.createGain()
      kick.frequency.setValueAtTime(160, t); kick.frequency.exponentialRampToValueAtTime(48, t + 0.12)
      kg.gain.setValueAtTime(0.9, t); kg.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
      kick.connect(kg).connect(out); kick.start(t); kick.stop(t + 0.2)
      const bs = c.createOscillator(); const bg = c.createGain()
      bs.type = wave; bs.frequency.value = notes[step % notes.length]
      bg.gain.setValueAtTime(0.0001, t); bg.gain.linearRampToValueAtTime(0.13, t + 0.03); bg.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.9)
      bs.connect(bg).connect(out); bs.start(t); bs.stop(t + beat)
      if (step % 2 === 0) {
        const lead = c.createOscillator(); const lg = c.createGain()
        lead.type = 'triangle'; lead.frequency.value = notes[(step + 2) % notes.length] * 4
        lg.gain.setValueAtTime(0.0001, t); lg.gain.linearRampToValueAtTime(0.05, t + 0.02); lg.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.5)
        lead.connect(lg).connect(out); lead.start(t); lead.stop(t + beat * 0.5)
      }
      if (noiseRef.current) {
        const hat = c.createBufferSource(); hat.buffer = noiseRef.current
        const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = hatFreq
        const hg = c.createGain(); const ht = t + beat / 2
        hg.gain.setValueAtTime(0.0001, ht); hg.gain.linearRampToValueAtTime(0.09, ht + 0.005); hg.gain.exponentialRampToValueAtTime(0.001, ht + 0.05)
        hat.connect(hp).connect(hg).connect(out); hat.start(ht); hat.stop(ht + 0.06)
      }
      stepRef.current = step + 1
    }
    scheduleBeat()
    schedRef.current = window.setInterval(scheduleBeat, beat * 1000)
  }

  // ---- React to track changes ----
  useEffect(() => {
    if (!activeTrack) return
    if (activeTrack.audioUrl) {
      playReal(activeTrack)
    } else {
      setUsingSynth(true); setDuration(180); setCurrentTime(0); startSynth(activeTrack.bpm || 124, activeTrack.title || activeTrack.id || ''); setIsPlaying(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrack])

  // ---- Transport ----
  const handleTogglePlay = () => {
    if (!activeTrack) return
    if (usingSynth) {
      if (isPlaying) { stopSynth(); setIsPlaying(false) } else { startSynth(activeTrack.bpm || 124, activeTrack.title || activeTrack.id || ''); setIsPlaying(true) }
      return
    }
    const a = audioRef.current
    if (!a) return
    if (isPlaying) { a.pause(); setIsPlaying(false) } else { a.play().catch(() => {}); setIsPlaying(true) }
  }

  const seekTo = (value: number) => {
    setCurrentTime(value)
    if (usingSynth) return
    if (audioRef.current) { try { audioRef.current.currentTime = value } catch { /* ignore */ } }
  }

  // ---- Volume ----
  useEffect(() => {
    if (masterRef.current) masterRef.current.gain.value = vol()
    if (audioRef.current && !usingGraphRef.current) audioRef.current.volume = vol()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume, isMuted])

  // ---- External control events (from the Archive console / mixer) ----
  useEffect(() => {
    const onPlay = (e: CustomEvent<ActiveTrack>) => { if (e.detail) { setActiveTrack(e.detail); setCurrentTime(0) } }
    const onVol = (e: CustomEvent<number>) => { const v = Math.max(0, Math.min(100, Number(e.detail))); if (!isNaN(v)) { setVolume(v); if (v > 0) setIsMuted(false) } }
    const onEq = (e: CustomEvent<{ low: number; mid: number; high: number }>) => {
      ensureGraph()
      const d = e.detail || ({} as { low: number; mid: number; high: number })
      const toDb = (n: number) => ((Math.max(0, Math.min(100, n)) - 50) / 50) * 12
      if (eqLowRef.current && typeof d.low === 'number') eqLowRef.current.gain.value = toDb(d.low)
      if (eqMidRef.current && typeof d.mid === 'number') eqMidRef.current.gain.value = toDb(d.mid)
      if (eqHighRef.current && typeof d.high === 'number') eqHighRef.current.gain.value = toDb(d.high)
    }
    const onFadeEnabled = (e: CustomEvent<boolean>) => { fadeEnabledRef.current = !!e.detail }

    window.addEventListener('drops-play-track' as any, onPlay as any)
    window.addEventListener('drops-set-volume' as any, onVol as any)
    window.addEventListener('drops-set-eq' as any, onEq as any)
    window.addEventListener('drops-set-fade-enabled' as any, onFadeEnabled as any)
    window.__drops_play_track = (track: ActiveTrack) => { setActiveTrack({ ...track }); setCurrentTime(0) }

    return () => {
      window.removeEventListener('drops-play-track' as any, onPlay as any)
      window.removeEventListener('drops-set-volume' as any, onVol as any)
      window.removeEventListener('drops-set-eq' as any, onEq as any)
      window.removeEventListener('drops-set-fade-enabled' as any, onFadeEnabled as any)
      delete window.__drops_play_track
      stopSynth()
      try { audioRef.current?.pause() } catch { /* ignore */ }
      if (ctxRef.current) { ctxRef.current.close().catch(() => {}); ctxRef.current = null }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Synth timeline progression (+ dissolvenza fade-out and queue auto-advance)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    if (isPlaying && usingSynth) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1
          const remaining = duration - next
          if (fadeEnabledRef.current && synthGainRef.current && ctxRef.current && remaining <= FADE_SECONDS && remaining > 0) {
            const g = synthGainRef.current.gain, now = ctxRef.current.currentTime
            g.cancelScheduledValues(now); g.setValueAtTime(g.value, now); g.linearRampToValueAtTime(0.0001, now + Math.max(0.1, remaining))
          }
          if (next >= duration) { setIsPlaying(false); stopSynth(); window.dispatchEvent(new CustomEvent('drops-track-ended')); return 0 }
          return next
        })
      }, 1000)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [isPlaying, usingSynth, duration])

  if (!activeTrack) return null

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <aside className="global-mini-player-bar" aria-label="Riproduttore Audio Globale">
      <div className="mini-player-track-info">
        <div className="mini-player-artwork-box">
          {activeTrack.coverUrl ? (
            <img src={activeTrack.coverUrl} alt={activeTrack.title} className="mini-player-cover-img" />
          ) : (
            <div className="mini-player-cover-fallback">🎵</div>
          )}
          {isPlaying && <div className="live-soundwave-indicator"><span></span><span></span><span></span></div>}
        </div>
        <div className="mini-player-meta-text">
          <div className="mini-player-title-row">
            <strong className="mini-player-title">{activeTrack.title}</strong>
            {activeTrack.bpm && <span className="mini-player-bpm-pill">{activeTrack.bpm} BPM</span>}
          </div>
          <span className="mini-player-artist">{activeTrack.artist}{usingSynth ? ' · anteprima' : ''}</span>
        </div>
      </div>

      <div className="mini-player-center-controls">
        <div className="mini-player-transport-row">
          <button type="button" className="mini-player-btn prev" onClick={() => seekTo(Math.max(0, currentTime - 15))} title="Riavvolgi 15s">↺ 15s</button>
          <button type="button" className="mini-player-play-btn" onClick={handleTogglePlay} aria-label={isPlaying ? 'Metti in pausa' : 'Riproduci traccia'}>{isPlaying ? '❚❚' : '▶'}</button>
          <button type="button" className="mini-player-btn next" onClick={() => seekTo(Math.min(duration, currentTime + 15))} title="Avanza 15s">15s ↻</button>
        </div>
        <div className="mini-player-progress-row">
          <span className="timecode-text">{formatTime(currentTime)}</span>
          <div className="mini-player-timeline-slider">
            <input type="range" min="0" max={duration} value={currentTime} onChange={(e) => seekTo(Number(e.target.value))} aria-label="Progresso riproduzione" />
            <div className="timeline-fill-bar" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <span className="timecode-text">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="mini-player-right-actions">
        <div className="mini-player-volume-control">
          <button type="button" className="volume-mute-btn" onClick={() => setIsMuted(!isMuted)} title={isMuted ? 'Riattiva audio' : 'Disattiva audio'}>{isMuted || volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}</button>
          <input type="range" min="0" max="100" value={isMuted ? 0 : volume} onChange={(e) => { setVolume(Number(e.target.value)); if (isMuted) setIsMuted(false) }} className="volume-slider" aria-label="Volume audio" />
        </div>
        <button type="button" className="mini-player-close-btn" onClick={() => { stopSynth(); setIsPlaying(false); try { audioRef.current?.pause() } catch { /* ignore */ } setActiveTrack(null) }} title="Chiudi riproduttore" aria-label="Chiudi riproduttore">✕</button>
      </div>
    </aside>
  )
}
