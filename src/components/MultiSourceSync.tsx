import React, { useState } from 'react'
import { api, batchProcess } from '../api'

export interface ImportedTrack {
  id: string
  title: string
  artist: string
  source: 'soundcloud' | 'youtube' | 'bandcamp'
  duration: string
  bpm: number
  key: string
  genre: string
  url: string
  status: 'ready' | 'downloading' | 'synced'
}

const PRESET_SOURCES = [
  {
    id: 'sc-1',
    label: 'Houghton Festival 2026 Morning Set (SoundCloud)',
    source: 'soundcloud' as const,
    url: 'https://soundcloud.com/drops-records/houghton-morning-session-2026',
    tracks: [
      { id: 'sc-t1', title: 'Subtle Modulations (Live Cut)', artist: 'Alex Rossi', source: 'soundcloud' as const, duration: '6:42', bpm: 124, key: '8A (Am)', genre: 'Microhouse', url: 'https://soundcloud.com/...', status: 'ready' as const },
      { id: 'sc-t2', title: 'Analog Echoes', artist: 'MANIA Sound Lab', source: 'soundcloud' as const, duration: '7:15', bpm: 126, key: '5A (Cm)', genre: 'Minimal Techno', url: 'https://soundcloud.com/...', status: 'ready' as const },
      { id: 'sc-t3', title: 'Resonant Sweep Tool', artist: 'Marco Donati', source: 'soundcloud' as const, duration: '5:50', bpm: 125, key: '11B (A)', genre: 'Deep Tech', url: 'https://soundcloud.com/...', status: 'ready' as const },
    ],
  },
  {
    id: 'yt-1',
    label: 'Underground Vinyl Rips 2026 (YouTube Playlist)',
    source: 'youtube' as const,
    url: 'https://youtube.com/playlist?list=PLdrops_vinyl_2026',
    tracks: [
      { id: 'yt-t1', title: 'Rare Dubplate 001', artist: 'Unknown Artist', source: 'youtube' as const, duration: '6:10', bpm: 123, key: '9A (Em)', genre: 'Dub Techno', url: 'https://youtube.com/...', status: 'ready' as const },
      { id: 'yt-t2', title: 'Berlin Warehouse Tool', artist: 'Elena Valeri', source: 'youtube' as const, duration: '8:04', bpm: 127, key: '4A (Fm)', genre: 'Hypnotic Techno', url: 'https://youtube.com/...', status: 'ready' as const },
    ],
  },
]

export default function MultiSourceSync() {
  const [inputUrl, setInputUrl] = useState('')
  const [isResolving, setIsResolving] = useState(false)
  const [importedTracks, setImportedTracks] = useState<ImportedTrack[]>(PRESET_SOURCES[0].tracks)
  const [syncNotice, setSyncNotice] = useState('')
  const [selectedTrackIds, setSelectedTrackIds] = useState<Set<string>>(new Set(PRESET_SOURCES[0].tracks.map((t) => t.id)))
  const [presetsOpen, setPresetsOpen] = useState(true)
  const [tableOpen, setTableOpen] = useState(true)

  const handleResolveUrl = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputUrl.trim()) return

    setIsResolving(true)
    setSyncNotice('')
    setTimeout(() => {
      setIsResolving(false)
      const mockResolved: ImportedTrack[] = [
        {
          id: `imp-${Date.now()}-1`,
          title: 'Imported Session Groove 01',
          artist: 'Discovered Artist',
          source: inputUrl.includes('youtube') ? 'youtube' : 'soundcloud',
          duration: '6:30',
          bpm: 125,
          key: '8A (Am)',
          genre: 'Minimal House',
          url: inputUrl,
          status: 'ready',
        },
        {
          id: `imp-${Date.now()}-2`,
          title: 'Imported Session Groove 02 (Dub Mix)',
          artist: 'Discovered Artist',
          source: inputUrl.includes('youtube') ? 'youtube' : 'soundcloud',
          duration: '7:12',
          bpm: 126,
          key: '5A (Cm)',
          genre: 'Deep Tech',
          url: inputUrl,
          status: 'ready',
        },
      ]
      setImportedTracks(mockResolved)
      setSelectedTrackIds(new Set(mockResolved.map((t) => t.id)))
      setSyncNotice(`✓ Risolte ${mockResolved.length} tracce dalla sorgente esterna.`)
    }, 600)
  }

  const handleLoadPreset = (preset: typeof PRESET_SOURCES[0]) => {
    setImportedTracks(preset.tracks)
    setSelectedTrackIds(new Set(preset.tracks.map((t) => t.id)))
    setSyncNotice(`✓ Caricato set preset: "${preset.label}" (${preset.tracks.length} tracce)`)
  }

  const toggleSelectTrack = (id: string) => {
    setSelectedTrackIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSyncSelected = () => {
    if (selectedTrackIds.size === 0) {
      setSyncNotice('⚠️ Seleziona almeno una traccia da sincronizzare.')
      return
    }
    const chosen = importedTracks.filter((t) => selectedTrackIds.has(t.id))
    setImportedTracks((prev) =>
      prev.map((t) => (selectedTrackIds.has(t.id) ? { ...t, status: 'synced' } : t))
    )

    const downloadable = chosen.filter((t) => t.url && (t.url.startsWith('http://') || t.url.startsWith('https://')))
    if (downloadable.length > 0) {
      batchProcess(
        downloadable,
        async (t) => {
          try {
            await api.createDownload(t.url, { title: t.title, artist: t.artist })
          } catch {
            /* ignore individual errors */
          }
        },
        3,
        100
      )
    }

    setSyncNotice(`✓ ${selectedTrackIds.size} tracce sincronizzate nel Crate personale e disponibili per il DJ Lab / Rekordbox.`)
  }

  const handlePlayGlobal = (track: ImportedTrack) => {
    if (typeof window !== 'undefined' && window.__drops_play_track) {
      window.__drops_play_track({
        title: track.title,
        artist: track.artist,
        bpm: track.bpm,
        genre: track.genre,
        audioUrl: 'https://actions.google.com/sounds/v1/science_fiction/low_humming.ogg',
      })
    }
  }

  return (
    <div className="multisource-sync-container">
      {/* HEADER BANNER */}
      <div className="multisource-header">
        <div>
          <div className="academy-badge-group">
            <span className="badge-new-pill">SYNC HUB</span>
            <span className="academy-tag">MULTI-PLATFORM</span>
          </div>
          <h2>SoundCloud &amp; YouTube Crate Sync</h2>
          <p className="multisource-sub">
            Importa tracce da playlist pubbliche, set underground e link SoundCloud/YouTube direttamente nella tua libreria.
          </p>
        </div>

        <div className="platform-badges-row">
          <span className="source-pill soundcloud">SoundCloud</span>
          <span className="source-pill youtube">YouTube</span>
          <span className="source-pill spotify">Spotify Sync</span>
        </div>
      </div>

      {/* URL INPUT FORM */}
      <div className="sync-input-card">
        <form onSubmit={handleResolveUrl} className="sync-url-form">
          <div className="input-with-icon">
            <span className="url-icon">🔗</span>
            <input
              type="url"
              className="sync-input-field"
              placeholder="Incolla link SoundCloud (es. soundcloud.com/artist/set) o YouTube Playlist..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
            />
          </div>
          <button type="submit" className="primary btn-resolve" disabled={isResolving}>
            {isResolving ? 'Analisi in corso...' : 'Risolvi e Importa'}
          </button>
        </form>

        {/* PRESET CHIPS (ACCORDION) */}
        <div className="preset-quick-chips">
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: presetsOpen ? '6px' : 0 }}
            onClick={() => setPresetsOpen((v) => !v)}
          >
            <span className="mini-label" style={{ margin: 0 }}>Oppure carica un set demo curato:</span>
            <button type="button" className="btn-sort-pill" style={{ fontSize: '11px', padding: '2px 7px' }}>
              {presetsOpen ? '▲' : '▼'}
            </button>
          </div>
          {presetsOpen && (
            <div className="chips-list">
              {PRESET_SOURCES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="preset-chip-btn"
                  onClick={() => handleLoadPreset(p)}
                >
                  {p.source === 'soundcloud' ? '🟠' : '🔴'} {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {syncNotice && (
        <div className="sync-notice-banner" role="status">
          {syncNotice}
        </div>
      )}

      {/* RESOLVED TRACKS TABLE (ACCORDION) */}
      <div className="resolved-tracks-card">
        <div
          className="card-header-row"
          style={{ cursor: 'pointer' }}
          onClick={() => setTableOpen((v) => !v)}
        >
          <h3>Tracce Estratte ({selectedTrackIds.size}/{importedTracks.length} selezionate)</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="button-link-accent btn-sync-action"
              onClick={handleSyncSelected}
            >
              📥 Importa nel Crate DJ Lab ({selectedTrackIds.size})
            </button>
            <button
              type="button"
              className="btn-sort-pill"
              onClick={() => setTableOpen((v) => !v)}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              {tableOpen ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {tableOpen && (
          <div className="tracks-table-wrapper">
            <table className="sync-tracks-table">
            <thead>
              <tr>
                <th style={{ width: '36px' }}>
                  <input
                    type="checkbox"
                    checked={selectedTrackIds.size === importedTracks.length && importedTracks.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedTrackIds(new Set(importedTracks.map((t) => t.id)))
                      else setSelectedTrackIds(new Set())
                    }}
                  />
                </th>
                <th>Titolo & Artista</th>
                <th>Sorgente</th>
                <th>Durata</th>
                <th>BPM / Key</th>
                <th>Genere</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {importedTracks.map((t) => {
                const isSelected = selectedTrackIds.has(t.id)
                return (
                  <tr key={t.id} className={isSelected ? 'selected-row' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectTrack(t.id)}
                      />
                    </td>
                    <td>
                      <div className="track-title-cell">
                        <strong>{t.title}</strong>
                        <span>{t.artist}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`source-tag ${t.source}`}>
                        {t.source === 'soundcloud' ? 'SoundCloud' : 'YouTube'}
                      </span>
                    </td>
                    <td>{t.duration}</td>
                    <td>
                      <span className="bpm-tag">{t.bpm} BPM</span>{' '}
                      <span className="key-tag">{t.key}</span>
                    </td>
                    <td>{t.genre}</td>
                    <td>
                      <span className={`status-pill ${t.status}`}>
                        {t.status === 'synced' ? '✓ Nel Crate' : 'Pronto'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-play-mini-row"
                        onClick={() => handlePlayGlobal(t)}
                        title="Ascolta nel Mini-Player"
                      >
                        ▶ Ascolta
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  )
}
