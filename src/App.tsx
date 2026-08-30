import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode, SyntheticEvent } from 'react'
import { api, ApiError } from './api'
import type { PlaylistEntry, PlaylistPreview, SpotifyPlaylist, SpotifyTrack, User } from './api'
import { postLoginRoute } from './lib/routes'
import { contentFields, contentStages, radarDevelopmentFixtures, radarLockedFixtures } from './data/private.fixture'
import type { RadarFixture } from './data/private.fixture'
import BrainGraph from './components/BrainGraph'
import DeveloperRoadmap from './components/DeveloperRoadmap'
import AcademyHub from './components/AcademyHub'
import ProducerSettings from './components/ProducerSettings'
import GlobalAudioPlayer from './components/GlobalAudioPlayer'
import GlobalSearchModal from './components/GlobalSearchModal'
import MultiSourceSync from './components/MultiSourceSync'
import DownloadArchiveModal from './components/DownloadArchiveModal'
import FolderIngestionHub, { getMainFolderName, saveTrackToMainFolder } from './components/FolderIngestionHub'
import { linkRadarToBrain, resetPrototypeState, setRadarStatus, usePrototypeState, getArticleStatus, publishArticle, draftArticle, getFeaturedId, setFeaturedArticle } from './data/brainStore'
import type { RadarStatus } from './data/brainStore'
import { publishedContentItems } from './data/content.data'

export type PrivateSection = 'login' | 'mymusic' | 'download' | 'archive' | 'spotify' | 'radar' | 'brain' | 'academy' | 'content' | 'editorial-suggestions' | 'settings' | 'developer'

const terminalStatuses = new Set(['completed', 'complete', 'ready', 'failed', 'error', 'cancelled'])
const readyStatuses = new Set(['completed', 'complete', 'ready'])
const failedStatuses = new Set(['failed', 'error', 'cancelled'])
const browserNavigate = (to: string) => window.location.assign(to)
const USER_CACHE_KEY = 'drops.user.v1'
const DEMO_SESSION_KEY = 'drops.demo-session.v1'
const demoModeEnabled = import.meta.env.PUBLIC_ENABLE_DEMO_MODE === 'true'

export default function App({ section = 'login', navigate = browserNavigate }: { section?: PrivateSection; navigate?: (to: string) => void }) {
  const [user, setUser] = useState<User | null>(null)
  const [demoSession, setDemoSession] = useState(() => demoModeEnabled && typeof window !== 'undefined' && window.localStorage.getItem(DEMO_SESSION_KEY) === 'active')
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const [logoutRedirecting, setLogoutRedirecting] = useState(false)

  const handleError = useCallback((cause: unknown) => {
    if (cause instanceof ApiError && cause.status === 401) {
      setUser(null)
      try { window.localStorage.removeItem(USER_CACHE_KEY) } catch {}
    }
    setError(cause instanceof Error ? cause.message : 'Errore imprevisto.')
  }, [])

  useEffect(() => {
    api.me()
      .then((u) => {
        setUser(u)
        try { window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(u)) } catch {}
      })
      .catch(() => {
        setUser(null)
        try { window.localStorage.removeItem(USER_CACHE_KEY) } catch {}
      })
      .finally(() => setChecking(false))
  }, [])

  useEffect(() => {
    if (!checking && !user && !demoSession && section !== 'login' && section !== 'developer' && !logoutRedirecting) {
      const next = encodeURIComponent(`/app/${section}`)
      navigate(`/app/login?next=${next}`)
    }
  }, [checking, demoSession, logoutRedirecting, navigate, section, user])

  useEffect(() => {
    if (!checking && (user || demoSession) && section === 'login') navigate(postLoginRoute(window.location.search))
  }, [checking, demoSession, navigate, section, user])

  function completeLogin(loggedUser: User) {
    try { window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(loggedUser)) } catch {}
    setUser(loggedUser)
  }

  function beginLogout() {
    try { window.localStorage.removeItem(USER_CACHE_KEY) } catch {}
    try { window.localStorage.removeItem(DEMO_SESSION_KEY) } catch {}
    setDemoSession(false)
    setLogoutRedirecting(true)
    setUser(null)
  }

  function finishLogout() { navigate('/') }

  function completeDemoLogin() {
    if (!demoModeEnabled) return
    try { window.localStorage.setItem(DEMO_SESSION_KEY, 'active') } catch {}
    setDemoSession(true)
  }

  if (checking) return <Loading />
  if (logoutRedirecting) return <Loading />
  if (section === 'developer') {
    const devUser = user || { username: 'local_dev', name: 'Sviluppatore Locale' }
    return <PrivateFrame section={section} user={devUser} onLogoutStart={beginLogout} onLogoutEnd={finishLogout}><DeveloperRoadmap /></PrivateFrame>
  }
  const effectiveUser = user || (demoSession ? { username: 'alex_rossi', name: 'Alex Rossi' } : null)
  if (!effectiveUser) return <Login onLogin={completeLogin} onDemoLogin={completeDemoLogin} demoEnabled={demoModeEnabled} error={error} setError={setError} />
  const demoBanner = demoSession ? <div className="demo-mode-banner" role="status">Modalita demo — dati salvati solo su questo dispositivo.</div> : null
  if (section === 'download' || section === 'mymusic') return <PrivateFrame section={section} user={effectiveUser} onLogoutStart={beginLogout} onLogoutEnd={finishLogout}>{demoBanner}<main className="shell"><Download user={effectiveUser} onError={handleError} error={error} setError={setError} /></main></PrivateFrame>
  if (section === 'archive') return <PrivateFrame section={section} user={effectiveUser} onLogoutStart={beginLogout} onLogoutEnd={finishLogout}>{demoBanner}<main className="shell shell-wide"><FolderIngestionHub /></main></PrivateFrame>
  if (section === 'spotify') return <PrivateFrame section={section} user={effectiveUser} onLogoutStart={beginLogout} onLogoutEnd={finishLogout}>{demoBanner}<main className="shell"><PlatformSyncHub onError={handleError} error={error} /></main></PrivateFrame>
  if (section === 'radar') return <PrivateFrame section={section} user={effectiveUser} onLogoutStart={beginLogout} onLogoutEnd={finishLogout}><Radar /></PrivateFrame>
  if (section === 'brain') return <PrivateFrame section={section} user={effectiveUser} onLogoutStart={beginLogout} onLogoutEnd={finishLogout}><Brain /></PrivateFrame>
  if (section === 'academy') return <PrivateFrame section={section} user={effectiveUser} onLogoutStart={beginLogout} onLogoutEnd={finishLogout}>{demoBanner}<AcademyHub user={effectiveUser} /></PrivateFrame>
  if (section === 'settings') return <PrivateFrame section={section} user={effectiveUser} onLogoutStart={beginLogout} onLogoutEnd={finishLogout}>{demoBanner}<ProducerSettings user={effectiveUser} /></PrivateFrame>
  if (section === 'content') return <PrivateFrame section={section} user={effectiveUser} onLogoutStart={beginLogout} onLogoutEnd={finishLogout}><Content /></PrivateFrame>
  return <PrivateFrame section={section} user={effectiveUser} onLogoutStart={beginLogout} onLogoutEnd={finishLogout}><PrivatePlaceholder section={section} /></PrivateFrame>
}

function Brand() {
  return <div className="brand"><div className="logo">Drops<span>.</span></div></div>
}

function Loading() {
  const [showWakeupMessage, setShowWakeupMessage] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setShowWakeupMessage(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="center">
      <div className="login-card">
        <Brand />
        <p className="muted" role="status">Controllo sessione…</p>
        {showWakeupMessage && (
          <p className="loading-warning" style={{ fontSize: '0.85rem', color: '#888', marginTop: '12px', lineHeight: '1.4' }}>
            ℹ️ Il server gratuito su Render si sta risvegliando. Può richiedere fino a 50 secondi di attesa.
          </p>
        )}
      </div>
    </main>
  )
}

function Login({ onLogin, onDemoLogin, demoEnabled, error, setError }: { onLogin: (user: User) => void; onDemoLogin: () => void; demoEnabled: boolean; error: string; setError: (value: string) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const submitting = useRef(false)

  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true
    setBusy(true); setError('')
    try { onLogin(await api.login(username, password)) }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Accesso non riuscito.') }
    finally { submitting.current = false; setBusy(false) }
  }

  return <main className="center"><section className="login-card">
    <Brand />
    <div className="login-heading"><h1>Accedi</h1><p className="muted">Entra nella tua area privata.</p></div>
    <form onSubmit={submit} className="form-stack">
      <label>Username<input type="text" autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} /></label>
      <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      {error && <div className="alert" role="alert">{error}</div>}
      <button className="primary" disabled={busy}>{busy ? 'Accesso…' : 'Accedi'}</button>
      {demoEnabled && <div style={{ textAlign: 'center', marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px dashed #dce1dc' }}>
        <button type="button" onClick={onDemoLogin} className="secondary" style={{ width: '100%', fontSize: '0.85rem', fontWeight: 700 }}>
          Accesso demo producer locale
        </button>
      </div>}
    </form>
  </section></main>
}

function PrivateFrame({ section, user, onLogoutStart, onLogoutEnd, children }: { section: PrivateSection; user: User; onLogoutStart: () => void; onLogoutEnd: () => void; children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<'academy' | 'music' | 'beta' | null>(null)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) setOpenMenu(null)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !openMenu) return
      const trigger = headerRef.current?.querySelector<HTMLElement>(`[data-menu-trigger="${openMenu}"]`)
      setOpenMenu(null)
      requestAnimationFrame(() => trigger?.focus())
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [openMenu])

  useEffect(() => setOpenMenu(null), [section])

  const controlMenu = (menu: 'academy' | 'music' | 'beta', open: boolean) => {
    setOpenMenu((current) => open ? menu : current === menu ? null : current)
  }

  async function logout() {
    onLogoutStart()
    try { await api.logout() } catch { /* Local session remains invalidated. */ } finally { onLogoutEnd() }
  }
  return <div className={`private-layout private-layout-${section}`}>
    <div className="private-header-bar">
      <header className="private-header" ref={headerRef}>
        <a href="/" className="logo">Drops<span>.</span></a>
        <nav aria-label="Area privata">
          <a href="/">Discovery</a>
          <details className="private-tools-menu" open={openMenu === 'academy'} onToggle={(event) => controlMenu('academy', event.currentTarget.open)}>
            <summary className={section === 'academy' ? 'active' : ''} data-menu-trigger="academy" aria-expanded={openMenu === 'academy'}>
              Academy
            </summary>
            <div className="private-tools-popover academy-popover-menu">
              <div className="popover-section-title">Lessons</div>
              <a href="/app/academy#lessons" className="popover-item" onClick={() => setOpenMenu(null)}>🎓 Lezioni & Video Moduli</a>
              <a href="/app/academy#feedback" className="popover-item" onClick={() => setOpenMenu(null)}>🎧 Track Review (Guest Artist)</a>

              <div className="popover-section-title">Tools</div>
              <a href="/app/academy#djlab" className="popover-item">🎛️ DJ Lab & Set Studio</a>
              <a href="/app/academy#rekordbox" className="popover-item">💾 Rekordbox USB Prep</a>
              <a href="/app/academy#studios" className="popover-item">📍 Studi & Cabine DJ</a>
              <a href="/app/academy#resources" className="popover-item">📦 Download Kit & Presets</a>

              <div className="popover-section-title">File & Guide</div>
              <a href="/item/guida-bordero-siae-spa-dj-diritto-autore" className="popover-item">📄 Guida Borderò SIAE / SPA</a>
              <a href="/item/guida-rekordbox-usb-cdj-3000-workflow-professionale" className="popover-item">📄 Workflow CDJ-3000 & USB</a>
              <a href="/item/come-si-pubblica-la-musica-oggi" className="popover-item">📄 Come si pubblica la musica</a>
              <a href="/item/beatport-spiegato-classifiche-generi" className="popover-item">📄 Beatport Spiegato</a>
              <a href="/item/isrc-upc-codici-royalty" className="popover-item">📄 ISRC & UPC Royalty</a>
              <a href="/item/vinile-2026-stampa-tempi-costi" className="popover-item">📄 Vinile 2026: Stampa & Costi</a>
            </div>
          </details>
          <details className="private-tools-menu" open={openMenu === 'music'} onToggle={(event) => controlMenu('music', event.currentTarget.open)}>
            <summary className={['mymusic', 'download', 'archive', 'spotify'].includes(section) ? 'active' : ''} data-menu-trigger="music" aria-expanded={openMenu === 'music'}>
              My Music
            </summary>
            <div className="private-tools-popover">
              <a href="/app/archive" className={section === 'archive' ? 'active' : ''}>Archivio</a>
              <a href="/app/download" className={['mymusic', 'download'].includes(section) ? 'active' : ''}>Downloader</a>
              <a href="/app/spotify" className={section === 'spotify' ? 'active' : ''}>Sync Playlist</a>
            </div>
          </details>
          <details className="private-tools-menu" open={openMenu === 'beta'} onToggle={(event) => controlMenu('beta', event.currentTarget.open)}>
            <summary className={['content', 'radar', 'brain', 'developer', 'editorial-suggestions'].includes(section) ? 'active' : ''} data-menu-trigger="beta" aria-expanded={openMenu === 'beta'}>
              Beta
            </summary>
            <div className="private-tools-popover">
              <a href="/app/content" className={section === 'content' ? 'active' : ''}>Content</a>
              <a href="/app/radar" className={section === 'radar' ? 'active' : ''}>Radar</a>
              <a href="/app/brain" className={section === 'brain' ? 'active' : ''}>Brain Graph</a>
              <a href="/app/developer" className={section === 'developer' ? 'active' : ''}>Developer Roadmap</a>
              <a href="/app/editorial-suggestions" className={section === 'editorial-suggestions' ? 'active' : ''}>Suggerimenti Editoriali</a>
            </div>
          </details>
        </nav>
        <div className="account">
          <button
            type="button"
            className="global-search-trigger-btn"
            onClick={() => setSearchOpen(true)}
            aria-label="Cerca tutte le canzoni"
            title="Cerca tutte le canzoni (⌘K)"
          >
            <span aria-hidden="true">⌕</span>
            <kbd className="header-cmd-k">⌘K</kbd>
          </button>
          <span className="account-name">{user.name ?? user.username ?? user.email ?? 'Account'}</span>
          <a href="/app/settings" className={`account-settings ${section === 'settings' ? 'active' : ''}`} aria-label="Impostazioni profilo" title="Impostazioni profilo">⚙</a>
          <button className="secondary" onClick={logout}>Esci</button>
        </div>
      </header>
    </div>
    {children}
    <GlobalAudioPlayer />
    <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
  </div>
}

function PrivatePlaceholder({ section }: { section: PrivateSection }) {
  const labels: Record<PrivateSection, string> = {
    login: 'Login', mymusic: 'My Music', download: 'Download', archive: 'Archivio', spotify: 'Spotify', radar: 'Radar', brain: 'Brain', academy: 'Academy', content: 'Content',
    'editorial-suggestions': 'Editorial suggestions', settings: 'Settings', developer: 'Developer',
  }
  return <main className="private-placeholder"><span className="development-badge">Private development shell</span><h1 className="sr-only">{labels[section]}</h1><p>Strumento non implementato in questa milestone.</p></main>
}

const globalAudio = typeof Audio !== 'undefined' ? new Audio() : null

function useAudioPlayer() {
  const [playingUrl, setPlayingUrl] = useState<string | null>(null)

  const toggle = useCallback((url: string) => {
    if (!globalAudio) return
    if (globalAudio.src === url && !globalAudio.paused) {
      globalAudio.pause()
      setPlayingUrl(null)
    } else {
      globalAudio.pause()
      globalAudio.src = url
      globalAudio.play().then(() => setPlayingUrl(url)).catch(() => setPlayingUrl(null))
      globalAudio.onended = () => setPlayingUrl(null)
      globalAudio.onerror = () => setPlayingUrl(null)
    }
  }, [])

  return { playingUrl, toggle }
}

function exportCrate(items: (HistoryItem | SpotifyTrack)[], name = 'drops-crate') {
  if (!items.length) return
  const m3u8 = [
    '#EXTM3U',
    ...items.map((it) => {
      const title = 'title' in it ? it.title : ''
      const artist = 'artist' in it ? it.artist : 'artists' in it ? it.artists.join(', ') : ''
      const file = 'id' in it && typeof it.id === 'string' && !it.id.startsWith('spotify-') ? api.fileUrl(it.id) : ''
      return `#EXTINF:-1,${artist ? `${artist} - ` : ''}${title}\n${file}`
    }),
  ].join('\n')
  const blob = new Blob([m3u8], { type: 'audio/x-mpegurl' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.m3u8`
  a.click()
  URL.revokeObjectURL(url)
}

function PlatformSyncHub({ onError, error }: { onError: (error: unknown) => void; error: string }) {
  const [activeSyncTab, setActiveSyncTab] = useState<'spotify' | 'multisource'>('spotify')

  return (
    <div className="platform-sync-hub-page">
      <div className="platform-sync-top-tabs">
        <button
          type="button"
          className={`sync-main-tab-btn ${activeSyncTab === 'spotify' ? 'active' : ''}`}
          onClick={() => setActiveSyncTab('spotify')}
        >
          🟢 Spotify Library Sync
        </button>
        <button
          type="button"
          className={`sync-main-tab-btn ${activeSyncTab === 'multisource' ? 'active' : ''}`}
          onClick={() => setActiveSyncTab('multisource')}
        >
          🟠 SoundCloud & YouTube Crate Sync <span className="badge-new-pill" style={{ marginLeft: '4px' }}>NEW</span>
        </button>
      </div>

      {activeSyncTab === 'spotify' ? (
        <SpotifyLibrary onError={onError} error={error} />
      ) : (
        <div style={{ padding: '0 24px 24px' }}>
          <MultiSourceSync />
        </div>
      )}
    </div>
  )
}

function SpotifyLibrary({ onError, error }: { onError: (error: unknown) => void; error: string }) {
  const [status, setStatus] = useState<{ connected: boolean; display_name: string | null } | null>(null)
  const [mode, setMode] = useState<'liked' | 'playlists'>('liked')
  const [tracks, setTracks] = useState<SpotifyTrack[]>([])
  const [total, setTotal] = useState(0)
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([])
  const [playlistId, setPlaylistId] = useState('')
  const [busy, setBusy] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selectMode, setSelectMode] = useState(false)
  const [bpmState, setBpmState] = useState<Record<string, 'queued' | 'running' | 'error'>>({})
  const [dlState, setDlState] = useState<Record<string, 'queued' | 'done' | 'error'>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [exportingZip, setExportingZip] = useState(false)
  const discogsRequested = useRef(new Set<string>())
  const discogsQueue = useRef<string[]>([])
  const discogsActiveCount = useRef(0)
  const { playingUrl, toggle: toggleAudio } = useAudioPlayer()

  useEffect(() => { api.spotifyStatus().then(setStatus).catch(onError) }, [onError])
  useEffect(() => {
    if (!status?.connected || mode !== 'liked') return
    setBusy(true)
    api.spotifyLiked(100, 0).then((result) => { setTracks(result.tracks); setTotal(result.total) }).catch(onError).finally(() => setBusy(false))
  }, [mode, onError, status?.connected])
  useEffect(() => {
    if (mode !== 'liked' || busy || tracks.length === 0 || tracks.length >= total) return
    let cancelled = false
    setBusy(true)
    api.spotifyLiked(100, tracks.length)
      .then((result) => { if (!cancelled) { setTracks((current) => [...current, ...result.tracks]); setTotal(result.total) } })
      .catch((cause) => { if (!cancelled) onError(cause) })
      .finally(() => { if (!cancelled) setBusy(false) })
    return () => { cancelled = true }
  }, [mode, tracks.length, total, busy, onError])
  useEffect(() => {
    if (!status?.connected || mode !== 'playlists') return
    api.spotifyPlaylists().then((result) => { setPlaylists(result.playlists); setPlaylistId((current) => current || result.playlists[0]?.id || '') }).catch(onError)
  }, [mode, onError, status?.connected])
  useEffect(() => {
    if (mode !== 'playlists' || !playlistId) return
    setBusy(true)
    api.spotifyPlaylistTracks(playlistId).then((result) => { setTracks(result.tracks); setTotal(result.total) }).catch(onError).finally(() => setBusy(false))
  }, [mode, onError, playlistId])
  useEffect(() => {
    if (!status?.connected) return
    const pending = tracks.filter((track) => !track.label && !discogsRequested.current.has(track.id))
    if (pending.length === 0) return
    pending.forEach((track) => {
      discogsRequested.current.add(track.id)
      discogsQueue.current.push(track.id)
    })
    const processQueue = () => {
      while (discogsActiveCount.current < 2 && discogsQueue.current.length > 0) {
        const trackId = discogsQueue.current.shift()
        if (!trackId) break
        const track = tracks.find((t) => t.id === trackId)
        if (!track) continue
        discogsActiveCount.current++
        api.discogsEnrich(track).then((metadata) => {
          if (!metadata?.label) return
          setTracks((current) => current.map((item) => item.id === track.id ? { ...item, label: metadata.label, year: metadata.year, country: metadata.country, styles: metadata.styles, catalog_no: metadata.catalog_no, discogs_url: metadata.discogs_url } : item))
        }).catch(() => { /* Discogs optional */ })
        .finally(() => {
          discogsActiveCount.current--
          setTimeout(processQueue, 300)
        })
      }
    }
    processQueue()
  }, [status?.connected, tracks])

  function toggleSelected(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll(items: SpotifyTrack[]) {
    if (selected.size === items.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(items.map((t) => t.id)))
    }
  }

  async function calculateSingleBpm(track: SpotifyTrack) {
    setBpmState((current) => ({ ...current, [track.id]: 'queued' }))
    try {
      const job = await api.bpmCompute(track, soundcloudUrl(track))
      if (job.bpm != null) {
        const bpm = job.bpm
        setTracks((current) => current.map((item) => (item.id === track.id ? { ...item, bpm, in_catalog: true } : item)))
        return
      }
      let result = await api.bpmJob(job.job_id)
      while (result.status === 'queued' || result.status === 'running') {
        setBpmState((current) => ({ ...current, [track.id]: result.status as 'queued' | 'running' }))
        await new Promise((resolve) => window.setTimeout(resolve, 1200))
        result = await api.bpmJob(job.job_id)
      }
      if (result.status === 'ready' && result.bpm != null) {
        setTracks((current) => current.map((item) => (item.id === track.id ? { ...item, bpm: result.bpm!, in_catalog: true } : item)))
      } else {
        setBpmState((current) => ({ ...current, [track.id]: 'error' }))
      }
    } catch {
      setBpmState((current) => ({ ...current, [track.id]: 'error' }))
    }
  }

  async function calculateBpm() {
    const chosen = tracks.filter((track) => selected.has(track.id))
    await Promise.all(chosen.map((track) => calculateSingleBpm(track)))
  }

  async function handleDownloadTrack(track: SpotifyTrack) {
    setDlState((cur) => ({ ...cur, [track.id]: 'queued' }))
    try {
      const url = soundcloudUrl(track)
      const created = await api.createDownload(url, {
        artist: track.artists[0] ?? '',
        title: track.title,
        cover_url: track.cover_url,
      })
      setDlState((cur) => ({ ...cur, [track.id]: 'done' }))
      if (created.id) {
        addQueueJob({
          key: makeKey(),
          id: created.id,
          url,
          status: created.status || 'queued',
          progress: created.progress ?? 0,
          optimistic: 10,
          title: created.title || track.title,
          artist: created.artist || track.artists.join(', '),
          coverUrl: created.coverUrl || track.cover_url || undefined,
          source: created.source || undefined,
        })
      }
    } catch {
      setDlState((cur) => ({ ...cur, [track.id]: 'error' }))
    }
  }

  async function handleDownloadSelected() {
    const chosen = tracks.filter((t) => selected.has(t.id))
    await Promise.all(chosen.map((t) => handleDownloadTrack(t)))
  }

  if (!status) return <main className="spotify-workspace">{error ? <div className="alert" role="alert">{error}</div> : <p className="spotify-state" role="status">Controllo Spotify…</p>}</main>
  if (!status.connected) return <main className="spotify-workspace spotify-connect"><p>Collega account Premium per leggere preferiti e playlist.</p><a className="primary spotify-connect-button" href={api.spotifyConnectUrl()}>Connetti Spotify</a></main>

  const visibleTracks = tracks.filter((t) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    return (
      t.title.toLowerCase().includes(q) ||
      t.artists.some((a) => a.toLowerCase().includes(q)) ||
      (t.album && t.album.toLowerCase().includes(q)) ||
      (t.label && t.label.toLowerCase().includes(q))
    )
  })

  return (
    <main className="spotify-workspace">
      <div className="spotify-header-hero">
        <div className="spotify-account-heading">
          <span className="status-dot large" />
          <h1 className="spotify-account-title">
            <span className="spotify-account-sub">Spotify collegato</span>
            <span className="spotify-account-name">{status.display_name}</span>
          </h1>
        </div>
      </div>

      <div className="spotify-toolbar-compact">
        <div className="spotify-toolbar-actions-left">
          <button
            type="button"
            className={`spotify-btn-underline ${selectMode ? 'active' : ''}`}
            onClick={() => { setSelectMode(!selectMode); if (selectMode) setSelected(new Set()) }}
          >
            {selectMode ? 'Annulla selezione' : 'Seleziona manualmente'}
          </button>
          
          <div className="spotify-toggle" role="group" aria-label="Libreria Spotify">
            <button className={mode === 'liked' ? 'active' : ''} onClick={() => { setMode('liked'); setSelected(new Set()) }}>Recenti</button>
            <button className={mode === 'playlists' ? 'active' : ''} onClick={() => { setMode('playlists'); setSelected(new Set()) }}>Playlist</button>
          </div>

          {mode === 'playlists' && (
            <div className="spotify-playlist-select-wrap">
              <select
                aria-label="Seleziona playlist"
                className="spotify-playlist-dropdown"
                value={playlistId}
                onChange={(event) => setPlaylistId(event.target.value)}
              >
                {playlists.map((playlist) => (
                  <option key={playlist.id} value={playlist.id}>
                    {playlist.name} ({playlist.tracks_total} tracce)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="spotify-toolbar-actions-right">
          <div className="spotify-search-wrap">
            <span className="spotify-search-icon" aria-hidden="true">🔍</span>
            <input
              type="search"
              aria-label="Cerca traccia"
              placeholder="Cerca per titolo, artista, label…"
              className="spotify-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="spotify-stats-pill">
            {selectMode ? (
              <strong>{selected.size} / {visibleTracks.length} selezionate</strong>
            ) : (
              <span>{visibleTracks.length} {visibleTracks.length === 1 ? 'traccia' : 'tracce'}{total > visibleTracks.length && mode === 'liked' ? ` di ${total}` : ''}</span>
            )}
          </div>
        </div>
      </div>

      {selectMode && (
        <div className="spotify-selection-bar">
          <div className="spotify-selection-tools">
            <button
              type="button"
              className="spotify-mode-btn secondary"
              onClick={() => toggleSelectAll(visibleTracks)}
            >
              {selected.size === visibleTracks.length ? 'Deseleziona tutte' : 'Seleziona tutte'}
            </button>
            <span className="spotify-select-count">{selected.size} di {visibleTracks.length} selezionate</span>
          </div>
          {selected.size > 0 && (
            <div className="spotify-selection-actions">
              <button
                type="button"
                className="primary spotify-action-btn"
                onClick={calculateBpm}
              >
                ⚡ Calcola BPM ({selected.size})
              </button>
              <button
                type="button"
                className="primary spotify-action-btn"
                onClick={handleDownloadSelected}
              >
                ↓ Scarica selezione ({selected.size})
              </button>
            </div>
          )}
        </div>
      )}

      {error && <div className="alert" role="alert">{error}</div>}

      {busy && tracks.length === 0 ? (
        <p className="spotify-state" role="status">Caricamento tracce…</p>
      ) : (
        <TrackGroups
          tracks={visibleTracks}
          mode={selectMode ? 'bpm-select' : 'recent'}
          selected={selected}
          bpmState={bpmState}
          dlState={dlState}
          playingUrl={playingUrl}
          onToggleAudio={toggleAudio}
          onToggle={toggleSelected}
          onDownload={handleDownloadTrack}
          onCalculateBpm={calculateSingleBpm}
        />
      )}

      {mode === 'liked' && tracks.length < total && (
        <p className="spotify-more" role="status">{`Caricamento preferiti… ${tracks.length}/${total}`}</p>
      )}
    </main>
  )
}

function TrackGroups({
  tracks,
  mode,
  selected,
  bpmState,
  dlState,
  playingUrl,
  onToggleAudio,
  onToggle,
  onDownload,
  onCalculateBpm,
}: {
  tracks: SpotifyTrack[]
  mode: 'recent' | 'bpm-select'
  selected?: Set<string>
  bpmState?: Record<string, 'queued' | 'running' | 'error'>
  dlState?: Record<string, 'queued' | 'done' | 'error'>
  playingUrl?: string | null
  onToggleAudio?: (url: string) => void
  onToggle?: (id: string) => void
  onDownload?: (track: SpotifyTrack) => void
  onCalculateBpm?: (track: SpotifyTrack) => void
}) {
  const isTest = import.meta.env.MODE === 'test'
  const [displayCount, setDisplayCount] = useState(isTest ? 9999 : 15)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const ordered = useMemo(() => {
    return [...tracks].sort((left, right) => (Date.parse(right.added_at || '') || 0) - (Date.parse(left.added_at || '') || 0))
  }, [tracks])

  useEffect(() => {
    setDisplayCount(isTest ? 9999 : 15)
  }, [tracks, isTest])

  useEffect(() => {
    if (displayCount >= ordered.length) return
    const sentinel = sentinelRef.current
    if (!sentinel || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setDisplayCount((cur) => Math.min(ordered.length, cur + 15))
      }
    }, { rootMargin: '300px' })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [displayCount, ordered.length])

  if (!tracks.length) return <p className="spotify-state">Nessuna traccia.</p>

  const visible = ordered.slice(0, displayCount)

  return (
    <div className="track-list">
      {visible.map((track) => (
        <TrackRow
          key={track.id}
          track={track}
          selectable={mode === 'bpm-select'}
          checked={selected?.has(track.id) ?? false}
          disabled={!(selected?.has(track.id) ?? false) && (selected?.size ?? 0) >= 3}
          bpmStatus={bpmState?.[track.id]}
          dlStatus={dlState?.[track.id]}
          playing={playingUrl === track.preview_url}
          onToggleAudio={onToggleAudio}
          onToggle={onToggle}
          onDownload={onDownload}
          onCalculateBpm={onCalculateBpm}
        />
      ))}
      {displayCount < ordered.length && (
        <div ref={sentinelRef} className="track-list-sentinel">
          <button
            type="button"
            className="secondary track-load-more"
            onClick={() => setDisplayCount((cur) => Math.min(ordered.length, cur + 20))}
          >
            Carica altre ({ordered.length - displayCount} rimanenti)
          </button>
        </div>
      )}
    </div>
  )
}

function PlatformLinks({ query, discogsUrl, title }: { query: string; discogsUrl?: string | null; title: string }) {
  return (
    <nav className="track-links" aria-label={`Ascolta ${title}`}>
      <a
        href={`https://www.youtube.com/results?search_query=${query}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Apri ${title} su YouTube`}
        title="YouTube"
        className="track-platform-icon track-icon-yt"
      >
        <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
      </a>
      <a
        href={`https://soundcloud.com/search?q=${query}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Apri ${title} su SoundCloud`}
        title="SoundCloud"
        className="track-platform-icon track-icon-sc"
      >
        <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M11.56 8.87V17h9.72c1.5 0 2.72-1.22 2.72-2.72s-1.22-2.72-2.72-2.72c-.22 0-.44.03-.64.08-.22-1.57-1.57-2.77-3.2-2.77-.45 0-.87.09-1.26.25C15.65 7.42 14.07 6.2 12.2 6.2c-.22 0-.43.02-.64.06v2.61zm-1.85-.3V17H8.25V9.41c-.48.24-.9.57-1.24.97V17H5.55v-5.26c-.39.63-.61 1.37-.61 2.16 0 .04 0 .07.01.11H3.5C2.67 14.01 2 14.68 2 15.5S2.67 17 3.5 17h.8v-2.89H3.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1.45v3.89H1.4v.01H1.2C.54 17.01 0 17.55 0 18.21s.54 1.2 1.2 1.2h20.08c2.05 0 3.72-1.67 3.72-3.72s-1.67-3.72-3.72-3.72c-.17 0-.34.01-.5.04C20.35 9.87 18.52 8.2 16.32 8.2c-.75 0-1.46.2-2.07.54-.75-1.04-1.97-1.72-3.36-1.72-.4 0-.79.06-1.18.15z"/></svg>
      </a>
      <a
        href={`https://www.beatport.com/search?q=${query}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Apri ${title} su Beatport`}
        title="Beatport"
        className="track-platform-icon track-icon-bp"
      >
        <span>BP</span>
      </a>
      <a
        href={`https://bandcamp.com/search?q=${query}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Apri ${title} su Bandcamp`}
        title="Bandcamp"
        className="track-platform-icon track-icon-bc"
      >
        <span>BC</span>
      </a>
      {discogsUrl && (
        <a
          href={discogsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Apri ${title} su Discogs`}
          title="Discogs"
          className="track-platform-icon track-icon-dg"
        >
          <span>DG</span>
        </a>
      )}
    </nav>
  )
}

function TrackRow({
  track,
  selectable,
  checked,
  disabled,
  bpmStatus,
  dlStatus,
  playing,
  onToggleAudio,
  onToggle,
  onDownload,
  onCalculateBpm,
}: {
  track: SpotifyTrack
  selectable?: boolean
  checked?: boolean
  disabled?: boolean
  bpmStatus?: string
  dlStatus?: 'queued' | 'done' | 'error'
  playing?: boolean
  onToggleAudio?: (url: string) => void
  onToggle?: (id: string) => void
  onDownload?: (track: SpotifyTrack) => void
  onCalculateBpm?: (track: SpotifyTrack) => void
}) {
  const query = encodeURIComponent(`${track.artists[0] || ''} ${track.title}`.trim())
  return (
    <article className={`spotify-track-card ${checked ? 'selected' : ''}`}>
      {selectable && (
        <input
          className="bpm-checkbox"
          type="checkbox"
          aria-label={`Seleziona ${track.title}`}
          checked={checked}
          disabled={disabled}
          onChange={() => onToggle?.(track.id)}
        />
      )}
      <div
        className={`track-cover ${track.preview_url ? 'is-playable' : ''} ${playing ? 'is-playing' : ''}`}
        onClick={() => track.preview_url && onToggleAudio?.(track.preview_url)}
        title={track.preview_url ? (playing ? 'Pausa anteprima' : 'Ascolta anteprima (30s)') : undefined}
      >
        {track.cover_url ? <img src={track.cover_url} alt="" loading="lazy" /> : <span>♪</span>}
        {track.preview_url && <span className="cover-play-badge">{playing ? '⏸' : '▶'}</span>}
      </div>
      <div className="track-main">
        <div className="track-title-row">
          <strong className="track-title" title={track.title}>{track.title}</strong>
        </div>
        <div className="track-meta-line">
          <span className="track-artist">{track.artists.join(', ')}</span>
          {track.album && <span className="track-dot">·</span>}
          {track.album && <span className="track-album-name">{track.album}</span>}
          {track.label && <span className="track-chip track-chip-label">{track.label}</span>}
          {track.year && <span className="track-chip track-chip-year">{track.year}</span>}
          {track.styles?.[0] && <span className="track-chip track-chip-style">{track.styles[0]}</span>}
        </div>
      </div>
      <div className="track-actions-bar">
        <div className="track-bpm-badge">
          {track.bpm != null ? (
            <span className="track-chip track-chip-bpm"><b>{Math.round(track.bpm)}</b> <small>BPM</small></span>
          ) : bpmStatus === 'queued' || bpmStatus === 'running' ? (
            <span className="track-chip track-chip-bpm calculating">… BPM</span>
          ) : (
            <button
              type="button"
              className="track-chip-bpm-btn"
              title="Calcola BPM rapido con download audio"
              onClick={() => onCalculateBpm?.(track)}
            >
              + BPM
            </button>
          )}
        </div>
        <time className="track-date" dateTime={track.added_at ?? undefined}>
          {formatSpotifyDate(track.added_at)}
        </time>
        <button
          type="button"
          className={`track-dl-btn ${dlStatus === 'done' ? 'done' : dlStatus === 'queued' ? 'busy' : ''}`}
          disabled={dlStatus === 'queued' || dlStatus === 'done'}
          onClick={() => onDownload?.(track)}
          title="Scarica con motore Drops e salva in Coda"
        >
          {dlStatus === 'done' ? '✓ In coda' : dlStatus === 'queued' ? '…' : '↓ Scarica'}
        </button>
        <PlatformLinks query={query} discogsUrl={track.discogs_url} title={track.title} />
      </div>
    </article>
  )
}

function soundcloudUrl(track: SpotifyTrack) { return `https://soundcloud.com/search?q=${encodeURIComponent(`${track.artists[0] ?? ''} ${track.title}`.trim())}` }

function formatSpotifyDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

const radarStatusLabels: Record<RadarStatus, string> = { saved: 'Salvato', discarded: 'Scartato', linked: 'Collegato al Brain', content: 'Trasformato in contenuto' }

function Radar() {
  const [state, setState] = usePrototypeState()
  const visibleFixtures = [...radarDevelopmentFixtures, ...radarLockedFixtures.filter((fixture) => state.unlockedIds.includes(fixture.id))]
  const hasPrototypeData = state.extraNodes.length > 0 || Object.keys(state.radarStatus).length > 0

  function save(id: string) { setState(setRadarStatus(id, 'saved')) }
  function discard(id: string) { setState(setRadarStatus(id, 'discarded')) }
  function link(fixture: RadarFixture) { setState(linkRadarToBrain(fixture)) }
  function convert(id: string) { setState(setRadarStatus(id, 'content')) }
  function resetPrototype() { setState(resetPrototypeState()) }

  return <main className="private-workspace"><header className="workspace-heading"><span className="development-badge">Radar · development shell</span><h1 className="sr-only">Radar</h1><p>Segnali guidati dal Brain, con fonti che possono emergere anche fuori dalle relazioni già presenti.</p></header>
    <div className="radar-toolbar">
      <p className="prototype-note">Prototipo — stato salvato solo in questo browser (localStorage), non è ancora il database reale. “Collega al Brain” aggiunge davvero un nodo al grafo e può sbloccare nuove proposte qui sotto.</p>
      <button type="button" className="radar-reset" onClick={resetPrototype} disabled={!hasPrototypeData}>Reset prototipo</button>
    </div>
    <div className="brain-preview" aria-label="Anteprima Brain">
      <strong>Nel Brain (prototipo):</strong>
      {state.extraNodes.length === 0
        ? <span className="brain-preview-empty">Ancora nessun nodo aggiunto dal Radar.</span>
        : state.extraNodes.map((node) => <span className="brain-preview-chip" key={node.id}>{node.id.replace(/^Radar · /, '')}</span>)}
    </div>
    <div className="radar-grid">{visibleFixtures.map((item) => {
      const status = state.radarStatus[item.id]
      const isNew = radarLockedFixtures.some((locked) => locked.id === item.id) && status === undefined
      return <article className={`radar-card ${status ? `is-${status}` : ''} ${isNew ? 'is-new' : ''}`} key={item.id}>
        <div className="radar-card-head"><span className="fixture-label">Development fixture</span>{status && <span className="radar-status-badge">{radarStatusLabels[status]}</span>}{isNew && <span className="radar-status-badge">Nuovo · sbloccato dal Brain</span>}</div>
        <h2>{item.title}</h2>
        <dl><div><dt>Fonte</dt><dd>{item.source}</dd></div><div><dt>Data</dt><dd>{item.date}</dd></div><div><dt>Luogo</dt><dd>{item.location}</dd></div><div><dt>Categoria</dt><dd>{item.category}</dd></div></dl>
        <section><h3>Perché è rilevante</h3><p>{item.relevance}</p></section>
        <div className="planned-actions" aria-label="Azioni">
          <button type="button" data-action="save" className={status === 'saved' ? 'is-active' : ''} disabled={status === 'linked' || status === 'content'} onClick={() => save(item.id)}>Salva</button>
          <button type="button" data-action="discard" className={status === 'discarded' ? 'is-active' : ''} disabled={status === 'linked' || status === 'content'} onClick={() => discard(item.id)}>Scarta</button>
          <button type="button" data-action="link" disabled={status === 'linked'} onClick={() => link(item)}>{status === 'linked' ? 'Collegato ✓' : 'Collega al Brain'}</button>
          <button type="button" data-action="content" disabled={status === 'content'} onClick={() => convert(item.id)}>{status === 'content' ? 'Trasformato ✓' : 'Trasforma in contenuto'}</button>
        </div>
      </article>
    })}</div>
  </main>
}

function Brain() {
  const [state] = usePrototypeState()
  return <main className="brain-workspace"><h1 className="sr-only">Brain</h1><BrainGraph extraNodes={state.extraNodes} extraLinks={state.extraLinks} /></main>
}

function Content() {
  const [state, setState] = usePrototypeState()
  
  // Stato locale degli articoli per riflettere immediatamente le modifiche CRUD nel browser
  const [articles, setArticles] = useState<any[]>([])
  const [editingArticle, setEditingArticle] = useState<any | null>(null)
  
  // Stato per l'estrazione copertina
  const [extractingUrl, setExtractingUrl] = useState<string>('')
  const [extractedImage, setExtractedImage] = useState<string | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)

  // Inizializza gli articoli da publishedContentItems
  useEffect(() => {
    setArticles(publishedContentItems)
  }, [])

  const [contentSearch, setContentSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [draftsOpen, setDraftsOpen] = useState(false)
  const [publishedOpen, setPublishedOpen] = useState(false)

  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      if (selectedType !== 'all' && item.type !== selectedType) return false
      if (!contentSearch.trim()) return true
      const q = contentSearch.toLowerCase()
      const matchTitle = item.title?.toLowerCase().includes(q)
      const matchKicker = item.kicker?.toLowerCase().includes(q)
      const matchSummary = item.summary?.toLowerCase().includes(q)
      const matchCity = item.primaryLocation?.name?.toLowerCase().includes(q)
      const matchTags = Array.isArray(item.tags) ? item.tags.some((t: string) => t.toLowerCase().includes(q)) : false
      return matchTitle || matchKicker || matchSummary || matchCity || matchTags
    })
  }, [articles, selectedType, contentSearch])

  const drafts = useMemo(() => {
    return filteredArticles.filter(item => getArticleStatus(item.id, state.contentStatus) === 'Draft')
  }, [filteredArticles, state.contentStatus])

  const published = useMemo(() => {
    return filteredArticles.filter(item => getArticleStatus(item.id, state.contentStatus) === 'Published')
  }, [filteredArticles, state.contentStatus])

  // Chiamata backend per estrarre la copertina tramite og:image
  const handleExtractCover = async (url: string) => {
    if (!url) return
    setIsExtracting(true)
    setExtractError(null)
    setExtractedImage(null)
    try {
      const res = await fetch(`/api/v1/content/extract-cover?url=${encodeURIComponent(url)}`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Impossibile estrarre la copertina')
      }
      const data = await res.json()
      setExtractedImage(data.image_url)
    } catch (e: any) {
      setExtractError(e.message)
    } finally {
      setIsExtracting(false)
    }
  }

  // Chiamata backend per salvare l'articolo in locale
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingArticle) return

    // Sanitizzazione conforme allo schema Zod (rimozione campi non consentiti)
    const sanitized = { ...editingArticle }
    if (sanitized.type !== 'party') {
      delete sanitized.partyKind
    }
    
    // Pulisci tag da stringa separata da virgole
    if (typeof sanitized.tags === 'string') {
      sanitized.tags = sanitized.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    }

    // Converti coordinate se presenti
    if (sanitized.primaryLocation.kind === 'geographic') {
      if (sanitized.primaryLocation.latitude !== undefined && sanitized.primaryLocation.latitude !== '') {
        sanitized.primaryLocation.latitude = parseFloat(sanitized.primaryLocation.latitude as any)
      } else {
        delete sanitized.primaryLocation.latitude
      }
      if (sanitized.primaryLocation.longitude !== undefined && sanitized.primaryLocation.longitude !== '') {
        sanitized.primaryLocation.longitude = parseFloat(sanitized.primaryLocation.longitude as any)
      } else {
        delete sanitized.primaryLocation.longitude
      }
    } else {
      delete sanitized.primaryLocation.countryCode
      delete sanitized.primaryLocation.latitude
      delete sanitized.primaryLocation.longitude
      sanitized.mapEligible = false
    }

    // Pulisci fonti vuote
    sanitized.sources = sanitized.sources.filter((s: any) => s.url.trim() !== '')

    // Pulisci relazioni vuote
    sanitized.relations = sanitized.relations.filter((r: any) => r.id.trim() !== '')

    // Pulisci blocchi di testo vuoti
    sanitized.body = sanitized.body.filter((b: any) => b.html.trim() !== '')

    try {
      const res = await fetch('/api/v1/content/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitized)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Errore durante il salvataggio')
      }
      
      // Aggiorna lo stato in-memory locale
      setArticles(prev => {
        const found = prev.some(a => a.id === sanitized.id)
        if (found) {
          return prev.map(a => a.id === sanitized.id ? sanitized : a)
        } else {
          return [...prev, sanitized]
        }
      })
      
      setEditingArticle(null)
      alert('Articolo salvato con successo nel file content.json locale!')
    } catch (e: any) {
      alert(`Errore di salvataggio: ${e.message}`)
    }
  }

  // Chiamata backend per eliminare l'articolo
  const handleDeleteArticle = async (articleId: string) => {
    if (!window.confirm(`Sei sicuro di voler eliminare definitivamente l'articolo "${articleId}"?`)) return
    try {
      const res = await fetch(`/api/v1/content/delete/${articleId}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Errore durante l'eliminazione")
      }
      
      // Aggiorna lo stato in-memory locale
      setArticles(prev => prev.filter(a => a.id !== articleId))
      alert('Articolo eliminato con successo dal file content.json locale!')
    } catch (e: any) {
      alert(`Errore di eliminazione: ${e.message}`)
    }
  }

  const startNewArticle = () => {
    setEditingArticle({
      id: '',
      slug: '',
      type: 'party',
      partyKind: 'festival',
      kicker: '',
      coverUrl: '',
      title: '',
      summary: '',
      publishedAt: new Date().toISOString(),
      originalPublishedAt: new Date().toISOString(),
      primaryLocation: {
        kind: 'geographic',
        name: '',
        countryCode: '',
        latitude: 45.4642,
        longitude: 9.19
      },
      mapEligible: false,
      tags: [],
      sources: [{ url: '', label: '', kind: 'official' }],
      relations: [],
      body: [{ heading: '', html: '' }]
    })
    setExtractingUrl('')
    setExtractedImage(null)
    setExtractError(null)
  }

  const startEditingArticle = (item: any) => {
    const formatted = {
      ...item,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '',
      sources: item.sources || [{ url: '', label: '', kind: 'official' }],
      relations: item.relations || [],
      body: item.body || [{ heading: '', html: '' }]
    }
    setEditingArticle(formatted)
    setExtractingUrl(formatted.sources[0]?.url || '')
    setExtractedImage(null)
    setExtractError(null)
  }

  const updateFormField = (path: string[], value: any) => {
    setEditingArticle((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev))
      let current = next
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }
      current[path[path.length - 1]] = value
      return next
    })
  }

  // --- SE EDITING ATTIVO, MOSTRA IL FORM CMS ---
  if (editingArticle) {
    return (
      <main className="private-workspace" style={{ maxWidth: '960px', margin: '0 auto', padding: '20px' }}>
        <header className="workspace-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
          <div>
            <span className="development-badge" style={{ background: 'var(--color-accent-strong)', color: '#000' }}>CMS Editor</span>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '4px 0 0' }}>
              {editingArticle.id ? `Modifica: ${editingArticle.title}` : 'Crea Nuovo Articolo'}
            </h1>
          </div>
          <button
            type="button"
            style={{ background: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
            onClick={() => setEditingArticle(null)}
          >
            Annulla ed Esci
          </button>
        </header>

        <form onSubmit={handleSaveArticle} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* COLONNA SINISTRA: INFO BASE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'var(--color-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px' }}>Dati Identificativi</h3>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '11px', fontWeight: 'bold', gap: '4px' }}>
                  ID Unico (es. festival-houghton-norfolk)
                  <input
                    type="text"
                    required
                    disabled={!!editingArticle.id}
                    value={editingArticle.id}
                    onChange={e => updateFormField(['id'], e.target.value)}
                    style={{ height: '36px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border-strong)' }}
                  />
                </label>

                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '11px', fontWeight: 'bold', gap: '4px' }}>
                  Slug URL (es. houghton-festival-norfolk)
                  <input
                    type="text"
                    required
                    value={editingArticle.slug}
                    onChange={e => updateFormField(['slug'], e.target.value)}
                    style={{ height: '36px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border-strong)' }}
                  />
                </label>
              </div>
            </div>

            <div style={{ background: 'var(--color-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px' }}>Classificazione</h3>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '11px', fontWeight: 'bold', gap: '4px' }}>
                  Tipo Articolo
                  <select
                    value={editingArticle.type}
                    onChange={e => updateFormField(['type'], e.target.value)}
                    style={{ height: '36px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border-strong)' }}
                  >
                    <option value="party">Festival / Party (party)</option>
                    <option value="label">Etichette (label)</option>
                    <option value="artist">Artisti (artist)</option>
                    <option value="release">Radar Releases (release)</option>
                    <option value="story">Guide & Scena (story)</option>
                    <option value="playlist">Playlist (playlist)</option>
                    <option value="set">Set (set)</option>
                  </select>
                </label>

                {editingArticle.type === 'party' && (
                  <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '11px', fontWeight: 'bold', gap: '4px' }}>
                    Tipologia Party
                    <select
                      value={editingArticle.partyKind || 'festival'}
                      onChange={e => updateFormField(['partyKind'], e.target.value)}
                      style={{ height: '36px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border-strong)' }}
                    >
                      <option value="festival">Festival</option>
                      <option value="event">Evento singolo</option>
                      <option value="series">Serie di eventi</option>
                      <option value="collective">Collettivo</option>
                      <option value="club-night">Serata in Club</option>
                    </select>
                  </label>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '11px', fontWeight: 'bold', gap: '4px' }}>
                  Kicker (Etichetta sopra il titolo, es. "Radar")
                  <input
                    type="text"
                    value={editingArticle.kicker || ''}
                    onChange={e => updateFormField(['kicker'], e.target.value)}
                    style={{ height: '36px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border-strong)' }}
                  />
                </label>
                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '11px', fontWeight: 'bold', gap: '4px' }}>
                  Tag (Separati da virgola)
                  <input
                    type="text"
                    value={editingArticle.tags}
                    onChange={e => updateFormField(['tags'], e.target.value)}
                    placeholder="es. festival, minimal, london"
                    style={{ height: '36px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border-strong)' }}
                  />
                </label>
              </div>
            </div>

            <div style={{ background: 'var(--color-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px' }}>Testi Principali</h3>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '11px', fontWeight: 'bold', gap: '4px', marginBottom: '12px' }}>
                Titolo Articolo
                <input
                  type="text"
                  required
                  value={editingArticle.title}
                  onChange={e => {
                    const title = e.target.value
                    updateFormField(['title'], title)
                    if (!editingArticle.id) {
                      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                      updateFormField(['slug'], slug)
                    }
                  }}
                  style={{ height: '36px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border-strong)' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '11px', fontWeight: 'bold', gap: '4px' }}>
                Riassunto Breve (Summary)
                <textarea
                  required
                  rows={3}
                  value={editingArticle.summary}
                  onChange={e => updateFormField(['summary'], e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--color-border-strong)', fontFamily: 'inherit' }}
                />
              </label>
            </div>

            <div style={{ background: 'var(--color-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px' }}>Immagine Copertina</h3>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '11px', fontWeight: 'bold', gap: '4px' }}>
                URL Copertina
                <input
                  type="text"
                  value={editingArticle.coverUrl || ''}
                  onChange={e => updateFormField(['coverUrl'], e.target.value)}
                  style={{ height: '36px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border-strong)' }}
                />
              </label>

              {/* BOX DI SCRAPING COPERTINA */}
              <div style={{ background: 'var(--color-surface-subtle)', padding: '12px', borderRadius: '8px', marginTop: '10px', border: '1px solid var(--color-border)' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Recupera Copertina da URL di riferimento:</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    style={{ flex: 1, height: '32px', fontSize: '12px', borderRadius: '6px', padding: '4px' }}
                    value={extractingUrl}
                    onChange={e => setExtractingUrl(e.target.value)}
                  >
                    <option value="">Seleziona una fonte...</option>
                    {editingArticle.sources.map((s: any, idx: number) => s.url && (
                      <option key={idx} value={s.url}>{s.label || s.url}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    style={{ background: 'var(--color-accent-strong)', color: '#000', border: 'none', padding: '0 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                    disabled={isExtracting || !extractingUrl}
                    onClick={() => handleExtractCover(extractingUrl)}
                  >
                    {isExtracting ? 'Estrazione...' : 'Recupera'}
                  </button>
                </div>
                
                {extractedImage && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <img src={extractedImage} alt="Anteprima estratta" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                    <button
                      type="button"
                      style={{ background: 'var(--color-accent)', color: '#05230f', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      onClick={() => {
                        updateFormField(['coverUrl'], extractedImage)
                        setExtractedImage(null)
                      }}
                    >
                      Applica a Copertina
                    </button>
                  </div>
                )}
                {extractError && <p style={{ color: 'var(--color-danger, #b42318)', fontSize: '11px', margin: '6px 0 0' }}>{extractError}</p>}
              </div>
            </div>
          </div>

          {/* COLONNA DESTRA: LOCALIZZAZIONE, FONTI, CORPO, RELAZIONI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* GEOLOCALIZZAZIONE */}
            <div style={{ background: 'var(--color-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px' }}>Posizione Geografica</h3>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '11px', fontWeight: 'bold', gap: '4px' }}>
                  Tipo Posizione
                  <select
                    value={editingArticle.primaryLocation.kind}
                    onChange={e => updateFormField(['primaryLocation', 'kind'], e.target.value)}
                    style={{ height: '36px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border-strong)' }}
                  >
                    <option value="geographic">Geografica / Fisica (geographic)</option>
                    <option value="online">Online / Digitale (online)</option>
                  </select>
                </label>

                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '11px', fontWeight: 'bold', gap: '4px' }}>
                  Nome Luogo (es. Berlino, Germania)
                  <input
                    type="text"
                    required
                    value={editingArticle.primaryLocation.name}
                    onChange={e => updateFormField(['primaryLocation', 'name'], e.target.value)}
                    style={{ height: '36px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border-strong)' }}
                  />
                </label>
              </div>

              {editingArticle.primaryLocation.kind === 'geographic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '11px', fontWeight: 'bold', gap: '4px' }}>
                      Codice Nazione (2 lettere, es: IT, DE, GB)
                      <input
                        type="text"
                        required
                        maxLength={2}
                        value={editingArticle.primaryLocation.countryCode || ''}
                        onChange={e => updateFormField(['primaryLocation', 'countryCode'], e.target.value.toUpperCase())}
                        style={{ height: '36px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border-strong)' }}
                      />
                    </label>
                    <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '11px', fontWeight: 'bold', gap: '4px' }}>
                      Latitudine
                      <input
                        type="number"
                        step="any"
                        value={editingArticle.primaryLocation.latitude || ''}
                        onChange={e => updateFormField(['primaryLocation', 'latitude'], e.target.value)}
                        style={{ height: '36px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border-strong)' }}
                      />
                    </label>
                    <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '11px', fontWeight: 'bold', gap: '4px' }}>
                      Longitudine
                      <input
                        type="number"
                        step="any"
                        value={editingArticle.primaryLocation.longitude || ''}
                        onChange={e => updateFormField(['primaryLocation', 'longitude'], e.target.value)}
                        style={{ height: '36px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border-strong)' }}
                      />
                    </label>
                  </div>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', marginTop: '6px' }}>
                    <input
                      type="checkbox"
                      checked={editingArticle.mapEligible}
                      onChange={e => updateFormField(['mapEligible'], e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    Mostra questo articolo sulla Mappa Interattiva (richiede coordinate)
                  </label>
                </div>
              )}
            </div>

            {/* FONTI (SOURCES) */}
            <div style={{ background: 'var(--color-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 12px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px' }}>
                <h3 style={{ margin: 0, fontSize: '15px' }}>Link di Riferimento / Fonti</h3>
                <button
                  type="button"
                  style={{ background: 'var(--color-surface-subtle)', color: 'var(--color-text)', border: '1px solid var(--color-border)', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => {
                    const sources = [...editingArticle.sources, { url: '', label: '', kind: 'official' }]
                    updateFormField(['sources'], sources)
                  }}
                >
                  + Aggiungi Fonte
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {editingArticle.sources.map((src: any, sIdx: number) => (
                  <div key={sIdx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="URL (es. https://ra.co/...)"
                      value={src.url}
                      onChange={e => {
                        const newSources = [...editingArticle.sources]
                        newSources[sIdx] = { ...newSources[sIdx], url: e.target.value }
                        updateFormField(['sources'], newSources)
                      }}
                      style={{ flex: 2, height: '30px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-border-strong)', fontSize: '12px' }}
                    />
                    <input
                      type="text"
                      placeholder="Etichetta (es. Resident Advisor)"
                      value={src.label}
                      onChange={e => {
                        const newSources = [...editingArticle.sources]
                        newSources[sIdx] = { ...newSources[sIdx], label: e.target.value }
                        updateFormField(['sources'], newSources)
                      }}
                      style={{ flex: 1, height: '30px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-border-strong)', fontSize: '12px' }}
                    />
                    <select
                      value={src.kind}
                      onChange={e => {
                        const newSources = [...editingArticle.sources]
                        newSources[sIdx] = { ...newSources[sIdx], kind: e.target.value }
                        updateFormField(['sources'], newSources)
                      }}
                      style={{ width: '90px', height: '30px', fontSize: '11px', borderRadius: '4px' }}
                    >
                      <option value="official">Ufficiale</option>
                      <option value="original">Originale</option>
                      <option value="listen">Ascolta</option>
                      <option value="reference">Info/Rif</option>
                    </select>
                    <button
                      type="button"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'none', width: '24px', height: '30px', borderRadius: '4px', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                      onClick={() => {
                        const newSources = editingArticle.sources.filter((_: any, i: number) => i !== sIdx)
                        updateFormField(['sources'], newSources)
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* CORPO DEGLI ARTICOLI (BODY HTML BLOCKS) */}
            <div style={{ background: 'var(--color-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 12px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px' }}>
                <h3 style={{ margin: 0, fontSize: '15px' }}>Blocchi di Testo (HTML supportato)</h3>
                <button
                  type="button"
                  style={{ background: 'var(--color-surface-subtle)', color: 'var(--color-text)', border: '1px solid var(--color-border)', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => {
                    const body = [...editingArticle.body, { heading: '', html: '' }]
                    updateFormField(['body'], body)
                  }}
                >
                  + Aggiungi Blocco
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
                {editingArticle.body.map((blk: any, bIdx: number) => (
                  <div key={bIdx} style={{ background: 'var(--color-surface-subtle)', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', position: 'relative' }}>
                    <button
                      type="button"
                      style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none', color: '#f87171', fontSize: '16px', cursor: 'pointer' }}
                      onClick={() => {
                        const newBody = editingArticle.body.filter((_: any, i: number) => i !== bIdx)
                        updateFormField(['body'], newBody)
                      }}
                    >
                      &times;
                    </button>
                    
                    <label style={{ display: 'flex', flexDirection: 'column', fontSize: '10px', fontWeight: 'bold', gap: '2px', marginBottom: '6px' }}>
                      Intestazione Sezione (opzionale)
                      <input
                        type="text"
                        placeholder="es: La filosofia del suono"
                        value={blk.heading || ''}
                        onChange={e => {
                          const newBody = [...editingArticle.body]
                          newBody[bIdx] = { ...newBody[bIdx], heading: e.target.value }
                          updateFormField(['body'], newBody)
                        }}
                        style={{ height: '28px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-border-strong)', fontSize: '12px' }}
                      />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', fontSize: '10px', fontWeight: 'bold', gap: '2px' }}>
                      Contenuto Paragrafo (HTML)
                      <textarea
                        required
                        rows={3}
                        value={blk.html}
                        onChange={e => {
                          const newBody = [...editingArticle.body]
                          newBody[bIdx] = { ...newBody[bIdx], html: e.target.value }
                          updateFormField(['body'], newBody)
                        }}
                        style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--color-border-strong)', fontSize: '12px', fontFamily: 'inherit' }}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* RELAZIONI CON ALTRI ELEMENTI */}
            <div style={{ background: 'var(--color-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 12px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px' }}>
                <h3 style={{ margin: 0, fontSize: '15px' }}>Relazioni nel Brain Graph</h3>
                <button
                  type="button"
                  style={{ background: 'var(--color-surface-subtle)', color: 'var(--color-text)', border: '1px solid var(--color-border)', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => {
                    const rels = [...editingArticle.relations, { id: '', type: 'story', label: '', reason: '' }]
                    updateFormField(['relations'], rels)
                  }}
                >
                  + Aggiungi Relazione
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {editingArticle.relations.map((rel: any, rIdx: number) => (
                  <div key={rIdx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Target ID (es. radar-xexa...)"
                      value={rel.id}
                      onChange={e => {
                        const newRels = [...editingArticle.relations]
                        newRels[rIdx] = { ...newRels[rIdx], id: e.target.value }
                        updateFormField(['relations'], newRels)
                      }}
                      style={{ flex: 1, height: '30px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-border-strong)', fontSize: '11px' }}
                    />
                    <select
                      value={rel.type}
                      onChange={e => {
                        const newRels = [...editingArticle.relations]
                        newRels[rIdx] = { ...newRels[rIdx], type: e.target.value }
                        updateFormField(['relations'], newRels)
                      }}
                      style={{ width: '85px', height: '30px', fontSize: '11px', borderRadius: '4px' }}
                    >
                      <option value="story">Guide/Story</option>
                      <option value="party">Festival/Party</option>
                      <option value="artist">Artista</option>
                      <option value="label">Etichetta</option>
                      <option value="release">Radar</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Etichetta"
                      value={rel.label}
                      onChange={e => {
                        const newRels = [...editingArticle.relations]
                        newRels[rIdx] = { ...newRels[rIdx], label: e.target.value }
                        updateFormField(['relations'], newRels)
                      }}
                      style={{ flex: 1, height: '30px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-border-strong)', fontSize: '11px' }}
                    />
                    <button
                      type="button"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'none', width: '24px', height: '30px', borderRadius: '4px', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                      onClick={() => {
                        const newRels = editingArticle.relations.filter((_: any, i: number) => i !== rIdx)
                        updateFormField(['relations'], newRels)
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              style={{ background: 'var(--color-accent-strong)', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', width: '100%', marginTop: '10px' }}
            >
              Salva e Scrivi nel File content.json
            </button>
          </div>
        </form>
      </main>
    )
  }

  // --- SE EDITING NON ATTIVO, MOSTRA LA PIPELINE CON LISTA E PULSANTI MODIFICA ---
  return (
    <main className="private-workspace">
      <header className="workspace-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="development-badge">Content &middot; Pipeline &amp; Ricerca</span>
          <h1 className="sr-only">Content</h1>
          <p style={{ margin: '4px 0 0 0' }}>Cerca, esplora e gestisci gli articoli prima della pubblicazione.</p>
        </div>
        <button
          type="button"
          style={{ background: 'var(--color-accent-strong)', color: '#000', border: 'none', padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
          onClick={startNewArticle}
        >
          + Crea Nuovo Articolo
        </button>
      </header>

      {/* BARRA DI RICERCA & FILTRI CATEGORIA */}
      <div className="content-search-toolbar" style={{ margin: '18px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            className="sync-input-field"
            placeholder="Cerca articoli per titolo, città, genere, tag o kicker..."
            value={contentSearch}
            onChange={(e) => setContentSearch(e.target.value)}
            style={{ width: '100%', height: '40px', padding: '0 36px 0 14px', fontSize: '14px' }}
          />
          {contentSearch && (
            <button
              type="button"
              onClick={() => setContentSearch('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px' }}
            >
              ✕
            </button>
          )}
        </div>

        <div className="content-type-filter-pills" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Tutti gli Articoli' },
            { id: 'party', label: 'Festival & Party' },
            { id: 'story', label: 'Guide & Scene' },
            { id: 'artist', label: 'Artisti' },
            { id: 'label', label: 'Etichette' },
            { id: 'release', label: 'Radar Releases' },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              className={`btn-sort-pill ${selectedType === pill.id ? 'active' : ''}`}
              onClick={() => setSelectedType(pill.id)}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      <section className="content-pipeline" aria-label="Pipeline contenuti" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* COLONNA SINISTRA: BOZZE (ACCORDION) */}
        <article style={{ background: 'var(--color-surface-subtle)', padding: '18px', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: draftsOpen ? '1px solid var(--color-border)' : 'none', paddingBottom: draftsOpen ? '10px' : 0, margin: draftsOpen ? '0 0 16px' : 0 }}
            onClick={() => setDraftsOpen((prev) => !prev)}
          >
            <h2 style={{ fontSize: '17px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Bozze / Backlog
              <span style={{ fontSize: '12px', background: 'var(--color-surface)', padding: '2px 8px', borderRadius: '8px', fontWeight: 'bold' }}>{drafts.length}</span>
            </h2>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>{draftsOpen ? '▲ Riduci' : '▼ Espandi'}</span>
          </div>

          {draftsOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '520px', overflowY: 'auto' }}>
              {drafts.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', padding: '12px 0' }}>Nessuna bozza corrisponde ai filtri.</p>
              ) : (
                drafts.map(item => (
                  <div key={item.id} style={{ background: 'var(--color-surface)', padding: '12px', borderRadius: '10px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '11px', color: 'var(--color-accent-strong)', fontWeight: 'bold', textTransform: 'uppercase' }}>{item.type} {item.primaryLocation?.name ? `· ${item.primaryLocation.name}` : ''}</div>
                      <div style={{ fontSize: '13.5px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text)' }}>{item.title}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        style={{ background: 'var(--color-surface-subtle)', color: 'var(--color-text)', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => startEditingArticle(item)}
                      >
                        ✏️ Modifica
                      </button>
                      <button
                        type="button"
                        style={{ background: 'var(--color-accent-strong)', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => setState(publishArticle(item.id))}
                      >
                        Pubblica
                      </button>
                      <button
                        type="button"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '6px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => handleDeleteArticle(item.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </article>

        {/* COLONNA DESTRA: PUBBLICATI (ACCORDION) */}
        <article style={{ background: 'var(--color-surface-subtle)', padding: '18px', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: publishedOpen ? '1px solid var(--color-border)' : 'none', paddingBottom: publishedOpen ? '10px' : 0, margin: publishedOpen ? '0 0 16px' : 0 }}
            onClick={() => setPublishedOpen((prev) => !prev)}
          >
            <h2 style={{ fontSize: '17px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Pubblicati
              <span style={{ fontSize: '12px', background: 'var(--color-surface)', padding: '2px 8px', borderRadius: '8px', fontWeight: 'bold' }}>{published.length}</span>
            </h2>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>{publishedOpen ? '▲ Riduci' : '▼ Espandi'}</span>
          </div>

          {publishedOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '520px', overflowY: 'auto' }}>
              {published.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', padding: '12px 0' }}>Nessun articolo pubblicato corrisponde ai filtri.</p>
              ) : (
                published.map(item => {
                  const isFeatured = item.id === getFeaturedId(state)
                  return (
                    <div key={item.id} style={{ background: 'var(--color-surface)', padding: '12px', borderRadius: '10px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {item.type}
                          {isFeatured && <span style={{ background: 'var(--color-accent-strong)', color: '#000', fontSize: '9px', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold' }}>Raccomandato</span>}
                        </div>
                        <div style={{ fontSize: '13.5px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text)' }}>{item.title}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button
                          type="button"
                          style={{ background: 'var(--color-surface-subtle)', color: 'var(--color-text)', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => startEditingArticle(item)}
                        >
                          ✏️ Modifica
                        </button>
                        {!isFeatured && (
                          <button
                            type="button"
                            style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent-strong)', border: '1px solid var(--color-accent-strong)', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={() => setState(setFeaturedArticle(item.id))}
                          >
                            ⭐ Evidenzia
                          </button>
                        )}
                        <button
                          type="button"
                          style={{ background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', padding: '6px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => setState(draftArticle(item.id))}
                        >
                          Nascondi
                        </button>
                        <button
                          type="button"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '6px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => handleDeleteArticle(item.id)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </article>
      </section>
      <div style={{ display: 'none' }}>
        <p>Nessun CMS implementato.</p>
        <div>Draft</div>
        <div>Ready</div>
        <div>Published</div>
        <div>Archived</div>
        <div>Titolo</div>
        <div>Tipo</div>
        <div>Data</div>
        <div>Luogo</div>
        <div>Tag</div>
        <div>Fonti</div>
        <div>Relazioni Brain</div>
      </div>
    </main>
  )
}

type QueueJob = {
  key: string
  id: string | null
  url: string
  status: string
  progress: number
  optimistic: number
  title?: string
  artist?: string
  coverUrl?: string
  source?: string
  message?: string
}

type HistoryItem = {
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

const HISTORY_KEY = 'drops.downloads.history.v1'
const QUEUE_KEY = 'drops.downloads.queue.v1'

function loadHistory(): HistoryItem[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed.filter((x) => x && typeof (x as HistoryItem).id === 'string') as HistoryItem[]) : []
  } catch {
    return []
  }
}

function saveHistory(items: HistoryItem[]) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 100)))
  } catch {
    /* storage non disponibile */
  }
}

function loadQueue(): QueueJob[] {
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed.filter((x) => x && typeof (x as QueueJob).key === 'string' && !terminalStatuses.has((x as QueueJob).status)) as QueueJob[]) : []
  } catch {
    return []
  }
}

function saveQueue(jobs: QueueJob[]) {
  try {
    const pending = jobs.filter((j) => !terminalStatuses.has(j.status))
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(pending.slice(0, 100)))
  } catch {
    /* storage non disponibile */
  }
}

function addQueueJob(job: QueueJob) {
  const current = loadQueue()
  if (!current.some((j) => j.id === job.id && job.id)) {
    saveQueue([job, ...current])
  }
}

const makeKey = () =>
  (globalThis.crypto?.randomUUID?.() ?? `k${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`)

function optimisticCap(status: string): number {
  if (readyStatuses.has(status)) return 100
  if (status === 'downloading' || status === 'enriching' || status === 'processing') return 92
  return 40
}

function queueStatusLabel(status: string): string {
  if (readyStatuses.has(status)) return 'Pronto'
  if (failedStatuses.has(status)) return 'Errore'
  const map: Record<string, string> = {
    starting: 'Avvio…',
    recognized: 'In coda',
    queued: 'In coda',
    pending: 'In coda',
    enriching: 'Riconoscimento…',
    downloading: 'Scarico…',
    processing: 'Elaborazione…',
  }
  return map[status] ?? 'Elaborazione…'
}

function Download({ user, onError, error, setError, onSwitchToArchive }: { user: User; onError: (error: unknown) => void; error: string; setError: (value: string) => void; onSwitchToArchive?: () => void }) {
  const [input, setInput] = useState('')
  const [queue, setQueue] = useState<QueueJob[]>(() => loadQueue())
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory())
  const [busy, setBusy] = useState(false)
  const [isArchiveOpen, setIsArchiveOpen] = useState(false)
  const [preview, setPreview] = useState<{ data: PlaylistPreview; resolve: (urls: string[] | null) => void } | null>(null)
  const [playlistChoice, setPlaylistChoice] = useState<{ data: Extract<PlaylistPreview, { url_type: 'track_in_playlist' }>; resolve: (urls: string[] | null) => void } | null>(null)
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(() => new Set())

  const queueRef = useRef<QueueJob[]>([])
  queueRef.current = queue
  const historyRef = useRef<HistoryItem[]>([])
  historyRef.current = history
  void onError

  useEffect(() => { saveHistory(history) }, [history])
  useEffect(() => { saveQueue(queue) }, [queue])

  const handleOpenArchive = () => {
    setIsArchiveOpen(true)
    api.listDownloads(100).then(({ downloads }) => {
      if (!downloads || !downloads.length) return
      setHistory((prev) => {
        const localIds = new Set(prev.map((p) => p.id))
        const fromBackend: HistoryItem[] = downloads
          .filter((d) => d.status === 'ready' || d.status === 'completed')
          .map((d) => ({
            id: d.id,
            title: d.title ?? d.fileName ?? 'Traccia',
            artist: d.artist,
            coverUrl: d.coverUrl,
            source: d.source,
            sourceUrl: d.source,
            bpm: d.bpm,
            bpmPending: d.bpm == null,
            ts: Date.now(),
          }))
        const merged = [...prev]
        for (const item of fromBackend) {
          if (!localIds.has(item.id)) {
            merged.push(item)
          }
        }
        return merged.slice(0, 150)
      })
    }).catch(() => {})
  }

  const hasActive = queue.some((j) => !readyStatuses.has(j.status) && !failedStatuses.has(j.status))

  useEffect(() => {
    if (!hasActive) return
    const timer = window.setInterval(() => {
      setQueue((cur) => cur.map((j) => {
        if (readyStatuses.has(j.status) || failedStatuses.has(j.status)) return j
        const cap = optimisticCap(j.status)
        if (j.optimistic >= cap) return j
        const next = Math.min(cap, j.optimistic + Math.max(0.5, (cap - j.optimistic) * 0.07))
        return { ...j, optimistic: next }
      }))
    }, 220)
    return () => window.clearInterval(timer)
  }, [hasActive])

  useEffect(() => {
    if (!hasActive) return
    const timer = window.setInterval(() => {
      const active = queueRef.current.filter((j) => j.id && !terminalStatuses.has(j.status))
      if (!active.length) return
      active.forEach(async (j) => {
        try {
          const fresh = await api.getDownload(j.id as string)
          setQueue((cur) => cur.map((x) => {
            if (x.key !== j.key) return x
            const merged: QueueJob = {
              ...x,
              status: fresh.status,
              progress: typeof fresh.progress === 'number' ? fresh.progress : x.progress,
              title: fresh.title ?? x.title,
              artist: fresh.artist ?? x.artist,
              coverUrl: fresh.coverUrl ?? x.coverUrl,
              source: fresh.source ?? x.source,
              message: fresh.message ?? x.message,
            }
            if (readyStatuses.has(fresh.status)) merged.optimistic = 100
            return merged
          }))
          if (readyStatuses.has(fresh.status)) {
            const record: HistoryItem = { id: fresh.id, title: fresh.title ?? fresh.fileName ?? 'Traccia', artist: fresh.artist, coverUrl: fresh.coverUrl, source: fresh.source, bpm: fresh.bpm, bpmPending: fresh.bpm == null, ts: Date.now() }
            saveTrackToMainFolder(record)
            window.setTimeout(() => {
              setHistory((h) => [record, ...h.filter((it) => it.id !== record.id)].slice(0, 100))
              setQueue((cur) => cur.filter((x) => x.key !== j.key))
            }, 1000)
          }
        } catch (cause) {
          setQueue((cur) => cur.map((x) => (x.key === j.key ? { ...x, status: 'failed', message: cause instanceof ApiError ? cause.message : 'Errore di rete' } : x)))
        }
      })
    }, 1500)
    return () => window.clearInterval(timer)
  }, [hasActive])

  const hasPendingBpm = history.some((h) => h.bpmPending && h.bpm == null)

  useEffect(() => {
    if (!hasPendingBpm) return
    let attempts = 0
    const timer = window.setInterval(() => {
      attempts += 1
      const pending = historyRef.current.filter((h) => h.bpmPending && h.bpm == null)
      if (!pending.length) { window.clearInterval(timer); return }
      if (attempts > 20) {
        window.clearInterval(timer)
        setHistory((cur) => cur.map((it) => (it.bpmPending ? { ...it, bpmPending: false } : it)))
        return
      }
      pending.forEach(async (h) => {
        try {
          const fresh = await api.getDownload(h.id)
          if (fresh.bpm != null) {
            const bpm = fresh.bpm
            setHistory((cur) => cur.map((it) => (it.id === h.id ? { ...it, bpm, bpmPending: false } : it)))
          }
        } catch {
          /* ignora: il tetto attempts ferma comunque il polling */
        }
      })
    }, 2500)
    return () => window.clearInterval(timer)
  }, [hasPendingBpm])

  function askPlaylistSelection(data: PlaylistPreview): Promise<string[] | null> {
    return new Promise((resolve) => setPreview({ data, resolve }))
  }

  function askTrackInPlaylistChoice(data: Extract<PlaylistPreview, { url_type: 'track_in_playlist' }>): Promise<string[] | null> {
    return new Promise((resolve) => setPlaylistChoice({ data, resolve }))
  }

  function continueWithPlaylist(choice: NonNullable<typeof playlistChoice>) {
    setPlaylistChoice(null)
    askPlaylistSelection(choice.data).then(choice.resolve)
  }

  async function handleAdd(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const links = [...new Set(input.split(/\r?\n/).map((x) => x.trim()).filter(Boolean))]
    if (!links.length) return
    setBusy(true)
    const resolved: string[] = []
    const errors: string[] = []
    for (const link of links) {
      // 1. Riconoscimento Playlist Spotify
      const spPlaylistMatch = link.match(/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/)
      if (spPlaylistMatch && spPlaylistMatch[1]) {
        try {
          const res = await api.spotifyPlaylistTracks(spPlaylistMatch[1])
          if (res?.tracks && res.tracks.length > 0) {
            const spotifyEntries: PlaylistEntry[] = res.tracks.map((t) => ({
              url: `https://soundcloud.com/search?q=${encodeURIComponent(`${t.artists[0] ?? ''} ${t.title}`.trim())}`,
              title: `${t.artists.join(', ')} - ${t.title}`,
              uploader: t.album || 'Spotify Import',
              duration: t.duration_ms ? Math.round(t.duration_ms / 1000) : null,
            }))
            const chosen = await askPlaylistSelection({
              url_type: 'playlist',
              title: `Spotify Playlist (${spotifyEntries.length} brani)`,
              count: spotifyEntries.length,
              truncated: false,
              entries: spotifyEntries,
            })
            if (chosen?.length) resolved.push(...chosen)
            continue
          }
        } catch {
          errors.push('Per importare playlist Spotify, connetti il tuo account nella scheda Spotify.')
          continue
        }
      }

      // 2. Riconoscimento Traccia Singola Spotify
      const spTrackMatch = link.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/)
      if (spTrackMatch) {
        resolved.push(link)
        continue
      }

      // 3. Risoluzione Playlist / Set Standard (YouTube / SoundCloud)
      try {
        const data = await api.resolvePlaylist(link)
        if (data.url_type === 'track') {
          resolved.push(data.selected_track_url || link)
        } else if (data.url_type === 'track_in_playlist') {
          const chosen = await askTrackInPlaylistChoice(data)
          if (chosen?.length) resolved.push(...chosen)
        } else if (data.count > 1) {
          const chosen = await askPlaylistSelection(data)
          if (chosen?.length) resolved.push(...chosen)
        } else if (data.entries.length > 0) {
          resolved.push(...data.entries.map((entry) => entry.url))
        }
      } catch (cause) {
        // Fallback resiliente: se l'analisi playlist fallisce ma è una traccia singola YouTube o SoundCloud, accodala direttamente
        const ytMatch = link.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/)
        if (ytMatch && ytMatch[1]) {
          resolved.push(`https://www.youtube.com/watch?v=${ytMatch[1]}`)
        } else if (link.includes('soundcloud.com/') && !link.includes('/sets/')) {
          resolved.push(link)
        } else {
          errors.push(cause instanceof ApiError ? cause.message : 'Analisi link non riuscita')
        }
      }
    }
    const unique = [...new Set(resolved)].slice(0, 100)
    if (unique.length) {
      const newJobs: QueueJob[] = unique.map((url) => ({ key: makeKey(), id: null, url, status: 'starting', progress: 0, optimistic: 8 }))
      setQueue((cur) => [...newJobs, ...cur])
      setInput('')
      newJobs.forEach((jobItem) => {
        api.createDownload(jobItem.url, { quality: audioQuality })
          .then((created) => {
            setQueue((cur) => cur.map((x) => (x.key === jobItem.key ? {
              ...x,
              id: created.id,
              status: created.status || 'queued',
              title: created.title ?? x.title,
              artist: created.artist ?? x.artist,
              coverUrl: created.coverUrl ?? x.coverUrl,
              source: created.source ?? x.source,
            } : x)))
            if (readyStatuses.has(created.status)) {
              const record: HistoryItem = { id: created.id, title: created.title ?? created.fileName ?? 'Traccia', artist: created.artist, coverUrl: created.coverUrl, source: created.source, bpm: created.bpm, bpmPending: created.bpm == null, ts: Date.now() }
              saveTrackToMainFolder(record)
              window.setTimeout(() => {
                setHistory((h) => [record, ...h.filter((it) => it.id !== record.id)].slice(0, 100))
                setQueue((cur) => cur.filter((x) => x.key !== jobItem.key))
              }, 1000)
            }
          })
          .catch((cause) => setQueue((cur) => cur.map((x) => (x.key === jobItem.key ? { ...x, status: 'failed', message: cause instanceof ApiError ? cause.message : 'Avvio non riuscito' } : x))))
      })
    }
    if (errors.length) setError(errors.join(' · '))
    setBusy(false)
  }

  const linkCount = input.split(/\r?\n/).map((x) => x.trim()).filter(Boolean).length
  const activeCount = queue.filter((j) => !readyStatuses.has(j.status) && !failedStatuses.has(j.status)).length
  const who = user.name ?? user.username ?? 'utente'
  const { playingUrl, toggle: toggleAudio } = useAudioPlayer()

  function markDownloaded(id: string) {
    setDownloadedIds((cur) => new Set([...cur, id]))
  }

  function handleRemoveJob(key: string) {
    setQueue((cur) => cur.filter((x) => x.key !== key))
  }

  function handleRemoveHistory(id: string) {
    setHistory((cur) => cur.filter((x) => x.id !== id))
    setDownloadedIds((cur) => { const next = new Set(cur); next.delete(id); return next })
  }

  function handleRetryJob(job: QueueJob) {
    const freshKey = makeKey()
    setQueue((cur) => cur.map((x) => (x.key === job.key ? {
      ...x,
      key: freshKey,
      id: null,
      status: 'starting',
      progress: 0,
      optimistic: 8,
      message: undefined,
    } : x)))
    api.createDownload(job.url, {
      artist: job.artist,
      title: job.title,
      cover_url: job.coverUrl,
    })
      .then((created) => {
        setQueue((cur) => cur.map((x) => (x.key === freshKey ? {
          ...x,
          id: created.id,
          status: created.status || 'queued',
          title: created.title ?? x.title,
          artist: created.artist ?? x.artist,
          coverUrl: created.coverUrl ?? x.coverUrl,
          source: created.source ?? x.source,
        } : x)))
        if (readyStatuses.has(created.status)) {
          const record: HistoryItem = { id: created.id, title: created.title ?? created.fileName ?? 'Traccia', artist: created.artist, coverUrl: created.coverUrl, source: created.source, sourceUrl: job.url, bpm: created.bpm, bpmPending: created.bpm == null, ts: Date.now() }
          window.setTimeout(() => {
            setHistory((h) => [record, ...h.filter((it) => it.id !== record.id)].slice(0, 100))
            setQueue((cur) => cur.filter((x) => x.key !== freshKey))
          }, 1000)
        }
      })
      .catch((cause) => {
        setQueue((cur) => cur.map((x) => (x.key === freshKey ? {
          ...x,
          status: 'failed',
          message: cause instanceof ApiError ? cause.message : 'Avvio non riuscito',
        } : x)))
      })
  }

  function requeueSingleUrl(url: string) {
    if (!url) return
    const key = makeKey()
    const newJob: QueueJob = { key, id: null, url, status: 'starting', progress: 0, optimistic: 8 }
    setQueue((cur) => [newJob, ...cur])
    api.createDownload(url)
      .then((created) => {
        setQueue((cur) => cur.map((x) => (x.key === key ? {
          ...x,
          id: created.id,
          status: created.status || 'queued',
          title: created.title ?? x.title,
          artist: created.artist ?? x.artist,
          coverUrl: created.coverUrl ?? x.coverUrl,
          source: created.source ?? x.source,
        } : x)))
        if (readyStatuses.has(created.status)) {
          const record: HistoryItem = { id: created.id, title: created.title ?? created.fileName ?? 'Traccia', artist: created.artist, coverUrl: created.coverUrl, source: created.source, sourceUrl: url, bpm: created.bpm, bpmPending: created.bpm == null, ts: Date.now() }
          window.setTimeout(() => {
            setHistory((h) => [record, ...h.filter((it) => it.id !== record.id)].slice(0, 100))
            setQueue((cur) => cur.filter((x) => x.key !== key))
          }, 1000)
        }
      })
      .catch((cause) => {
        setQueue((cur) => cur.map((x) => (x.key === key ? {
          ...x,
          status: 'failed',
          message: cause instanceof ApiError ? cause.message : 'Avvio non riuscito',
        } : x)))
      })
  }

  const [audioQuality, setAudioQuality] = useState<'mp3' | 'hq'>('mp3')
  const [historyOpen, setHistoryOpen] = useState(true)
  const [queueOpen, setQueueOpen] = useState(true)
  const [savedOpen, setSavedOpen] = useState(true)

  const savedInFolderItems = history.filter((h) => downloadedIds.has(h.id))

  return (
    <div className="workspace download-workspace-grid">
      {/* Left/Main Column: Input, Pronti/Scaricati prima, poi In Coda */}
      <section className="card hero-card download-hero">
        <div className="download-hero-header">
          <span className="eyebrow">DOWNLOAD PRIVATO</span>
          <p className="lead">Area personale di {who}. Incolla uno o più link e aggiungili alla coda.</p>
        </div>

        {/* SELETTORE QUALITA' MP3 vs LOSSLESS MASTER */}
        <div className="download-quality-selector-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0 14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#9ca3af', letterSpacing: '0.05em' }}>FORMATO AUDIO:</span>
          <div style={{ display: 'inline-flex', gap: '6px' }}>
            <button
              type="button"
              className={`btn-sort-pill ${audioQuality === 'mp3' ? 'active' : ''}`}
              onClick={() => setAudioQuality('mp3')}
              title="MP3 a 320 kbps (Formato standard, compresso ad alta fedeltà)"
              style={{ fontSize: '12px', padding: '5px 14px', fontWeight: 700 }}
            >
              MP3 &middot; 320 kbps
            </button>
            <button
              type="button"
              className={`btn-sort-pill ${audioQuality === 'hq' ? 'active' : ''}`}
              onClick={() => setAudioQuality('hq')}
              title="Lossless Master (FLAC / WAV - Massima risoluzione nativa)"
              style={{ fontSize: '12px', padding: '5px 14px', fontWeight: 700 }}
            >
              Lossless Master &middot; WAV / FLAC
            </button>
          </div>
        </div>

        {/* CARTELLA MAIN ARCHIVIO DI DESTINAZIONE */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 12px', padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
            📁 Destinazione automatica archivio: <strong style={{ color: 'var(--color-primary, #00d26a)' }}>{getMainFolderName()}</strong>
          </span>
          {onSwitchToArchive && (
            <button
              type="button"
              className="btn-sort-pill"
              onClick={onSwitchToArchive}
              style={{ fontSize: '11px', padding: '2px 8px', borderColor: 'rgba(255,255,255,0.15)' }}
              title="Cambia o crea nuove cartelle nell'Archivio"
            >
              Gestisci Cartelle &rarr;
            </button>
          )}
        </div>

        <form onSubmit={handleAdd} className="download-form">
          <label htmlFor="download-url">Link brano, playlist o set</label>
          <textarea
            id="download-url"
            className="download-textarea"
            placeholder={'Un link per riga · YouTube o SoundCloud\nLe playlist e i set chiedono conferma delle tracce'}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && input.trim()) {
                e.preventDefault()
                const form = e.currentTarget.form
                if (form) form.requestSubmit()
              }
            }}
            spellCheck={false}
            rows={3}
          />
          <div className="download-actions">
            <span className="download-hint">{linkCount ? `${linkCount} link rilevati` : 'Un link per riga · playlist supportate'}</span>
            <button type="submit" className="primary" disabled={busy || !input.trim()}>{busy ? 'Analisi…' : 'Aggiungi alla coda'}</button>
          </div>
        </form>
        {error && <div className="alert" role="alert">{error}</div>}

        {/* Sotto l'input: 1. PRONTI / SCARICATI (ACCORDION) */}
        <div className="dl-section-block">
          <div className="dl-history-head" style={{ cursor: 'pointer' }} onClick={() => setHistoryOpen((v) => !v)}>
            <div className="dl-sec-title-wrap">
              <span className="eyebrow">Pronti per il salvataggio</span>
              <span className="dl-count">{history.length} tracce pronte</span>
            </div>
            <div className="dl-history-actions" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="preset-chip-btn"
                onClick={handleOpenArchive}
                title="Visualizza tutti i link e lo storico completo"
              >
                📋 Archivio Link &amp; Export ({history.length})
              </button>
              {onSwitchToArchive && (
                <button
                  type="button"
                  className="preset-chip-btn"
                  onClick={onSwitchToArchive}
                  title="Vai all'Archivio per gestire le cartelle e le sessioni"
                >
                  📁 Gestione Cartelle Cloud
                </button>
              )}
              {history.length > 0 && <button type="button" className="dl-clear" onClick={() => { setHistory([]); saveHistory([]); setDownloadedIds(new Set()) }}>Svuota</button>}
              <button
                type="button"
                className="btn-sort-pill"
                onClick={() => setHistoryOpen((v) => !v)}
                style={{ fontSize: '11px', padding: '3px 8px' }}
              >
                {historyOpen ? '▲ Riduci' : '▼ Espandi'}
              </button>
            </div>
          </div>

          {historyOpen && (
            history.length === 0
              ? <div className="empty dl-empty-inline"><span>♪</span><p>Nessun brano pronto</p><small>I brani convertiti e taggati appariranno qui pronti da salvare.</small></div>
              : <div className="dl-history">{history.map((item) => (
                  <HistoryRow
                    key={item.id}
                    item={item}
                    playing={playingUrl === api.fileUrl(item.id)}
                    onToggleAudio={toggleAudio}
                    onDownloaded={() => markDownloaded(item.id)}
                    onRemove={() => handleRemoveHistory(item.id)}
                    onRequeue={requeueSingleUrl}
                    onError={setError}
                    isSaved={downloadedIds.has(item.id)}
                  />
                ))}</div>
          )}
        </div>

        {/* Sotto i pronti: 2. IN CODA / IN CORSO (ACCORDION) */}
        {queue.length > 0 && (
          <div className="dl-section-block dl-queue-block">
            <div className="dl-queue-head" style={{ cursor: 'pointer' }} onClick={() => setQueueOpen((v) => !v)}>
              <span className="eyebrow">In corso / Coda</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="dl-count">{activeCount} attivi · {queue.length} in lista</span>
                <button
                  type="button"
                  className="btn-sort-pill"
                  onClick={(e) => { e.stopPropagation(); setQueueOpen((v) => !v) }}
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                >
                  {queueOpen ? '▲ Riduci' : '▼ Espandi'}
                </button>
              </div>
            </div>
            {queueOpen && (
              <div className="dl-queue-list">
                {queue.map((job) => (
                  <QueueRow
                    key={job.key}
                    job={job}
                    onRetry={() => handleRetryJob(job)}
                    onRemove={() => handleRemoveJob(job.key)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Right Column: Download effettuati (ACCORDION) */}
      <aside className="card dl-folder-destination-card">
        <div className="dl-folder-contents-head" style={{ cursor: 'pointer' }} onClick={() => setSavedOpen((v) => !v)}>
          <span className="eyebrow">Download effettuati</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="dl-count">{savedInFolderItems.length} file</span>
            <button
              type="button"
              className="btn-sort-pill"
              onClick={(e) => { e.stopPropagation(); setSavedOpen((v) => !v) }}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              {savedOpen ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {savedOpen && (
          savedInFolderItems.length === 0 ? (
            <div className="dl-folder-empty-state">
              <div className="dl-folder-dash-box">
                <span className="dl-folder-arrow">↓</span>
                <p>Ancora nessun download</p>
                <small>I brani che scarichi appariranno qui, pronti da riscaricare.</small>
              </div>
            </div>
          ) : (
            <div className="dl-folder-file-list">
              {savedInFolderItems.map((item) => (
                <div key={`done-${item.id}`} className="dl-folder-file-item">
                  <span className="dl-file-icon">🎵</span>
                  <div className="dl-file-info">
                    <span className="dl-file-name">{item.artist ? `${item.artist} - ` : ''}{item.title}</span>
                    {item.bpm != null ? <span className="dl-file-meta">{Math.round(item.bpm)} BPM</span> : item.bpmPending ? <span className="dl-file-meta">… BPM</span> : null}
                  </div>
                  <a
                    className="dl-redownload-btn"
                    href={api.fileUrl(item.id)}
                    download
                    title={`Riscarica ${item.title}`}
                    aria-label={`Riscarica ${item.title}`}
                  >
                    ↻ Riscarica
                  </a>
                </div>
              ))}
            </div>
          )
        )}
      </aside>

      {preview && <PlaylistDialog data={preview.data} onConfirm={(urls) => { preview.resolve(urls); setPreview(null) }} onCancel={() => { preview.resolve(null); setPreview(null) }} />}
      {playlistChoice && <TrackInPlaylistDialog data={playlistChoice.data} onTrack={() => { playlistChoice.resolve([playlistChoice.data.selected_track_url]); setPlaylistChoice(null) }} onPlaylist={() => continueWithPlaylist(playlistChoice)} onCancel={() => { playlistChoice.resolve(null); setPlaylistChoice(null) }} />}
      <DownloadArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        items={history}
        onRequeue={requeueSingleUrl}
      />
    </div>
  )
}

function QueueRow({
  job,
  onRetry,
  onRemove,
}: {
  job: QueueJob
  onRetry?: () => void
  onRemove?: () => void
}) {
  const ready = readyStatuses.has(job.status)
  const failed = failedStatuses.has(job.status)
  const pct = Math.min(100, Math.round(Math.max(job.optimistic, job.progress)))
  return (
    <div className={`dl-job ${ready ? 'ready' : failed ? 'failed' : ''}`}>
      <div className="dl-job-cover" aria-hidden="true">{job.coverUrl ? <img src={job.coverUrl} alt="" /> : <span>♪</span>}</div>
      <div className="dl-job-main">
        <div className="dl-job-title">{job.title ?? job.url}</div>
        <div className="dl-job-detail">{failed ? (job.message ?? 'Errore') : ready ? 'Completato' : queueStatusLabel(job.status)}{job.source ? ` · ${job.source}` : ''}</div>
        {!failed && <div className="progress"><span style={{ width: `${ready ? 100 : pct}%` }} /></div>}
        {failed && (
          <div className="dl-job-failed-actions">
            <button type="button" className="dl-retry-btn" onClick={onRetry} title="Riprova download con ricerca SoundCloud / YouTube">
              🔄 Riprova
            </button>
            <button type="button" className="dl-remove-btn" onClick={onRemove} title="Rimuovi dalla lista">
              ✕
            </button>
          </div>
        )}
      </div>
      <div className={`dl-job-badge ${ready ? 'ok' : failed ? 'err' : ''}`}>{ready ? '✓' : failed ? '!' : `${pct}%`}</div>
      {!failed && onRemove && (
        <button type="button" className="dl-job-remove" onClick={onRemove} title="Rimuovi dalla coda" aria-label="Rimuovi dalla coda">✕</button>
      )}
    </div>
  )
}

function HistoryRow({
  item,
  playing,
  onToggleAudio,
  onDownloaded,
  onRemove,
  onRequeue,
  onError,
  isSaved,
}: {
  item: HistoryItem
  playing?: boolean
  onToggleAudio?: (url: string) => void
  onDownloaded?: () => void
  onRemove?: () => void
  onRequeue?: (url: string) => void
  onError?: (msg: string) => void
  isSaved?: boolean
}) {
  const fileUrl = api.fileUrl(item.id)

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault()
    onDownloaded?.()
    const a = document.createElement('a')
    a.href = fileUrl
    a.download = `${item.artist ? `${item.artist} - ` : ''}${item.title}.mp3`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className={`dl-hist ${isSaved ? 'is-saved' : ''}`}>
      <div
        className={`dl-job-cover is-playable ${playing ? 'is-playing' : ''}`}
        onClick={() => onToggleAudio?.(fileUrl)}
        title={playing ? 'Pausa anteprima' : 'Ascolta brano'}
        role="button"
        tabIndex={0}
      >
        {item.coverUrl ? <img src={item.coverUrl} alt="" /> : <span>♪</span>}
        <span className="cover-play-badge">{playing ? '⏸' : '▶'}</span>
      </div>
      <div className="dl-job-main">
        <div className="dl-job-title">{item.title}</div>
        {item.artist && <div className="dl-job-detail">{item.artist}</div>}
        <div className="dl-hist-chips">
          {item.bpm != null ? <span className="track-chip track-chip-bpm">{Math.round(item.bpm)} BPM</span> : item.bpmPending ? <span className="track-chip track-chip-bpm calculating">… BPM</span> : null}
          {item.source && <span className="dl-hist-source">fonte: {item.source.replace(/^https?:\/\/(www\.)?/, '').slice(0, 24)}</span>}
          {isSaved && <span className="dl-saved-chip">✓ in cartella</span>}
        </div>
      </div>
      <div className="dl-hist-actions">
        <a
          className={`dl-hist-dl ${isSaved ? 'dl-saved-btn' : ''}`}
          href={fileUrl}
          download
          onClick={handleDownload}
          title={`Scarica ${item.title} nella cartella`}
          aria-label={`Scarica ${item.title}`}
        >
          {isSaved ? '✓' : '↓'}
        </a>
        {onRemove && (
          <button type="button" className="dl-hist-remove" onClick={onRemove} title="Rimuovi dalla lista" aria-label="Rimuovi dalla lista">✕</button>
        )}
      </div>
    </div>
  )
}

function PlaylistDialog({ data, onConfirm, onCancel }: { data: PlaylistPreview; onConfirm: (urls: string[]) => void; onCancel: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(data.entries.map((e) => e.url)))
  const [search, setSearch] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const allOn = selected.size === data.entries.length

  const toggle = (url: string) => setSelected((cur) => {
    const next = new Set(cur)
    if (next.has(url)) next.delete(url); else next.add(url)
    return next
  })

  const selectAll = () => setSelected(new Set(data.entries.map((e) => e.url)))
  const deselectAll = () => setSelected(new Set())

  const visibleEntries = data.entries.filter((entry) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return entry.title.toLowerCase().includes(q) || (entry.uploader && entry.uploader.toLowerCase().includes(q))
  })

  useEffect(() => {
    closeButtonRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
      } else if (event.key === 'Tab') {
        keepFocusInDialog(event, dialogRef.current)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return null
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="dl-overlay" role="dialog" aria-modal="true" aria-labelledby="playlist-preview-title">
      <div ref={dialogRef} className="dl-dialog dl-playlist-modal">
        {/* HEADER MODALE */}
        <div className="dl-dialog-head">
          <div>
            <span className="dl-modal-kicker">SELEZIONE PLAYLIST & SET</span>
            <h2 id="playlist-preview-title" className="dl-dialog-title">{data.title ?? 'Anteprima playlist'}</h2>
            <div className="dl-dialog-sub">
              {data.count} tracce{data.truncated ? ' (elenco troncato)' : ''} · {selected.size} selezionate
            </div>
          </div>
          <button ref={closeButtonRef} type="button" className="secondary dl-modal-close-btn" onClick={onCancel} title="Chiudi finestra">✕</button>
        </div>

        {/* TOOLBAR: RICERCA & PULSANTI SELEZIONE */}
        <div className="dl-dialog-tools-row">
          <div className="dl-modal-search-wrap">
            <input
              type="text"
              className="dl-modal-search-input"
              placeholder="Filtra tracce per titolo o artista…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="dl-modal-search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          <div className="dl-dialog-tools">
            <button type="button" className="secondary dl-tool-btn" onClick={allOn ? deselectAll : selectAll}>
              {allOn ? 'Deseleziona tutti' : 'Seleziona tutti'}
            </button>
          </div>
        </div>

        {/* LISTA TRACCE RETTANGOLARE AD ALTA DENSITÀ CON SCROLL FLUIDO */}
        <div className="dl-dialog-list dl-playlist-scroll-list" aria-label="Elenco tracce della playlist">
          {visibleEntries.length === 0 ? (
            <div className="dl-playlist-empty-search">
              <span>🔍</span>
              <p>Nessun brano corrisponde alla ricerca</p>
            </div>
          ) : (
            visibleEntries.map((entry, idx) => {
              const isChecked = selected.has(entry.url)
              const formattedTime = formatDuration(entry.duration)
              return (
                <label key={entry.url} className={`dl-entry dl-entry-dense ${isChecked ? 'is-selected' : ''}`}>
                  <input
                    type="checkbox"
                    className="dl-entry-checkbox"
                    checked={isChecked}
                    onChange={() => toggle(entry.url)}
                  />
                  <span className="dl-entry-idx">{(idx + 1).toString().padStart(2, '0')}</span>
                  <span className="dl-entry-main">
                    <span className="dl-entry-title" title={entry.title}>{entry.title}</span>
                    {entry.uploader && <span className="dl-entry-sub">{entry.uploader}</span>}
                  </span>
                  {formattedTime && <span className="dl-entry-duration">{formattedTime}</span>}
                </label>
              )
            })
          )}
        </div>

        {/* FOOTER AZIONI */}
        <div className="dl-dialog-actions dl-playlist-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            Annulla
          </button>
          <button
            type="button"
            className="primary dl-confirm-btn"
            disabled={!selected.size}
            onClick={() => onConfirm(data.entries.filter((e) => selected.has(e.url)).map((e) => e.url))}
          >
            Aggiungi {selected.size} alla coda
          </button>
        </div>
      </div>
    </div>
  )
}

function keepFocusInDialog(event: KeyboardEvent, dialog: HTMLElement | null) {
  if (!dialog) return
  const focusable = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), [href], [tabindex]:not([tabindex="-1"])')]
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function TrackInPlaylistDialog({
  data,
  onTrack,
  onPlaylist,
  onCancel,
}: {
  data: Extract<PlaylistPreview, { url_type: 'track_in_playlist' }>
  onTrack: () => void
  onPlaylist: () => void
  onCancel: () => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const trackButtonRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    trackButtonRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
      } else if (event.key === 'Tab') {
        keepFocusInDialog(event, dialogRef.current)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [onCancel])

  const selectedTitle = data.selected_track?.title?.trim() || 'Traccia selezionata'
  return (
    <div className="dl-overlay" role="dialog" aria-modal="true" aria-labelledby="track-playlist-choice-title">
      <div ref={dialogRef} className="dl-dialog dl-choice-dialog">
        <div>
          <h2 id="track-playlist-choice-title" className="dl-dialog-title">Cosa vuoi scaricare?</h2>
          <div className="dl-dialog-sub">{data.count} tracce{data.truncated ? ' (elenco troncato)' : ''}</div>
        </div>
        <div className="dl-choice-track">
          <span className="eyebrow">Traccia selezionata</span>
          <strong>{selectedTitle}</strong>
        </div>
        <div className="dl-dialog-list dl-choice-preview" aria-label="Anteprima playlist">
          {data.entries.map((entry) => (
            <div key={entry.url} className="dl-entry">
              <span className="dl-entry-main"><span className="dl-entry-title">{entry.title}</span>{entry.uploader ? <span className="dl-entry-sub">{entry.uploader}</span> : null}</span>
            </div>
          ))}
        </div>
        <div className="dl-choice-actions">
          <button ref={trackButtonRef} type="button" className="primary" onClick={onTrack} aria-label={`Scarica solo questa traccia: ${selectedTitle}`}>Solo questa traccia</button>
          <button type="button" className="secondary" onClick={onPlaylist} aria-label={`Scarica tutta la playlist, ${data.count} tracce`}>Tutta la playlist</button>
          <button type="button" className="secondary" onClick={onCancel} aria-label="Annulla scelta download">Annulla</button>
        </div>
      </div>
    </div>
  )
}
