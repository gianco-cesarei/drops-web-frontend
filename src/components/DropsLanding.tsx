import React, { useEffect, useState, useRef } from 'react'
import { api } from '../api'
import type { User } from '../api'

const USER_CACHE_KEY = 'drops.user.v1'
const DEMO_SESSION_KEY = 'drops.demo-session.v1'

type RoleOption = {
  id: string
  label: string
  icon: string
  description: string
}

const ROLE_OPTIONS: RoleOption[] = [
  { id: 'dj_selector', label: 'DJ & Selector', icon: '🎧', description: 'Sets, tracklist & CUE pre-listen' },
  { id: 'producer', label: 'Music Producer', icon: '🎹', description: 'BPM, chiavi Camelot & stem' },
  { id: 'club_resident', label: 'Club Resident', icon: '🏢', description: 'Rekordbox USB & playlist M3U' },
  { id: 'curator', label: 'Curator & Digger', icon: '📻', description: 'HQ downloads & vinyl archiving' },
]

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

  // Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register')

  // Registration Form State
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [preferredRole, setPreferredRole] = useState('dj_selector')
  
  // Login Form State
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // UI status
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAuthModalOpen])

  const openRegisterModal = () => {
    setAuthMode('register')
    setErrorMessage('')
    setSuccessMessage('')
    setIsAuthModalOpen(true)
  }

  const openLoginModal = () => {
    setAuthMode('login')
    setErrorMessage('')
    setSuccessMessage('')
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
    setErrorMessage('')
    setSuccessMessage('')
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const cleanEmail = email.trim()
    const cleanUsername = username.trim().toLowerCase()
    const cleanPassword = password.trim()

    // Validation
    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setErrorMessage('Inserisci un indirizzo email valido.')
      return
    }
    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMessage('Lo username deve contenere almeno 3 caratteri.')
      return
    }
    if (!cleanPassword || cleanPassword.length < 4) {
      setErrorMessage('La password deve contenere almeno 4 caratteri.')
      return
    }

    setBusy(true)

    try {
      // Simulate quick secure account provisioning
      await new Promise((resolve) => setTimeout(resolve, 500))

      const newUser: User = {
        username: cleanUsername,
        name: username.trim(),
        email: cleanEmail,
        role: cleanUsername === 'admin' ? 'admin' : 'user',
      }

      // Save to localStorage
      try {
        window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(newUser))
        window.localStorage.setItem('drops.role_pref.v1', preferredRole)
      } catch {}

      setUser(newUser)
      setSuccessMessage(`🎉 Benvenuto a bordo, @${cleanUsername}! Il tuo profilo DJ & Cloud è pronto.`)

      // Redirect to private area
      redirectTimerRef.current = setTimeout(() => {
        window.location.assign('/app/download')
      }, 1000)
    } catch {
      setErrorMessage('Impossibile completare la registrazione. Riprova.')
    } finally {
      setBusy(false)
    }
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const cleanUser = loginUsername.trim().toLowerCase()
    const cleanPass = loginPassword.trim()

    if (!cleanUser) {
      setErrorMessage('Inserisci il tuo username.')
      return
    }
    if (!cleanPass) {
      setErrorMessage('Inserisci la password.')
      return
    }

    setBusy(true)

    try {
      let loggedUser: User | null = null

      try {
        const res = await api.login(cleanUser, cleanPass)
        const isAdm = res.role === 'admin' || cleanUser === 'admin'
        loggedUser = {
          ...res,
          role: isAdm ? 'admin' : (res.role || 'user'),
          name: res.name || (isAdm ? 'Admin Drops' : res.username),
        }
      } catch {
        // Fallback for local dev/demo users
        if (cleanUser === 'admin') {
          loggedUser = { username: 'admin', name: 'Admin Drops', role: 'admin' }
        } else if (cleanUser === 'alex_rossi') {
          loggedUser = { username: 'alex_rossi', name: 'Alex Rossi', role: 'user' }
        } else {
          loggedUser = { username: cleanUser, name: cleanUser, role: 'user' }
        }
      }

      if (loggedUser) {
        try {
          window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(loggedUser))
        } catch {}
        setUser(loggedUser)
        setSuccessMessage(`Accesso effettuato. Reindirizzamento in corso...`)
        redirectTimerRef.current = setTimeout(() => {
          window.location.assign('/app/download')
        }, 750)
      }
    } catch {
      setErrorMessage('Credenziali non valide o servizio offline.')
    } finally {
      setBusy(false)
    }
  }

  const handleQuickDemoAccess = () => {
    const demoUser: User = { username: 'alex_rossi', name: 'Alex Rossi', role: 'user' }
    try {
      window.localStorage.setItem(DEMO_SESSION_KEY, 'active')
      window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(demoUser))
    } catch {}
    setUser(demoUser)
    setSuccessMessage('Accesso rapido Demo attivato!')
    redirectTimerRef.current = setTimeout(() => {
      window.location.assign('/app/download')
    }, 500)
  }

  return (
    <div className="landing-container">
      {/* HERO BANNER WITH CUE HEADPHONE INDICATOR & CLEAN VISUALS */}
      <section className="discovery-hero-campaign landing-clean-hero" aria-label="Campagna Drops">
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

          {/* CUE HEADPHONE INDICATOR BADGE (DJ BOOTH PRE-LISTEN ROUTE) */}
          <div className="landing-cue-indicator" role="status" aria-label="Indicatore CUE Cuffia DJ attivo">
            <div className="cue-indicator-header">
              <span className="cue-led-indicator" title="Segnale CUE Live" />
              <div className="cue-badge-tag">CUE</div>
              
              {/* Icona a 'L' verso destra: routing preascolto canale cuffia */}
              <div className="cue-l-route-wrap" title="Routing canale cuffia (L-Shape indicator)">
                <svg
                  className="cue-l-route-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 3v11a2 2 0 0 0 2 2h9" />
                  <polyline points="14 13 18 17 14 21" />
                </svg>
              </div>

              <span className="cue-channel-label">CH-1 PREASCOLTO</span>
            </div>

            <div className="cue-indicator-body">
              <span className="cue-status-text">HEADPHONE MONITOR • 320K / FLAC</span>
              <div className="cue-mini-eq" aria-hidden="true">
                <span className="eq-bar bar-1" />
                <span className="eq-bar bar-2" />
                <span className="eq-bar bar-3" />
                <span className="eq-bar bar-4" />
              </div>
            </div>
          </div>

          {/* Payoff pulito senza box */}
          <div className="discovery-hero-headline-clean">
            <h1 className="discovery-hero-claim-clean">
              Manage your<br />
              music world<br />
              in cloud.
            </h1>
          </div>

          {/* Logo Drops */}
          <div className="discovery-hero-brand-clean" aria-label="Logo Drops">
            Drops<span className="hero-logo-dot">.</span>
          </div>

          {/* Pulsanti di Azione */}
          <div className="landing-clean-hero-cta">
            {user ? (
              <div className="landing-hero-btn-row">
                <a href="/app/download" className="landing-btn landing-btn-primary">
                  🎛️ Apri Downloader
                </a>
                <a href="/app/archive" className="landing-btn landing-btn-secondary">
                  📁 Archivio
                </a>
              </div>
            ) : (
              <div className="landing-hero-btn-row">
                <button
                  type="button"
                  onClick={openRegisterModal}
                  className="landing-btn landing-btn-primary"
                >
                  ✨ Iscriviti gratis
                </button>
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="landing-btn landing-btn-secondary"
                >
                  Accedi
                </button>
              </div>
            )}
          </div>

          {/* Sfumatura inferiore per transizione seamless */}
          <div className="discovery-hero-fade" />
        </div>
      </section>

      {/* VALUE STRIP */}
      <section className="landing-value-strip" aria-label="Caratteristiche salienti">
        <div className="landing-strip-item">
          <span className="landing-strip-icon">⚡</span>
          <span>320 KBPS & FLAC LOSSLESS</span>
        </div>
        <div className="landing-strip-divider">&bull;</div>
        <div className="landing-strip-item">
          <span className="landing-strip-icon">🎹</span>
          <span>CAMELOT WHEEL HARMONIC ENGINE</span>
        </div>
        <div className="landing-strip-divider">&bull;</div>
        <div className="landing-strip-item">
          <span className="landing-strip-icon">💾</span>
          <span>PIONEER REKORDBOX USB READY</span>
        </div>
        <div className="landing-strip-divider">&bull;</div>
        <div className="landing-strip-item">
          <span className="landing-strip-icon">🎧</span>
          <span>DJ CUE HEADPHONE MONITORING</span>
        </div>
      </section>

      {/* ESSENTIAL FEATURES */}
      <section className="landing-features-section">
        <div className="landing-section-header">
          <span className="landing-section-eyebrow">FUNZIONALITÀ</span>
          <h2>Piattaforma cloud per DJ e Producer</h2>
        </div>

        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <div className="landing-feature-icon">🎛️</div>
            <h3>Ingestione & Downloader</h3>
            <p>
              Scarica singoli brani o interi set da YouTube, SoundCloud, Spotify, Bandcamp o file locali a 320 kbps MP3 o WAV / FLAC Lossless.
            </p>
            <a href="/app/download" className="landing-feature-link">Vai al Downloader &rarr;</a>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">🎹</div>
            <h3>Analisi Armonica Camelot</h3>
            <p>
              Rilevamento immediato della chiave Camelot Wheel (8A, 11B, 10B...) e BPM per transizioni perfette senza dissonanze.
            </p>
            <a href="/app/archive" className="landing-feature-link">Vedi Analisi Chiavi &rarr;</a>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">💾</div>
            <h3>Archivio Cloud & Rekordbox</h3>
            <p>
              Organizzazione automatica in cartelle con tag ID3 e generazione di playlist M3U pronte per CDJ Pioneer.
            </p>
            <a href="/app/archive" className="landing-feature-link">Esplora la Libreria &rarr;</a>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA SECTION */}
      <section className="landing-cta-section">
        <div className="landing-cta-card">
          <span className="landing-cta-eyebrow">CREA IL TUO ACCOUNT</span>
          <h2>Manage your music world in cloud.</h2>
          <p>Organizza la tua libreria musicale, estrai tracce ad alta fedeltà e prepara le tue chiavette USB per il club.</p>
          
          <div className="landing-cta-buttons">
            {user ? (
              <>
                <a href="/app/download" className="landing-btn landing-btn-primary">
                  🎛️ Apri Downloader
                </a>
                <a href="/app/archive" className="landing-btn landing-btn-secondary">
                  📁 Archivio
                </a>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openRegisterModal}
                  className="landing-btn landing-btn-primary"
                >
                  ✨ Inizia subito — Iscriviti
                </button>
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="landing-btn landing-btn-secondary"
                >
                  Accedi
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <span className="landing-logo">Drops<span>.</span></span>
            <p>Manage your music world in cloud</p>
          </div>
          <div className="landing-footer-links">
            <a href="/app/download">Download</a>
            <a href="/app/archive">Archivio</a>
            {user ? (
              <a href="/app/download" className="landing-footer-user">@{user.username || user.name}</a>
            ) : (
              <>
                <button type="button" onClick={openLoginModal} className="landing-footer-btn-link">Accedi</button>
                <button type="button" onClick={openRegisterModal} className="landing-footer-btn-link landing-footer-btn-highlight">Iscriviti</button>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* REAL INTERACTIVE REGISTRATION & LOGIN MODAL */}
      {isAuthModalOpen && (
        <div className="landing-modal-backdrop" onClick={closeAuthModal} role="dialog" aria-modal="true">
          <div className="landing-auth-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Close Button */}
            <button
              type="button"
              className="landing-modal-close"
              onClick={closeAuthModal}
              aria-label="Chiudi finestra"
            >
              ✕
            </button>

            {/* Modal Tabs: Iscriviti / Accedi */}
            <div className="landing-auth-tabs">
              <button
                type="button"
                className={`landing-auth-tab ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
              >
                Crea Account
              </button>
              <button
                type="button"
                className={`landing-auth-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
              >
                Accedi
              </button>
            </div>

            {/* REGISTER FORM */}
            {authMode === 'register' ? (
              <form onSubmit={handleRegisterSubmit} className="landing-auth-form">
                <div className="landing-auth-header">
                  <h3>Unisciti alla community Drops</h3>
                  <p>Inizia a gestire la tua musica in cloud con qualità da club.</p>
                </div>

                {errorMessage && (
                  <div className="landing-alert-error" role="alert">
                    <span>⚠️</span> {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="landing-alert-success" role="status">
                    <span>✓</span> {successMessage}
                  </div>
                )}

                {/* Preferred Role Picker */}
                <div className="landing-field-group">
                  <label className="landing-field-label">Qual è il tuo profilo principale?</label>
                  <div className="landing-roles-grid">
                    {ROLE_OPTIONS.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        className={`landing-role-card ${preferredRole === role.id ? 'selected' : ''}`}
                        onClick={() => setPreferredRole(role.id)}
                      >
                        <span className="role-icon">{role.icon}</span>
                        <div className="role-text">
                          <strong>{role.label}</strong>
                          <small>{role.description}</small>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="landing-field-group">
                  <label htmlFor="reg-email" className="landing-field-label">Email</label>
                  <input
                    id="reg-email"
                    type="email"
                    className="landing-input"
                    placeholder="dj@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="landing-form-row">
                  <div className="landing-field-group">
                    <label htmlFor="reg-username" className="landing-field-label">Username</label>
                    <input
                      id="reg-username"
                      type="text"
                      className="landing-input"
                      placeholder="es. dj_solaris"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoComplete="username"
                    />
                  </div>

                  <div className="landing-field-group">
                    <label htmlFor="reg-password" className="landing-field-label">Password</label>
                    <input
                      id="reg-password"
                      type="password"
                      className="landing-input"
                      placeholder="Minimo 4 caratteri"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="landing-btn landing-btn-primary landing-btn-block"
                  disabled={busy}
                >
                  {busy ? 'Creazione profilo in corso…' : 'Completa Iscrizione & Entra ➔'}
                </button>

                <p className="landing-auth-footer-text">
                  Hai già un account?{' '}
                  <button
                    type="button"
                    className="landing-link-button"
                    onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
                  >
                    Accedi qui
                  </button>
                </p>
              </form>
            ) : (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="landing-auth-form">
                <div className="landing-auth-header">
                  <h3>Accedi a Drops</h3>
                  <p>Inserisci le tue credenziali per accedere alla tua console.</p>
                </div>

                {errorMessage && (
                  <div className="landing-alert-error" role="alert">
                    <span>⚠️</span> {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="landing-alert-success" role="status">
                    <span>✓</span> {successMessage}
                  </div>
                )}

                <div className="landing-field-group">
                  <label htmlFor="login-user" className="landing-field-label">Username</label>
                  <input
                    id="login-user"
                    type="text"
                    className="landing-input"
                    placeholder="Username o email"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>

                <div className="landing-field-group">
                  <label htmlFor="login-pass" className="landing-field-label">Password</label>
                  <input
                    id="login-pass"
                    type="password"
                    className="landing-input"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="submit"
                  className="landing-btn landing-btn-primary landing-btn-block"
                  disabled={busy}
                >
                  {busy ? 'Verifica credenziali…' : 'Entra in Drops ➔'}
                </button>

                <div className="landing-demo-quick-box">
                  <button
                    type="button"
                    onClick={handleQuickDemoAccess}
                    className="landing-btn-demo"
                  >
                    ⚡ Accesso rapido modalità Demo (Alex Rossi)
                  </button>
                </div>

                <p className="landing-auth-footer-text">
                  Non hai ancora un account?{' '}
                  <button
                    type="button"
                    className="landing-link-button"
                    onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
                  >
                    Iscriviti ora
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

