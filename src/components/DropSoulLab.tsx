import React, { useState } from 'react'

export interface SoulTrack {
  id: string
  title: string
  artist: string
  bpm: number
  camelot: string
  status: 'completed' | 'queued' | 'downloading' | 'hunting' | 'downsized' | 'failed'
  soulStatus: 'FLAC_LOSSLESS' | 'VERIFIED_320K' | 'DOWNSIZED' | 'HUNTING' | 'SKIPPED'
  cutoffHz: number
  progress: number
}

const INITIAL_QUEUE: SoulTrack[] = [
  {
    id: 't-01',
    title: 'Music & Wine (Original Mix)',
    artist: 'Blue Six',
    bpm: 122,
    camelot: '11A',
    status: 'completed',
    soulStatus: 'FLAC_LOSSLESS',
    cutoffHz: 21800,
    progress: 100,
  },
  {
    id: 't-02',
    title: 'The Night (Dub)',
    artist: 'Miguel Migs',
    bpm: 124,
    camelot: '8A',
    status: 'completed',
    soulStatus: 'VERIFIED_320K',
    cutoffHz: 20400,
    progress: 100,
  },
  {
    id: 't-03',
    title: 'Always (Naked Mix)',
    artist: 'Lisa Shaw',
    bpm: 120,
    camelot: '4A',
    status: 'downloading',
    soulStatus: 'VERIFIED_320K',
    cutoffHz: 20100,
    progress: 68,
  },
  {
    id: 't-04',
    title: 'Atmospheric Beats',
    artist: 'Kerri Chandler',
    bpm: 125,
    camelot: '11B',
    status: 'downsized',
    soulStatus: 'DOWNSIZED',
    cutoffHz: 15800,
    progress: 100,
  },
  {
    id: 't-05',
    title: 'Karma (Deep Mix)',
    artist: 'Aquanauts',
    bpm: 123,
    camelot: '7A',
    status: 'hunting',
    soulStatus: 'HUNTING',
    cutoffHz: 0,
    progress: 15,
  },
]

export default function DropSoulLab() {
  const [mode, setMode] = useState<'drops' | 'dropsoul'>('dropsoul')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [sidebarTab, setSidebarTab] = useState<'ready' | 'archive'>('ready')
  const [inputUrl, setInputUrl] = useState('')
  const [queue, setQueue] = useState<SoulTrack[]>(INITIAL_QUEUE)
  const [inspectingTrackId, setInspectingTrackId] = useState<string | null>(INITIAL_QUEUE[0].id)
  const [showDecisionModal, setShowDecisionModal] = useState(false)
  const [activeFolder, setActiveFolder] = useState('Nude Dimensions Vol 1 (Naked Music 1999)')

  const inspectingTrack = queue.find((t) => t.id === inspectingTrackId) || queue[0]

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputUrl.trim()) return
    const newTrack: SoulTrack = {
      id: `t-${Date.now()}`,
      title: inputUrl.includes('youtube') || inputUrl.includes('soundcloud') ? 'Release Audio in Coda' : inputUrl.trim(),
      artist: 'Artista Selezionato',
      bpm: 124,
      camelot: '8A',
      status: 'downloading',
      soulStatus: mode === 'dropsoul' ? 'VERIFIED_320K' : 'VERIFIED_320K',
      cutoffHz: mode === 'dropsoul' ? 20400 : 16000,
      progress: 12,
    }
    setQueue((cur) => [newTrack, ...cur])
    setInputUrl('')
  }

  const handleDecision = (decision: 'downsize' | 'wait' | 'skip') => {
    setQueue((prev) =>
      prev.map((t) => {
        if (t.id === 't-04') {
          if (decision === 'downsize') {
            return { ...t, soulStatus: 'DOWNSIZED', status: 'downsized', cutoffHz: 15800 }
          } else if (decision === 'wait') {
            return { ...t, soulStatus: 'HUNTING', status: 'hunting', cutoffHz: 0 }
          } else {
            return { ...t, soulStatus: 'SKIPPED', status: 'failed', cutoffHz: 0 }
          }
        }
        return t
      })
    )
    setShowDecisionModal(false)
  }

  const renderSpectrumBars = (cutoff: number) => {
    const totalBars = 22
    const cutoffBar = Math.floor((cutoff / 22050) * totalBars)

    return Array.from({ length: totalBars }).map((_, i) => {
      const active = i <= cutoffBar && cutoff > 0
      const heightPercent = active ? Math.min(100, Math.max(15, 95 - Math.pow(i / totalBars, 1.8) * 60)) : 6
      const barColor = cutoff >= 19500 ? '#15803d' : cutoff > 0 ? '#d97706' : '#cbd5e1'

      return (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${heightPercent}%`,
            background: active ? barColor : 'rgba(0,0,0,0.06)',
            borderRadius: '2px 2px 0 0',
            transition: 'height 0.25s ease, background 0.25s ease',
          }}
        />
      )
    })
  }

  return (
    <div className="download-workspace-frameless" style={{ paddingTop: '16px' }}>
      
      {/* STAGING TEST BAR / SWITCHER */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 16px',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            background: '#ffffff',
            border: '1px solid #dce1dc',
            color: '#475569',
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '11.5px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}>
            <span>🧪</span> Staging Downloader Lab
          </span>
          <span style={{ fontSize: '12px', color: '#626862' }}>
            Testa l&apos;interfaccia del Downloader con la modalità Soul.
          </span>
        </div>

        {/* Macro Switcher */}
        <div style={{
          background: '#f2f4f1',
          border: '1px solid #dce1dc',
          borderRadius: '10px',
          padding: '3px',
          display: 'flex',
          gap: '3px',
        }}>
          <button
            type="button"
            onClick={() => setMode('drops')}
            style={{
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              fontSize: '12px',
              fontWeight: mode === 'drops' ? 700 : 500,
              cursor: 'pointer',
              background: mode === 'drops' ? '#ffffff' : 'transparent',
              color: mode === 'drops' ? '#151815' : '#626862',
              boxShadow: mode === 'drops' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            💧 Drops Standard
          </button>
          <button
            type="button"
            onClick={() => setMode('dropsoul')}
            style={{
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              fontSize: '12px',
              fontWeight: mode === 'dropsoul' ? 700 : 500,
              cursor: 'pointer',
              background: mode === 'dropsoul' ? '#22c55e' : 'transparent',
              color: mode === 'dropsoul' ? '#ffffff' : '#626862',
              boxShadow: mode === 'dropsoul' ? '0 2px 6px rgba(34, 197, 94, 0.25)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            🔥 DropSoul Hi-Fi
          </button>
        </div>
      </div>

      {/* TOP NAVIGATION / HAMBURGER BAR (Real Drops Structure) */}
      <div className="workspace-top-bar" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <button
          type="button"
          className={`drops-hamburger-btn ${isSidebarOpen ? 'is-active' : ''}`}
          onClick={() => setIsSidebarOpen((v) => !v)}
          title={isSidebarOpen ? 'Chiudi pannello laterale' : 'Apri Libreria e File Pronti'}
          aria-label={isSidebarOpen ? 'Chiudi pannello laterale' : 'Apri Libreria e File Pronti'}
          aria-expanded={isSidebarOpen}
        >
          <div className="drops-hamburger-icon">
            <span className="ham-line ham-line-1" />
            <span className="ham-line ham-line-2" />
            <span className="ham-line ham-line-3" />
          </div>
          <span className="drops-hamburger-label">Libreria</span>
          <span className="drops-hamburger-badge" title="Tracce pronte">
            {queue.filter((t) => t.status === 'completed' || t.status === 'downsized').length}
          </span>
        </button>
      </div>

      {isSidebarOpen && (
        <div
          className="drops-sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* MAIN WORKSPACE ROW */}
      <div className={`workspace-stage-row ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* UNIFIED LEFT SIDEBAR (Real Drops Downloader Sidebar) */}
        {isSidebarOpen && (
          <aside className="drops-unified-sidebar" aria-label="Libreria e Archivio">
            <div className="sidebar-top-header">
              <div className="sidebar-tabs-segmented">
                <button
                  type="button"
                  className={`sidebar-tab-btn ${sidebarTab === 'ready' ? 'active' : ''}`}
                  onClick={() => setSidebarTab('ready')}
                >
                  📥 Pronti ({queue.filter((t) => t.status === 'completed' || t.status === 'downsized').length})
                </button>
                <button
                  type="button"
                  className={`sidebar-tab-btn ${sidebarTab === 'archive' ? 'active' : ''}`}
                  onClick={() => setSidebarTab('archive')}
                >
                  📁 Archivio (3)
                </button>
              </div>
              <button
                type="button"
                className="sidebar-close-btn"
                onClick={() => setIsSidebarOpen(false)}
                title="Chiudi pannello"
                aria-label="Chiudi pannello"
              >
                ✕
              </button>
            </div>

            {/* TAB CONTENT */}
            {sidebarTab === 'ready' ? (
              <div className="sidebar-tab-content">
                <div className="wing-cloud-box">
                  <span className="wing-cloud-label">SALVATO IN CLOUD:</span>
                  <strong className="wing-cloud-folder">📁 {activeFolder}</strong>
                </div>

                <div className="wing-ready-list">
                  {queue.filter((t) => t.status === 'completed' || t.status === 'downsized').map((item) => (
                    <div key={item.id} className="wing-ready-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button type="button" className="wing-mini-play" title="Ascolta">▶</button>
                        <div className="wing-track-info" style={{ flex: 1, minWidth: 0 }}>
                          <span className="wing-track-title">{item.title}</span>
                          <div className="wing-track-meta">
                            <span className="wing-artist">{item.artist}</span>
                            <span className="wing-bpm">BPM {item.bpm}</span>
                            <span style={{ fontWeight: 700, color: '#15803d' }}>{item.camelot}</span>
                          </div>
                        </div>
                      </div>

                      {/* Soul Layer Extra: Badge & FFT Inspection */}
                      {mode === 'dropsoul' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '34px', fontSize: '10.5px' }}>
                          {item.soulStatus === 'FLAC_LOSSLESS' && (
                            <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 6px', borderRadius: '10px', fontWeight: 800 }}>
                              ● FLAC LOSSLESS
                            </span>
                          )}
                          {item.soulStatus === 'VERIFIED_320K' && (
                            <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: '10px', fontWeight: 800 }}>
                              ● VERIFIED 320k
                            </span>
                          )}
                          {item.soulStatus === 'DOWNSIZED' && (
                            <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '1px 6px', borderRadius: '10px', fontWeight: 800 }}>
                              ◑ DOWNSIZED (Hunting ⏳)
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => setInspectingTrackId(item.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: inspectingTrackId === item.id ? '#15803d' : '#626862',
                              fontWeight: 700,
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            {inspectingTrackId === item.id ? 'Spettro attivo ✓' : 'Analizza Spettro 🔬'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="sidebar-tab-content">
                <div style={{ padding: '8px 12px', fontSize: '12px', color: '#626862' }}>
                  <div
                    onClick={() => setActiveFolder('Nude Dimensions Vol 1 (Naked Music 1999)')}
                    style={{ padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', background: activeFolder.includes('Nude') ? '#f0fdf4' : 'transparent', fontWeight: 600, color: '#151815', marginBottom: '4px' }}
                  >
                    📁 Nude Dimensions Vol 1 (14 brani)
                  </div>
                  <div
                    onClick={() => setActiveFolder('Cabaret Recordings Archive')}
                    style={{ padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', background: activeFolder.includes('Cabaret') ? '#f0fdf4' : 'transparent', fontWeight: 600, color: '#151815', marginBottom: '4px' }}
                  >
                    📁 Cabaret Recordings Archive (84 brani)
                  </div>
                  <div
                    onClick={() => setActiveFolder('Perlon Vinyl Gems')}
                    style={{ padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', background: activeFolder.includes('Perlon') ? '#f0fdf4' : 'transparent', fontWeight: 600, color: '#151815' }}
                  >
                    📁 Perlon Vinyl Gems (26 brani)
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* MAIN DOWNLOAD STAGE (Real Drops Downloader Canvas) */}
        <main className="download-stage-frameless">
          
          {/* Main Form */}
          <form onSubmit={handleAddUrl} className="download-form-clean">
            <div className="dl-field-header">
              <label htmlFor="download-url-lab" className="dl-field-eyebrow" style={{ cursor: 'pointer', display: 'block' }}>
                Link brano, playlist o set
              </label>
              <p className="dl-field-sub">
                Incolla qui i tuoi link musicali per scaricarli direttamente in locale.
              </p>
            </div>

            <div className="dl-folder-top-bar">
              <div className="dl-select-wrap">
                <span className="dl-select-label">Scarica in:</span>
                <select
                  value={activeFolder}
                  onChange={(e) => setActiveFolder(e.target.value)}
                  className="dl-folder-select-clean"
                  title="Cartella cloud di salvataggio"
                >
                  <option value="Nude Dimensions Vol 1 (Naked Music 1999)">📁 Nude Dimensions Vol 1 (14 brani)</option>
                  <option value="Cabaret Recordings Archive">📁 Cabaret Recordings Archive (84 brani)</option>
                  <option value="Perlon Vinyl Gems">📁 Perlon Vinyl Gems (26 brani)</option>
                </select>
              </div>
            </div>

            <textarea
              id="download-url-lab"
              className="download-textarea-clean"
              placeholder={'Un link per riga · YouTube o SoundCloud / Le playlist e i set chiedono conferma delle tracce'}
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              rows={4}
              spellCheck={false}
            />

            {/* DYNAMIC QUALITY NOTICE: DROPS VS DROPSOUL */}
            <div className="dl-fixed-quality-notice" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              {mode === 'drops' ? (
                <span className="dl-quality-badge">
                  <span className="dl-quality-dot"></span>
                  MP3 HD Quality · 320 kbps CBR (Formato fisso)
                </span>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="dl-quality-badge" style={{ background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }}>
                    <span className="dl-quality-dot" style={{ background: '#22c55e' }}></span>
                    DropSoul Hi-Fi • Soulseek P2P + Quality Gate Spettrale (&gt;20 kHz)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDecisionModal(true)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #bbf7d0',
                      color: '#15803d',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    ⚡ Simula Decision Gate
                  </button>
                </div>
              )}

              {mode === 'dropsoul' && (
                <span style={{ fontSize: '11px', color: '#626862' }}>
                  Worker Cloud: <strong style={{ color: '#15803d' }}>● Connesso</strong>
                </span>
              )}
            </div>

            {/* BIG SUBMIT BUTTON */}
            <button
              type="submit"
              className="primary dl-btn-submit-green"
              disabled={!inputUrl.trim()}
            >
              {mode === 'dropsoul' ? 'Aggiungi alla coda DropSoul (Hi-Fi)' : 'Aggiungi alla coda'}
            </button>
          </form>

          {/* FFT INSPECTOR CARD: VISIBLE IN DROPSOUL MODE */}
          {mode === 'dropsoul' && inspectingTrack && (
            <div style={{
              background: '#ffffff',
              border: '1px solid #dce1dc',
              borderRadius: '14px',
              padding: '16px 18px',
              marginTop: '18px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#15803d' }}>
                    🔬 FFT Cutoff Inspector
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#151815' }}>
                    {inspectingTrack.artist} - {inspectingTrack.title}
                  </span>
                </div>
                <span style={{
                  background: inspectingTrack.cutoffHz >= 19500 ? '#f0fdf4' : '#fffbeb',
                  color: inspectingTrack.cutoffHz >= 19500 ? '#15803d' : '#b45309',
                  border: `1px solid ${inspectingTrack.cutoffHz >= 19500 ? '#bbf7d0' : '#fde68a'}`,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                }}>
                  {inspectingTrack.cutoffHz > 0 ? `${(inspectingTrack.cutoffHz / 1000).toFixed(1)} kHz` : 'IN ATTESA'}
                </span>
              </div>

              {/* 22 Bars */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 12px',
                height: '80px',
                display: 'flex',
                alignItems: 'flex-end',
                gap: '4px',
              }}>
                {renderSpectrumBars(inspectingTrack.cutoffHz)}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px', fontFamily: 'monospace' }}>
                <span>100Hz</span>
                <span>8kHz</span>
                <span>16kHz</span>
                <span style={{ color: '#15803d', fontWeight: 700 }}>20kHz (Cutoff Studio)</span>
                <span>22kHz</span>
              </div>
            </div>
          )}

          {/* REAL CODA CARD (Real Drops Downloader Queue) */}
          <section className="download-queue-card" style={{ marginTop: '20px' }}>
            <div className="dl-queue-header-clean">
              <span className="eyebrow">
                CODA &amp; BRANI IN CORSO ({queue.length})
              </span>
              <div className="dl-queue-header-actions">
                <span className="dl-count">{queue.filter((t) => t.status !== 'completed').length} attivi</span>
              </div>
            </div>

            <div className="dl-queue-list-clean">
              {queue.map((job) => {
                const isReady = job.status === 'completed' || job.status === 'downsized'
                const isFailed = job.status === 'failed'
                const isInspecting = inspectingTrackId === job.id

                return (
                  <div
                    key={job.id}
                    className={`dl-queue-item-clean ${isReady ? 'ready' : isFailed ? 'failed' : ''}`}
                    onClick={() => mode === 'dropsoul' && setInspectingTrackId(job.id)}
                    style={{ cursor: mode === 'dropsoul' ? 'pointer' : 'default', background: isInspecting && mode === 'dropsoul' ? '#f0fdf4' : undefined }}
                  >
                    <div className="dl-queue-info">
                      <span className="dl-queue-icon">{isFailed ? '⚠️' : isReady ? '✓' : '◷'}</span>
                      <div className="dl-queue-text">
                        <span className="dl-queue-title">{job.artist} - {job.title}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                          <span className="dl-queue-detail">
                            {isReady ? 'Completato' : job.status === 'hunting' ? 'In caccia nel cloud (slskd)' : `Download in corso (${job.progress}%)`}
                          </span>
                          
                          {/* DropSoul Badges inside Queue */}
                          {mode === 'dropsoul' && (
                            <>
                              {job.soulStatus === 'FLAC_LOSSLESS' && (
                                <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 6px', borderRadius: '8px', fontSize: '9.5px', fontWeight: 800 }}>
                                  ● FLAC
                                </span>
                              )}
                              {job.soulStatus === 'VERIFIED_320K' && (
                                <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: '8px', fontSize: '9.5px', fontWeight: 800 }}>
                                  ● VERIFIED 320k
                                </span>
                              )}
                              {job.soulStatus === 'DOWNSIZED' && (
                                <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '1px 6px', borderRadius: '8px', fontSize: '9.5px', fontWeight: 800 }}>
                                  ◑ DOWNSIZED ⏳
                                </span>
                              )}
                              {job.soulStatus === 'HUNTING' && (
                                <span style={{ background: '#faf5ff', color: '#7e22ce', border: '1px solid #e9d5ff', padding: '1px 6px', borderRadius: '8px', fontSize: '9.5px', fontWeight: 800 }}>
                                  ○ HUNTING CLOUD
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {!isReady && !isFailed && (
                      <div className="dl-progress-track">
                        <div className="dl-progress-bar" style={{ width: `${job.progress}%` }} />
                      </div>
                    )}

                    <span className="dl-queue-pct">{isReady ? '100%' : `${job.progress}%`}</span>

                    {mode === 'dropsoul' && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setInspectingTrackId(job.id) }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#626862',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}
                        title="Ispeziona spettro FFT"
                      >
                        🔬
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </main>
      </div>

      {/* MODAL DECISION GATE (Drops White Design) */}
      {showDecisionModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #dce1dc',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{
                  background: '#fffbeb',
                  color: '#b45309',
                  border: '1px solid #fde68a',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}>
                  ⚠️ Decision Gate — Release Not Immediate
                </span>
                <h3 style={{ margin: '8px 0 4px', fontSize: '16px', fontWeight: 700, color: '#151815' }}>
                  Kerri Chandler - Atmospheric Beats
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#626862' }}>
                  Nessuna release verificata (&gt;20kHz) disponibile subito su Soulseek. Come vuoi procedere?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDecisionModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#626862', cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '20px 0' }}>
              <button
                type="button"
                onClick={() => handleDecision('downsize')}
                style={{
                  background: '#fbfcfb',
                  border: '1px solid #fde68a',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '18px' }}>⚡</span>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#b45309' }}>
                    Downsizing Provvisorio + Soul Hunt (Consigliato)
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#626862', marginTop: '2px' }}>
                    Scarica subito il WebRip per la sessione. Il worker cloud cerca il FLAC per sostituirlo in automatico.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDecision('wait')}
                style={{
                  background: '#fbfcfb',
                  border: '1px solid #e9d5ff',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '18px' }}>⏳</span>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#7e22ce' }}>
                    Pure Quality: Aspetta nel Cloud
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#626862', marginTop: '2px' }}>
                    Nessun file a bassa risoluzione. La traccia verrà scaricata solo quando il master vero è online.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDecision('skip')}
                style={{
                  background: '#fbfcfb',
                  border: '1px solid #fecdd3',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '18px' }}>⏭️</span>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#be123c' }}>
                    Salta Traccia
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#626862', marginTop: '2px' }}>
                    Escludi questa traccia dal set senza cercarla nel cloud.
                  </div>
                </div>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #f2f4f1' }}>
              <button
                type="button"
                onClick={() => setShowDecisionModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#626862', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

