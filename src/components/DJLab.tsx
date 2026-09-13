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
  camelotKey: string
  volume: number
  trim: number // 0 to 100
  eqHigh: number // -12dB to +6dB
  eqMid: number
  eqLow: number
  filterFx: number // -50 (LPF) to +50 (HPF)
  activeLoop: number | null // 2, 4, 8, 16 bars
  padMode: 'hotcue' | 'beatloop' | 'sliploop' | 'beatjump'
  hotCues: (number | null)[] // up to 8 cues
  audioUrl?: string
}

const DEMO_TRACKS = [
  {
    id: 'track-1',
    title: 'Above The Cloud (Original Mix)',
    artist: 'Alex Rossi',
    bpm: 124.0,
    duration: 378,
    camelotKey: '8A',
    genre: 'Microhouse',
  },
  {
    id: 'track-2',
    title: 'Rainy Season (Original Club Mix)',
    artist: 'MANIA Collective',
    bpm: 124.0,
    duration: 412,
    camelotKey: '8B',
    genre: 'Minimal Techno',
  },
  {
    id: 'track-3',
    title: 'Submarine Bassline (Pre-master)',
    artist: 'Marco Donati',
    bpm: 126.0,
    duration: 360,
    camelotKey: '11B',
    genre: 'Deep Tech',
  },
  {
    id: 'track-4',
    title: 'Houghton Forest Drift',
    artist: 'Dan Ghenacia & Shonky',
    bpm: 125.0,
    duration: 440,
    camelotKey: '2A',
    genre: 'Underground House',
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
  const [masterVolume, setMasterVolume] = useState<number>(85)
  const [boothVolume, setBoothVolume] = useState<number>(70)

  // Beat FX Section (Center Right)
  const [selectedFx, setSelectedFx] = useState<string>('FLANGER')
  const [fxBeatFraction, setFxBeatFraction] = useState<string>('1/2')
  const [fxOn, setFxOn] = useState<boolean>(false)

  // Screen Tab Mode (Touchscreen Top)
  const [screenTab, setScreenTab] = useState<'wave' | 'browse' | 'playlist'>('wave')

  // Deck A State (Left)
  const [deckA, setDeckA] = useState<DeckState>({
    title: DEMO_TRACKS[0].title,
    artist: DEMO_TRACKS[0].artist,
    bpm: DEMO_TRACKS[0].bpm,
    currentBpm: DEMO_TRACKS[0].bpm,
    pitchPercent: 0.0,
    isPlaying: false,
    isCueing: false,
    currentTime: 142,
    duration: DEMO_TRACKS[0].duration,
    keyLock: true,
    camelotKey: DEMO_TRACKS[0].camelotKey,
    volume: 85,
    trim: 75,
    eqHigh: 0,
    eqMid: 0,
    eqLow: 0,
    filterFx: 0,
    activeLoop: null,
    padMode: 'hotcue',
    hotCues: [0, 32, 64, 128, null, null, null, null],
  })

  // Deck B State (Right)
  const [deckB, setDeckB] = useState<DeckState>({
    title: DEMO_TRACKS[1].title,
    artist: DEMO_TRACKS[1].artist,
    bpm: DEMO_TRACKS[1].bpm,
    currentBpm: DEMO_TRACKS[1].bpm,
    pitchPercent: 0.0,
    isPlaying: false,
    isCueing: false,
    currentTime: 88,
    duration: DEMO_TRACKS[1].duration,
    keyLock: true,
    camelotKey: DEMO_TRACKS[1].camelotKey,
    volume: 85,
    trim: 75,
    eqHigh: 0,
    eqMid: 0,
    eqLow: 0,
    filterFx: 0,
    activeLoop: null,
    padMode: 'hotcue',
    hotCues: [0, 16, 48, 96, null, null, null, null],
  })

  // Playback timer ticker for active decks
  useEffect(() => {
    const interval = setInterval(() => {
      if (deckA.isPlaying) {
        setDeckA((prev) => ({
          ...prev,
          currentTime: prev.currentTime >= prev.duration ? 0 : prev.currentTime + 1,
        }))
      }
      if (deckB.isPlaying) {
        setDeckB((prev) => ({
          ...prev,
          currentTime: prev.currentTime >= prev.duration ? 0 : prev.currentTime + 1,
        }))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [deckA.isPlaying, deckB.isPlaying])

  // Pitch calculation
  const handlePitchChange = (deckLetter: 'A' | 'B', percent: number) => {
    if (deckLetter === 'A') {
      const newBpm = Number((deckA.bpm * (1 + percent / 100)).toFixed(2))
      setDeckA((prev) => ({ ...prev, pitchPercent: percent, currentBpm: newBpm }))
    } else {
      const newBpm = Number((deckB.bpm * (1 + percent / 100)).toFixed(2))
      setDeckB((prev) => ({ ...prev, pitchPercent: percent, currentBpm: newBpm }))
    }
  }

  // Pitch Nudge / Bend (+ / -)
  const handlePitchNudge = (deckLetter: 'A' | 'B', amount: number) => {
    if (deckLetter === 'A') {
      const clamped = Math.max(-8, Math.min(8, deckA.pitchPercent + amount))
      handlePitchChange('A', Number(clamped.toFixed(2)))
    } else {
      const clamped = Math.max(-8, Math.min(8, deckB.pitchPercent + amount))
      handlePitchChange('B', Number(clamped.toFixed(2)))
    }
  }

  // Master Sync Deck to other Deck
  const handleSync = (targetDeck: 'A' | 'B') => {
    if (targetDeck === 'A') {
      const deltaPercent = ((deckB.currentBpm - deckA.bpm) / deckA.bpm) * 100
      handlePitchChange('A', Number(deltaPercent.toFixed(2)))
    } else {
      const deltaPercent = ((deckA.currentBpm - deckB.bpm) / deckB.bpm) * 100
      handlePitchChange('B', Number(deltaPercent.toFixed(2)))
    }
  }

  // Hot Cues
  const handleHotCue = (deckLetter: 'A' | 'B', padIndex: number) => {
    const deck = deckLetter === 'A' ? deckA : deckB
    const setDeck = deckLetter === 'A' ? setDeckA : setDeckB

    const existingTime = deck.hotCues[padIndex]
    if (existingTime !== null && existingTime !== undefined) {
      setDeck((prev) => ({ ...prev, currentTime: existingTime, isPlaying: true }))
    } else {
      const newCues = [...deck.hotCues]
      newCues[padIndex] = deck.currentTime
      setDeck((prev) => ({ ...prev, hotCues: newCues }))
    }
  }

  // Load track
  const loadTrack = (deckLetter: 'A' | 'B', trackIndex: number) => {
    const tr = DEMO_TRACKS[trackIndex]
    if (!tr) return
    const update = {
      title: tr.title,
      artist: tr.artist,
      bpm: tr.bpm,
      currentBpm: tr.bpm,
      pitchPercent: 0,
      currentTime: 0,
      duration: tr.duration,
      camelotKey: tr.camelotKey,
      isPlaying: false,
    }
    if (deckLetter === 'A') {
      setDeckA((prev) => ({ ...prev, ...update }))
    } else {
      setDeckB((prev) => ({ ...prev, ...update }))
    }
    setScreenTab('wave')
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    const ms = Math.floor((secs % 1) * 100)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  const bpmDifference = Math.abs(deckA.currentBpm - deckB.currentBpm).toFixed(2)
  const isBpmMatched = parseFloat(bpmDifference) === 0.0

  return (
    <div className="djlab-wrapper" aria-label="Beatmatching & Dual-Deck Studio">
      <h1 className="sr-only">Beatmatching & Dual-Deck Studio</h1>
      <div className="rx3-console-chassis">
        {/* =========================================================================
            TOP PANORAMIC 10.1" TOUCHSCREEN (XDJ-RX3 HEAD UNIT)
            ========================================================================= */}
        <header className="rx3-screen-unit">
        <div className="rx3-screen-bezel">
          {/* Top Header Buttons Bar */}
          <div className="rx3-screen-header-nav">
            <div className="rx3-screen-tabs-left">
              <button
                type="button"
                className={`rx3-touch-tab ${screenTab === 'browse' ? 'active' : ''}`}
                onClick={() => setScreenTab(screenTab === 'browse' ? 'wave' : 'browse')}
              >
                BROWSE
              </button>
              <button
                type="button"
                className={`rx3-touch-tab ${screenTab === 'playlist' ? 'active' : ''}`}
                onClick={() => setScreenTab(screenTab === 'playlist' ? 'wave' : 'playlist')}
              >
                PLAYLIST
              </button>
              <button
                type="button"
                className={`rx3-touch-tab ${screenTab === 'wave' ? 'active' : ''}`}
                onClick={() => setScreenTab('wave')}
              >
                WAVEFORM
              </button>
            </div>
            <div className="rx3-screen-logo">
              <span className="rx3-model-pill">Pioneer DJ • XDJ-RX3 DISPLAY</span>
            </div>
            <div className="rx3-screen-tabs-right">
              <span className="rx3-mini-clock">124.0 BPM • MASTER</span>
              <button type="button" className="rx3-touch-tab menu">MENU</button>
            </div>
          </div>

          {/* SCREEN CONTENT: BROWSE MODAL OR DUAL HORIZONTAL WAVEFORMS */}
          {screenTab === 'browse' || screenTab === 'playlist' ? (
            <div className="rx3-screen-browser">
              <div className="rx3-browser-header">
                <span>📁 DROPS CLOUD ARCHIVE • SELECT TRACK</span>
                <button type="button" className="rx3-browser-close" onClick={() => setScreenTab('wave')}>✕ CLOSE</button>
              </div>
              <div className="rx3-browser-list">
                {DEMO_TRACKS.map((t, idx) => (
                  <div key={t.id} className="rx3-browser-row">
                    <div className="rx3-browser-meta">
                      <span className="rx3-b-title">{t.title}</span>
                      <span className="rx3-b-sub">{t.artist} • {t.genre} • <strong>{t.camelotKey}</strong> • {t.bpm} BPM</span>
                    </div>
                    <div className="rx3-browser-load-btns">
                      <button type="button" className="rx3-load-btn deck-1" onClick={() => loadTrack('A', idx)}>
                        LOAD 1
                      </button>
                      <button type="button" className="rx3-load-btn deck-2" onClick={() => loadTrack('B', idx)}>
                        LOAD 2
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rx3-dual-waveform-stage">
              {/* WAVEFORM 1 (DECK A - ORANGE) */}
              <div className="rx3-wave-row deck-1">
                <div className="rx3-wave-header-strip">
                  <div className="rx3-wh-left">
                    <span className="rx3-deck-badge d1">DECK A</span>
                    <span className="rx3-track-name">{deckA.title}</span>
                  </div>
                  <div className="rx3-wh-right">
                    <span className="rx3-key-badge">{deckA.camelotKey}</span>
                    <span className="rx3-bpm-badge">{deckA.currentBpm.toFixed(1)} BPM</span>
                    <span className="rx3-time-readout">{formatTime(deckA.currentTime)}</span>
                  </div>
                </div>
                <div className="rx3-wave-canvas-wrapper">
                  <div className="rx3-center-needle"></div>
                  <div className={`rx3-waveform-scrollable orange ${deckA.isPlaying ? 'scrolling' : ''}`}>
                    {Array.from({ length: 96 }).map((_, i) => {
                      const h = 10 + Math.sin(i * 0.28) * 26 + (i % 4 === 0 ? 12 : 0) + (i % 16 === 0 ? 14 : 0)
                      const isBeat = i % 4 === 0
                      const isBar = i % 16 === 0
                      return (
                        <div
                          key={`w1-${i}`}
                          className={`rx3-wave-bar ${isBeat ? 'beat' : ''} ${isBar ? 'bar' : ''}`}
                          style={{ height: `${Math.min(58, h)}px` }}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* BEAT PHASE METER (CENTER LINE IN XDJ-RX3) */}
              <div className="rx3-screen-phase-meter">
                <div className="rx3-phase-track">
                  <div className="rx3-phase-grid">
                    <span className="dot active"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                  <span className={`rx3-phase-sync-status ${isBpmMatched ? 'matched' : 'drift'}`}>
                    {isBpmMatched ? 'BEAT SYNC • IN PHASE' : `DIFFERENZA BPM: ${bpmDifference}`}
                  </span>
                </div>
              </div>

              {/* WAVEFORM 2 (DECK B - BLUE) */}
              <div className="rx3-wave-row deck-2">
                <div className="rx3-wave-header-strip">
                  <div className="rx3-wh-left">
                    <span className="rx3-deck-badge d2">DECK B</span>
                    <span className="rx3-track-name">{deckB.title}</span>
                  </div>
                  <div className="rx3-wh-right">
                    <span className="rx3-key-badge">{deckB.camelotKey}</span>
                    <span className="rx3-bpm-badge">{deckB.currentBpm.toFixed(1)} BPM</span>
                    <span className="rx3-time-readout">{formatTime(deckB.currentTime)}</span>
                  </div>
                </div>
                <div className="rx3-wave-canvas-wrapper">
                  <div className="rx3-center-needle"></div>
                  <div className={`rx3-waveform-scrollable blue ${deckB.isPlaying ? 'scrolling' : ''}`}>
                    {Array.from({ length: 96 }).map((_, i) => {
                      const h = 12 + Math.cos(i * 0.32) * 24 + (i % 4 === 0 ? 10 : 0) + (i % 16 === 0 ? 16 : 0)
                      const isBeat = i % 4 === 0
                      const isBar = i % 16 === 0
                      return (
                        <div
                          key={`w2-${i}`}
                          className={`rx3-wave-bar ${isBeat ? 'beat' : ''} ${isBar ? 'bar' : ''}`}
                          style={{ height: `${Math.min(58, h)}px` }}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Screen Bottom Quick Load Buttons */}
          <div className="rx3-screen-footer">
            <div className="rx3-deck-load-pill">
              <button type="button" className="rx3-quick-load-btn" onClick={() => loadTrack('A', 0)}>
                LOAD DECK 1
              </button>
              <span className="rx3-deck-pitch-status">{deckA.pitchPercent >= 0 ? `+${deckA.pitchPercent.toFixed(2)}%` : `${deckA.pitchPercent.toFixed(2)}%`}</span>
            </div>
            <div className="rx3-screen-fx-status">
              <span className="rx3-fx-tag">BEAT FX: <strong>{selectedFx}</strong> ({fxBeatFraction})</span>
            </div>
            <div className="rx3-deck-load-pill">
              <span className="rx3-deck-pitch-status">{deckB.pitchPercent >= 0 ? `+${deckB.pitchPercent.toFixed(2)}%` : `${deckB.pitchPercent.toFixed(2)}%`}</span>
              <button type="button" className="rx3-quick-load-btn" onClick={() => loadTrack('B', 1)}>
                LOAD DECK 2
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          LOWER HARDWARE UNIT (DECK 1 | MIXER | DECK 2)
          ========================================================================= */}
      <main className="rx3-lower-hardware-grid">
        {/* =====================================================================
            LEFT DECK (DECK 1 / A)
            ===================================================================== */}
        <section className="rx3-deck-hardware deck-left">
          <div className="rx3-deck-top-strip">
            <div className="rx3-deck-id-title">
              <span className="rx3-deck-number-pill a">DECK A</span>
              <span className="rx3-tag-genre">VINYL / USB 1</span>
            </div>
            <div className="rx3-sync-group">
              <button
                type="button"
                className={`rx3-round-metal-btn sync ${isBpmMatched ? 'engaged' : ''}`}
                onClick={() => handleSync('A')}
                title="Sincronizza BPM con Deck B"
              >
                Sync Deck A ➔ B ({deckB.currentBpm} BPM)
              </button>
              <button
                type="button"
                className={`rx3-round-metal-btn master ${!isBpmMatched ? 'active' : ''}`}
                onClick={() => handleSync('B')}
              >
                MASTER
              </button>
            </div>
          </div>

          {/* PIONEER JOG WHEEL (DECK 1) */}
          <div className="rx3-jog-outer-ring">
            <div className={`rx3-jog-inner-platter ${deckA.isPlaying ? 'spinning' : ''}`}>
              <div className="rx3-on-jog-display">
                <span className="rx3-on-jog-bpm">{deckA.currentBpm.toFixed(1)}</span>
                <span className="rx3-on-jog-time">{formatTime(deckA.currentTime)}</span>
                <div className="rx3-on-jog-needle-marker"></div>
              </div>
            </div>
          </div>

          {/* PITCH / TEMPO SLIDER ROW */}
          <div className="rx3-tempo-slider-dock">
            <div className="rx3-tempo-labels">
              <span>TEMPO</span>
              <span className="rx3-tempo-val">{deckA.pitchPercent >= 0 ? `+${deckA.pitchPercent.toFixed(2)}%` : `${deckA.pitchPercent.toFixed(2)}%`}</span>
            </div>
            <input
              type="range"
              min="-8.00"
              max="8.00"
              step="0.05"
              value={deckA.pitchPercent}
              onChange={(e) => handlePitchChange('A', parseFloat(e.target.value))}
              className="rx3-vertical-pitch"
              aria-label="Pitch fader Deck A"
            />
            <div className="rx3-pitch-bend-micro">
              <button type="button" onClick={() => handlePitchNudge('A', -0.1)}>- BEND</button>
              <button type="button" onClick={() => handlePitchChange('A', 0)}>RESET</button>
              <button type="button" onClick={() => handlePitchNudge('A', +0.1)}>+ BEND</button>
            </div>
          </div>

          {/* 8 RGB PERFORMANCE PADS */}
          <div className="rx3-pads-container">
            <div className="rx3-pad-mode-selector">
              <button type="button" className={deckA.padMode === 'hotcue' ? 'active' : ''} onClick={() => setDeckA({ ...deckA, padMode: 'hotcue' })}>HOT CUE</button>
              <button type="button" className={deckA.padMode === 'beatloop' ? 'active' : ''} onClick={() => setDeckA({ ...deckA, padMode: 'beatloop' })}>BEAT LOOP</button>
              <button type="button" className={deckA.padMode === 'sliploop' ? 'active' : ''} onClick={() => setDeckA({ ...deckA, padMode: 'sliploop' })}>SLIP LOOP</button>
              <button type="button" className={deckA.padMode === 'beatjump' ? 'active' : ''} onClick={() => setDeckA({ ...deckA, padMode: 'beatjump' })}>BEAT JUMP</button>
            </div>
            <div className="rx3-pads-grid">
              {['1', '2', '3', '4', '5', '6', '7', '8'].map((label, idx) => {
                const cue = deckA.hotCues[idx]
                const isSet = cue !== null && cue !== undefined
                return (
                  <button
                    key={`pad-a-${idx}`}
                    type="button"
                    className={`rx3-rgb-pad ${isSet ? 'set' : 'dim'}`}
                    onClick={() => handleHotCue('A', idx)}
                  >
                    <span className="pad-n">{label}</span>
                    <span className="pad-time">{isSet ? `${cue}s` : '--'}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* BIG ROUND PLAY & CUE BUTTONS (LOWER LEFT) */}
          <div className="rx3-transport-cluster">
            <button
              type="button"
              className={`rx3-big-round-btn cue ${deckA.isCueing ? 'lit' : ''}`}
              onClick={() => setDeckA((prev) => ({ ...prev, isCueing: !prev.isCueing }))}
            >
              CUE
            </button>
            <button
              type="button"
              className={`rx3-big-round-btn play ${deckA.isPlaying ? 'playing' : ''}`}
              onClick={() => setDeckA((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))}
            >
              {deckA.isPlaying ? '❚❚' : '▶'}
            </button>
          </div>
        </section>

        {/* =====================================================================
            CENTER MIXER (PIONEER DJM SECTION - 2 CHANNELS)
            ===================================================================== */}
        <section className="rx3-mixer-hardware">
          <div className="rx3-mixer-top-bar">
            <span className="rx3-mixer-branding">Pioneer DJ • 2-CH MIXER</span>
          </div>

          <div className="rx3-mixer-channels-chassis">
            {/* CHANNEL 1 STRIP */}
            <div className="rx3-channel-strip ch1">
              <span className="rx3-ch-num">1</span>
              
              {/* TRIM */}
              <label className="rx3-knob-unit">
                <span className="knob-t">TRIM</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={deckA.trim}
                  onChange={(e) => setDeckA({ ...deckA, trim: parseInt(e.target.value, 10) })}
                  className="rx3-rotary-knob"
                />
              </label>

              {/* EQ HIGH */}
              <label className="rx3-knob-unit">
                <span className="knob-t">HI</span>
                <input
                  type="range"
                  min="-12"
                  max="6"
                  value={deckA.eqHigh}
                  onChange={(e) => setDeckA({ ...deckA, eqHigh: parseInt(e.target.value, 10) })}
                  className="rx3-rotary-knob"
                />
              </label>

              {/* EQ MID */}
              <label className="rx3-knob-unit">
                <span className="knob-t">MID</span>
                <input
                  type="range"
                  min="-12"
                  max="6"
                  value={deckA.eqMid}
                  onChange={(e) => setDeckA({ ...deckA, eqMid: parseInt(e.target.value, 10) })}
                  className="rx3-rotary-knob"
                />
              </label>

              {/* EQ LOW */}
              <label className="rx3-knob-unit">
                <span className="knob-t">LOW</span>
                <input
                  type="range"
                  min="-12"
                  max="6"
                  value={deckA.eqLow}
                  onChange={(e) => setDeckA({ ...deckA, eqLow: parseInt(e.target.value, 10) })}
                  className="rx3-rotary-knob"
                />
              </label>

              {/* SOUND COLOR FX (FILTER) */}
              <label className="rx3-knob-unit color-fx">
                <span className="knob-t">COLOR</span>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={deckA.filterFx}
                  onChange={(e) => setDeckA({ ...deckA, filterFx: parseInt(e.target.value, 10) })}
                  className="rx3-rotary-knob filter"
                />
                <span className="knob-v">{deckA.filterFx === 0 ? 'FLAT' : deckA.filterFx < 0 ? 'LPF' : 'HPF'}</span>
              </label>

              {/* CUE 1 HEADPHONES */}
              <button
                type="button"
                className={`rx3-ch-cue-btn ${deckA.isCueing ? 'lit' : ''}`}
                onClick={() => setDeckA((prev) => ({ ...prev, isCueing: !prev.isCueing }))}
              >
                CUE 1
              </button>

              {/* CHANNEL 1 FADER */}
              <div className="rx3-fader-track-box">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={deckA.volume}
                  onChange={(e) => setDeckA({ ...deckA, volume: parseInt(e.target.value, 10) })}
                  className="rx3-vertical-fader"
                  aria-label="Fader volume Canale 1"
                />
              </div>
            </div>

            {/* MIXER CENTER COLUMN (VU METERS & MASTER/BOOTH) */}
            <div className="rx3-mixer-master-column">
              <div className="rx3-master-knobs">
                <label className="rx3-knob-unit master">
                  <span className="knob-t">MASTER</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={masterVolume}
                    onChange={(e) => setMasterVolume(parseInt(e.target.value, 10))}
                    className="rx3-rotary-knob small"
                  />
                </label>
                <label className="rx3-knob-unit booth">
                  <span className="knob-t">BOOTH</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={boothVolume}
                    onChange={(e) => setBoothVolume(parseInt(e.target.value, 10))}
                    className="rx3-rotary-knob small"
                  />
                </label>
              </div>

              {/* STEREO LED VU METER BAR */}
              <div className="rx3-stereo-vu-meter">
                <div className="rx3-vu-ladder ch1">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={`vu1-${i}`}
                      className={`vu-segment ${i >= 10 ? 'red' : i >= 7 ? 'amber' : 'green'} ${deckA.isPlaying ? 'lit' : ''}`}
                    />
                  ))}
                </div>
                <div className="rx3-vu-ladder master">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={`vum-${i}`}
                      className={`vu-segment ${i >= 10 ? 'red' : i >= 7 ? 'amber' : 'green'} ${(deckA.isPlaying || deckB.isPlaying) ? 'lit' : ''}`}
                    />
                  ))}
                </div>
                <div className="rx3-vu-ladder ch2">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={`vu2-${i}`}
                      className={`vu-segment ${i >= 10 ? 'red' : i >= 7 ? 'amber' : 'green'} ${deckB.isPlaying ? 'lit' : ''}`}
                    />
                  ))}
                </div>
              </div>

              {/* BEAT FX ENGAGE BUTTON */}
              <div className="rx3-beat-fx-box">
                <span className="fx-t">BEAT FX</span>
                <button
                  type="button"
                  className={`rx3-fx-blue-button ${fxOn ? 'engaged' : ''}`}
                  onClick={() => setFxOn(!fxOn)}
                >
                  ON / OFF
                </button>
              </div>
            </div>

            {/* CHANNEL 2 STRIP */}
            <div className="rx3-channel-strip ch2">
              <span className="rx3-ch-num">2</span>

              {/* TRIM */}
              <label className="rx3-knob-unit">
                <span className="knob-t">TRIM</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={deckB.trim}
                  onChange={(e) => setDeckB({ ...deckB, trim: parseInt(e.target.value, 10) })}
                  className="rx3-rotary-knob"
                />
              </label>

              {/* EQ HIGH */}
              <label className="rx3-knob-unit">
                <span className="knob-t">HI</span>
                <input
                  type="range"
                  min="-12"
                  max="6"
                  value={deckB.eqHigh}
                  onChange={(e) => setDeckB({ ...deckB, eqHigh: parseInt(e.target.value, 10) })}
                  className="rx3-rotary-knob"
                />
              </label>

              {/* EQ MID */}
              <label className="rx3-knob-unit">
                <span className="knob-t">MID</span>
                <input
                  type="range"
                  min="-12"
                  max="6"
                  value={deckB.eqMid}
                  onChange={(e) => setDeckB({ ...deckB, eqMid: parseInt(e.target.value, 10) })}
                  className="rx3-rotary-knob"
                />
              </label>

              {/* EQ LOW */}
              <label className="rx3-knob-unit">
                <span className="knob-t">LOW</span>
                <input
                  type="range"
                  min="-12"
                  max="6"
                  value={deckB.eqLow}
                  onChange={(e) => setDeckB({ ...deckB, eqLow: parseInt(e.target.value, 10) })}
                  className="rx3-rotary-knob"
                />
              </label>

              {/* SOUND COLOR FX (FILTER) */}
              <label className="rx3-knob-unit color-fx">
                <span className="knob-t">COLOR</span>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={deckB.filterFx}
                  onChange={(e) => setDeckB({ ...deckB, filterFx: parseInt(e.target.value, 10) })}
                  className="rx3-rotary-knob filter"
                />
                <span className="knob-v">{deckB.filterFx === 0 ? 'FLAT' : deckB.filterFx < 0 ? 'LPF' : 'HPF'}</span>
              </label>

              {/* CUE 2 HEADPHONES */}
              <button
                type="button"
                className={`rx3-ch-cue-btn ${deckB.isCueing ? 'lit' : ''}`}
                onClick={() => setDeckB((prev) => ({ ...prev, isCueing: !prev.isCueing }))}
              >
                CUE 2
              </button>

              {/* CHANNEL 2 FADER */}
              <div className="rx3-fader-track-box">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={deckB.volume}
                  onChange={(e) => setDeckB({ ...deckB, volume: parseInt(e.target.value, 10) })}
                  className="rx3-vertical-fader"
                  aria-label="Fader volume Canale 2"
                />
              </div>
            </div>
          </div>

          {/* CROSSFADER ROW (BOTTOM CENTER) */}
          <div className="rx3-crossfader-dock">
            <div className="rx3-cf-labels">
              <span>◄ CH 1</span>
              <span className="rx3-cf-brand">CROSSFADER</span>
              <span>CH 2 ►</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={crossfader}
              onChange={(e) => setCrossfader(parseInt(e.target.value, 10))}
              className="rx3-horizontal-crossfader"
              aria-label="Crossfader"
            />
          </div>
        </section>

        {/* =====================================================================
            RIGHT DECK (DECK 2 / B)
            ===================================================================== */}
        <section className="rx3-deck-hardware deck-right">
          <div className="rx3-deck-top-strip">
            <div className="rx3-deck-id-title">
              <span className="rx3-deck-number-pill b">DECK B</span>
              <span className="rx3-tag-genre">VINYL / USB 2</span>
            </div>
            <div className="rx3-sync-group">
              <button
                type="button"
                className={`rx3-round-metal-btn sync ${isBpmMatched ? 'engaged' : ''}`}
                onClick={() => handleSync('B')}
                title="Sincronizza BPM con Deck A"
              >
                Sync Deck B ➔ A ({deckA.currentBpm} BPM)
              </button>
              <button
                type="button"
                className={`rx3-round-metal-btn master ${!isBpmMatched ? 'active' : ''}`}
                onClick={() => handleSync('A')}
              >
                MASTER
              </button>
            </div>
          </div>

          {/* PIONEER JOG WHEEL (DECK 2) */}
          <div className="rx3-jog-outer-ring">
            <div className={`rx3-jog-inner-platter ${deckB.isPlaying ? 'spinning' : ''}`}>
              <div className="rx3-on-jog-display">
                <span className="rx3-on-jog-bpm">{deckB.currentBpm.toFixed(1)}</span>
                <span className="rx3-on-jog-time">{formatTime(deckB.currentTime)}</span>
                <div className="rx3-on-jog-needle-marker"></div>
              </div>
            </div>
          </div>

          {/* PITCH / TEMPO SLIDER ROW */}
          <div className="rx3-tempo-slider-dock">
            <div className="rx3-tempo-labels">
              <span>TEMPO</span>
              <span className="rx3-tempo-val">{deckB.pitchPercent >= 0 ? `+${deckB.pitchPercent.toFixed(2)}%` : `${deckB.pitchPercent.toFixed(2)}%`}</span>
            </div>
            <input
              type="range"
              min="-8.00"
              max="8.00"
              step="0.05"
              value={deckB.pitchPercent}
              onChange={(e) => handlePitchChange('B', parseFloat(e.target.value))}
              className="rx3-vertical-pitch"
              aria-label="Pitch fader Deck B"
            />
            <div className="rx3-pitch-bend-micro">
              <button type="button" onClick={() => handlePitchNudge('B', -0.1)}>- BEND</button>
              <button type="button" onClick={() => handlePitchChange('B', 0)}>RESET</button>
              <button type="button" onClick={() => handlePitchNudge('B', +0.1)}>+ BEND</button>
            </div>
          </div>

          {/* 8 RGB PERFORMANCE PADS */}
          <div className="rx3-pads-container">
            <div className="rx3-pad-mode-selector">
              <button type="button" className={deckB.padMode === 'hotcue' ? 'active' : ''} onClick={() => setDeckB({ ...deckB, padMode: 'hotcue' })}>HOT CUE</button>
              <button type="button" className={deckB.padMode === 'beatloop' ? 'active' : ''} onClick={() => setDeckB({ ...deckB, padMode: 'beatloop' })}>BEAT LOOP</button>
              <button type="button" className={deckB.padMode === 'sliploop' ? 'active' : ''} onClick={() => setDeckB({ ...deckB, padMode: 'sliploop' })}>SLIP LOOP</button>
              <button type="button" className={deckB.padMode === 'beatjump' ? 'active' : ''} onClick={() => setDeckB({ ...deckB, padMode: 'beatjump' })}>BEAT JUMP</button>
            </div>
            <div className="rx3-pads-grid">
              {['1', '2', '3', '4', '5', '6', '7', '8'].map((label, idx) => {
                const cue = deckB.hotCues[idx]
                const isSet = cue !== null && cue !== undefined
                return (
                  <button
                    key={`pad-b-${idx}`}
                    type="button"
                    className={`rx3-rgb-pad ${isSet ? 'set' : 'dim'}`}
                    onClick={() => handleHotCue('B', idx)}
                  >
                    <span className="pad-n">{label}</span>
                    <span className="pad-time">{isSet ? `${cue}s` : '--'}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* BIG ROUND PLAY & CUE BUTTONS (LOWER RIGHT) */}
          <div className="rx3-transport-cluster">
            <button
              type="button"
              className={`rx3-big-round-btn cue ${deckB.isCueing ? 'lit' : ''}`}
              onClick={() => setDeckB((prev) => ({ ...prev, isCueing: !prev.isCueing }))}
            >
              CUE
            </button>
            <button
              type="button"
              className={`rx3-big-round-btn play ${deckB.isPlaying ? 'playing' : ''}`}
              onClick={() => setDeckB((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))}
            >
              {deckB.isPlaying ? '❚❚' : '▶'}
            </button>
          </div>
        </section>
      </main>
    </div>
  </div>
)
}
