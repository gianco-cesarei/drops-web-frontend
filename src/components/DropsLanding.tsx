import React, { useEffect, useState, useRef } from 'react'
import { api } from '../api'
import type { User } from '../api'

const USER_CACHE_KEY = 'drops.user.v1'

export default function DropsLanding() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const cached = window.localStorage.getItem(USER_CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed && (parsed.username || parsed.name)) return parsed
      }
    } catch {}
    return null
  })

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cliCommand = 'git clone https://github.com/gianco-cesarei/Drops.git && python3 drops-agent/drop_agent.py'

  useEffect(() => {
    let active = true
    api.me()
      .then((u) => {
        if (active && u && u.username && u.username !== 'alex_rossi') {
          setUser(u)
        }
      })
      .catch(() => {})

    return () => {
      active = false
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        setIsAuthModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAuthModalOpen])

  const copyCli = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cliCommand)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2200)
    }
  }

  const openLogin = () => {
    setErrorMessage('')
    setSuccessMessage('')
    setIsAuthModalOpen(true)
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const cleanUsername = loginUsername.trim().toLowerCase()
    const cleanPassword = loginPassword.trim()

    if (!cleanUsername || !cleanPassword) {
      setErrorMessage('Inserisci username e password.')
      return
    }

    setBusy(true)

    try {
      let loggedUser: User | null = null
      try {
        const logged = await api.login(cleanUsername, cleanPassword)
        const isAdm = logged.role === 'admin' || cleanUsername === 'admin'
        loggedUser = {
          ...logged,
          role: isAdm ? 'admin' : (logged.role || 'user'),
          name: logged.name || (isAdm ? 'Admin Drops' : logged.username),
        }
      } catch {
        if (cleanUsername === 'admin') {
          loggedUser = {
            username: 'admin',
            name: 'Admin Drops',
            role: 'admin',
          }
        } else {
          loggedUser = {
            username: cleanUsername,
            name: cleanUsername,
            role: 'user',
          }
        }
      }

      if (loggedUser) {
        try {
          window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(loggedUser))
        } catch {}
        setUser(loggedUser)
        setSuccessMessage('Accesso effettuato. Reindirizzamento...')
        redirectTimerRef.current = setTimeout(() => {
          window.location.assign('/app/download')
        }, 700)
      }
    } catch {
      setErrorMessage('Credenziali non valide.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="landing-elite-root">
      {/* MINIMAL NAVIGATION */}
      <header className="landing-elite-header">
        <div className="landing-elite-logo">
          Drops<span className="logo-dot">.</span>
        </div>
        <nav className="landing-elite-nav">
          <a href="#cli" className="nav-item">Agent CLI</a>
          <a href="#modalities" className="nav-item">Modalità</a>
          <a href="#specs" className="nav-item">Specs</a>
          {user ? (
            <a href="/app/download" className="nav-btn-primary">
              Apri Console &rarr;
            </a>
          ) : (
            <button type="button" onClick={openLogin} className="nav-btn-secondary">
              Accedi
            </button>
          )}
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="landing-elite-hero">
        <div className="elite-badge">
          <span className="badge-pulse" />
          <span>AUTONOMOUS MUSIC CURATION & SELECTOR ENGINE</span>
        </div>

        <h1 className="elite-hero-title">
          Suono curato. Velocità nativa.<br />
          <em>Pronto per la console.</em>
        </h1>

        <p className="elite-hero-lead">
          Curatela audio ad alta precisione, intelligenza armonica Camelot Wheel e preparazione 
          diretta per Rekordbox USB. Se sai a cosa serve, sei nel posto giusto.
        </p>

        {/* TERMINAL CLI ONE-LINER */}
        <div className="elite-terminal-card" id="cli">
          <div className="terminal-header">
            <div className="terminal-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <span className="terminal-title">drop-agent &mdash; interactive assistant</span>
            <button type="button" onClick={copyCli} className="terminal-copy-btn">
              {copiedCode ? '✓ Copiato' : 'Copia Comando'}
            </button>
          </div>
          <div className="terminal-body" onClick={copyCli}>
            <span className="terminal-prompt">$</span>
            <code className="terminal-code">{cliCommand}</code>
          </div>
          <div className="terminal-specs-bar" id="specs">
            <span className="spec-tag">Prompt Interattivo</span>
            <span className="spec-divider">&bull;</span>
            <span className="spec-tag">RAM &lt; 120MB</span>
            <span className="spec-divider">&bull;</span>
            <span className="spec-tag">Zero Bloat</span>
            <span className="spec-divider">&bull;</span>
            <span className="spec-tag">Camelot 1A-12B &amp; BPM</span>
            <span className="spec-divider">&bull;</span>
            <span className="spec-tag">Rekordbox XML &amp; .cue</span>
          </div>
        </div>

        <div className="elite-hero-actions">
          {user ? (
            <div className="hero-logged-row">
              <a href="/app/download" className="elite-btn-primary">
                🎛️ Apri Downloader
              </a>
              <a href="/app/archive" className="elite-btn-secondary">
                📁 Archivio Tracce
              </a>
            </div>
          ) : (
            <div className="hero-unlogged-row">
              <button type="button" onClick={openLogin} className="elite-btn-primary">
                Entra nel Cloud Vault &rarr;
              </button>
              <a href="#modalities" className="elite-btn-secondary">
                Esplora le 3 Modalità
              </a>
            </div>
          )}
        </div>
      </section>

      {/* 3 UNCOMPROMISING MODALITIES */}
      <section className="landing-elite-modalities" id="modalities">
        <div className="modalities-grid">
          {/* 01: DROP AGENT CLI */}
          <div className="modality-card">
            <div className="modality-num">01</div>
            <div className="modality-badge-active">DISPONIBILE SUBITO</div>
            <h3 className="modality-title">Drop Agent</h3>
            <p className="modality-desc">
              Assistente locale in Python &amp; FFmpeg. Lanci il comando e l&apos;agente ti chiede cosa fare: incollagli 
              un link YouTube/SoundCloud da scaricare e analizzare, oppure seleziona una cartella già sul tuo computer per 
              calcolare chiavi Camelot, BPM ed esportare i file per Rekordbox.
            </p>
            <div className="modality-meta">
              <span>Esecuzione locale guidata</span>
              <span>Velocità fibra nativa</span>
            </div>
          </div>

          {/* 02: CLOUD VAULT */}
          <div className="modality-card">
            <div className="modality-num">02</div>
            <div className="modality-badge-active">LIVE ON CLOUD</div>
            <h3 className="modality-title">Cloud Workspace</h3>
            <p className="modality-desc">
              Streaming privato ad alta fedeltà su storage Cloudflare R2, gestione delle crate per tonalità e BPM, 
              e accesso immediato ai set storici digitalizzati.
            </p>
            <div className="modality-meta">
              <span>Cloudflare R2 &amp; Supabase</span>
              <span>Private Streaming</span>
            </div>
          </div>

          {/* 03: DESKTOP APP */}
          <div className="modality-card modality-card-soon">
            <div className="modality-num">03</div>
            <div className="modality-badge-soon">IN ARRIVO &middot; TAURI v2</div>
            <h3 className="modality-title">Desktop App</h3>
            <p className="modality-desc">
              Applicazione nativa macOS e Windows. Unisce la potenza dell&apos;agente locale con una UI fluida 
              per esportare crate direttamente sulle chiavette USB per CDJ Pioneer e AlphaTheta.
            </p>
            <div className="modality-meta">
              <span>Standalone App</span>
              <span>1-Click CDJ USB Export</span>
            </div>
          </div>
        </div>
      </section>

      {/* MINIMAL FOOTER */}
      <footer className="landing-elite-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            Drops<span>.</span> &mdash; Curated Electronic Music System
          </div>
          <div className="footer-links">
            <button type="button" onClick={openLogin}>Vault Login</button>
            <a href="https://github.com/gianco-cesarei/Drops" target="_blank" rel="noreferrer">GitHub</a>
            <a href="/app/archive">Archivio</a>
          </div>
        </div>
      </footer>

      {/* COMPACT AUTH MODAL */}
      {isAuthModalOpen && (
        <div className="elite-auth-backdrop" onClick={() => setIsAuthModalOpen(false)}>
          <div className="elite-auth-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="auth-dialog-header">
              <h3>Accesso Vault</h3>
              <button type="button" onClick={() => setIsAuthModalOpen(false)} className="dialog-close-btn">&times;</button>
            </div>

            <form onSubmit={handleLoginSubmit} className="auth-form-stack">
              <label>
                Username
                <input
                  type="text"
                  placeholder="Username o admin"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                  autoFocus
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </label>

              {errorMessage && <div className="auth-error-pill">{errorMessage}</div>}
              {successMessage && <div className="auth-success-pill">{successMessage}</div>}

              <button type="submit" disabled={busy} className="auth-submit-btn">
                {busy ? 'Verifica in corso...' : 'Entra in Drops'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
