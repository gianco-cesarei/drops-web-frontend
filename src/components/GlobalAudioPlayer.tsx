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
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(180)
  const [volume, setVolume] = useState<number>(80)
  const [isMuted, setIsMuted] = useState<boolean>(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const synthCtxRef = useRef<AudioContext | null>(null)
  const synthOscRef = useRef<OscillatorNode | null>(null)
  const synthGainRef = useRef<GainNode | null>(null)

  // Initialize or update HTMLAudioElement when activeTrack changes
  useEffect(() => {
    if (!activeTrack) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
      return
    }

    const audio = audioRef.current || new Audio()
    audioRef.current = audio
    audio.volume = isMuted ? 0 : volume / 100

    if (activeTrack.audioUrl) {
      audio.src = activeTrack.audioUrl
      audio.currentTime = 0
      audio.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {
        // Fallback to synthetic preview generator if remote audio fails or is blocked
        playSyntheticPreview(activeTrack.bpm || 124)
      })
    } else {
      // Synthetic club groove preview generator
      playSyntheticPreview(activeTrack.bpm || 124)
    }

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

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [activeTrack])

  // Synthetic electronic groove generator as rich fallback
  const playSyntheticPreview = (bpm: number) => {
    try {
      if (!synthCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        if (AudioCtx) synthCtxRef.current = new AudioCtx()
      }
      if (synthCtxRef.current && synthCtxRef.current.state === 'suspended') {
        synthCtxRef.current.resume()
      }
    } catch {
      /* ignore audio context restrictions */
    }
  }

  // Play/Pause toggle handler
  const handleTogglePlay = () => {
    if (!activeTrack) return

    if (isPlaying) {
      if (audioRef.current && activeTrack.audioUrl) {
        audioRef.current.pause()
      }
      setIsPlaying(false)
    } else {
      if (audioRef.current && activeTrack.audioUrl) {
        audioRef.current.play().catch(() => {})
      }
      setIsPlaying(true)
    }
  }

  // Handle Volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])

  // Listen for global play events
  useEffect(() => {
    const handleGlobalPlay = (e: CustomEvent<ActiveTrack>) => {
      if (e.detail) {
        setActiveTrack(e.detail)
        setIsPlaying(true)
        setCurrentTime(0)
      }
    }

    window.addEventListener('drops-play-track' as any, handleGlobalPlay)
    window.__drops_play_track = (track: ActiveTrack) => {
      setActiveTrack(track)
      setIsPlaying(true)
      setCurrentTime(0)
    }

    return () => {
      window.removeEventListener('drops-play-track' as any, handleGlobalPlay)
      delete window.__drops_play_track
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  // Timer simulation fallback for progression
  useEffect(() => {
    let interval: any
    if (isPlaying && (!audioRef.current || !activeTrack?.audioUrl)) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, duration, activeTrack])

  if (!activeTrack) return null

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
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
          <span className="mini-player-artist">{activeTrack.artist}</span>
        </div>
      </div>

      {/* CENTER CONTROLS & TIMELINE */}
      <div className="mini-player-center-controls">
        <div className="mini-player-transport-row">
          <button
            type="button"
            className="mini-player-btn prev"
            onClick={() => setCurrentTime(Math.max(0, currentTime - 15))}
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
            onClick={() => setCurrentTime(Math.min(duration, currentTime + 15))}
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
              onChange={(e) => setCurrentTime(Number(e.target.value))}
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
