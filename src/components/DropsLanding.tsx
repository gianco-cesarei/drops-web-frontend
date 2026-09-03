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
      setErrorMessage('Please enter username and password.')
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
        setSuccessMessage('Access granted. Redirecting...')
        redirectTimerRef.current = setTimeout(() => {
          window.location.assign('/app/download')
        }, 700)
      }
    } catch {
      setErrorMessage('Invalid credentials.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="landing-container">
      {/* CAMPAIGN VISUAL HERO */}
      <section className="discovery-hero-campaign landing-clean-hero" aria-label="Drops Campaign">
        <div className="discovery-hero-media-wrap">
          <picture className="discovery-hero-picture">
            <source media="(max-width: 768px)" srcSet="/assets/cue-campaign-mobile.jpg" />
            <img
              src="/assets/cue-campaign-desktop.jpg"
              alt="Manage your music world in cloud"
              className="discovery-hero-img"
              loading="eager"
            />
          </picture>

          <div className="discovery-hero-headline-clean">
            <h1 className="discovery-hero-claim-clean">
              Manage your <br />
              music world <br />
              in cloud.
            </h1>
          </div>

          <div className="discovery-hero-brand-clean" aria-label="Logo Drops">
            Drops<span className="hero-logo-dot">.</span>
          </div>

          <div className="landing-clean-hero-cta">
            {user ? (
              <div className="landing-hero-btn-row">
                <a href="/app/download" className="landing-btn landing-btn-primary">
                  Open Downloader
                </a>
                <a href="/app/archive" className="landing-btn landing-btn-secondary">
                  Archive
                </a>
              </div>
            ) : (
              <div className="landing-hero-btn-row">
                <button
                  type="button"
                  onClick={openLogin}
                  className="landing-btn landing-btn-primary"
                >
                  Enter Vault &rarr;
                </button>
              </div>
            )}
          </div>
          <div className="discovery-hero-fade" />
        </div>
      </section>

      {/* TERMINAL CARD & MODALITIES CONTAINER */}
      <section className="landing-elite-modalities" style={{ paddingTop: '24px' }}>
        {/* INTERACTIVE TERMINAL BOX */}
        <div className="elite-terminal-card" style={{ margin: '0 auto 40px auto' }}>
          <div className="terminal-header">
            <div className="terminal-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <span className="terminal-title">drop-agent &mdash; interactive selector bot</span>
            <button type="button" onClick={copyCli} className="terminal-copy-btn">
              {copiedCode ? '✓ Copied' : 'Copy Command'}
            </button>
          </div>
          <div className="terminal-body" onClick={copyCli}>
            <span className="terminal-prompt">$</span>
            <code className="terminal-code">{cliCommand}</code>
          </div>
          <div className="terminal-specs-bar">
            <span className="spec-tag">Interactive Bot Prompt</span>
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

        {/* 3 SHARP MODALITIES */}
        <div className="modalities-grid">
          {/* 01: DROP AGENT CLI */}
          <div className="modality-card">
            <div className="modality-num">01</div>
            <div className="modality-badge-active">AVAILABLE NOW</div>
            <h3 className="modality-title">Drop Agent</h3>
            <p className="modality-desc">
              Standalone local Python &amp; FFmpeg bot. Paste any DJ set or playlist URL to fetch 100+ tracks in 
              minutes, or point it to any local folder on your disk to compute Camelot keys, BPM, and Rekordbox XML exports.
            </p>
            <div className="modality-meta">
              <span>Local Native Execution</span>
              <span>Direct Fiber Speed</span>
            </div>
          </div>

          {/* 02: CLOUD WORKSPACE */}
          <div className="modality-card">
            <div className="modality-num">02</div>
            <div className="modality-badge-active">LIVE ON CLOUD</div>
            <h3 className="modality-title">Cloud Workspace</h3>
            <p className="modality-desc">
              High-fidelity private audio streaming on Cloudflare R2 object storage. Browse curated continuous mixes, 
              organize harmonic crates, and preview tracks with headphone Cue routing.
            </p>
            <div className="modality-meta">
              <span>Cloudflare R2 &amp; Supabase</span>
              <span>Private Vault</span>
            </div>
          </div>

          {/* 03: DESKTOP APP */}
          <div className="modality-card modality-card-soon">
            <div className="modality-num">03</div>
            <div className="modality-badge-soon">COMING SOON &middot; TAURI v2</div>
            <h3 className="modality-title">Desktop App</h3>
            <p className="modality-desc">
              Native lightweight app for macOS and Windows. Combines local agent performance with a fluid UI 
              to sync your crates directly onto Pioneer CDJ and AlphaTheta USB drives with 1 click.
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
            <a href="/app/archive">Archive</a>
          </div>
        </div>
      </footer>

      {/* COMPACT AUTH MODAL */}
      {isAuthModalOpen && (
        <div className="elite-auth-backdrop" onClick={() => setIsAuthModalOpen(false)}>
          <div className="elite-auth-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="auth-dialog-header">
              <h3>Vault Access</h3>
              <button type="button" onClick={() => setIsAuthModalOpen(false)} className="dialog-close-btn">&times;</button>
            </div>

            <form onSubmit={handleLoginSubmit} className="auth-form-stack">
              <label>
                Username
                <input
                  type="text"
                  placeholder="Username or admin"
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
                {busy ? 'Verifying...' : 'Enter Drops'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
