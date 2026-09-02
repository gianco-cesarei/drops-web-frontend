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
  coverUrl?: string
  description?: string
  tracks: IngestedTrack[]
}

const STORAGE_KEY = 'drops.indexed.folders.v1'
const HISTORY_KEY = 'drops.downloads.history.v1'
const DEMO_AUDIO_PREVIEW = 'https://actions.google.com/sounds/v1/science_fiction/low_humming.ogg'

const DEMO_FOLDERS: IndexedFolder[] = [
  {
    id: 'f-nude-dimensions-01',
    name: 'Nude Dimensions Vol 1 (Naked Music 1999)',
    uploadDate: '31 Ago 2026, 20:00',
    timestamp: Date.now() - 1800000,
    trackCount: 14,
    totalSizeMb: 182.4,
    dominantGenre: 'Deep House / Naked Music NYC',
    status: 'ready',
    coverUrl: '/assets/nude-dimensions.webp',
    description: 'Curata con Drop Agent • 14 Single Releases + Full Mix • Camelot Harmonic Mixing 11B / 10B / 8A / 7A / 2A • 123.0 BPM',
    tracks: [
      { id: 'nd-00', filename: '00. Nude Dimensions - Vol 1 - 1999.mp3', title: 'Nude Dimensions Vol 1 (Full Continuous Mix)', artist: 'Naked Music', genre: 'Deep House', label: 'Naked Music NYC', year: 1999, bpm: 123, keySignature: '11B', audioUrl: DEMO_AUDIO_PREVIEW },
      { id: 'nd-01', filename: '01. Petalpusher feat. Ledisi - Breakin It Down.mp3', title: "Breakin' It Down (Jay's Naked Vocal)", artist: 'Petalpusher feat. Ledisi', genre: 'Deep House', label: 'Naked Music', year: 1999, bpm: 123, keySignature: '11B', audioUrl: DEMO_AUDIO_PREVIEW },
      { id: 'nd-02', filename: '02. Miguel Migs - Take Me To Paradise.mp3', title: "Take Me To Paradise (Summer Lover's Dub)", artist: 'Miguel Migs', genre: 'Deep House', label: 'Naked Music', year: 1999, bpm: 123, keySignature: '10B', audioUrl: DEMO_AUDIO_PREVIEW },
      { id: 'nd-03', filename: '03. Janet Rushmore - On My Own.mp3', title: 'On My Own (Acapella Mix)', artist: 'Janet Rushmore', genre: 'Soulful House', label: 'Soulfuric', year: 1999, bpm: 123, keySignature: '10B', audioUrl: DEMO_AUDIO_PREVIEW },
      { id: 'nd-04', filename: '04. Lisha - Thats Why Im Here.mp3', title: "That's Why I'm Here (Migs Transporter Vocal)", artist: "Li'sha", genre: 'Deep House', label: 'Naked Music', year: 1999, bpm: 123, keySignature: '8A', audioUrl: DEMO_AUDIO_PREVIEW },
      { id: 'nd-05', filename: '05. Petalpusher - Surrender.mp3', title: 'Surrender (Original Vocal)', artist: 'Petalpusher', genre: 'Deep House', label: 'Naked Music', year: 1999, bpm: 123, keySignature: '10B', audioUrl: DEMO_AUDIO_PREVIEW },
      { id: 'nd-06', filename: '06. Night Source - Rise Above.mp3', title: 'Rise Above (Original Version)', artist: 'Night Source', genre: 'Deep House', label: 'Naked Music', year: 1999, bpm: 123, keySignature: '7A', audioUrl: DEMO_AUDIO_PREVIEW },
      { id: 'nd-07', filename: '07. Lovetronic - You Are Love.mp3', title: "You Are Love (Si Brad's Payback Dub)", artist: 'Lovetronic', genre: 'Deep House', label: 'Naked Music', year: 1999, bpm: 123, keySignature: '8A', audioUrl: DEMO_AUDIO_PREVIEW },
      { id: 'nd-08', filename: '08. Weekender - Spirit In Your Soul.mp3', title: 'Spirit In Your Soul (Original Version)', artist: 'Weekender', genre: 'Deep House', label: 'Naked Music', year: 1999, bpm: 123, keySignature: '8A', audioUrl: DEMO_AUDIO_PREVIEW },
      { id: 'nd-09', filename: '09. Blue Six - Music and Wine.mp3', title: "Music & Wine (Th' Attaboy Vocal)", artist: 'Blue Six', genre: 'Deep House', label: 'Naked Music', year: 1999, bpm: 123, keySignature: '11A', audioUrl: DEMO_AUDIO_PREVIEW },
      { id: 'nd-10', filename: '10. Charles Schillings - No Communication.mp3', title: 'No Communication, No Love (Salt City Orch. Remix)', artist: 'Charles Schillings', genre: 'Deep House', label: 'Pschent', year: 1999, bpm: 123, keySignature: '10B', audioUrl: DEMO_AUDIO_PREVIEW },
      { id: 'nd-11', filename: '11. Atjazz - Wind and Sea.mp3', title: 'Wind & Sea (Nail Remix)', artist: 'Atjazz', genre: 'Deep House', label: 'Mantis', year: 1999, bpm: 123, keySignature: '8A', audioUrl: DEMO_AUDIO_PREVIEW },
      { id: 'nd-12', filename: '12. Gigi - Mood Is Right.mp3', title: 'Mood Is Right (Migs & Jelly Mix)', artist: 'Gigi', genre: 'Deep House', label: 'Naked Music', year: 1999, bpm: 123, keySignature: '8A', audioUrl: DEMO_AUDIO_PREVIEW },
      { id: 'nd-13', filename: '13. Lovetronic - You Are Love Afro.mp3', title: "You Are Love (Jay's Afrotronic Ext. Vocal)", artist: 'Lovetronic', genre: 'Afro Deep', label: 'Naked Music', year: 1999, bpm: 123, keySignature: '7A', audioUrl: DEMO_AUDIO_PREVIEW },
      { id: 'nd-14', filename: '14. Bob Sinclar - The Ghetto.mp3', title: 'The Ghetto (Atjazz Remix)', artist: 'Bob Sinclar', genre: 'Deep House', label: 'Yellow Productions', year: 1999, bpm: 123, keySignature: '2A', audioUrl: DEMO_AUDIO_PREVIEW },
    ],
  },
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

export const MAIN_FOLDER_STORAGE_KEY = 'drops.main.folder.id'
export const FOLDERS_STORAGE_KEY = STORAGE_KEY

export function saveTrackToMainFolder(track: {
  id: string
  title: string
  artist?: string
  genre?: string
  bpm?: number
  coverUrl?: string
  source?: string
}, folderId?: string) {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
    let folders: IndexedFolder[] = raw ? JSON.parse(raw) : DEMO_FOLDERS
    if (!Array.isArray(folders) || !folders.length) folders = [...DEMO_FOLDERS]

    const targetFolderId = folderId || (typeof window !== 'undefined' ? window.localStorage.getItem(MAIN_FOLDER_STORAGE_KEY) : null) || folders[0].id
    const targetIdx = folders.findIndex((f) => f.id === targetFolderId)
    const targetFolder = targetIdx >= 0 ? folders[targetIdx] : folders[0]

    const newTrack: IngestedTrack = {
      id: track.id,
      filename: `${track.artist ? `${track.artist} - ` : ''}${track.title}.mp3`,
      title: track.title,
      artist: track.artist || 'Artista Sconosciuto',
      genre: track.genre || targetFolder.dominantGenre || 'Electronic',
      bpm: track.bpm,
      audioUrl: api.fileUrl(track.id),
      sizeBytes: 10485760,
    }

    if (!targetFolder.tracks.some((t) => t.id === track.id || t.title === track.title)) {
      targetFolder.tracks = [newTrack, ...targetFolder.tracks]
      targetFolder.trackCount = targetFolder.tracks.length
      targetFolder.totalSizeMb = Math.round(targetFolder.tracks.reduce((acc, t) => acc + (t.sizeBytes || 10485760), 0) / (1024 * 1024) * 10) / 10
      folders[targetIdx >= 0 ? targetIdx : 0] = { ...targetFolder }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(folders))
    }
  } catch {
    /* ignore storage errors */
  }
}

export function getSavedFolders(): IndexedFolder[] {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
    if (!raw) return DEMO_FOLDERS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as IndexedFolder[]) : DEMO_FOLDERS
  } catch {
    return DEMO_FOLDERS
  }
}

export function getMainFolderId(): string {
  try {
    const folders = getSavedFolders()
    return (typeof window !== 'undefined' ? window.localStorage.getItem(MAIN_FOLDER_STORAGE_KEY) : null) || folders[0]?.id || 'f-session-001'
  } catch {
    return 'f-session-001'
  }
}

export function setMainFolder(folderId: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(MAIN_FOLDER_STORAGE_KEY, folderId)
  }
}

export function renameMainFolder(folderId: string, newName: string): boolean {
  try {
    if (!newName.trim()) return false
    const folders = getSavedFolders()
    const target = folders.find((f) => f.id === folderId)
    if (target) {
      target.name = newName.trim()
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(folders))
      api.renameFolder(folderId, newName.trim()).catch(() => {})
      return true
    }
  } catch {
    /* ignore */
  }
  return false
}

export function createNewArchiveFolder(name: string): IndexedFolder {
  const newFolder: IndexedFolder = {
    id: `f-${Date.now()}`,
    name: name.trim() || `Nuova Sessione ${new Date().toLocaleDateString('it-IT')}`,
    uploadDate: new Date().toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short' }),
    timestamp: Date.now(),
    trackCount: 0,
    totalSizeMb: 0,
    dominantGenre: 'Electronic',
    status: 'ready',
    isSession: true,
    tracks: [],
  }
  try {
    const folders = getSavedFolders()
    const updated = [newFolder, ...folders]
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.localStorage.setItem(MAIN_FOLDER_STORAGE_KEY, newFolder.id)
    api.createFolder({ name: newFolder.name, dominant_genre: newFolder.dominantGenre }).catch(() => {})
  } catch {
    /* ignore */
  }
  return newFolder
}

export interface LocalAudioItem {
  id: string
  title: string
  artist?: string
  coverUrl?: string
  source?: string
  sourceUrl?: string
  bpm?: number
  bpmPending?: boolean
  ts: number
}

export async function processLocalAudioFile(file: File, targetFolderId?: string): Promise<LocalAudioItem> {
  const baseName = file.name.replace(/\.[^/.]+$/, '')
  let artist = 'Artista Sconosciuto'
  let title = baseName
  if (baseName.includes(' - ')) {
    const parts = baseName.split(' - ')
    artist = parts[0].trim()
    title = parts.slice(1).join(' - ').trim()
  }

  let calculatedBpm: number | null = null

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioCtx) {
      const audioCtx = new AudioCtx()
      const arrayBuffer = await file.slice(0, Math.min(file.size, 4 * 1024 * 1024)).arrayBuffer()
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
      const pcmData = audioBuffer.getChannelData(0)
      const sampleRate = audioBuffer.sampleRate
      const peaks: number[] = []
      const step = Math.floor(sampleRate * 0.05)
      for (let i = 0; i < pcmData.length; i += step) {
        let max = 0
        for (let j = i; j < Math.min(i + step, pcmData.length); j++) {
          const val = Math.abs(pcmData[j])
          if (val > max) max = val
        }
        if (max > 0.35) peaks.push(i / sampleRate)
      }
      if (peaks.length > 8) {
        const intervals: number[] = []
        for (let i = 1; i < peaks.length; i++) {
          const diff = peaks[i] - peaks[i - 1]
          if (diff >= 0.33 && diff <= 0.86) {
            intervals.push(diff)
          }
        }
        if (intervals.length > 4) {
          const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
          const rawBpm = Math.round(60 / avgInterval)
          if (rawBpm >= 60 && rawBpm <= 200) {
            calculatedBpm = rawBpm
          }
        }
      }
      audioCtx.close().catch(() => {})
    }
  } catch {
    /* fallback to default */
  }

  const itemId = `loc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const record: LocalAudioItem = {
    id: itemId,
    title,
    artist,
    coverUrl: undefined,
    source: 'locale',
    sourceUrl: file.name,
    bpm: calculatedBpm || 124,
    bpmPending: false,
    ts: Date.now(),
  }

  saveTrackToMainFolder(record, targetFolderId)
  return record
}

export function getMainFolderName(): string {
  try {
    const folders = getSavedFolders()
    const mainFolderId = getMainFolderId()
    const found = folders.find((f) => f.id === mainFolderId)
    return found?.name || folders[0]?.name || 'Session 001'
  } catch {
    return 'Session 001'
  }
}

export default function FolderIngestionHub() {
  const [folders, setFolders] = useState<IndexedFolder[]>(() => loadFolders())
  const [selectedFolderId, setSelectedFolderId] = useState<string>(() => folders[0]?.id || '__all__')
  const [mainFolderId, setMainFolderId] = useState<string>(() => {
    try {
      return window.localStorage.getItem(MAIN_FOLDER_STORAGE_KEY) || loadFolders()[0]?.id || 'f-session-001'
    } catch {
      return 'f-session-001'
    }
  })
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

  // Console / mini-player + layout state
  const [queue, setQueue] = useState<IngestedTrack[]>([])
  const [queueIndex, setQueueIndex] = useState<number>(-1)
  const [crossfade, setCrossfade] = useState<boolean>(false)
  const [eqLow, setEqLow] = useState<number>(50)
  const [eqMid, setEqMid] = useState<number>(50)
  const [eqHigh, setEqHigh] = useState<number>(50)
  const [master, setMaster] = useState<number>(80)
  const [leftOpen, setLeftOpen] = useState<boolean>(true)
  const [consoleOpen, setConsoleOpen] = useState<boolean>(true)

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

  const handlePlayTrack = async (track: IngestedTrack) => {
    setPlayingTrackId(track.id)
    let audioUrl = track.audioUrl && track.audioUrl !== DEMO_AUDIO_PREVIEW ? track.audioUrl : undefined
    // For real backend files, upgrade to a signed/CORS URL so the Web Audio EQ can process the stream
    if (audioUrl && track.id && audioUrl.includes('/api/v1/downloads/')) {
      try { audioUrl = await api.resolveFileUrl(track.id) } catch { /* keep direct url */ }
    }
    if (typeof window !== 'undefined') {
      window.__drops_play_track?.({
        id: track.id,
        title: track.title,
        artist: track.artist || 'Artista Sconosciuto',
        bpm: track.bpm,
        genre: track.genre,
        audioUrl,
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
    const q = filterQuery.toLowerCase().trim()
    if (!q) return true
    return (
      f.name.toLowerCase().includes(q) ||
      f.tracks.some((t) => t.title.toLowerCase().includes(q) || (t.artist && t.artist.toLowerCase().includes(q)))
    )
  })

  const filteredTracks = (selectedFolder?.tracks ?? []).filter((t) => {
    const q = trackFilterQuery.toLowerCase().trim()
    if (!q) return true
    return (
      t.title.toLowerCase().includes(q) ||
      (t.artist && t.artist.toLowerCase().includes(q)) ||
      (t.label && t.label.toLowerCase().includes(q)) ||
      (t.keySignature && t.keySignature.toLowerCase().includes(q)) ||
      (t.bpm && t.bpm.toString().includes(q))
    )
  })

  const nowPlaying = queueIndex >= 0 && queueIndex < queue.length ? queue[queueIndex] : null

  const playFromList = (list: IngestedTrack[], i: number) => {
    if (!list.length || i < 0 || i >= list.length) return
    setQueue(list)
    setQueueIndex(i)
    handlePlayTrack(list[i])
  }
  const playIndex = (i: number) => {
    if (i < 0 || i >= queue.length) return
    setQueueIndex(i)
    handlePlayTrack(queue[i])
  }
  const playNext = () => { if (queue.length) playIndex((queueIndex + 1) % queue.length) }
  const playPrev = () => { if (queue.length) playIndex((queueIndex - 1 + queue.length) % queue.length) }
  const addToQueue = (t: IngestedTrack) => {
    setQueue((cur) => (cur.some((x) => x.id === t.id) ? cur : [...cur, t]))
    setNotice(`✓ "${t.title}" aggiunta alla coda`)
    setTimeout(() => setNotice(null), 1800)
  }
  const removeFromQueue = (id: string) => {
    const idx = queue.findIndex((x) => x.id === id)
    if (idx === -1) return
    const next = queue.filter((x) => x.id !== id)
    setQueue(next)
    setQueueIndex((qi) => (idx < qi ? qi - 1 : idx === qi ? Math.min(qi, next.length - 1) : qi))
  }
  const clearQueue = () => { setQueue([]); setQueueIndex(-1) }
  const moveInQueue = (id: string, dir: -1 | 1) => {
    setQueue((cur) => {
      const idx = cur.findIndex((x) => x.id === id)
      const j = idx + dir
      if (idx === -1 || j < 0 || j >= cur.length) return cur
      const nx = [...cur]
      const tmp = nx[idx]; nx[idx] = nx[j]; nx[j] = tmp
      return nx
    })
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('drops-set-volume', { detail: master }))
    }
  }, [master])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('drops-set-eq', { detail: { low: eqLow, mid: eqMid, high: eqHigh } }))
    }
  }, [eqLow, eqMid, eqHigh])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('drops-set-fade-enabled', { detail: crossfade }))
    }
  }, [crossfade])

  useEffect(() => {
    const onEnded = () => {
      if (queue.length && queueIndex >= 0 && queueIndex < queue.length - 1) {
        const ni = queueIndex + 1
        setQueueIndex(ni)
        handlePlayTrack(queue[ni])
      }
    }
    window.addEventListener('drops-track-ended', onEnded)
    return () => window.removeEventListener('drops-track-ended', onEnded)
  }, [queue, queueIndex])

  return (
    <div
      className={`arch-winged-layout ${isDraggingOver ? 'is-dragging-over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true) }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleDrop}
    >
      {isDraggingOver && (
        <div className="arch-drop-overlay">
          <div className="arch-drop-badge">
            <span>📥</span>
            <h3>Rilascia qui la cartella da caricare</h3>
            <p>Drops indicizza automaticamente i file audio con BPM</p>
          </div>
        </div>
      )}

      {notice && <div className="arch-notice" role="status">{notice}</div>}

      {isProcessing && (
        <div className="arch-processing">
          <div className="arch-processing-info">
            <span>Scansione metadati per &quot;{currentFolderProcessing}&quot;…</span>
            <span>{processingProgress}%</span>
          </div>
          <div className="arch-processing-track"><div className="arch-processing-fill" style={{ width: `${processingProgress}%` }} /></div>
        </div>
      )}

      {/* LEFT WING: CARTELLE */}
      {leftOpen && (
        <aside className="arch-wing-left">
          <div className="arch-wing-head">
            <div className="arch-wing-head-title">
              <span className="arch-wing-kicker">📁 CARTELLE</span>
              <span className="arch-wing-sub">{folders.length} cartelle · {allTracks.length} brani</span>
            </div>
            <button type="button" className="arch-wing-close" onClick={() => setLeftOpen(false)} title="Chiudi pannello cartelle">✕</button>
          </div>

          <div className="arch-left-actions">
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
            <label htmlFor="am-folder-input-picker" className="arch-btn-primary">⬆ Carica Cartella</label>
            <button type="button" className="arch-btn-ghost" onClick={handleCreateNewSession} title="Crea una nuova cartella collegata ai download">+ Nuova Cartella</button>
          </div>

          <input
            type="text"
            className="arch-search"
            placeholder="Cerca cartelle…"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />

          <button
            type="button"
            className={`arch-folder-row arch-all ${selectedFolderId === '__all__' ? 'is-active' : ''}`}
            onClick={() => setSelectedFolderId('__all__')}
          >
            <span className="arch-folder-ic">🎧</span>
            <span className="arch-folder-name">Tutti i Brani</span>
            <span className="arch-folder-count">{allTracks.length}</span>
          </button>

          <div className="arch-folder-list">
            {filteredFolders.length === 0 ? (
              <div className="arch-empty">Nessuna cartella.</div>
            ) : (
              filteredFolders.map((folder) => {
                const isSelected = selectedFolderId === folder.id
                const isEditing = editingFolderId === folder.id
                return (
                  <div
                    key={folder.id}
                    className={`arch-folder-row ${isSelected ? 'is-active' : ''}`}
                    onClick={() => setSelectedFolderId(folder.id)}
                  >
                    <span className="arch-folder-ic">📁</span>
                    {isEditing ? (
                      <div className="arch-rename" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          className="arch-rename-input"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveRename(folder.id); if (e.key === 'Escape') setEditingFolderId(null) }}
                          autoFocus
                        />
                        <button type="button" className="arch-rename-ok" onClick={() => handleSaveRename(folder.id)}>✓</button>
                      </div>
                    ) : (
                      <>
                        <span className="arch-folder-name" title={folder.name}>{folder.name}</span>
                        <span className="arch-folder-count">{folder.trackCount}</span>
                        <span className="arch-folder-hover">
                          <button type="button" className="arch-mini-ic" onClick={(e) => handleStartRename(folder, e)} title="Rinomina">✏️</button>
                          <button type="button" className="arch-mini-ic danger" onClick={(e) => handleDeleteFolder(folder.id, e)} title="Elimina">✕</button>
                        </span>
                      </>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </aside>
      )}

      {/* CENTER: LIBRERIA */}
      <main className="arch-wing-center">
        <div className="arch-dock-bar">
          <button type="button" className={`arch-dock-btn ${leftOpen ? 'active' : ''}`} onClick={() => setLeftOpen((v) => !v)} title="Mostra/nascondi cartelle">
            📁 Cartelle ({folders.length}) {leftOpen ? '◀' : '▶'}
          </button>
          <button type="button" className={`arch-dock-btn ${consoleOpen ? 'active' : ''}`} onClick={() => setConsoleOpen((v) => !v)} title="Mostra/nascondi console">
            🎛️ Console {consoleOpen ? '▶' : '◀'}
          </button>
        </div>

        {selectedFolder ? (
          <div className="arch-folder-view">
            <div className="arch-hero">
              <div className="arch-hero-art">
                {selectedFolder.coverUrl ? <img src={selectedFolder.coverUrl} alt={selectedFolder.name} /> : <span>{selectedFolder.id === '__all__' ? '🎧' : '📁'}</span>}
              </div>
              <div className="arch-hero-info">
                <span className="arch-hero-kicker">{selectedFolder.id === '__all__' ? 'CATALOGO UNIFICATO' : 'CARTELLA'}</span>
                {editingFolderId === selectedFolder.id && selectedFolder.id !== '__all__' ? (
                  <div className="arch-rename hero">
                    <input type="text" className="arch-rename-input" value={editingName} onChange={(e) => setEditingName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSaveRename(selectedFolder.id); if (e.key === 'Escape') setEditingFolderId(null) }} autoFocus />
                    <button type="button" className="arch-rename-ok" onClick={() => handleSaveRename(selectedFolder.id)}>Salva</button>
                  </div>
                ) : (
                  <div className="arch-hero-title-row">
                    <h1 className="arch-hero-title" title={selectedFolder.name}>{selectedFolder.name}</h1>
                    {selectedFolder.id !== '__all__' && <button type="button" className="arch-mini-ic" onClick={() => handleStartRename(selectedFolder)} title="Rinomina">✏️</button>}
                  </div>
                )}
                <p className="arch-hero-meta">{selectedFolder.trackCount} brani · {selectedFolder.totalSizeMb} MB · {selectedFolder.uploadDate}</p>
                <div className="arch-hero-actions">
                  <button type="button" className="arch-act primary" onClick={() => playFromList(filteredTracks, 0)} disabled={filteredTracks.length === 0}>▶ Riproduci Tutto</button>
                  <button type="button" className="arch-act" onClick={() => { if (filteredTracks.length) { const i = Math.floor(Math.random() * filteredTracks.length); playFromList(filteredTracks, i) } }} disabled={filteredTracks.length === 0}>🔀 Casuale</button>
                  {selectedFolder.id !== '__all__' && <button type="button" className="arch-act" onClick={() => handleExportM3U(selectedFolder)} title="Esporta playlist M3U per Rekordbox">Esporta M3U</button>}
                  {selectedFolder.id !== '__all__' && (
                    <button type="button" className={`arch-act ${mainFolderId === selectedFolder.id ? 'is-main' : ''}`} onClick={() => { setMainFolderId(selectedFolder.id); try { window.localStorage.setItem(MAIN_FOLDER_STORAGE_KEY, selectedFolder.id) } catch {}; setNotice(`★ "${selectedFolder.name}" impostata come Cartella Principale!`); setTimeout(() => setNotice(null), 3000) }} title="Imposta come destinazione principale dei download">
                      {mainFolderId === selectedFolder.id ? '★ Cartella Main' : '☆ Imposta Main'}
                    </button>
                  )}
                  <button type="button" className="arch-act" onClick={() => { navigator.clipboard.writeText(selectedFolder.tracks.map((t) => `${t.bpm ? `[${Math.round(t.bpm)} BPM] ` : ''}${t.artist || ''} - ${t.title}`).join('\n')); setNotice('✓ Tracklist copiata!'); setTimeout(() => setNotice(null), 2500) }}>📋 Copia</button>
                </div>
              </div>
            </div>

            <div className="arch-tracks-toolbar">
              <input type="text" className="arch-tracks-search" placeholder="Cerca per titolo, artista, BPM o chiave…" value={trackFilterQuery} onChange={(e) => setTrackFilterQuery(e.target.value)} />
              <span className="arch-tracks-counter">{filteredTracks.length} / {selectedFolder.tracks.length} brani</span>
            </div>

            <div className="arch-tracks">
              <div className="arch-track-head">
                <span className="c-idx">#</span>
                <span className="c-title">Titolo & Artista</span>
                <span className="c-bpm">BPM</span>
                <span className="c-key">Key</span>
                <span className="c-act">Azioni</span>
              </div>
              <div className="arch-track-body">
                {filteredTracks.length === 0 ? (
                  <div className="arch-empty pad">Nessun brano trovato.</div>
                ) : (
                  filteredTracks.map((track, idx) => {
                    const isThisPlaying = playingTrackId === track.id
                    return (
                      <div key={track.id} className={`arch-track-row ${isThisPlaying ? 'is-playing' : ''}`} onDoubleClick={() => playFromList(filteredTracks, idx)}>
                        <button type="button" className="c-idx arch-idx-btn" onClick={() => playFromList(filteredTracks, idx)} title="Riproduci">
                          <span className="arch-idx-n">{(idx + 1).toString().padStart(2, '0')}</span>
                          <span className="arch-idx-p">{isThisPlaying ? '❚❚' : '▶'}</span>
                        </button>
                        <span className="c-title arch-title-cell">
                          <span className="arch-t-name" title={track.title}>{track.title}</span>
                          <span className="arch-t-artist" title={track.artist || 'Artista Sconosciuto'}>{track.artist || 'Artista Sconosciuto'}</span>
                        </span>
                        <span className="c-bpm"><span className="arch-bpm">{track.bpm ? `${Math.round(track.bpm)}` : '—'}</span></span>
                        <span className="c-key"><span className="arch-key">{track.keySignature || '—'}</span></span>
                        <span className="c-act arch-row-act">
                          <button type="button" className={`arch-mini ${isThisPlaying ? 'on' : ''}`} onClick={() => playFromList(filteredTracks, idx)} title="Riproduci">{isThisPlaying ? '❚❚' : '▶'}</button>
                          <button type="button" className="arch-mini" onClick={() => addToQueue(track)} title="Aggiungi alla coda">＋</button>
                          {track.audioUrl && <a className="arch-mini dl" href={track.audioUrl} download={track.filename || `${track.title}.mp3`} title="Scarica">↓</a>}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="arch-no-sel"><span>📂</span><h3>Seleziona una cartella</h3></div>
        )}
      </main>

      {/* RIGHT WING: CONSOLE / MINI PLAYER */}
      {consoleOpen && (
        <aside className="arch-wing-right">
          <div className="arch-wing-head">
            <div className="arch-wing-head-title">
              <span className="arch-wing-kicker">🎛️ CONSOLE</span>
              <span className="arch-wing-sub">Mixer & coda</span>
            </div>
            <button type="button" className="arch-wing-close" onClick={() => setConsoleOpen(false)} title="Chiudi console">✕</button>
          </div>

          <div className="arch-now">
            {nowPlaying ? (
              <>
                <div className="arch-now-art">
                  <span>🎵</span>
                  <div className="arch-now-eq"><span></span><span></span><span></span></div>
                </div>
                <div className="arch-now-info">
                  <span className="arch-now-title" title={nowPlaying.title}>{nowPlaying.title}</span>
                  <span className="arch-now-artist" title={nowPlaying.artist || ''}>{nowPlaying.artist || 'Artista Sconosciuto'}</span>
                  <div className="arch-now-tags">
                    {nowPlaying.bpm && <span className="arch-bpm">{Math.round(nowPlaying.bpm)} BPM</span>}
                    {nowPlaying.keySignature && <span className="arch-key">{nowPlaying.keySignature}</span>}
                  </div>
                </div>
              </>
            ) : (
              <div className="arch-now-empty">Nessuna traccia in riproduzione</div>
            )}
          </div>

          <div className="arch-transport">
            <button type="button" className="arch-tp" onClick={playPrev} disabled={!queue.length} title="Precedente">⏮</button>
            <button type="button" className="arch-tp big" onClick={() => { if (nowPlaying) handlePlayTrack(nowPlaying); else if (filteredTracks.length) playFromList(filteredTracks, 0) }} title="Play">▶</button>
            <button type="button" className="arch-tp" onClick={playNext} disabled={!queue.length} title="Successiva">⏭</button>
            <button type="button" className={`arch-xfade ${crossfade ? 'on' : ''}`} onClick={() => setCrossfade((v) => !v)} title="Attiva/disattiva dissolvenza automatica tra le tracce">
              <span className="arch-xfade-dot" /> Dissolvenza
            </button>
          </div>

          <div className="arch-mixer">
            <span className="arch-mixer-title">MIXER</span>
            <div className="arch-eq">
              <div className="arch-eq-band">
                <input type="range" min="0" max="100" value={eqHigh} onChange={(e) => setEqHigh(Number(e.target.value))} className="arch-vslider" />
                <span className="arch-eq-lbl">HIGH</span>
              </div>
              <div className="arch-eq-band">
                <input type="range" min="0" max="100" value={eqMid} onChange={(e) => setEqMid(Number(e.target.value))} className="arch-vslider" />
                <span className="arch-eq-lbl">MID</span>
              </div>
              <div className="arch-eq-band">
                <input type="range" min="0" max="100" value={eqLow} onChange={(e) => setEqLow(Number(e.target.value))} className="arch-vslider" />
                <span className="arch-eq-lbl">LOW</span>
              </div>
            </div>
            <div className="arch-master">
              <span className="arch-master-lbl">🔊 Master</span>
              <input type="range" min="0" max="100" value={master} onChange={(e) => setMaster(Number(e.target.value))} className="arch-hslider" />
              <span className="arch-master-val">{master}</span>
            </div>
          </div>

          <div className="arch-queue">
            <div className="arch-queue-head">
              <span className="arch-queue-title">CODA ({queue.length})</span>
              {queue.length > 0 && <button type="button" className="arch-queue-clear" onClick={clearQueue} title="Svuota coda">🧹 Svuota</button>}
            </div>
            <div className="arch-queue-list">
              {queue.length === 0 ? (
                <div className="arch-empty pad small">Aggiungi brani con ＋ o premi Riproduci Tutto.</div>
              ) : (
                queue.map((t, i) => (
                  <div key={`${t.id}-${i}`} className={`arch-q-item ${i === queueIndex ? 'is-current' : ''}`} onDoubleClick={() => playIndex(i)}>
                    <button type="button" className="arch-q-play" onClick={() => playIndex(i)} title="Riproduci">{i === queueIndex && playingTrackId === t.id ? '❚❚' : '▶'}</button>
                    <span className="arch-q-info">
                      <span className="arch-q-title" title={t.title}>{t.title}</span>
                      <span className="arch-q-artist" title={t.artist || ''}>{t.artist || 'Artista Sconosciuto'}{t.bpm ? ` · ${Math.round(t.bpm)} BPM` : ''}</span>
                    </span>
                    <span className="arch-q-ctrl">
                      <button type="button" className="arch-mini" onClick={() => moveInQueue(t.id, -1)} title="Su">▲</button>
                      <button type="button" className="arch-mini" onClick={() => moveInQueue(t.id, 1)} title="Giù">▼</button>
                      <button type="button" className="arch-mini danger" onClick={() => removeFromQueue(t.id)} title="Rimuovi">✕</button>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}
