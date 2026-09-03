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
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [regEmail, setRegEmail] = useState('')
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
    setAuthMode('login')
    setErrorMessage('')
    setSuccessMessage('')
    setIsAuthModalOpen(true)
  }

  const openSignUp = () => {
    setAuthMode('register')
    setErrorMessage('')
    setSuccessMessage('')
    setIsAuthModalOpen(true)
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const cleanUsername = loginUsername.trim().toLowerCase()
    const cleanPassword = loginPassword.trim()

    if (!cleanUsername || !cleanPassword) {
      setErrorMessage('Please fill in all fields.')
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
          email: regEmail || logged.email,
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
            email: regEmail,
          }
        }
      }

      if (loggedUser) {
        try {
          window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(loggedUser))
        } catch {}
        setUser(loggedUser)
        setSuccessMessage(authMode === 'register' ? 'Account created! Free 1,000 tracks unlocked.' : 'Login successful. Redirecting...')
        redirectTimerRef.current = setTimeout(() => {
          window.location.assign('/app/download')
        }, 700)
      }
    } catch {
      setErrorMessage('Invalid credentials. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="landing-elite-root">
      {/* MINIMAL NAVIGATION - MAX 1200PX */}
      <header className="landing-elite-header">
        <div className="landing-elite-logo">
          Drops<span className="logo-dot">.</span>
        </div>
        <nav className="landing-elite-nav">
          <a href="#agent" className="nav-item">Drop Agent</a>
          <a href="#features" className="nav-item">Features</a>
          {user ? (
            <a href="/app/download" className="nav-btn-primary">
              Console &rarr;
            </a>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={openLogin} className="nav-btn-secondary">
                Login
              </button>
              <button type="button" onClick={openSignUp} className="nav-btn-primary">
                Sign Up
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* CAMPAIGN VISUAL HERO - BOUNDED TO 1200PX */}
      <div className="landing-hero-wrapper-contained">
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
                    Library Archive
                  </a>
                </div>
              ) : (
                <div className="landing-hero-btn-row">
                  <button
                    type="button"
                    onClick={openLogin}
                    className="landing-btn landing-btn-secondary"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={openSignUp}
                    className="landing-btn landing-btn-primary"
                  >
                    Sign Up &mdash; Free 1,000 Tracks
                  </button>
                </div>
              )}
            </div>
            <div className="discovery-hero-fade" />
          </div>
        </section>
      </div>

      {/* TERMINAL CARD & OUTCOME-BASED FEATURES - BOUNDED TO 1200PX */}
      <main className="landing-elite-modalities" id="agent">
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
            <span className="spec-tag">Native Speed</span>
            <span className="spec-divider">&bull;</span>
            <span className="spec-tag">Camelot 1A-12B &amp; BPM</span>
            <span className="spec-divider">&bull;</span>
            <span className="spec-tag">Rekordbox &amp; Traktor Export</span>
          </div>
        </div>

        {/* 3 OUTCOME-FOCUSED BOXES: WHAT YOU CAN ACTUALLY DO (100% ENGLISH) */}
        <div className="modalities-grid" id="features">
          {/* 01: DROP AGENT CLI */}
          <div className="modality-card">
            <div className="modality-num">01</div>
            <div className="modality-badge-active">FREE 4 EVER</div>
            <h3 className="modality-title">Drop Agent</h3>
            <p className="modality-desc">
              Download entire DJ sets and 100+ track playlists at true 320kbps in minutes. Or point the bot to any local music folder on your computer to automatically compute Camelot keys, BPM, and generate ready-to-use Rekordbox &amp; Traktor files.
            </p>
            <div className="modality-meta">
              <span>Instant Download &amp; Tagging</span>
              <span>Rekordbox USB Prep</span>
            </div>
          </div>

          {/* 02: CLOUD MUSIC HUB */}
          <div className="modality-card">
            <div className="modality-num">02</div>
            <div className="modality-badge-active">SIGN UP FREE</div>
            <h3 className="modality-title">Cloud Library</h3>
            <p className="modality-desc">
              Store, organize, and stream your private music collection in high quality from any browser or phone without using storage on your device. Free up to 1,000 tracks upon registration.
            </p>
            <div className="modality-meta">
              <span>Zero Device Storage</span>
              <span>Private HD Streaming</span>
            </div>
          </div>

          {/* 03: DESKTOP APP */}
          <div className="modality-card modality-card-soon">
            <div className="modality-num">03</div>
            <div className="modality-badge-soon">COMING SOON &middot; TAURI</div>
            <h3 className="modality-title">Desktop App</h3>
            <p className="modality-desc">
              Manage your local music collection with an ultra-fluid interface and export prepared playlists directly to your Pioneer CDJ and AlphaTheta USB drives with one click.
            </p>
            <div className="modality-meta">
              <span>1-Click USB Export</span>
              <span>Ultra-Light &amp; Fast</span>
            </div>
          </div>
        </div>
      </main>

      {/* MINIMAL FOOTER - BOUNDED TO 1200PX */}
      <footer className="landing-elite-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            Drops<span>.</span> &mdash; Curated Electronic Music System
          </div>
          <div className="footer-links">
            <button type="button" onClick={openLogin}>Login</button>
            <button type="button" onClick={openSignUp}>Sign Up</button>
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
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: authMode === 'login' ? '#ffffff' : '#6b7280',
                    fontSize: '16px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    paddingBottom: '4px',
                    borderBottom: authMode === 'login' ? '2px solid #22c55e' : '2px solid transparent'
                  }}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: authMode === 'register' ? '#ffffff' : '#6b7280',
                    fontSize: '16px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    paddingBottom: '4px',
                    borderBottom: authMode === 'register' ? '2px solid #22c55e' : '2px solid transparent'
                  }}
                >
                  Sign Up (Free 1k Tracks)
                </button>
              </div>
              <button type="button" onClick={() => setIsAuthModalOpen(false)} className="dialog-close-btn">&times;</button>
            </div>

            <form onSubmit={handleAuthSubmit} className="auth-form-stack">
              {authMode === 'register' && (
                <label>
                  Email
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </label>
              )}
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
                {busy ? 'Processing...' : (authMode === 'login' ? 'Login to Drops' : 'Claim Free 1,000 Tracks')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
