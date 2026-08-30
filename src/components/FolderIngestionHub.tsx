import React, { useEffect, useMemo, useRef, useState } from 'react'
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
  keySignature?: string
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
const DEMO_AUDIO_PREVIEW = 'https://actions.google.com/sounds/v1/science_fiction/low_humming.ogg'

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
      { id: 'ts1', filename: 'massive_attack_unfinished.mp3', title: 'Unfinished Sympathy', artist: 'Massive Attack', genre: 'Trip Hop / Downtempo', label: 'Wild Bunch', year: 1991, bpm: 115, keySignature: '8A', audioUrl: DEMO_AUDIO_PREVIEW },
      { id: 'ts2', filename: 'baby_four_tet.mp3', title: 'Baby', artist: 'Four Tet', genre: 'Electronic', label: 'Text Records', year: 2020, bpm: 122, keySignature: '11B', audioUrl: DEMO_AUDIO_PREVIEW },
      { id: 'ts3', filename: 'floating_points_lesalpx.mp3', title: 'LesAlpx', artist: 'Floating Points', genre: 'Microhouse', label: 'Ninja Tune', year: 2019, bpm: 128, keySignature: '4A', audioUrl: DEMO_AUDIO_PREVIEW },
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
      { id: 't1', filename: '01_villalobos_groove.mp3', title: 'Tremolo Flow', artist: 'Ricardo Villalobos', genre: 'Minimal Techno', label: 'Perlon', year: 2026, bpm: 126, keySignature: '5A', audioUrl: DEMO_AUDIO_PREVIEW },
      { id: 't2', filename: '02_rhadoo_sunset.mp3', title: 'Geometrie Sonore', artist: 'Rhadoo', genre: 'Microhouse', label: 'a:rpia:r', year: 2025, bpm: 124, keySignature: '8B', audioUrl: DEMO_AUDIO_PREVIEW },
      { id: 't3', filename: '03_sonja_tool.mp3', title: 'Perlon Minimal Tool', artist: 'Sonja Moonear', genre: 'Minimal Tech', label: 'Ruta5', year: 2026, bpm: 125, keySignature: '7A', audioUrl: DEMO_AUDIO_PREVIEW },
      { id: 't4', filename: '04_priku_dub.mp3', title: 'Sunset Dub Drift', artist: 'Priku', genre: 'Minimal Tech', label: 'Atipic', year: 2026, bpm: 124, keySignature: '9A', audioUrl: DEMO_AUDIO_PREVIEW },
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
      { id: 't5', filename: 'basic_channel_q1.1.mp3', title: 'Quadrant Dub Rip', artist: 'Basic Channel', genre: 'Dub Techno', label: 'Basic Channel', year: 1994, bpm: 122, keySignature: '2A', audioUrl: DEMO_AUDIO_PREVIEW },
      { id: 't6', filename: 'maurizio_m4.mp3', title: 'M4.5 White Label', artist: 'Maurizio', genre: 'Dub Techno', label: 'M-Series', year: 1995, bpm: 123, keySignature: '10A', audioUrl: DEMO_AUDIO_PREVIEW },
      { id: 't7', filename: 'rhythm_sound_w.mp3', title: 'Carrier Frequency', artist: 'Rhythm & Sound', genre: 'Dub', label: 'PK Records', year: 2001, bpm: 120, keySignature: '6B', audioUrl: DEMO_AUDIO_PREVIEW },
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
  const [selectedFolderId, setSelectedFolderId] = useState<string>(() => folders[0]?.id || '__all__')
  const [sidebarFilter, setSidebarFilter] = useState<'all' | 'folders' | 'sessions'>('all')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [currentFolderProcessing, setCurrentFolderProcessing] = useState('')
  const [filterQuery, setFilterQuery] = useState('')
  const [trackFilterQuery, setTrackFilterQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'tracks'>('date')
  const [notice, setNotice] = useState<string | null>(null)
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  // Rename folder state
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
            audioUrl: DEMO_AUDIO_PREVIEW,
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

  // All tracks aggregated
  const allTracks = useMemo(() => {
    return folders.flatMap((f) => f.tracks)
  }, [folders])

  const selectedFolder = useMemo(() => {
    if (selectedFolderId === '__all__') {
      return {
        id: '__all__',
        name: 'Tutta la Libreria',
        uploadDate: 'Sempre aggiornata',
        timestamp: Date.now(),
        trackCount: allTracks.length,
        totalSizeMb: Math.round(allTracks.reduce((acc, t) => acc + (t.sizeBytes || 10485760), 0) / (1024 * 1024) * 10) / 10,
        dominantGenre: 'Catalogo Drops Globale',
        status: 'ready' as const,
        isSession: false,
        tracks: allTracks,
      }
    }
    return folders.find((f) => f.id === selectedFolderId) || folders[0] || null
  }, [folders, selectedFolderId, allTracks])

  const handleStartRename = (folder: IndexedFolder, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (folder.id === '__all__') return
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
    api.renameFolder(folderId, trimmed).catch(() => {})
    setEditingFolderId(null)
    setNotice(`✓ Nome cartella aggiornato in "${trimmed}"!`)
    setTimeout(() => setNotice(null), 2500)
  }

  const handleCreateNewSession = () => {
    const sessionNumbers = folders
      .map((f) => {
        const match = f.name.trim().match(/^Session\s*(\d+)$/i)
        return match ? parseInt(match[1], 10) : 0
      })
      .filter((n) => !isNaN(n) && n > 0)

    const nextNum = sessionNumbers.length > 0 ? Math.max(...sessionNumbers) + 1 : 1
    const nextSessionName = `Session ${nextNum.toString().padStart(3, '0')}`

    let importedTracks: IngestedTrack[] = []
    try {
      const historyRaw = window.localStorage.getItem(HISTORY_KEY)
      if (historyRaw) {
        const parsed = JSON.parse(historyRaw)
        if (Array.isArray(parsed)) {
          importedTracks = parsed.slice(0, 15).map((h: any, idx) => ({
            id: `trk-sess-${Date.now()}-${idx}`,
            filename: `${h.artist ? `${h.artist} - ` : ''}${h.title}.mp3`,
            title: h.title ?? 'Traccia',
            artist: h.artist ?? 'Artista Sconosciuto',
            bpm: h.bpm ?? 124,
            keySignature: '8A',
            genre: 'Electronic',
            label: 'Download Session',
            year: 2026,
            sizeBytes: 10485760,
            audioUrl: h.id ? api.fileUrl(h.id) : DEMO_AUDIO_PREVIEW,
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
    setSelectedFolderId(newSessionFolder.id)
    setNotice(`✓ Creata nuova cartella "${nextSessionName}" in stile Apple Music!`)
    setTimeout(() => setNotice(null), 3500)
  }

  const processAudioFiles = async (files: FileList | File[], folderNameGuess?: string) => {
    const audioExtensions = /\.(mp3|wav|flac|aiff|m4a|aac|ogg)$/i
    const audioFiles: File[] = []
    for (let i = 0; i < files.length; i++) {
      if (audioExtensions.test(files[i].name)) {
        audioFiles.push(files[i])
      }
    }

    if (audioFiles.length === 0) {
      setNotice('⚠️ Nessun file audio valido (.mp3, .wav, .flac) trovato.')
      return
    }

    const firstPath = audioFiles[0].webkitRelativePath || ''
    const folderName = folderNameGuess || (firstPath.includes('/') ? firstPath.split('/')[0] : `Cartella ${new Date().toLocaleDateString('it-IT')}`)

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
      const camelotKeys = ['8A', '11B', '4A', '5A', '7A', '9B', '2A', '6B', '10A']
      const assignedKey = camelotKeys[i % camelotKeys.length]

      parsedTracks.push({
        id: `trk-${Date.now()}-${i}`,
        filename: file.name,
        title,
        artist,
        genre: assignedGenre,
        label: 'Auto-detected Discogs',
        year: 2026,
        bpm: mockBpm,
        keySignature: assignedKey,
        sizeBytes: file.size,
        audioUrl: URL.createObjectURL(file),
      })

      setProcessingProgress(Math.round(((i + 1) / audioFiles.length) * 85) + 10)
      await new Promise((r) => setTimeout(r, 40))
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
    setSelectedFolderId(newFolder.id)
    api.createFolder({
      name: folderName,
      dominant_genre: parsedTracks[0]?.genre ?? 'Electronic',
      track_ids: parsedTracks.map((t) => t.id),
    }).catch(() => {})
    setIsProcessing(false)
    setProcessingProgress(100)
    setNotice(`✓ Cartella "${folderName}" caricata con successo! ${parsedTracks.length} brani indicizzati.`)
    setTimeout(() => setNotice(null), 4000)

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    await processAudioFiles(files)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDraggingOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processAudioFiles(e.dataTransfer.files, 'Cartella Trascina & Rilascia')
    }
  }

  const handleDeleteFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (folderId === '__all__') return
    setFolders((prev) => prev.filter((f) => f.id !== folderId))
    api.deleteFolder(folderId).catch(() => {})
    if (selectedFolderId === folderId) {
      setSelectedFolderId('__all__')
    }
  }

  const handlePlayTrack = (track: IngestedTrack) => {
    setPlayingTrackId(track.id)
    if (typeof window !== 'undefined') {
      window.__drops_play_track?.({
        id: track.id,
        title: track.title,
        artist: track.artist || 'Artista Sconosciuto',
        bpm: track.bpm,
        genre: track.genre,
        audioUrl: track.audioUrl || DEMO_AUDIO_PREVIEW,
      })
    }
  }

  const handlePlayAll = () => {
    if (selectedFolder && selectedFolder.tracks.length > 0) {
      handlePlayTrack(selectedFolder.tracks[0])
    }
  }

  const handleShufflePlay = () => {
    if (selectedFolder && selectedFolder.tracks.length > 0) {
      const randomTrack = selectedFolder.tracks[Math.floor(Math.random() * selectedFolder.tracks.length)]
      handlePlayTrack(randomTrack)
    }
  }

  // Export M3U Playlist file
  const handleExportM3U = (folder: IndexedFolder) => {
    const lines = ['#EXTM3U', `#PLAYLIST:${folder.name}`]
    folder.tracks.forEach((track) => {
      const artist = track.artist || 'Unknown'
      const title = track.title || 'Track'
      lines.push(`#EXTINF:-1,${artist} - ${title}`)
      lines.push(track.filename || `${artist} - ${title}.mp3`)
    })

    const blob = new Blob([lines.join('\n')], { type: 'audio/x-mpegurl;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${folder.name.replace(/[^a-zA-Z0-9_\-]/g, '_')}.m3u`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setNotice(`✓ Playlist "${folder.name}.m3u" esportata per Rekordbox / Pioneer CDJ!`)
    setTimeout(() => setNotice(null), 3500)
  }

  const sortedFolders = [...folders].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'tracks') return b.trackCount - a.trackCount
    return b.timestamp - a.timestamp
  })

  const filteredFolders = sortedFolders.filter((f) => {
    if (sidebarFilter === 'folders' && f.isSession) return false
    if (sidebarFilter === 'sessions' && !f.isSession) return false
    const q = filterQuery.toLowerCase().trim()
    if (!q) return true
    return (
      f.name.toLowerCase().includes(q) ||
      (f.dominantGenre && f.dominantGenre.toLowerCase().includes(q)) ||
      f.tracks.some((t) => t.title.toLowerCase().includes(q) || (t.artist && t.artist.toLowerCase().includes(q)))
    )
  })

  const filteredTracks = (selectedFolder?.tracks ?? []).filter((t) => {
    const q = trackFilterQuery.toLowerCase().trim()
    if (!q) return true
    return (
      t.title.toLowerCase().includes(q) ||
      (t.artist && t.artist.toLowerCase().includes(q)) ||
      (t.genre && t.genre.toLowerCase().includes(q)) ||
      (t.label && t.label.toLowerCase().includes(q)) ||
      (t.keySignature && t.keySignature.toLowerCase().includes(q)) ||
      (t.bpm && t.bpm.toString().includes(q))
    )
  })

  return (
    <div
      className={`folder-ingestion-container apple-music-library ${isDraggingOver ? 'is-dragging-over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true) }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleDrop}
    >
      {/* Drag overlay notice */}
      {isDraggingOver && (
        <div className="am-drop-overlay">
          <div className="am-drop-badge">
            <span>📥</span>
            <h3>Rilascia qui la cartella da caricare</h3>
            <p>Drops indicizzerà automaticamente tutti i file audio con BPM e Discogs</p>
          </div>
        </div>
      )}

      {notice && (
        <div className="sync-notice-banner am-notice" role="status">
          {notice}
        </div>
      )}

      {isProcessing && (
        <div className="ingestion-progress-box am-processing-box">
          <div className="progress-info">
            <span>Scansione metadati audio per &quot;{currentFolderProcessing}&quot;...</span>
            <span>{processingProgress}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${processingProgress}%` }} />
          </div>
        </div>
      )}

      {/* Main Apple Music 2-Column Workspace */}
      <div className="am-workspace-grid">
        {/* SIDEBAR APPLE MUSIC (Sinistra) */}
        <aside className="am-sidebar">
          {/* Sidebar Header */}
          <div className="am-sidebar-brand-header">
            <span className="am-sidebar-kicker">ARCHIVIO & ORGANIZZAZIONE CARTELLE NEL CLOUD</span>
          </div>

          {/* Quick Action Buttons */}
          <div className="am-sidebar-top-actions">
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
              id="am-folder-input-picker"
            />
            <label htmlFor="am-folder-input-picker" className="am-btn-primary">
              Carica Cartella
            </label>
            <button
              type="button"
              className="am-btn-secondary"
              onClick={handleCreateNewSession}
              title="Crea una cartella di sessione collegata ai download"
            >
              + Nuova Sessione
            </button>
          </div>

          {/* Nav Categories */}
          <div className="am-nav-section">
            <span className="am-section-title">LIBRERIA</span>
            <div className="am-nav-list">
              <button
                type="button"
                className={`am-nav-item ${selectedFolderId === '__all__' ? 'is-active' : ''}`}
                onClick={() => setSelectedFolderId('__all__')}
              >
                <span className="am-nav-icon">🎵</span>
                <span className="am-nav-label">Tutti i Brani</span>
                <span className="am-nav-count">{allTracks.length}</span>
              </button>
            </div>
          </div>

          {/* Folder Categories Filter Tabs */}
          <div className="am-nav-section">
            <div className="am-section-header-row">
              <span className="am-section-title">CARTELLE & ALBUM</span>
              <div className="am-filter-pills">
                <button
                  type="button"
                  className={`am-pill ${sidebarFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setSidebarFilter('all')}
                >
                  Tutte
                </button>
                <button
                  type="button"
                  className={`am-pill ${sidebarFilter === 'folders' ? 'active' : ''}`}
                  onClick={() => setSidebarFilter('folders')}
                >
                  Cartelle
                </button>
                <button
                  type="button"
                  className={`am-pill ${sidebarFilter === 'sessions' ? 'active' : ''}`}
                  onClick={() => setSidebarFilter('sessions')}
                >
                  Sessioni
                </button>
              </div>
            </div>

            <div className="am-search-wrap">
              <input
                type="text"
                className="am-sidebar-search"
                placeholder="Cerca cartelle..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
              />
            </div>

            <div className="am-folders-scroll-list">
              {filteredFolders.length === 0 ? (
                <div className="am-empty-folders">
                  <p>Nessuna cartella.</p>
                </div>
              ) : (
                filteredFolders.map((folder) => {
                  const isSelected = selectedFolderId === folder.id
                  const isEditing = editingFolderId === folder.id
                  return (
                    <div
                      key={folder.id}
                      className={`am-folder-item ${isSelected ? 'is-active' : ''}`}
                      onClick={() => setSelectedFolderId(folder.id)}
                    >
                      <div className="am-folder-artwork">
                        <span>{folder.isSession ? '🏷️' : '📁'}</span>
                      </div>
                      <div className="am-folder-info">
                        {isEditing ? (
                          <div className="am-inline-rename-wrap" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              className="am-rename-input"
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
                              className="am-rename-confirm"
                              onClick={() => handleSaveRename(folder.id)}
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          <div className="am-folder-title-row">
                            <span className="am-folder-name" title={folder.name}>{folder.name}</span>
                            <div className="am-folder-hover-actions">
                              <button
                                type="button"
                                className="am-icon-btn"
                                onClick={(e) => handleStartRename(folder, e)}
                                title="Rinomina cartella"
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                className="am-icon-btn am-btn-delete"
                                onClick={(e) => handleDeleteFolder(folder.id, e)}
                                title="Rimuovi cartella"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        )}
                        <span className="am-folder-sub">
                          {folder.trackCount} {folder.trackCount === 1 ? 'brano' : 'brani'} &bull; {folder.totalSizeMb} MB
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </aside>

        {/* MAIN HERO & TRACK TABLE (Destra in Stile Apple Music) */}
        <main className="am-main-content">
          {selectedFolder ? (
            <div className="am-folder-view">
              {/* HERO HEADER IN STILE APPLE MUSIC */}
              <div className="am-hero-header">
                <div className="am-hero-artwork-box">
                  <div className="am-artwork-inner">
                    <span className="am-artwork-big-icon">
                      {selectedFolder.id === '__all__' ? '🎧' : selectedFolder.isSession ? '🏷️' : '🎵'}
                    </span>
                  </div>
                </div>

                <div className="am-hero-details">
                  <span className="am-hero-kicker">
                    {selectedFolder.id === '__all__'
                      ? 'CATALOGO UNIFICATO'
                      : selectedFolder.isSession
                      ? 'SESSIONE DI DOWNLOAD'
                      : 'CARTELLA CLOUD'}
                  </span>

                  <div className="am-hero-title-wrap">
                    {editingFolderId === selectedFolder.id && selectedFolder.id !== '__all__' ? (
                      <div className="am-inline-rename-hero">
                        <input
                          type="text"
                          className="am-hero-rename-input"
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
                          className="am-hero-rename-save"
                          onClick={() => handleSaveRename(selectedFolder.id)}
                        >
                          Salva
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h1 className="am-hero-title">{selectedFolder.name}</h1>
                        {selectedFolder.id !== '__all__' && (
                          <button
                            type="button"
                            className="am-hero-edit-btn"
                            onClick={() => handleStartRename(selectedFolder)}
                            title="Rinomina questa cartella"
                          >
                            ✏️
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="am-hero-meta">
                    <strong>{selectedFolder.trackCount} brani</strong> &bull; {selectedFolder.totalSizeMb} MB &bull; {selectedFolder.dominantGenre} &bull; {selectedFolder.uploadDate}
                  </p>

                  {/* APPLE MUSIC ACTION BUTTONS */}
                  <div className="am-hero-actions">
                    <button
                      type="button"
                      className="am-action-btn am-btn-play-all"
                      onClick={handlePlayAll}
                      disabled={selectedFolder.tracks.length === 0}
                    >
                      Riproduci Tutto
                    </button>
                    <button
                      type="button"
                      className="am-action-btn am-btn-shuffle"
                      onClick={handleShufflePlay}
                      disabled={selectedFolder.tracks.length === 0}
                    >
                      Casuale
                    </button>
                    {selectedFolder.id !== '__all__' && (
                      <button
                        type="button"
                        className="am-action-btn am-btn-export"
                        onClick={() => handleExportM3U(selectedFolder)}
                        title="Esporta playlist M3U per chiavetta USB Pioneer Rekordbox"
                      >
                        Esporta M3U (Rekordbox)
                      </button>
                    )}
                    <button
                      type="button"
                      className="am-action-btn am-btn-copy"
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
              </div>

              {/* SEARCH & FILTER BAR PER LE TRACCE */}
              <div className="am-tracks-toolbar">
                <input
                  type="text"
                  className="am-tracks-search-input"
                  placeholder="Cerca per titolo, artista, genere, etichetta o BPM..."
                  value={trackFilterQuery}
                  onChange={(e) => setTrackFilterQuery(e.target.value)}
                />
                <span className="am-tracks-counter">
                  Mostrati <strong>{filteredTracks.length}</strong> su {selectedFolder.tracks.length} brani
                </span>
              </div>

              {/* TABELLA BRANI IN STILE APPLE MUSIC */}
              <div className="am-tracks-table-container">
                <table className="am-tracks-table">
                  <thead>
                    <tr>
                      <th style={{ width: '44px', textAlign: 'center' }}>#</th>
                      <th>Titolo & Artista</th>
                      <th>BPM</th>
                      <th>Chiave</th>
                      <th>Etichetta / Fonte</th>
                      <th>Genere</th>
                      <th style={{ width: '130px', textAlign: 'center' }}>Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTracks.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="am-empty-table-cell">
                          Nessun brano trovato per la ricerca corrente.
                        </td>
                      </tr>
                    ) : (
                      filteredTracks.map((track, idx) => {
                        const isThisPlaying = playingTrackId === track.id
                        return (
                          <tr
                            key={track.id}
                            className={`am-track-row ${isThisPlaying ? 'is-playing' : ''}`}
                            onDoubleClick={() => handlePlayTrack(track)}
                          >
                            <td className="am-track-idx-cell" onClick={() => handlePlayTrack(track)}>
                              <span className="am-idx-number">{(idx + 1).toString().padStart(2, '0')}</span>
                              <span className="am-idx-play-btn">{isThisPlaying ? '❚❚' : '▶'}</span>
                            </td>
                            <td>
                              <div className="am-track-title-info">
                                <span className="am-track-name">{track.title}</span>
                                <span className="am-track-artist">{track.artist || 'Artista Sconosciuto'}</span>
                              </div>
                            </td>
                            <td>
                              {track.bpm ? (
                                <span className="am-bpm-badge">{Math.round(track.bpm)} BPM</span>
                              ) : (
                                <span className="am-meta-muted">-</span>
                              )}
                            </td>
                            <td>
                              <span className="am-camelot-badge">{track.keySignature || '8A'}</span>
                            </td>
                            <td>
                              <span className="am-label-text">{track.label || 'Discogs Enriched'}</span>
                            </td>
                            <td>
                              <span className="am-genre-pill">{track.genre || 'Electronic'}</span>
                            </td>
                            <td>
                              <div className="am-row-actions">
                                <button
                                  type="button"
                                  className={`am-btn-mini-play ${isThisPlaying ? 'active' : ''}`}
                                  onClick={() => handlePlayTrack(track)}
                                  title="Riproduci anteprima"
                                >
                                  {isThisPlaying ? '❚❚' : '▶'}
                                </button>
                                {track.audioUrl && (
                                  <a
                                    className="am-btn-mini-download"
                                    href={track.audioUrl}
                                    download={track.filename || `${track.title}.mp3`}
                                    title={`Scarica ${track.title}`}
                                  >
                                    ↓ Scarica
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="am-no-selection">
              <span>📂</span>
              <h3>Seleziona una cartella dalla libreria</h3>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
