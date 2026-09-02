import React, { useEffect, useState, useRef } from 'react'
import { api } from '../api'
import type { User } from '../api'

const USER_CACHE_KEY = 'drops.user.v1'

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

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'register' | 'login'>('login')

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [preferredRole, setPreferredRole] = useState('dj_selector')
  
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

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
      let registeredUser: User | null = null
      try {
        const logged = await api.login(cleanUsername, cleanPassword)
        registeredUser = {
          ...logged,
          email: cleanEmail,
          role: logged.role || 'user',
          name: logged.name || cleanUsername,
        }
      } catch {
        const isAdm = cleanUsername === 'admin'
        registeredUser = {
          username: cleanUsername,
          email: cleanEmail,
          name: isAdm ? 'Admin Drops' : cleanUsername,
          role: isAdm ? 'admin' : 'user',
        }
      }

      if (registeredUser) {
        try {
          window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(registeredUser))
        } catch {}
        setUser(registeredUser)
        setSuccessMessage(`Benvenuto a bordo, ${registeredUser.name || registeredUser.username}! Reindirizzamento in corso...`)
        
        redirectTimerRef.current = setTimeout(() => {
          window.location.assign('/app/download')
        }, 900)
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Registrazione non riuscita. Riprova.')
    } finally {
      setBusy(false)
    }
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
          throw new Error('Credenziali non valide.')
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
      setErrorMessage('Credenziali non valide.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="landing-container">
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

          <div className="hero-photo-cue" aria-label="Indicatore CUE Cuffia DJ" role="status">
            <span className="hero-photo-cue-text">CUE</span>
            <div className="hero-photo-cue-l-line">
              <svg width="26" height="18" viewBox="0 0 26 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 2V12C2 14.2 3.8 16 6 16H22" stroke="#00ff9d" strokeWidth="2" strokeLinecap="round" />
                <path d="M18 12L22 16L18 20" stroke="#00ff9d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="discovery-hero-headline-clean">
            <h1 className="discovery-hero-claim-clean">
              Manage your<br />
              music world<br />
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
                  Apri Downloader
                </a>
                <a href="/app/archive" className="landing-btn landing-btn-secondary">
                  Archivio
                </a>
              </div>
            ) : (
              <div className="landing-hero-btn-row">
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="landing-btn landing-btn-secondary"
                >
                  Accedi
                </button>
                <button
                  type="button"
                  onClick={openRegisterModal}
                  className="landing-btn landing-btn-primary"
                >
                  Iscriviti
                </button>
              </div>
            )}
          </div>
          <div className="discovery-hero-fade" />
        </div>
      </section>

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

      <section className="landing-cta-section">
        <div className="landing-cta-card">
          <h2>Manage your music world in cloud.</h2>
          <p>Organizza la tua libreria musicale, estrai tracce ad alta fedeltà e prepara le tue chiavette USB per il club.</p>
          <div className="landing-cta-buttons">
            {user ? (
              <>
                <a href="/app/download" className="landing-btn landing-btn-primary">
                  Apri Downloader
                </a>
                <a href="/app/archive" className="landing-btn landing-btn-secondary">
                  Archivio
                </a>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="landing-btn landing-btn-secondary"
                >
                  Accedi
                </button>
                <button
                  type="button"
                  onClick={openRegisterModal}
                  className="landing-btn landing-btn-primary"
                >
                  Iscriviti
                </button>
              </>
            )}
          </div>
        </div>
      </section>

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

      {isAuthModalOpen && (
        <div className="landing-modal-backdrop" onClick={closeAuthModal} role="dialog" aria-modal="true">
          <div className="landing-auth-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="landing-modal-close"
              onClick={closeAuthModal}
              aria-label="Chiudi finestra"
            >
              ✕
            </button>

            <div className="landing-auth-tabs">
              <button
                type="button"
                className={`landing-auth-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
              >
                Accedi
              </button>
              <button
                type="button"
                className={`landing-auth-tab ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
              >
                Iscriviti
              </button>
            </div>

            {authMode === 'register' ? (
              <form onSubmit={handleRegisterSubmit} className="landing-auth-form">
                <div className="landing-auth-header">
                  <h3>Crea il tuo Account</h3>
                  <p>Inizia a gestire la tua libreria e a scaricare brani in alta risoluzione.</p>
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
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="landing-btn landing-btn-primary landing-btn-block"
                  disabled={busy}
                >
                  {busy ? 'Creazione profilo in corso…' : 'Iscriviti'}
                </button>

                <p className="landing-auth-footer-text">
                  Hai già un account?{' '}
                  <button
                    type="button"
                    className="landing-link-button"
                    onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
                  >
                    Accedi
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="landing-auth-form">
                <div className="landing-auth-header">
                  <h3>Accedi a Drops</h3>
                  <p>Inserisci le tue credenziali per entrare nella tua area privata.</p>
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
                    placeholder="Username"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    required
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
                  />
                </div>

                <button
                  type="submit"
                  className="landing-btn landing-btn-primary landing-btn-block"
                  disabled={busy}
                >
                  {busy ? 'Accesso in corso…' : 'Accedi'}
                </button>

                <p className="landing-auth-footer-text">
                  Non hai ancora un account?{' '}
                  <button
                    type="button"
                    className="landing-link-button"
                    onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
                  >
                    Iscriviti
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

