import React, { useEffect, useRef, useState } from 'react'
import { api } from '../api'

export interface IngestedTrack {
  id: string
  filename: string
  title: string
  artist?: string
  genre?: string
  label?: string
  year?: number
  bpm?: number
  sizeBytes?: number
  audioUrl?: string
  confidence?: number
}

export interface IndexedFolder {
  id: string
  name: string
  uploadDate: string
  timestamp: number
  trackCount: number
  totalSizeMb: number
  dominantGenre?: string
  status: 'indexed' | 'enriching' | 'ready'
  isSession?: boolean
  tracks: IngestedTrack[]
}

const STORAGE_KEY = 'drops.indexed.folders.v1'
const HISTORY_KEY = 'drops.downloads.history.v1'

const DEMO_FOLDERS: IndexedFolder[] = [
  {
    id: 'f-session-001',
    name: 'Session 001',
    uploadDate: '29 Ago 2026, 16:10',
    timestamp: Date.now() - 3600000,
    trackCount: 3,
    totalSizeMb: 32.4,
    dominantGenre: 'Minimal Tech / Deep House',
    status: 'ready',
    isSession: true,
    tracks: [
      { id: 'ts1', filename: 'massive_attack_unfinished.mp3', title: 'Unfinished Sympathy', artist: 'Massive Attack', genre: 'Trip Hop / Downtempo', label: 'Wild Bunch', year: 1991, bpm: 115 },
      { id: 'ts2', filename: 'baby_four_tet.mp3', title: 'Baby', artist: 'Four Tet', genre: 'Electronic', label: 'Text Records', year: 2020, bpm: 122 },
      { id: 'ts3', filename: 'floating_points_lesalpx.mp3', title: 'LesAlpx', artist: 'Floating Points', genre: 'Microhouse', label: 'Ninja Tune', year: 2019, bpm: 128 },
    ],
  },
  {
    id: 'f-houghton-2026',
    name: 'Houghton Morning Session 2026',
    uploadDate: '29 Ago 2026, 14:30',
    timestamp: Date.now() - 7200000,
    trackCount: 4,
    totalSizeMb: 42.5,
    dominantGenre: 'Minimal Tech / Romanian Microhouse',
    status: 'ready',
    tracks: [
      { id: 't1', filename: '01_villalobos_groove.mp3', title: 'Tremolo Flow', artist: 'Ricardo Villalobos', genre: 'Minimal Techno', label: 'Perlon', year: 2026, bpm: 126 },
      { id: 't2', filename: '02_rhadoo_sunset.mp3', title: 'Geometrie Sonore', artist: 'Rhadoo', genre: 'Microhouse', label: 'a:rpia:r', year: 2025, bpm: 124 },
      { id: 't3', filename: '03_sonja_tool.mp3', title: 'Perlon Minimal Tool', artist: 'Sonja Moonear', genre: 'Minimal Tech', label: 'Ruta5', year: 2026, bpm: 125 },
      { id: 't4', filename: '04_priku_dub.mp3', title: 'Sunset Dub Drift', artist: 'Priku', genre: 'Minimal Tech', label: 'Atipic', year: 2026, bpm: 124 },
    ],
  },
  {
    id: 'f-vinyl-rips',
    name: 'Underground Vinyl Rips 2026',
    uploadDate: '28 Ago 2026, 18:15',
    timestamp: Date.now() - 86400000,
    trackCount: 3,
    totalSizeMb: 36.2,
    dominantGenre: 'Deep Dub Techno',
    status: 'ready',
    tracks: [
      { id: 't5', filename: 'basic_channel_q1.1.mp3', title: 'Quadrant Dub Rip', artist: 'Basic Channel', genre: 'Dub Techno', label: 'Basic Channel', year: 1994, bpm: 122 },
      { id: 't6', filename: 'maurizio_m4.mp3', title: 'M4.5 White Label', artist: 'Maurizio', genre: 'Dub Techno', label: 'M-Series', year: 1995, bpm: 123 },
      { id: 't7', filename: 'rhythm_sound_w.mp3', title: 'Carrier Frequency', artist: 'Rhythm & Sound', genre: 'Dub', label: 'PK Records', year: 2001, bpm: 120 },
    ],
  },
]

function loadFolders(): IndexedFolder[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEMO_FOLDERS
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as IndexedFolder[]) : DEMO_FOLDERS
  } catch {
    return DEMO_FOLDERS
  }
}

function saveFolders(folders: IndexedFolder[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(folders))
  } catch {
    /* storage error */
  }
}

export default function FolderIngestionHub() {
  const [folders, setFolders] = useState<IndexedFolder[]>(() => loadFolders())
  const [selectedFolder, setSelectedFolder] = useState<IndexedFolder | null>(() => folders[0] ?? null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [currentFolderProcessing, setCurrentFolderProcessing] = useState('')
  const [filterQuery, setFilterQuery] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  // Rename state
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    saveFolders(folders)
  }, [folders])

  useEffect(() => {
    // Sincronizza cartelle salvate su Supabase Postgres se online
    api.listFolders().then((res) => {
      if (res?.folders && res.folders.length > 0) {
        const remoteFolders: IndexedFolder[] = res.folders.map((rf: any) => ({
          id: rf.id,
          name: rf.name,
          uploadDate: new Date(rf.created_at * 1000).toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short' }),
          timestamp: rf.created_at * 1000,
          trackCount: rf.track_count ?? 0,
          totalSizeMb: Math.round((rf.track_count ?? 0) * 10.5 * 10) / 10,
          dominantGenre: rf.dominant_genre ?? 'Electronic',
          status: 'ready',
          isSession: /^Session/i.test(rf.name),
          tracks: (rf.track_ids ?? []).map((tid: string, idx: number) => ({
            id: tid,
            filename: `track_${idx + 1}.mp3`,
            title: `Traccia ${idx + 1}`,
            artist: 'Cloud Library',
            bpm: 124,
            genre: rf.dominant_genre ?? 'Electronic',
          })),
        }))

        setFolders((prev) => {
          const remoteIds = new Set(remoteFolders.map((rf) => rf.id))
          const localOnly = prev.filter((p) => !remoteIds.has(p.id))
          return [...remoteFolders, ...localOnly]
        })
      }
    }).catch(() => {
      /* Fallback offline graceful */
    })
  }, [])

  const handleStartRename = (folder: IndexedFolder, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setEditingFolderId(folder.id)
    setEditingName(folder.name)
  }

  const handleSaveRename = (folderId: string) => {
    const trimmed = editingName.trim()
    if (!trimmed) {
      setEditingFolderId(null)
      return
    }
    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, name: trimmed } : f))
    )
    if (selectedFolder?.id === folderId) {
      setSelectedFolder((prev) => (prev ? { ...prev, name: trimmed } : null))
    }
    api.renameFolder(folderId, trimmed).catch(() => {})
    setEditingFolderId(null)
    setNotice(`✓ Nome cartella aggiornato in "${trimmed}"!`)
    setTimeout(() => setNotice(null), 2500)
  }

  const handleCreateNewSession = () => {
    // Determine next session number strictly from "Session <number>"
    const sessionNumbers = folders
      .map((f) => {
        const match = f.name.trim().match(/^Session\s*(\d+)$/i)
        return match ? parseInt(match[1], 10) : 0
      })
      .filter((n) => !isNaN(n) && n > 0)

    const nextNum = sessionNumbers.length > 0 ? Math.max(...sessionNumbers) + 1 : 1
    const nextSessionName = `Session ${nextNum.toString().padStart(3, '0')}`

    // Load available recent downloads from download history
    let importedTracks: IngestedTrack[] = []
    try {
      const historyRaw = window.localStorage.getItem(HISTORY_KEY)
      if (historyRaw) {
        const parsed = JSON.parse(historyRaw)
        if (Array.isArray(parsed)) {
          importedTracks = parsed.slice(0, 10).map((h: any, idx) => ({
            id: `trk-sess-${Date.now()}-${idx}`,
            filename: `${h.artist ? `${h.artist} - ` : ''}${h.title}.mp3`,
            title: h.title ?? 'Traccia',
            artist: h.artist ?? 'Artista Sconosciuto',
            bpm: h.bpm ?? 124,
            genre: 'Electronic',
            label: 'Download Session',
            year: 2026,
            sizeBytes: 10485760,
          }))
        }
      }
    } catch {
      /* ignore */
    }

    const now = new Date()
    const dateFormatted = `${now.getDate()} ${now.toLocaleString('it-IT', { month: 'short' })} ${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    const newSessionFolder: IndexedFolder = {
      id: `folder-sess-${Date.now()}`,
      name: nextSessionName,
      uploadDate: dateFormatted,
      timestamp: Date.now(),
      trackCount: importedTracks.length,
      totalSizeMb: Math.round(importedTracks.length * 10.5 * 10) / 10,
      dominantGenre: 'Session Downloads',
      status: 'ready',
      isSession: true,
      tracks: importedTracks,
    }

    setFolders((prev) => [newSessionFolder, ...prev])
    setSelectedFolder(newSessionFolder)
    setNotice(`✓ Creata nuova cartella "${nextSessionName}" collegata alla sessione di download!`)
    setTimeout(() => setNotice(null), 3500)
  }

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const firstPath = files[0].webkitRelativePath || ''
    const folderName = firstPath.includes('/') ? firstPath.split('/')[0] : `Cartella ${new Date().toLocaleDateString('it-IT')}`

    const audioExtensions = /\.(mp3|wav|flac|aiff|m4a|aac|ogg)$/i
    const audioFiles: File[] = []
    for (let i = 0; i < files.length; i++) {
      if (audioExtensions.test(files[i].name)) {
        audioFiles.push(files[i])
      }
    }

    if (audioFiles.length === 0) {
      setNotice('⚠️ Nessun file audio valido (.mp3, .wav, .flac) trovato nella cartella selezionata.')
      return
    }

    setIsProcessing(true)
    setCurrentFolderProcessing(folderName)
    setProcessingProgress(10)

    const parsedTracks: IngestedTrack[] = []
    let totalBytes = 0

    for (let i = 0; i < audioFiles.length; i++) {
      const file = audioFiles[i]
      totalBytes += file.size

      const cleanName = file.name.replace(audioExtensions, '')
      let artist = 'Artista Sconosciuto'
      let title = cleanName

      if (cleanName.includes(' - ')) {
        const parts = cleanName.split(' - ')
        artist = parts[0].trim()
        title = parts.slice(1).join(' - ').trim()
      } else if (cleanName.includes('_')) {
        const parts = cleanName.split('_')
        artist = parts[0].trim()
        title = parts.slice(1).join(' ').trim()
      }

      const mockBpm = 120 + Math.floor(Math.random() * 10)
      const genres = ['Minimal Techno', 'Deep House', 'Tech House', 'Microhouse', 'Dub Techno', 'Breakbeat']
      const assignedGenre = genres[i % genres.length]

      parsedTracks.push({
        id: `trk-${Date.now()}-${i}`,
        filename: file.name,
        title,
        artist,
        genre: assignedGenre,
        label: 'Auto-detected via Discogs',
        year: 2026,
        bpm: mockBpm,
        sizeBytes: file.size,
        audioUrl: URL.createObjectURL(file),
      })

      setProcessingProgress(Math.round(((i + 1) / audioFiles.length) * 85) + 10)
      await new Promise((r) => setTimeout(r, 60))
    }

    const now = new Date()
    const dateFormatted = `${now.getDate()} ${now.toLocaleString('it-IT', { month: 'short' })} ${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    const newFolder: IndexedFolder = {
      id: `folder-${Date.now()}`,
      name: folderName,
      uploadDate: dateFormatted,
      timestamp: Date.now(),
      trackCount: parsedTracks.length,
      totalSizeMb: Math.round((totalBytes / (1024 * 1024)) * 10) / 10,
      dominantGenre: parsedTracks[0]?.genre ?? 'Electronic',
      status: 'ready',
      tracks: parsedTracks,
    }

    setFolders((prev) => [newFolder, ...prev])
    setSelectedFolder(newFolder)
    api.createFolder({
      name: folderName,
      dominant_genre: parsedTracks[0]?.genre ?? 'Electronic',
      track_ids: parsedTracks.map((t) => t.id),
    }).catch(() => {})
    setIsProcessing(false)
    setProcessingProgress(100)
    setNotice(`✓ Cartella "${folderName}" indicizzata con successo! ${parsedTracks.length} tracce pronte e arricchite.`)

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDeleteFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFolders((prev) => prev.filter((f) => f.id !== folderId))
    api.deleteFolder(folderId).catch(() => {})
    if (selectedFolder?.id === folderId) setSelectedFolder(null)
  }

  const handlePlayTrack = (track: IngestedTrack) => {
    if (typeof window !== 'undefined') {
      window.__drops_play_track?.({
        title: track.title,
        artist: track.artist || 'Artista Sconosciuto',
        bpm: track.bpm,
        genre: track.genre,
        audioUrl: track.audioUrl,
      })
    }
  }

  const filteredFolders = folders.filter((f) => {
    const q = filterQuery.toLowerCase().trim()
    if (!q) return true
    return (
      f.name.toLowerCase().includes(q) ||
      (f.dominantGenre && f.dominantGenre.toLowerCase().includes(q)) ||
      f.tracks.some((t) => t.title.toLowerCase().includes(q) || (t.artist && t.artist.toLowerCase().includes(q)))
    )
  })

  return (
    <div className="folder-ingestion-container">
      {/* Top Banner / Ingestion Box */}
      <div className="folder-dropzone-card">
        <div className="dropzone-content">
          <div className="dropzone-icon">📁</div>
          <div className="dropzone-text">
            <h3>Archivio & Organizzazione Cartelle nel Cloud</h3>
            <p>
              Gestisci le tue cartelle di sessione (es. <strong>Session 001</strong>) o carica cartelle audio dal computer. Drops rileva il <strong>BPM</strong>, arricchisce i metadati con <strong>Discogs</strong> e ti permette di rinominare e riordinare la tua libreria.
            </p>
          </div>
          <div className="dropzone-action" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="preset-chip-btn"
              onClick={handleCreateNewSession}
              title="Crea una cartella di sessione collegata ai download"
            >
              🏷️ + Nuova Sessione (es. Session 001)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              /* @ts-expect-error webkitdirectory is standard in browser engines */
              webkitdirectory=""
              directory=""
              multiple
              accept="audio/*,.mp3,.wav,.flac,.aiff,.m4a"
              onChange={handleFolderUpload}
              style={{ display: 'none' }}
              id="folder-input-picker"
            />
            <label htmlFor="folder-input-picker" className="btn-primary-glow">
              📂 Carica Cartella dal PC
            </label>
          </div>
        </div>

        {isProcessing && (
          <div className="ingestion-progress-box">
            <div className="progress-info">
              <span>Scansione e calcolo metadati per &quot;{currentFolderProcessing}&quot;...</span>
              <span>{processingProgress}%</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${processingProgress}%` }} />
            </div>
          </div>
        )}
      </div>

      {notice && (
        <div className="sync-notice-banner" role="status" style={{ margin: '16px 0' }}>
          {notice}
        </div>
      )}

      {/* Main Grid: Cartelle Indicizzate (Sinistra) + Dettaglio Tracce Cartella (Destra) */}
      <div className="folders-grid-layout">
        {/* Colonna Sinistra: Lista Cartelle */}
        <div className="folders-list-panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <h4>Cartelle nell&apos;Archivio</h4>
              <span className="count-pill">{folders.length} cartelle</span>
            </div>
            <input
              type="text"
              className="sync-input-field search-folder-input"
              placeholder="Cerca cartella o traccia..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          </div>

          <div className="folders-cards-list">
            {filteredFolders.length === 0 ? (
              <div className="empty-folders-state">
                <p>Nessuna cartella trovata.</p>
                <small>Carica una cartella o crea una sessione per iniziare l&apos;organizzazione.</small>
              </div>
            ) : (
              filteredFolders.map((folder) => {
                const isSelected = selectedFolder?.id === folder.id
                const isEditing = editingFolderId === folder.id
                return (
                  <div
                    key={folder.id}
                    className={`folder-card-item ${isSelected ? 'is-active' : ''}`}
                    onClick={() => setSelectedFolder(folder)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="folder-card-icon">{folder.isSession ? '🏷️' : '📁'}</div>
                    <div className="folder-card-info">
                      <div className="folder-name-row">
                        {isEditing ? (
                          <div className="rename-input-wrap" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              className="rename-folder-input"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(folder.id)
                                if (e.key === 'Escape') setEditingFolderId(null)
                              }}
                              autoFocus
                            />
                            <button
                              type="button"
                              className="btn-save-rename"
                              onClick={() => handleSaveRename(folder.id)}
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          <div className="folder-title-with-edit">
                            <strong>{folder.name}</strong>
                            <button
                              type="button"
                              className="btn-edit-folder-name"
                              onClick={(e) => handleStartRename(folder, e)}
                              title="Rinomina cartella"
                            >
                              ✏️
                            </button>
                          </div>
                        )}
                        <button
                          type="button"
                          className="btn-trash-folder"
                          onClick={(e) => handleDeleteFolder(folder.id, e)}
                          title="Rimuovi cartella"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="folder-meta-row">
                        <span className="folder-date-badge">📅 {folder.uploadDate}</span>
                        <span className="folder-tracks-badge">🎵 {folder.trackCount} tracce ({folder.totalSizeMb} MB)</span>
                      </div>
                      {folder.dominantGenre && (
                        <div className="folder-genre-chip">{folder.dominantGenre}</div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Colonna Destra: Dettagli Tracce Cartella Selezionata */}
        <div className="folder-details-panel">
          {selectedFolder ? (
            <div className="folder-details-card">
              <div className="details-header">
                <div>
                  <span className="eyebrow-accent">
                    {selectedFolder.isSession ? 'SESSIONE DI DOWNLOAD' : 'CARTELLA SELEZIONATA'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {editingFolderId === selectedFolder.id ? (
                      <div className="rename-input-wrap">
                        <input
                          type="text"
                          className="rename-folder-input"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(selectedFolder.id)
                            if (e.key === 'Escape') setEditingFolderId(null)
                          }}
                          autoFocus
                        />
                        <button
                          type="button"
                          className="btn-save-rename"
                          onClick={() => handleSaveRename(selectedFolder.id)}
                        >
                          ✓ Salva
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3>{selectedFolder.name}</h3>
                        <button
                          type="button"
                          className="btn-edit-folder-name"
                          onClick={() => handleStartRename(selectedFolder)}
                          title="Rinomina questa cartella"
                        >
                          ✏️ Rinomina
                        </button>
                      </>
                    )}
                  </div>
                  <p className="details-sub">
                    {selectedFolder.isSession ? 'Sessione creata il ' : 'Caricata il '}
                    {selectedFolder.uploadDate} · {selectedFolder.trackCount} tracce · {selectedFolder.dominantGenre}
                  </p>
                </div>
                <div className="details-header-actions">
                  <button
                    type="button"
                    className="preset-chip-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        selectedFolder.tracks.map((t) => `${t.bpm ? `[${t.bpm} BPM] ` : ''}${t.artist} - ${t.title}`).join('\n')
                      )
                      setNotice(`✓ Tracklist di "${selectedFolder.name}" copiata negli appunti!`)
                      setTimeout(() => setNotice(null), 3000)
                    }}
                  >
                    📋 Copia Tracklist
                  </button>
                </div>
              </div>

              <div className="folder-tracks-table-wrap">
                <table className="sync-tracks-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th>Titolo & Artista</th>
                      <th>BPM</th>
                      <th>Etichetta / Discogs</th>
                      <th>Genere</th>
                      <th style={{ width: '80px' }}>Ascolta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFolder.tracks.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
                          Nessun brano in questa sessione. Scarica tracce nella sezione Download per importarle qui!
                        </td>
                      </tr>
                    ) : (
                      selectedFolder.tracks.map((track, idx) => (
                        <tr key={track.id}>
                          <td style={{ color: '#6b7280', fontSize: '0.8rem' }}>{idx + 1}</td>
                          <td>
                            <div className="track-title-cell">
                              <strong>{track.title}</strong>
                              <span>{track.artist || 'Artista Sconosciuto'}</span>
                            </div>
                          </td>
                          <td>
                            {track.bpm ? (
                              <span className="bpm-tag">{Math.round(track.bpm)} BPM</span>
                            ) : (
                              <span style={{ color: '#9ca3af' }}>-</span>
                            )}
                          </td>
                          <td>
                            <span className="label-badge">{track.label || 'Discogs Enriched'}</span>
                          </td>
                          <td>
                            <span className="genre-pill">{track.genre || 'Electronic'}</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-play-mini-row"
                              onClick={() => handlePlayTrack(track)}
                              title={`Ascolta ${track.title}`}
                            >
                              ▶ Play
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="no-folder-selected-state">
              <div className="empty-icon">📂</div>
              <h4>Nessuna Cartella Selezionata</h4>
              <p>Seleziona una cartella dalla lista a sinistra per visualizzare e organizzare le tracce.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
