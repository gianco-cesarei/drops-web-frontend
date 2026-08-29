import React, { useEffect, useRef, useState } from 'react'

export interface AudioOutputDevice {
  deviceId: string
  label: string
}

export interface DeckState {
  title: string
  artist: string
  bpm: number
  currentBpm: number
  pitchPercent: number // -8.00 to +8.00
  isPlaying: boolean
  isCueing: boolean
  currentTime: number
  duration: number
  keyLock: boolean
  volume: number
  eqHigh: number // -12dB to +6dB
  eqMid: number
  eqLow: number
  filterFx: number // -50 (LPF) to +50 (HPF)
  activeLoop: number | null // 2, 4, 8, 16 bars
  hotCues: (number | null)[] // up to 4 cue points
  audioUrl?: string
}

const DEMO_TRACKS = [
  {
    id: 'track-1',
    title: 'Minimal Groove (Vinyl Rip)',
    artist: 'Alex Rossi',
    bpm: 124.0,
    duration: 380,
    genre: 'Microhouse',
  },
  {
    id: 'track-2',
    title: 'Hypnotic Deep Flow (Club Mix)',
    artist: 'MANIA Collective',
    bpm: 126.0,
    duration: 420,
    genre: 'Minimal Techno',
  },
  {
    id: 'track-3',
    title: 'Submarine Bassline (Pre-master)',
    artist: 'Marco Donati',
    bpm: 125.0,
    duration: 360,
    genre: 'Deep Tech',
  },
]

export default function DJLab() {
  // Audio devices for Multi-Output Routing
  const [outputDevices, setOutputDevices] = useState<AudioOutputDevice[]>([])
  const [masterDeviceId, setMasterDeviceId] = useState<string>('default')
  const [cueDeviceId, setCueDeviceId] = useState<string>('default')
  const [multiOutputSupported, setMultiOutputSupported] = useState<boolean>(false)
  const [routingMode, setRoutingMode] = useState<'single' | 'multi' | 'split'>('single')
  const [cueMix, setCueMix] = useState<number>(50) // 0 = 100% CUE, 50 = 50/50 MIX, 100 = 100% MASTER

  // Crossfader: -100 (100% Deck A) to +100 (100% Deck B)
  const [crossfader, setCrossfader] = useState<number>(0)

  // Master Volume (0 to 100)
  const [masterVolume, setMasterVolume] = useState<number>(85)

  // Deck A State
  const [deckA, setDeckA] = useState<DeckState>({
    title: DEMO_TRACKS[0].title,
    artist: DEMO_TRACKS[0].artist,
    bpm: DEMO_TRACKS[0].bpm,
    currentBpm: DEMO_TRACKS[0].bpm,
    pitchPercent: 0.0,
    isPlaying: false,
    isCueing: false,
    currentTime: 0,
    duration: DEMO_TRACKS[0].duration,
    keyLock: true,
    volume: 85,
    eqHigh: 0,
    eqMid: 0,
    eqLow: 0,
    filterFx: 0,
    activeLoop: null,
    hotCues: [0, 32, 64, null],
  })

  // Deck B State
  const [deckB, setDeckB] = useState<DeckState>({
    title: DEMO_TRACKS[1].title,
    artist: DEMO_TRACKS[1].artist,
    bpm: DEMO_TRACKS[1].bpm,
    currentBpm: DEMO_TRACKS[1].bpm,
    pitchPercent: 0.0,
    isPlaying: false,
    isCueing: false,
    currentTime: 0,
    duration: DEMO_TRACKS[1].duration,
    keyLock: true,
    volume: 85,
    eqHigh: 0,
    eqMid: 0,
    eqLow: 0,
    filterFx: 0,
    activeLoop: null,
    hotCues: [0, 16, 48, null],
  })

  // Enumerate audio output devices on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.mediaDevices) return

    const checkDevices = async () => {
      try {
        if ('setSinkId' in HTMLMediaElement.prototype || 'setSinkId' in (window.AudioContext || {}).prototype) {
          setMultiOutputSupported(true)
        }
        const devices = await navigator.mediaDevices.enumerateDevices()
        const outputs = devices
          .filter((d) => d.kind === 'audiooutput')
          .map((d, index) => ({
            deviceId: d.deviceId || `device-${index}`,
            label: d.label || (index === 0 ? 'Altoparlanti Principali / Default' : `Uscita Audio ${index + 1}`),
          }))

        if (outputs.length > 0) {
          setOutputDevices(outputs)
          setMasterDeviceId(outputs[0].deviceId)
          if (outputs.length > 1) {
            setCueDeviceId(outputs[1].deviceId)
            setRoutingMode('multi')
          }
        }
      } catch {
        // Fallback for permissions / older browsers
      }
    }

    checkDevices()
  }, [])

  // Pitch change handlers with continuous floating point precision
  const handlePitchChange = (deck: 'A' | 'B', percent: number) => {
    const clamped = Math.max(-8.0, Math.min(8.0, Number(percent.toFixed(2))))
    if (deck === 'A') {
      const newBpm = Number((deckA.bpm * (1 + clamped / 100)).toFixed(2))
      setDeckA((prev) => ({ ...prev, pitchPercent: clamped, currentBpm: newBpm }))
    } else {
      const newBpm = Number((deckB.bpm * (1 + clamped / 100)).toFixed(2))
      setDeckB((prev) => ({ ...prev, pitchPercent: clamped, currentBpm: newBpm }))
    }
  }

  // Pitch nudge / bend (+/- temporary adjustment)
  const handlePitchNudge = (deck: 'A' | 'B', delta: number) => {
    if (deck === 'A') {
      handlePitchChange('A', deckA.pitchPercent + delta)
    } else {
      handlePitchChange('B', deckB.pitchPercent + delta)
    }
  }

  // Sync BPM of Deck B to Deck A or vice-versa
  const handleSync = (targetDeck: 'A' | 'B') => {
    if (targetDeck === 'B') {
      const desiredBpm = deckA.currentBpm
      const requiredPitch = Number((((desiredBpm - deckB.bpm) / deckB.bpm) * 100).toFixed(2))
      handlePitchChange('B', requiredPitch)
    } else {
      const desiredBpm = deckB.currentBpm
      const requiredPitch = Number((((desiredBpm - deckA.bpm) / deckA.bpm) * 100).toFixed(2))
      handlePitchChange('A', requiredPitch)
    }
  }

  // Hot Cue trigger or set
  const handleHotCue = (deck: 'A' | 'B', cueIndex: number) => {
    if (deck === 'A') {
      setDeckA((prev) => {
        const currentCue = prev.hotCues[cueIndex]
        if (currentCue !== null && currentCue !== undefined) {
          return { ...prev, currentTime: currentCue, isPlaying: true }
        }
        const updated = [...prev.hotCues]
        updated[cueIndex] = Math.round(prev.currentTime)
        return { ...prev, hotCues: updated }
      })
    } else {
      setDeckB((prev) => {
        const currentCue = prev.hotCues[cueIndex]
        if (currentCue !== null && currentCue !== undefined) {
          return { ...prev, currentTime: currentCue, isPlaying: true }
        }
        const updated = [...prev.hotCues]
        updated[cueIndex] = Math.round(prev.currentTime)
        return { ...prev, hotCues: updated }
      })
    }
  }

  // Auto Beat Loop toggle
  const handleLoopToggle = (deck: 'A' | 'B', bars: number) => {
    if (deck === 'A') {
      setDeckA((prev) => ({ ...prev, activeLoop: prev.activeLoop === bars ? null : bars }))
    } else {
      setDeckB((prev) => ({ ...prev, activeLoop: prev.activeLoop === bars ? null : bars }))
    }
  }

  // Load track into deck
  const loadTrack = (deck: 'A' | 'B', trackIndex: number) => {
    const t = DEMO_TRACKS[trackIndex]
    if (deck === 'A') {
      setDeckA((prev) => ({
        ...prev,
        title: t.title,
        artist: t.artist,
        bpm: t.bpm,
        currentBpm: t.bpm,
        pitchPercent: 0.0,
        duration: t.duration,
        currentTime: 0,
        isPlaying: false,
      }))
    } else {
      setDeckB((prev) => ({
        ...prev,
        title: t.title,
        artist: t.artist,
        bpm: t.bpm,
        currentBpm: t.bpm,
        pitchPercent: 0.0,
        duration: t.duration,
        currentTime: 0,
        isPlaying: false,
      }))
    }
  }

  // BPM delta calculation
  const bpmDifference = Math.abs(deckA.currentBpm - deckB.currentBpm).toFixed(2)
  const isBpmMatched = Number(bpmDifference) <= 0.05

  return (
    <div className="djlab-container">
      {/* TOP HEADER & ROUTING CONTROLS */}
      <div className="djlab-header-bar">
        <div className="djlab-title-group">
          <div className="academy-badge-group">
            <span className="badge-new-pill">NEW</span>
            <span className="academy-tag">DJ LAB & STUDIO</span>
          </div>
          <h2>Beatmatching & Dual-Deck Studio</h2>
          <span className="djlab-subtitle">
            Esercitati nel pitch control continuo (±8%), allineamento BPM millimetrico e pre-ascolto separato via Web Audio.
          </span>
        </div>

        {/* AUDIO ROUTING SETTINGS */}
        <div className="djlab-routing-box">
          <div className="routing-mode-selector">
            <span className="routing-label">Uscita Audio:</span>
            <div className="routing-chips">
              <button
                type="button"
                className={`routing-chip-btn ${routingMode === 'single' ? 'active' : ''}`}
                onClick={() => setRoutingMode('single')}
                title="Ascolto tramite singola uscita cuffie con manopola Cue Mix virtuale"
              >
                🎧 Singola Cuffia (Cue Mix)
              </button>
              <button
                type="button"
                className={`routing-chip-btn ${routingMode === 'multi' ? 'active' : ''}`}
                onClick={() => setRoutingMode('multi')}
                title="Due uscite separate (es. Cassa Bluetooth per Master + AirPods per Cue)"
              >
                🔊 Multi-Device (Cassa + AirPods)
              </button>
              <button
                type="button"
                className={`routing-chip-btn ${routingMode === 'split' ? 'active' : ''}`}
                onClick={() => setRoutingMode('split')}
                title="Split cavo DJ: Canale Sinistro (Master Casse) / Canale Destro (Cue Cuffie)"
              >
                🔀 Split Stereo L/R
              </button>
            </div>
          </div>

          {routingMode === 'multi' && (
            <div className="device-pickers-row">
              <label className="device-select-label">
                <span>🔊 Master (Casse):</span>
                <select value={masterDeviceId} onChange={(e) => setMasterDeviceId(e.target.value)}>
                  {outputDevices.length === 0 && <option value="default">Altoparlanti di sistema (Predefinito)</option>}
                  {outputDevices.map((d) => (
                    <option key={`master-${d.deviceId}`} value={d.deviceId}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="device-select-label">
                <span>🎧 Cue (Cuffie / AirPods):</span>
                <select value={cueDeviceId} onChange={(e) => setCueDeviceId(e.target.value)}>
                  {outputDevices.length === 0 && <option value="default">Cuffie / Auricolari Bluetooth</option>}
                  {outputDevices.map((d) => (
                    <option key={`cue-${d.deviceId}`} value={d.deviceId}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* BPM PHASE STATUS INDICATOR */}
      <div className="bpm-phase-bar">
        <div className="phase-indicator-box">
          <span className="phase-label">DIFFERENZA BPM:</span>
          <span className={`phase-diff-value ${isBpmMatched ? 'matched' : 'unmatched'}`}>
            {bpmDifference} BPM {isBpmMatched ? '✓ IN FASE' : '⚠️ FUORI TEMPO'}
          </span>
        </div>

        <div className="deck-sync-actions">
          <button type="button" className="sync-pill-btn" onClick={() => handleSync('B')}>
            Sync Deck B ➔ A ({deckA.currentBpm} BPM)
          </button>
          <button type="button" className="sync-pill-btn" onClick={() => handleSync('A')}>
            Sync Deck A ➔ B ({deckB.currentBpm} BPM)
          </button>
        </div>
      </div>

      {/* MAIN DUAL DECK & MIXER LAYOUT */}
      <div className="djlab-main-deck-grid">
        {/* =========================================================================
            DECK A (LEFT)
            ========================================================================= */}
        <section className="dj-deck-unit deck-a">
          <div className="deck-top-info">
            <div className="deck-tag-row">
              <span className="deck-letter-badge a">DECK A</span>
              <span className="deck-track-title">{deckA.title}</span>
            </div>
            <span className="deck-artist-sub">{deckA.artist}</span>
          </div>

          {/* WAVEFORM VISUALIZER MOCKUP */}
          <div className="deck-waveform-container">
            <div className="waveform-center-playhead"></div>
            <div className="waveform-bars-visual">
              {Array.from({ length: 44 }).map((_, i) => {
                const height = 14 + Math.sin(i * 0.4) * 18 + ((i % 4 === 0) ? 10 : 0)
                const isBeat = i % 4 === 0
                return (
                  <span
                    key={`wa-${i}`}
                    className={`wave-bar ${isBeat ? 'beat-marker' : ''}`}
                    style={{ height: `${height}px` }}
                  ></span>
                )
              })}
            </div>
          </div>

          {/* DECK A CONTROLS & PITCH */}
          <div className="deck-controls-row">
            <div className="deck-transport-column">
              <div className="transport-main-btns">
                <button
                  type="button"
                  className={`btn-transport cue ${deckA.isCueing ? 'active' : ''}`}
                  onClick={() => setDeckA((prev) => ({ ...prev, isCueing: !prev.isCueing }))}
                >
                  CUE
                </button>
                <button
                  type="button"
                  className={`btn-transport play ${deckA.isPlaying ? 'playing' : ''}`}
                  onClick={() => setDeckA((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))}
                >
                  {deckA.isPlaying ? '❚❚ PAUSE' : '▶ PLAY'}
                </button>
              </div>

              {/* PITCH BEND BUTTONS */}
              <div className="pitch-bend-btns">
                <button type="button" className="btn-bend" onClick={() => handlePitchNudge('A', -0.15)}>
                  − BEND
                </button>
                <button type="button" className="btn-bend" onClick={() => handlePitchNudge('A', +0.15)}>
                  + BEND
                </button>
              </div>

              {/* AUTO BEAT LOOP ROW */}
              <div className="beat-loop-section">
                <span className="mini-label">AUTO BEAT LOOP:</span>
                <div className="loop-btns-row">
                  {[2, 4, 8, 16].map((bars) => (
                    <button
                      key={`loop-a-${bars}`}
                      type="button"
                      className={`btn-loop ${deckA.activeLoop === bars ? 'active' : ''}`}
                      onClick={() => handleLoopToggle('A', bars)}
                    >
                      {bars}B
                    </button>
                  ))}
                </div>
              </div>

              {/* HOT CUE PADS (4 PADS) */}
              <div className="hot-cues-section">
                <span className="mini-label">HOT CUES (PADS):</span>
                <div className="hot-cues-grid">
                  {['A', 'B', 'C', 'D'].map((padLabel, idx) => {
                    const cueVal = deckA.hotCues[idx]
                    const hasCue = cueVal !== null && cueVal !== undefined
                    return (
                      <button
                        key={`hotcue-a-${idx}`}
                        type="button"
                        className={`btn-hot-cue ${hasCue ? 'set' : 'empty'}`}
                        onClick={() => handleHotCue('A', idx)}
                        title={hasCue ? `Salta a Cue ${padLabel} (${cueVal}s)` : `Imposta Cue ${padLabel} al punto corrente`}
                      >
                        <span className="pad-letter">{padLabel}</span>
                        <span className="pad-time">{hasCue ? `${cueVal}s` : '--'}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* TRACK SELECTOR */}
              <div className="track-load-box">
                <span className="mini-label">Carica Traccia:</span>
                <div className="track-picker-chips">
                  {DEMO_TRACKS.map((t, idx) => (
                    <button
                      key={`load-a-${t.id}`}
                      type="button"
                      className="track-chip-btn"
                      onClick={() => loadTrack('A', idx)}
                    >
                      {idx + 1}. {t.title.slice(0, 15)}… ({t.bpm})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PITCH SLIDER A */}
            <div className="pitch-fader-column">
              <div className="pitch-readout">
                <span className="bpm-number">{deckA.currentBpm.toFixed(2)}</span>
                <span className="pitch-percent-tag">
                  {deckA.pitchPercent >= 0 ? `+${deckA.pitchPercent.toFixed(2)}%` : `${deckA.pitchPercent.toFixed(2)}%`}
                </span>
              </div>

              <div className="pitch-slider-track-box">
                <span className="pitch-limit-label">+8%</span>
                <input
                  type="range"
                  min="-8.00"
                  max="8.00"
                  step="0.05"
                  value={deckA.pitchPercent}
                  onChange={(e) => handlePitchChange('A', parseFloat(e.target.value))}
                  className="vertical-pitch-slider"
                  aria-label="Pitch fader Deck A"
                />
                <span className="pitch-limit-label">−8%</span>
              </div>

              <button
                type="button"
                className="btn-pitch-reset"
                onClick={() => handlePitchChange('A', 0)}
                title="Ripristina a 0.00%"
              >
                RESET 0%
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            CENTRAL MIXER UNIT
            ========================================================================= */}
        <section className="dj-mixer-unit">
          <div className="mixer-header">
            <span className="mixer-title-tag">2-CH MIXER & COLOR FX</span>
          </div>

          {/* CHANNEL STRIPS (EQ & GAIN) */}
          <div className="mixer-channels-grid">
            {/* CH 1 (DECK A) */}
            <div className="channel-strip">
              <span className="ch-name">CH 1</span>
              <div className="eq-knobs-stack">
                <label className="knob-label">
                  <span>HIGH</span>
                  <input
                    type="range"
                    min="-12"
                    max="6"
                    step="1"
                    value={deckA.eqHigh}
                    onChange={(e) => setDeckA({ ...deckA, eqHigh: parseInt(e.target.value, 10) })}
                    className="eq-slider"
                  />
                  <span className="knob-val">{deckA.eqHigh}dB</span>
                </label>
                <label className="knob-label">
                  <span>MID</span>
                  <input
                    type="range"
                    min="-12"
                    max="6"
                    step="1"
                    value={deckA.eqMid}
                    onChange={(e) => setDeckA({ ...deckA, eqMid: parseInt(e.target.value, 10) })}
                    className="eq-slider"
                  />
                  <span className="knob-val">{deckA.eqMid}dB</span>
                </label>
                <label className="knob-label">
                  <span>LOW</span>
                  <input
                    type="range"
                    min="-12"
                    max="6"
                    step="1"
                    value={deckA.eqLow}
                    onChange={(e) => setDeckA({ ...deckA, eqLow: parseInt(e.target.value, 10) })}
                    className="eq-slider"
                  />
                  <span className="knob-val">{deckA.eqLow}dB</span>
                </label>
                {/* COLOR FX / FILTER KNOB (LPF / HPF) */}
                <label className="knob-label filter-color-fx">
                  <span>FILTER (LPF/HPF)</span>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={deckA.filterFx}
                    onChange={(e) => setDeckA({ ...deckA, filterFx: parseInt(e.target.value, 10) })}
                    className="filter-slider"
                  />
                  <span className="knob-val">{deckA.filterFx === 0 ? 'FLAT' : deckA.filterFx < 0 ? `LPF ${deckA.filterFx}` : `HPF +${deckA.filterFx}`}</span>
                </label>
              </div>

              {/* CUE HEADPHONES BUTTON A */}
              <button
                type="button"
                className={`btn-ch-cue ${deckA.isCueing ? 'active' : ''}`}
                onClick={() => setDeckA((prev) => ({ ...prev, isCueing: !prev.isCueing }))}
                aria-label="Cuffia pre-ascolto Canale 1"
              >
                🎧 CUE 1
              </button>

              {/* VOLUME FADER A */}
              <div className="ch-volume-fader-box">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={deckA.volume}
                  onChange={(e) => setDeckA({ ...deckA, volume: parseInt(e.target.value, 10) })}
                  className="channel-volume-fader"
                  aria-label="Fader volume Canale 1"
                />
              </div>
            </div>

            {/* MASTER & CUE MIX CONTROLS (CENTER) */}
            <div className="mixer-center-column">
              <div className="cue-mix-box">
                <span className="mini-label">CUE / MASTER MIX</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cueMix}
                  onChange={(e) => setCueMix(parseInt(e.target.value, 10))}
                  className="cue-mix-slider"
                  aria-label="Manopola Cue / Master Mix"
                />
                <div className="cue-mix-readout">
                  <span>CUE {100 - cueMix}%</span>
                  <span>MST {cueMix}%</span>
                </div>
              </div>

              {/* MASTER LEVEL */}
              <label className="master-volume-label">
                <span>MASTER VOL</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterVolume}
                  onChange={(e) => setMasterVolume(parseInt(e.target.value, 10))}
                />
                <span className="knob-val">{masterVolume}%</span>
              </label>
            </div>

            {/* CH 2 (DECK B) */}
            <div className="channel-strip">
              <span className="ch-name">CH 2</span>
              <div className="eq-knobs-stack">
                <label className="knob-label">
                  <span>HIGH</span>
                  <input
                    type="range"
                    min="-12"
                    max="6"
                    step="1"
                    value={deckB.eqHigh}
                    onChange={(e) => setDeckB({ ...deckB, eqHigh: parseInt(e.target.value, 10) })}
                    className="eq-slider"
                  />
                  <span className="knob-val">{deckB.eqHigh}dB</span>
                </label>
                <label className="knob-label">
                  <span>MID</span>
                  <input
                    type="range"
                    min="-12"
                    max="6"
                    step="1"
                    value={deckB.eqMid}
                    onChange={(e) => setDeckB({ ...deckB, eqMid: parseInt(e.target.value, 10) })}
                    className="eq-slider"
                  />
                  <span className="knob-val">{deckB.eqMid}dB</span>
                </label>
                <label className="knob-label">
                  <span>LOW</span>
                  <input
                    type="range"
                    min="-12"
                    max="6"
                    step="1"
                    value={deckB.eqLow}
                    onChange={(e) => setDeckB({ ...deckB, eqLow: parseInt(e.target.value, 10) })}
                    className="eq-slider"
                  />
                  <span className="knob-val">{deckB.eqLow}dB</span>
                </label>
                {/* COLOR FX / FILTER KNOB (LPF / HPF) */}
                <label className="knob-label filter-color-fx">
                  <span>FILTER (LPF/HPF)</span>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={deckB.filterFx}
                    onChange={(e) => setDeckB({ ...deckB, filterFx: parseInt(e.target.value, 10) })}
                    className="filter-slider"
                  />
                  <span className="knob-val">{deckB.filterFx === 0 ? 'FLAT' : deckB.filterFx < 0 ? `LPF ${deckB.filterFx}` : `HPF +${deckB.filterFx}`}</span>
                </label>
              </div>

              {/* CUE HEADPHONES BUTTON B */}
              <button
                type="button"
                className={`btn-ch-cue ${deckB.isCueing ? 'active' : ''}`}
                onClick={() => setDeckB((prev) => ({ ...prev, isCueing: !prev.isCueing }))}
                aria-label="Cuffia pre-ascolto Canale 2"
              >
                🎧 CUE 2
              </button>

              {/* VOLUME FADER B */}
              <div className="ch-volume-fader-box">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={deckB.volume}
                  onChange={(e) => setDeckB({ ...deckB, volume: parseInt(e.target.value, 10) })}
                  className="channel-volume-fader"
                  aria-label="Fader volume Canale 2"
                />
              </div>
            </div>
          </div>

          {/* CROSSFADER */}
          <div className="crossfader-section">
            <div className="crossfader-labels">
              <span>DECK A</span>
              <span>CROSSFADER</span>
              <span>DECK B</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              step="1"
              value={crossfader}
              onChange={(e) => setCrossfader(parseInt(e.target.value, 10))}
              className="crossfader-slider"
              aria-label="Crossfader"
            />
          </div>
        </section>

        {/* =========================================================================
            DECK B (RIGHT)
            ========================================================================= */}
        <section className="dj-deck-unit deck-b">
          <div className="deck-top-info">
            <div className="deck-tag-row">
              <span className="deck-letter-badge b">DECK B</span>
              <span className="deck-track-title">{deckB.title}</span>
            </div>
            <span className="deck-artist-sub">{deckB.artist}</span>
          </div>

          {/* WAVEFORM VISUALIZER MOCKUP */}
          <div className="deck-waveform-container">
            <div className="waveform-center-playhead"></div>
            <div className="waveform-bars-visual">
              {Array.from({ length: 44 }).map((_, i) => {
                const height = 14 + Math.cos(i * 0.45) * 18 + ((i % 4 === 0) ? 10 : 0)
                const isBeat = i % 4 === 0
                return (
                  <span
                    key={`wb-${i}`}
                    className={`wave-bar ${isBeat ? 'beat-marker' : ''}`}
                    style={{ height: `${height}px` }}
                  ></span>
                )
              })}
            </div>
          </div>

          {/* DECK B CONTROLS & PITCH */}
          <div className="deck-controls-row">
            <div className="deck-transport-column">
              <div className="transport-main-btns">
                <button
                  type="button"
                  className={`btn-transport cue ${deckB.isCueing ? 'active' : ''}`}
                  onClick={() => setDeckB((prev) => ({ ...prev, isCueing: !prev.isCueing }))}
                >
                  CUE
                </button>
                <button
                  type="button"
                  className={`btn-transport play ${deckB.isPlaying ? 'playing' : ''}`}
                  onClick={() => setDeckB((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))}
                >
                  {deckB.isPlaying ? '❚❚ PAUSE' : '▶ PLAY'}
                </button>
              </div>

              {/* PITCH BEND BUTTONS */}
              <div className="pitch-bend-btns">
                <button type="button" className="btn-bend" onClick={() => handlePitchNudge('B', -0.15)}>
                  − BEND
                </button>
                <button type="button" className="btn-bend" onClick={() => handlePitchNudge('B', +0.15)}>
                  + BEND
                </button>
              </div>

              {/* AUTO BEAT LOOP ROW */}
              <div className="beat-loop-section">
                <span className="mini-label">AUTO BEAT LOOP:</span>
                <div className="loop-btns-row">
                  {[2, 4, 8, 16].map((bars) => (
                    <button
                      key={`loop-b-${bars}`}
                      type="button"
                      className={`btn-loop ${deckB.activeLoop === bars ? 'active' : ''}`}
                      onClick={() => handleLoopToggle('B', bars)}
                    >
                      {bars}B
                    </button>
                  ))}
                </div>
              </div>

              {/* HOT CUE PADS (4 PADS) */}
              <div className="hot-cues-section">
                <span className="mini-label">HOT CUES (PADS):</span>
                <div className="hot-cues-grid">
                  {['A', 'B', 'C', 'D'].map((padLabel, idx) => {
                    const cueVal = deckB.hotCues[idx]
                    const hasCue = cueVal !== null && cueVal !== undefined
                    return (
                      <button
                        key={`hotcue-b-${idx}`}
                        type="button"
                        className={`btn-hot-cue ${hasCue ? 'set' : 'empty'}`}
                        onClick={() => handleHotCue('B', idx)}
                        title={hasCue ? `Salta a Cue ${padLabel} (${cueVal}s)` : `Imposta Cue ${padLabel} al punto corrente`}
                      >
                        <span className="pad-letter">{padLabel}</span>
                        <span className="pad-time">{hasCue ? `${cueVal}s` : '--'}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* TRACK SELECTOR */}
              <div className="track-load-box">
                <span className="mini-label">Carica Traccia:</span>
                <div className="track-picker-chips">
                  {DEMO_TRACKS.map((t, idx) => (
                    <button
                      key={`load-b-${t.id}`}
                      type="button"
                      className="track-chip-btn"
                      onClick={() => loadTrack('B', idx)}
                    >
                      {idx + 1}. {t.title.slice(0, 15)}… ({t.bpm})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PITCH SLIDER B */}
            <div className="pitch-fader-column">
              <div className="pitch-readout">
                <span className="bpm-number">{deckB.currentBpm.toFixed(2)}</span>
                <span className="pitch-percent-tag">
                  {deckB.pitchPercent >= 0 ? `+${deckB.pitchPercent.toFixed(2)}%` : `${deckB.pitchPercent.toFixed(2)}%`}
                </span>
              </div>

              <div className="pitch-slider-track-box">
                <span className="pitch-limit-label">+8%</span>
                <input
                  type="range"
                  min="-8.00"
                  max="8.00"
                  step="0.05"
                  value={deckB.pitchPercent}
                  onChange={(e) => handlePitchChange('B', parseFloat(e.target.value))}
                  className="vertical-pitch-slider"
                  aria-label="Pitch fader Deck B"
                />
                <span className="pitch-limit-label">−8%</span>
              </div>

              <button
                type="button"
                className="btn-pitch-reset"
                onClick={() => handlePitchChange('B', 0)}
                title="Ripristina a 0.00%"
              >
                RESET 0%
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
