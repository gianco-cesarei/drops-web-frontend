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

export default function GlobalAudioPlayer() {
  const [activeTrack, setActiveTrack] = useState<ActiveTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [usingSynth, setUsingSynth] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(180)
  const [volume, setVolume] = useState<number>(80)
  const [isMuted, setIsMuted] = useState<boolean>(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const noiseRef = useRef<AudioBuffer | null>(null)
  const schedRef = useRef<number | null>(null)
  const stepRef = useRef<number>(0)

  const gainValue = () => (isMuted ? 0 : Math.max(0, Math.min(1, volume / 100)))

  // --- Synthesised club-groove engine (reliable offline / cross-browser fallback) ---
  const ensureCtx = (): AudioContext | null => {
    if (!ctxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return null
      ctxRef.current = new AudioCtx()
    }
    return ctxRef.current
  }

  const stopSynth = () => {
    if (schedRef.current != null) {
      window.clearInterval(schedRef.current)
      schedRef.current = null
    }
    if (masterRef.current) {
      try { masterRef.current.disconnect() } catch { /* ignore */ }
      masterRef.current = null
    }
  }

  const startSynth = (bpm: number) => {
    const ctx = ensureCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    stopSynth()
    stepRef.current = 0

    const master = ctx.createGain()
    master.gain.value = gainValue() * 0.85
    master.connect(ctx.destination)
    masterRef.current = master

    if (!noiseRef.current) {
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate)
      const ch = buf.getChannelData(0)
      for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1
      noiseRef.current = buf
    }

    const beat = 60 / (bpm && bpm > 40 ? bpm : 124)
    const bassNotes = [55, 55, 82.41, 65.41]

    const scheduleBeat = () => {
      if (!masterRef.current || !ctxRef.current) return
      const c = ctxRef.current
      const out = masterRef.current
      const t = c.currentTime + 0.03
      const step = stepRef.current

      // Kick drum
      const kick = c.createOscillator()
      const kg = c.createGain()
      kick.frequency.setValueAtTime(160, t)
      kick.frequency.exponentialRampToValueAtTime(48, t + 0.12)
      kg.gain.setValueAtTime(0.9, t)
      kg.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
      kick.connect(kg).connect(out)
      kick.start(t)
      kick.stop(t + 0.2)

      // Rolling bassline
      const bass = c.createOscillator()
      const bg = c.createGain()
      bass.type = 'sawtooth'
      bass.frequency.value = bassNotes[step % bassNotes.length]
      bg.gain.setValueAtTime(0.0001, t)
      bg.gain.linearRampToValueAtTime(0.14, t + 0.03)
      bg.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.9)
      bass.connect(bg).connect(out)
      bass.start(t)
      bass.stop(t + beat)

      // Off-beat hi-hat
      if (noiseRef.current) {
        const hat = c.createBufferSource()
        hat.buffer = noiseRef.current
        const hp = c.createBiquadFilter()
        hp.type = 'highpass'
        hp.frequency.value = 7000
        const hg = c.createGain()
        const ht = t + beat / 2
        hg.gain.setValueAtTime(0.0001, ht)
        hg.gain.linearRampToValueAtTime(0.09, ht + 0.005)
        hg.gain.exponentialRampToValueAtTime(0.001, ht + 0.05)
        hat.connect(hp).connect(hg).connect(out)
        hat.start(ht)
        hat.stop(ht + 0.06)
      }

      stepRef.current = step + 1
    }

    scheduleBeat()
    schedRef.current = window.setInterval(scheduleBeat, beat * 1000)
  }

  // Initialize / update playback when the active track changes
  useEffect(() => {
    if (!activeTrack) {
      stopSynth()
      setUsingSynth(false)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
      return
    }

    stopSynth()
    const audio = audioRef.current || new Audio()
    audioRef.current = audio
    audio.volume = gainValue()

    let cleanup = () => {}

    if (activeTrack.audioUrl) {
      setUsingSynth(false)
      audio.src = activeTrack.audioUrl
      audio.currentTime = 0
      audio.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {
        // Remote file blocked/unsupported -> reliable synthesised preview
        setUsingSynth(true)
        startSynth(activeTrack.bpm || 124)
        setIsPlaying(true)
      })

      const handleTimeUpdate = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setCurrentTime(audio.currentTime)
          setDuration(audio.duration)
        }
      }
      const handleEnded = () => {
        setIsPlaying(false)
        setCurrentTime(0)
      }
      audio.addEventListener('timeupdate', handleTimeUpdate)
      audio.addEventListener('ended', handleEnded)
      cleanup = () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate)
        audio.removeEventListener('ended', handleEnded)
      }
    } else {
      // No real file -> synthesised groove keyed to BPM
      setUsingSynth(true)
      setDuration(180)
      startSynth(activeTrack.bpm || 124)
      setIsPlaying(true)
    }

    return cleanup
  }, [activeTrack])

  // Play / Pause
  const handleTogglePlay = () => {
    if (!activeTrack) return
    if (usingSynth) {
      if (isPlaying) {
        stopSynth()
        setIsPlaying(false)
      } else {
        startSynth(activeTrack.bpm || 124)
        setIsPlaying(true)
      }
      return
    }
    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
    } else {
      audioRef.current?.play().catch(() => {})
      setIsPlaying(true)
    }
  }

  // Volume / mute applied to both engines
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = gainValue()
    if (masterRef.current) masterRef.current.gain.value = gainValue() * 0.85
  }, [volume, isMuted])

  // Register global play hook
  useEffect(() => {
    const handleGlobalPlay = (e: CustomEvent<ActiveTrack>) => {
      if (e.detail) {
        setActiveTrack(e.detail)
        setCurrentTime(0)
      }
    }
    const handleSetVolume = (e: CustomEvent<number>) => {
      const v = Math.max(0, Math.min(100, Number(e.detail)))
      if (!isNaN(v)) { setVolume(v); if (v > 0) setIsMuted(false) }
    }
    window.addEventListener('drops-play-track' as any, handleGlobalPlay)
    window.addEventListener('drops-set-volume' as any, handleSetVolume)
    window.__drops_play_track = (track: ActiveTrack) => {
      setActiveTrack({ ...track })
      setCurrentTime(0)
    }
    return () => {
      window.removeEventListener('drops-play-track' as any, handleGlobalPlay)
      window.removeEventListener('drops-set-volume' as any, handleSetVolume)
      delete window.__drops_play_track
      stopSynth()
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {})
        ctxRef.current = null
      }
      if (audioRef.current) audioRef.current.pause()
    }
  }, [])

  // Timeline progression for the synthesised engine
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    if (isPlaying && usingSynth) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false)
            stopSynth()
            return 0
          }
          return prev + 1
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

  const seekTo = (value: number) => {
    setCurrentTime(value)
    if (!usingSynth && audioRef.current) {
      audioRef.current.currentTime = value
    }
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <aside className="global-mini-player-bar" aria-label="Riproduttore Audio Globale">
      {/* TRACK INFO LEFT */}
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

      {/* CENTER CONTROLS & TIMELINE */}
      <div className="mini-player-center-controls">
        <div className="mini-player-transport-row">
          <button
            type="button"
            className="mini-player-btn prev"
            onClick={() => seekTo(Math.max(0, currentTime - 15))}
            title="Riavvolgi 15s"
          >
            ↺ 15s
          </button>
          <button
            type="button"
            className="mini-player-play-btn"
            onClick={handleTogglePlay}
            aria-label={isPlaying ? 'Metti in pausa' : 'Riproduci traccia'}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            className="mini-player-btn next"
            onClick={() => seekTo(Math.min(duration, currentTime + 15))}
            title="Avanza 15s"
          >
            15s ↻
          </button>
        </div>

        <div className="mini-player-progress-row">
          <span className="timecode-text">{formatTime(currentTime)}</span>
          <div className="mini-player-timeline-slider">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={(e) => seekTo(Number(e.target.value))}
              aria-label="Progresso riproduzione"
            />
            <div className="timeline-fill-bar" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <span className="timecode-text">{formatTime(duration)}</span>
        </div>
      </div>

      {/* RIGHT VOLUME & CLOSE */}
      <div className="mini-player-right-actions">
        <div className="mini-player-volume-control">
          <button
            type="button"
            className="volume-mute-btn"
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Riattiva audio' : 'Disattiva audio'}
          >
            {isMuted || volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value))
              if (isMuted) setIsMuted(false)
            }}
            className="volume-slider"
            aria-label="Volume audio"
          />
        </div>

        <button
          type="button"
          className="mini-player-close-btn"
          onClick={() => {
            stopSynth()
            setIsPlaying(false)
            setActiveTrack(null)
          }}
          title="Chiudi riproduttore"
          aria-label="Chiudi riproduttore"
        >
          ✕
        </button>
      </div>
    </aside>
  )
}
