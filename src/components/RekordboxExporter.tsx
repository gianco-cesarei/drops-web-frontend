import React, { useState } from 'react'

export interface TaggedTrack {
  id: string
  title: string
  artist: string
  bpm: number
  key: string
  genre: string
  comment: string
  filename: string
  fileSize: string
  selected: boolean
}

const INITIAL_TRACKS: TaggedTrack[] = [
  {
    id: 'trk-1',
    title: 'Minimal Groove (Vinyl Rip)',
    artist: 'Alex Rossi',
    bpm: 124,
    key: '8A (Am)',
    genre: 'Microhouse',
    comment: 'MANIA Private Set 2026',
    filename: 'Alex Rossi - Minimal Groove (Vinyl Rip).wav',
    fileSize: '48.2 MB',
    selected: true,
  },
  {
    id: 'trk-2',
    title: 'Hypnotic Deep Flow (Club Mix)',
    artist: 'MANIA Collective',
    bpm: 126,
    key: '5A (Cm)',
    genre: 'Minimal Techno',
    comment: 'Houghton Morning Tool',
    filename: 'MANIA Collective - Hypnotic Deep Flow.wav',
    fileSize: '52.1 MB',
    selected: true,
  },
  {
    id: 'trk-3',
    title: 'Submarine Bassline (Pre-master)',
    artist: 'Marco Donati',
    bpm: 125,
    key: '11B (A)',
    genre: 'Deep Tech',
    comment: 'Unreleased Dubplate',
    filename: 'Marco Donati - Submarine Bassline.wav',
    fileSize: '44.8 MB',
    selected: true,
  },
]

export default function RekordboxExporter() {
  const [tracks, setTracks] = useState<TaggedTrack[]>(INITIAL_TRACKS)
  const [activeTrackId, setActiveTrackId] = useState<string>('trk-1')
  const [usbDriveName, setUsbDriveName] = useState<string>('PIONEER_DJ')
  const [namingPattern, setNamingPattern] = useState<string>('{artist} - {title} [{bpm}bpm]')
  const [folderStructure, setFolderStructure] = useState<'genre' | 'artist' | 'flat'>('genre')
  const [exportNotice, setExportNotice] = useState<string>('')

  const activeTrack = tracks.find((t) => t.id === activeTrackId) || tracks[0]

  const updateTrackField = (field: keyof TaggedTrack, value: any) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === activeTrackId ? { ...t, [field]: value } : t))
    )
  }

  const toggleSelect = (id: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t))
    )
  }

  const selectAll = (selected: boolean) => {
    setTracks((prev) => prev.map((t) => ({ ...t, selected })))
  }

  const selectedCount = tracks.filter((t) => t.selected).length

  const handleExportUSB = () => {
    if (selectedCount === 0) {
      setExportNotice('⚠️ Seleziona almeno una traccia prima di esportare.')
      return
    }
    setExportNotice(
      `✓ Pacchetto Rekordbox USB generato per il drive "${usbDriveName}". ${selectedCount} tracce ordinate con struttura /${folderStructure.toUpperCase()}/ e metadati ID3 v2.4 puliti.`
    )
  }

  return (
    <div className="rekordbox-exporter-container">
      {/* HEADER BANNER */}
      <div className="rekordbox-header-banner">
        <div>
          <div className="academy-badge-group">
            <span className="badge-new-pill">UTILITY PRO</span>
            <span className="academy-tag">DJ HARDWARE PREP</span>
          </div>
          <h2>Editor Tag ID3 & Esportatore Rekordbox USB</h2>
          <p className="rekordbox-sub">
            Pulisci i metadati, correggi BPM e tonalità armonica (Camelot Key), e prepara la cartella per chiavette USB compatibili con Pioneer CDJ-3000 / XDJ.
          </p>
        </div>

        <div className="rekordbox-quick-stat">
          <strong>{selectedCount}/{tracks.length}</strong>
          <span>Tracce Selezionate</span>
        </div>
      </div>

      {/* MAIN TWO COLUMN GRID */}
      <div className="rekordbox-grid-layout">
        {/* LEFT COLUMN: TRACK LIST */}
        <div className="rekordbox-track-list-card">
          <div className="card-top-bar">
            <div className="select-all-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedCount === tracks.length && tracks.length > 0}
                  onChange={(e) => selectAll(e.target.checked)}
                />
                <span>Seleziona tutte</span>
              </label>
            </div>
            <span className="mini-note">Clicca una traccia per modificare i tag</span>
          </div>

          <div className="tracks-scroll-list">
            {tracks.map((t) => (
              <div
                key={t.id}
                className={`rekordbox-track-row ${t.id === activeTrackId ? 'active' : ''}`}
                onClick={() => setActiveTrackId(t.id)}
              >
                <input
                  type="checkbox"
                  checked={t.selected}
                  onChange={(e) => {
                    e.stopPropagation()
                    toggleSelect(t.id)
                  }}
                  className="row-checkbox"
                />

                <div className="row-main-meta">
                  <strong className="row-title">{t.title}</strong>
                  <span className="row-sub">{t.artist} • {t.genre}</span>
                </div>

                <div className="row-tags-pills">
                  <span className="bpm-badge">{t.bpm} BPM</span>
                  <span className="key-badge">{t.key}</span>
                </div>
              </div>
            ))}
          </div>

          {/* USB EXPORT OPTIONS */}
          <div className="usb-export-options-box">
            <div className="opt-row">
              <label className="opt-label">
                <span>Nome USB Drive:</span>
                <input
                  type="text"
                  value={usbDriveName}
                  onChange={(e) => setUsbDriveName(e.target.value)}
                  placeholder="PIONEER_DJ"
                />
              </label>

              <label className="opt-label">
                <span>Organizzazione Cartelle:</span>
                <select
                  value={folderStructure}
                  onChange={(e) => setFolderStructure(e.target.value as any)}
                >
                  <option value="genre">Per Genere (/GENERE/Traccia.wav)</option>
                  <option value="artist">Per Artista (/ARTISTA/Traccia.wav)</option>
                  <option value="flat">Cartella Singola (/CRATE/Traccia.wav)</option>
                </select>
              </label>
            </div>

            <div className="export-action-row">
              <button
                type="button"
                className="btn-export-rekordbox"
                onClick={handleExportUSB}
              >
                💾 Esporta su Chiavetta USB ({selectedCount} tracce)
              </button>
            </div>

            {exportNotice && (
              <div className="export-notice-banner" role="status">
                {exportNotice}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ID3 TAG EDITOR */}
        <div className="rekordbox-tag-editor-card">
          <div className="editor-card-header">
            <h3>Modifica Metadati ID3 (v2.4)</h3>
            <span className="editor-track-target">{activeTrack.title}</span>
          </div>

          <form className="tag-editor-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="tag-title">Titolo Traccia:</label>
              <input
                id="tag-title"
                type="text"
                value={activeTrack.title}
                onChange={(e) => updateTrackField('title', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tag-artist">Artista / Produttore:</label>
              <input
                id="tag-artist"
                type="text"
                value={activeTrack.artist}
                onChange={(e) => updateTrackField('artist', e.target.value)}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="tag-bpm">BPM:</label>
                <input
                  id="tag-bpm"
                  type="number"
                  value={activeTrack.bpm}
                  onChange={(e) => updateTrackField('bpm', parseInt(e.target.value, 10) || 0)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="tag-key">Tonalità Armonica (Camelot Key):</label>
                <input
                  id="tag-key"
                  type="text"
                  value={activeTrack.key}
                  onChange={(e) => updateTrackField('key', e.target.value)}
                  placeholder="es. 8A, 5B..."
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="tag-genre">Genere Musicale:</label>
              <input
                id="tag-genre"
                type="text"
                value={activeTrack.genre}
                onChange={(e) => updateTrackField('genre', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tag-comment">Commento DJ / Note Set:</label>
              <input
                id="tag-comment"
                type="text"
                value={activeTrack.comment}
                onChange={(e) => updateTrackField('comment', e.target.value)}
                placeholder="es. Peak time, Warmup, Outro..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="tag-pattern">Formato Nome File:</label>
              <input
                id="tag-pattern"
                type="text"
                value={namingPattern}
                onChange={(e) => setNamingPattern(e.target.value)}
              />
              <span className="field-hint">Variabili disponibili: &#123;artist&#125;, &#123;title&#125;, &#123;bpm&#125;, &#123;key&#125;</span>
            </div>

            <div className="preview-filename-box">
              <span className="mini-label">Anteprima Nome File:</span>
              <code className="filename-code">
                {namingPattern
                  .replace('{artist}', activeTrack.artist)
                  .replace('{title}', activeTrack.title)
                  .replace('{bpm}', String(activeTrack.bpm))
                  .replace('{key}', activeTrack.key)}
                .wav
              </code>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
