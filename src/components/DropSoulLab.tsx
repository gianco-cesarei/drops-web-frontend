import React, { useState } from 'react'

export interface TrackItem {
  id: number
  title: string
  camelot: string
  bpm: number
  status: 'VERIFIED_320K' | 'FLAC_LOSSLESS' | 'DOWNSIZED' | 'HUNTING' | 'SKIPPED'
  cutoffHz: number
  format: string
}

const INITIAL_TRACKS: TrackItem[] = [
  { id: 1, title: 'Blue Six - Music & Wine (Original Mix)', camelot: '11A', bpm: 122, status: 'FLAC_LOSSLESS', cutoffHz: 21800, format: 'FLAC' },
  { id: 2, title: 'Miguel Migs - The Night (Dub)', camelot: '8A', bpm: 124, status: 'VERIFIED_320K', cutoffHz: 20400, format: '320k' },
  { id: 3, title: 'Lisa Shaw - Always (Naked Mix)', camelot: '4A', bpm: 120, status: 'VERIFIED_320K', cutoffHz: 20100, format: '320k' },
  { id: 4, title: 'Kerri Chandler - Atmospheric Beats', camelot: '11B', bpm: 125, status: 'DOWNSIZED', cutoffHz: 15800, format: 'WebRip' },
  { id: 5, title: 'Aquanauts - Karma (Deep Mix)', camelot: '7A', bpm: 123, status: 'HUNTING', cutoffHz: 0, format: 'Pending' },
  { id: 6, title: 'Julius Papp - Groove Nation', camelot: '8B', bpm: 126, status: 'VERIFIED_320K', cutoffHz: 20800, format: '320k' },
]

export default function DropSoulLab() {
  const [mode, setMode] = useState<'drops' | 'dropsoul'>('dropsoul')
  const [tracks, setTracks] = useState<TrackItem[]>(INITIAL_TRACKS)
  const [selectedTrack, setSelectedTrack] = useState<TrackItem>(INITIAL_TRACKS[0])
  const [showModal, setShowModal] = useState<boolean>(false)
  const [rememberSetChoice, setRememberSetChoice] = useState<boolean>(false)

  const handleDecision = (decision: 'downsize' | 'wait' | 'skip') => {
    setTracks(prev => prev.map(t => {
      if (t.id === 4) {
        if (decision === 'downsize') {
          return { ...t, status: 'DOWNSIZED', format: 'WebRip', cutoffHz: 15800 }
        } else if (decision === 'wait') {
          return { ...t, status: 'HUNTING', format: 'Pending', cutoffHz: 0 }
        } else {
          return { ...t, status: 'SKIPPED', format: 'Excluded', cutoffHz: 0 }
        }
      }
      return t
    }))
    setShowModal(false)
  }

  const renderSpectrumBars = (cutoff: number) => {
    const totalBars = 22
    const cutoffBar = Math.floor((cutoff / 22050) * totalBars)

    return Array.from({ length: totalBars }).map((_, i) => {
      const active = i <= cutoffBar && cutoff > 0
      const heightPercent = active ? Math.min(100, Math.max(15, 95 - Math.pow(i / totalBars, 1.8) * 60)) : 6
      const barColor = cutoff >= 19500 ? '#10b981' : cutoff > 0 ? '#f59e0b' : '#374151'

      return (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${heightPercent}%`,
            background: active ? barColor : 'rgba(255,255,255,0.06)',
            borderRadius: '2px 2px 0 0',
            transition: 'height 0.3s ease, background 0.3s ease',
          }}
        />
      )
    })
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#edf3ee',
    }}>
      {/* Top Warning Banner: Staging Only */}
      <div style={{
        background: 'rgba(139, 92, 246, 0.1)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '12px',
        padding: '10px 16px',
        fontSize: '12px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#c4b5fd',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px' }}>🧪</span>
          <span><strong>Ambiente Staging / Lab:</strong> Questa pagina è isolata e non è visibile nella navigazione principale di Drops.</span>
        </div>
        <span style={{
          background: 'rgba(139, 92, 246, 0.25)',
          padding: '2px 8px',
          borderRadius: '6px',
          fontWeight: 700,
          fontSize: '10px',
          letterSpacing: '0.05em',
        }}>
          DROPSOUL PREVIEW
        </span>
      </div>

      {/* Main Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px',
        paddingBottom: '20px',
        borderBottom: '1px solid #293029',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🎛️</span>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
              DropSoul <span style={{ color: '#06b6d4', fontWeight: 400 }}>Engine Lab</span>
            </h1>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#8f9a90' }}>
            High-Fidelity Soulseek P2P Ingestion & Spectrogram Verification Playground
          </p>
        </div>

        {/* Macro Switcher */}
        <div style={{
          background: '#161b17',
          border: '1px solid #293029',
          borderRadius: '12px',
          padding: '4px',
          display: 'flex',
          gap: '4px',
        }}>
          <button
            onClick={() => setMode('drops')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              background: mode === 'drops' ? '#2563eb' : 'transparent',
              color: mode === 'drops' ? '#ffffff' : '#8f9a90',
              transition: 'all 0.2s',
            }}
          >
            💧 Drops (Standard)
          </button>
          <button
            onClick={() => setMode('dropsoul')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              background: mode === 'dropsoul' ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' : 'transparent',
              color: mode === 'dropsoul' ? '#ffffff' : '#8f9a90',
              boxShadow: mode === 'dropsoul' ? '0 0 16px rgba(6, 182, 212, 0.3)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            🔥 DropSoul (Hi-Fi)
          </button>
        </div>
      </div>

      {/* Mode Status Pill */}
      <div style={{
        background: mode === 'dropsoul' ? 'rgba(6, 182, 212, 0.08)' : 'rgba(37, 99, 235, 0.08)',
        border: `1px solid ${mode === 'dropsoul' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(37, 99, 235, 0.25)'}`,
        borderRadius: '14px',
        padding: '14px 18px',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: mode === 'dropsoul' ? '#06b6d4' : '#3b82f6',
            boxShadow: `0 0 10px ${mode === 'dropsoul' ? '#06b6d4' : '#3b82f6'}`,
          }} />
          <div style={{ fontSize: '13px' }}>
            <strong style={{ color: mode === 'dropsoul' ? '#06b6d4' : '#60a5fa' }}>
              {mode === 'dropsoul' ? 'Modalità DropSoul Attiva:' : 'Modalità Drops Standard:'}
            </strong>
            <span style={{ color: '#8f9a90', marginLeft: '6px' }}>
              {mode === 'dropsoul'
                ? 'Priorità a Soulseek P2P (FLAC / 320k) con Quality Gate spettrale (>20 kHz) e Decision Gate.'
                : 'Download rapido da YouTube/Web. Nessun controllo di frequenza bloccante.'}
            </span>
          </div>
        </div>
        {mode === 'dropsoul' && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: '#06b6d4',
              color: '#000000',
              fontWeight: 700,
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            ⚡ Simula Decision Gate
          </button>
        )}
      </div>

      {/* Grid: Tracklist + Right Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Tracklist Card */}
        <div style={{
          gridColumn: 'span 2',
          background: '#161b17',
          border: '1px solid #293029',
          borderRadius: '16px',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #293029' }}>
            <div>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c084fc', fontWeight: 800 }}>
                DJ Curation Vault
              </span>
              <h2 style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: 700 }}>
                Nude Dimensions Vol 1 (Naked Music 1999)
              </h2>
            </div>
            <span style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#10b981',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
            }}>
              ● 83% Studio Grade
            </span>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: '#8f9a90', borderBottom: '1px solid #293029' }}>
                  <th style={{ padding: '8px', width: '30px' }}>#</th>
                  <th style={{ padding: '8px' }}>Traccia</th>
                  <th style={{ padding: '8px', width: '60px' }}>Key</th>
                  <th style={{ padding: '8px', width: '50px' }}>BPM</th>
                  <th style={{ padding: '8px' }}>Quality Gate</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Spettro</th>
                </tr>
              </thead>
              <tbody>
                {tracks.map((t) => {
                  const isSelected = selectedTrack.id === t.id
                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTrack(t)}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                    >
                      <td style={{ padding: '10px 8px', color: '#8f9a90', fontFamily: 'monospace' }}>
                        {t.id < 10 ? `0${t.id}` : t.id}
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>{t.title}</td>
                      <td style={{ padding: '10px 8px', color: '#06b6d4', fontWeight: 700 }}>{t.camelot}</td>
                      <td style={{ padding: '10px 8px', fontFamily: 'monospace' }}>{t.bpm}</td>
                      <td style={{ padding: '10px 8px' }}>
                        {t.status === 'FLAC_LOSSLESS' && (
                          <span style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800 }}>
                            ● FLAC LOSSLESS
                          </span>
                        )}
                        {t.status === 'VERIFIED_320K' && (
                          <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800 }}>
                            ● VERIFIED 320k
                          </span>
                        )}
                        {t.status === 'DOWNSIZED' && (
                          <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800 }}>
                            ◑ DOWNSIZED (Hunting ⏳)
                          </span>
                        )}
                        {t.status === 'HUNTING' && (
                          <span style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800 }}>
                            ○ IN ATTESA NEL CLOUD
                          </span>
                        )}
                        {t.status === 'SKIPPED' && (
                          <span style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800 }}>
                            ✕ ESCLUSA
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedTrack(t); }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#8f9a90',
                            cursor: 'pointer',
                            fontSize: '11px',
                          }}
                        >
                          Analizza 🔬
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Spectrogram & Cloud Worker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* FFT Spectrogram Inspector */}
          <div style={{
            background: '#161b17',
            border: '1px solid #293029',
            borderRadius: '16px',
            padding: '18px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#8f9a90' }}>
                🔬 FFT Cutoff Inspector
              </span>
              <span style={{
                background: selectedTrack.cutoffHz >= 19500 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: selectedTrack.cutoffHz >= 19500 ? '#10b981' : '#f59e0b',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                fontFamily: 'monospace',
              }}>
                {selectedTrack.cutoffHz > 0 ? `${(selectedTrack.cutoffHz / 1000).toFixed(1)} kHz` : 'N/A'}
              </span>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '2px' }}>
              {selectedTrack.title}
            </div>
            <div style={{ fontSize: '11px', color: '#8f9a90', marginBottom: '14px' }}>
              {selectedTrack.cutoffHz >= 19500
                ? `${selectedTrack.format} • Risposta in frequenza completa da studio`
                : selectedTrack.cutoffHz > 0
                ? 'WebRip compresso • Taglio netto delle alte frequenze'
                : 'In attesa di download dai peer Soulseek'}
            </div>

            {/* Visualizer Bars Container */}
            <div style={{
              background: '#0d110e',
              border: '1px solid #222923',
              borderRadius: '10px',
              padding: '12px',
              height: '110px',
              display: 'flex',
              alignItems: 'flex-end',
              gap: '3px',
            }}>
              {renderSpectrumBars(selectedTrack.cutoffHz)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#626862', marginTop: '6px', fontFamily: 'monospace' }}>
              <span>100Hz</span>
              <span>8kHz</span>
              <span>16kHz</span>
              <span style={{ color: '#06b6d4', fontWeight: 700 }}>20kHz</span>
              <span>22kHz</span>
            </div>
          </div>

          {/* Cloud Hunt 24/7 Panel */}
          <div style={{
            background: '#161b17',
            border: '1px solid #293029',
            borderRadius: '16px',
            padding: '18px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>☁️</span> Cloud Worker 24/7
              </span>
              <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>● Connesso</span>
            </div>
            <p style={{ fontSize: '11px', color: '#8f9a90', margin: '0 0 12px', lineHeight: 1.4 }}>
              Il worker su server cloud scarica automaticamente da Soulseek, verifica il cutoff e salva su Cloudflare R2 anche mentre il tuo computer è spento.
            </p>
            <div style={{
              background: 'rgba(168, 85, 247, 0.08)',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '11px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '4px' }}>
                <span>In caccia nel cloud:</span>
                <span style={{ color: '#c084fc', fontFamily: 'monospace' }}>
                  {tracks.filter(t => t.status === 'HUNTING' || t.status === 'DOWNSIZED').length} release
                </span>
              </div>
              <div style={{ color: '#8f9a90', fontSize: '10.5px' }}>
                • Kerri Chandler - Atmospheric Beats (In coda slskd)
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modal Decision Gate */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: '#161b17',
            border: '1px solid #3b82f6',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}>
                  ⚠️ Decision Gate — Release Not Immediate
                </span>
                <h3 style={{ margin: '8px 0 4px', fontSize: '16px', fontWeight: 700 }}>
                  Traccia 04: Kerri Chandler - Atmospheric Beats
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#8f9a90' }}>
                  Nessuna release verificata (&gt;20kHz) disponibile subito su Soulseek. Come vuoi procedere?
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#8f9a90', cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '20px 0' }}>
              
              {/* Option 1: Downsizing */}
              <button
                onClick={() => handleDecision('downsize')}
                style={{
                  background: 'rgba(245, 158, 11, 0.05)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
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
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b' }}>
                    Downsizing Provvisorio + Soul Hunt (Consigliato)
                  </div>
                  <div style={{ fontSize: '11px', color: '#8f9a90', marginTop: '2px' }}>
                    Scarica subito il WebRip da YouTube per ascoltare il set. Il worker cloud continua a cercare il FLAC per sostituirlo in automatico.
                  </div>
                </div>
              </button>

              {/* Option 2: Wait */}
              <button
                onClick={() => handleDecision('wait')}
                style={{
                  background: 'rgba(168, 85, 247, 0.05)',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
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
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#c084fc' }}>
                    Pure Quality: Aspetta nel Cloud
                  </div>
                  <div style={{ fontSize: '11px', color: '#8f9a90', marginTop: '2px' }}>
                    Nessun file a bassa risoluzione. Lo slot resta in attesa nel cloud e la traccia verrà scaricata solo quando il master vero è online.
                  </div>
                </div>
              </button>

              {/* Option 3: Skip */}
              <button
                onClick={() => handleDecision('skip')}
                style={{
                  background: 'rgba(244, 63, 94, 0.05)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
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
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#f43f5e' }}>
                    Salta Traccia
                  </div>
                  <div style={{ fontSize: '11px', color: '#8f9a90', marginTop: '2px' }}>
                    Escludi questa traccia dal set senza cercarla nel cloud.
                  </div>
                </div>
              </button>

            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #293029' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#8f9a90', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberSetChoice}
                  onChange={(e) => setRememberSetChoice(e.target.checked)}
                />
                <span>Ricorda per tutto il set</span>
              </label>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#8f9a90', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
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
