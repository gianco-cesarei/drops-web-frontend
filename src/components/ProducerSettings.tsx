import { useState } from 'react'
import type { User } from '../api'

export interface LocalProducerSettings {
  artistName: string
  bio: string
  city: string
  daw: string
  genres: string[]
  instagramConnected: boolean
  soundcloudConnected: boolean
  tiktokConnected: boolean
  instagramUsername: string
  soundcloudUsername: string
  tiktokUsername: string
  spotifyUrl: string
  residentAdvisorUrl: string
  bandcampUrl: string
  youtubeUrl: string
  level: string
  xp: number
}

const SETTINGS_KEY = 'drops.producer.settings.v1'
const ALLOWED_GENRES = ['Deep House', 'Classic House', 'Microhouse', 'Minimal House', 'Minimal Techno', 'Tech House underground', 'Dub Techno', 'Detroit Techno'] as const

export function getLocalProducerSettings(): LocalProducerSettings {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(SETTINGS_KEY) : null
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LocalProducerSettings>
      const defaults = defaultProducerSettings()
      return {
        ...defaults,
        ...parsed,
        bio: typeof parsed.bio === 'string' ? parsed.bio.slice(0, 250) : defaults.bio,
        genres: Array.isArray(parsed.genres) ? [...new Set(parsed.genres.filter((genre): genre is string => ALLOWED_GENRES.includes(genre as typeof ALLOWED_GENRES[number])))].slice(0, 4) : defaults.genres,
      }
    }
  } catch {}
  return defaultProducerSettings()
}

function defaultProducerSettings(): LocalProducerSettings {
  return {
    artistName: 'Alex Rossi',
    bio: 'Producer e resident DJ del collettivo MANIA a Roma. Esplora sonorità minimal house, microhouse ipnotica e bassline avvolgenti.',
    city: 'Roma, Italia',
    daw: 'Ableton Live 12 Suite',
    genres: ['Minimal House', 'Microhouse'],
    instagramConnected: true,
    soundcloudConnected: true,
    tiktokConnected: false,
    instagramUsername: 'alexrossi.dj',
    soundcloudUsername: 'alex-rossi-music',
    tiktokUsername: '',
    spotifyUrl: 'https://open.spotify.com/artist/alexrossi',
    residentAdvisorUrl: 'https://ra.co/dj/alexrossi',
    bandcampUrl: 'https://alexrossi.bandcamp.com',
    youtubeUrl: '',
    level: 'LEVEL 03 — CLUB READY',
    xp: 740,
  }
}

export function saveLocalProducerSettings(settings: LocalProducerSettings) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
      window.dispatchEvent(new Event('drops-producer-settings-updated'))
    }
  } catch {}
}

export default function ProducerSettings({ user }: { user?: User | null }) {
  const [settings, setSettings] = useState<LocalProducerSettings>(() => getLocalProducerSettings())
  const [savedNotice, setSavedNotice] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [draft, setDraft] = useState<LocalProducerSettings>(() => getLocalProducerSettings())

  const isVerified = settings.instagramConnected || settings.soundcloudConnected || settings.tiktokConnected

  const updateSetting = <K extends keyof LocalProducerSettings>(key: K, value: LocalProducerSettings[K]) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value }
      saveLocalProducerSettings(updated)
      return updated
    })
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 2000)
  }

  const toggleSocial = (platform: 'instagram' | 'soundcloud' | 'tiktok') => {
    if (platform === 'instagram') {
      const nextState = !settings.instagramConnected
      updateSetting('instagramConnected', nextState)
      if (nextState && !settings.instagramUsername) updateSetting('instagramUsername', 'alexrossi.dj')
    } else if (platform === 'soundcloud') {
      const nextState = !settings.soundcloudConnected
      updateSetting('soundcloudConnected', nextState)
      if (nextState && !settings.soundcloudUsername) updateSetting('soundcloudUsername', 'alex-rossi-music')
    } else if (platform === 'tiktok') {
      const nextState = !settings.tiktokConnected
      updateSetting('tiktokConnected', nextState)
      if (nextState && !settings.tiktokUsername) updateSetting('tiktokUsername', 'alexrossi.sound')
    }
  }

  const startEditing = () => { setDraft(settings); setEditingProfile(true) }
  const saveProfile = () => {
    const updated = { ...settings, artistName: draft.artistName.trim(), city: draft.city.trim(), daw: draft.daw, bio: draft.bio.trim().slice(0, 250), genres: draft.genres }
    setSettings(updated); saveLocalProducerSettings(updated); setEditingProfile(false); setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 2000)
  }

  return (
    <main className="producer-settings-page">
      <div className="settings-header-banner">
        <div>
          <div className="academy-badge-group">
            <span className="badge-new-pill">NEW</span>
            <span className="academy-tag">PRODUCER PROFILE & ACCOUNTS</span>
          </div>
          <h1>Impostazioni Profilo & Verifica</h1>
          <p className="muted">
            Gestisci la tua identità pubblica, la DAW utilizzata e connetti i tuoi profili social per ottenere il badge di <strong>Profilo Connesso Verificato ✓</strong>.
          </p>
        </div>

        <div className="live-badge-preview-card">
          <span className="preview-label">Anteprima Badge Pubblico:</span>
          <div className="preview-artist-row">
            <span className="preview-name">{settings.artistName || user?.name || 'Producer'}</span>
            {isVerified ? (
              <span className="verified-badge-pill" title="Profilo Verificato: almeno un account esterno connesso">
                ✓ Verified
              </span>
            ) : (
              <span className="unverified-badge-pill" title="Non verificato: connetti almeno un social">
                Non Verificato
              </span>
            )}
          </div>
          <span className="preview-level-tag">{settings.level}</span>
        </div>
      </div>

      {savedNotice && (
        <div className="save-toast" role="status">
          ✓ Modifiche salvate in tempo reale!
        </div>
      )}

      <div className="settings-two-column-layout">
        {/* COLONNA 1: VERIFICA ACCOUNT ESTERNI */}
        <section className="settings-card verification-card">
          <div className="card-section-title settings-section-heading">
            <div className="section-icon">🔗</div>
            <div>
              <h2>Verifica il tuo Profilo</h2>
              <p className="card-subtext">
                Collega almeno <strong>UNO</strong> dei tuoi profili esterni per sbloccare la spunta di verifica <strong>✓</strong> sul tuo profilo e nelle classifiche.
              </p>
            </div>
          </div>

          <div className="connected-accounts-stack">
            {/* INSTAGRAM */}
            <div className={`account-connect-row ${settings.instagramConnected ? 'connected' : ''}`}>
              <div className="account-info-left">
                <div className="social-platform-icon ig">IG</div>
                <div>
                  <strong>Instagram</strong>
                  <span className="account-status">
                    {settings.instagramConnected ? `@${settings.instagramUsername || 'connesso'}` : 'Non collegato'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className={settings.instagramConnected ? 'button-disconnect' : 'button-connect'}
                onClick={() => toggleSocial('instagram')}
              >
                {settings.instagramConnected ? 'Disconnetti' : 'Collega in demo'}
              </button>
            </div>

            {/* SOUNDCLOUD */}
            <div className={`account-connect-row ${settings.soundcloudConnected ? 'connected' : ''}`}>
              <div className="account-info-left">
                <div className="social-platform-icon sc">SC</div>
                <div>
                  <strong>SoundCloud</strong>
                  <span className="account-status">
                    {settings.soundcloudConnected ? `@${settings.soundcloudUsername || 'connesso'}` : 'Non collegato'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className={settings.soundcloudConnected ? 'button-disconnect' : 'button-connect'}
                onClick={() => toggleSocial('soundcloud')}
              >
                {settings.soundcloudConnected ? 'Disconnetti' : 'Collega in demo'}
              </button>
            </div>

            {/* TIKTOK */}
            <div className={`account-connect-row ${settings.tiktokConnected ? 'connected' : ''}`}>
              <div className="account-info-left">
                <div className="social-platform-icon tt">TT</div>
                <div>
                  <strong>TikTok</strong>
                  <span className="account-status">
                    {settings.tiktokConnected ? `@${settings.tiktokUsername || 'connesso'}` : 'Non collegato'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className={settings.tiktokConnected ? 'button-disconnect' : 'button-connect'}
                onClick={() => toggleSocial('tiktok')}
              >
                {settings.tiktokConnected ? 'Disconnetti' : 'Collega in demo'}
              </button>
            </div>
          </div>

          <div className="verification-rule-hint">
            <span className="hint-icon">ℹ️</span>
            <span>
              In questo prototipo la spunta indica una presenza esterna inserita localmente. Verifica reale della proprieta richiede OAuth backend. Scollegando tutti gli account, il badge sparisce.
            </span>
          </div>

          {/* ALTRI LINK MUSICALI */}
          <div className="extra-links-group" style={{ marginTop: '2rem' }}>
            <h3>Altri Link & Profili Artistici</h3>
            <div className="form-stack">
              <label>
                Spotify Artist URL
                <input
                  type="url"
                  placeholder="https://open.spotify.com/artist/..."
                  value={settings.spotifyUrl}
                  onChange={(e) => updateSetting('spotifyUrl', e.target.value)}
                />
              </label>
              <label>
                Resident Advisor DJ URL
                <input
                  type="url"
                  placeholder="https://ra.co/dj/..."
                  value={settings.residentAdvisorUrl}
                  onChange={(e) => updateSetting('residentAdvisorUrl', e.target.value)}
                />
              </label>
              <label>
                Bandcamp URL
                <input
                  type="url"
                  placeholder="https://nome.bandcamp.com"
                  value={settings.bandcampUrl}
                  onChange={(e) => updateSetting('bandcampUrl', e.target.value)}
                />
              </label>
            </div>
          </div>
        </section>

        {/* COLONNA 2: DETTAGLI PRODUCER & LIVELLI XP */}
        <section className="settings-card details-card">
          <div className="card-section-title">
            <div className="section-icon">🎹</div>
            <div>
              <h2>Scheda Artistica & DAW</h2>
              <p className="card-subtext">Queste informazioni compaiono sulla tua scheda pubblica e nelle tracce caricate.</p>
            </div>
            {!editingProfile && <button type="button" className="secondary compact-edit-button" onClick={startEditing}>Modifica</button>}
          </div>

          {editingProfile ? <div className="form-stack profile-edit-form">
            <label>
              Nome Artistico / Alias
              <input
                type="text"
                value={draft.artistName}
                onChange={(e) => setDraft({ ...draft, artistName: e.target.value })}
              />
            </label>

            <label>
              Città / Scena Locale
              <input
                type="text"
                value={draft.city}
                onChange={(e) => setDraft({ ...draft, city: e.target.value })}
              />
            </label>

            <label>
              DAW Principale in Studio
              <select value={draft.daw} onChange={(e) => setDraft({ ...draft, daw: e.target.value })}>
                <option value="Ableton Live 12 Suite">Ableton Live 12 Suite</option>
                <option value="FL Studio 21">FL Studio 21</option>
                <option value="Logic Pro X">Logic Pro X</option>
                <option value="Bitwig Studio">Bitwig Studio</option>
                <option value="Cubase Pro">Cubase Pro</option>
                <option value="Reaper">Reaper</option>
                <option value="Hardware / Outboard Only">Hardware / Modular Only</option>
              </select>
            </label>

            <label>
              Biografia Breve (Massimo 250 caratteri)
              <textarea
                rows={3}
                maxLength={250}
                value={draft.bio}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
              />
              <span className="field-counter">{draft.bio.length}/250</span>
            </label>

            <fieldset className="genre-fieldset">
              <legend>Generi principali (massimo 4)</legend>
              <div className="genre-options">
                {ALLOWED_GENRES.map((genre) => {
                  const checked = draft.genres.includes(genre)
                  return <label key={genre} className="genre-option">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!checked && draft.genres.length >= 4}
                      onChange={() => setDraft({ ...draft, genres: checked ? draft.genres.filter((item) => item !== genre) : [...draft.genres, genre] })}
                    />
                    {genre}
                  </label>
                })}
              </div>
            </fieldset>
            <div className="profile-edit-actions"><button type="button" className="secondary" onClick={() => setEditingProfile(false)}>Annulla</button><button type="button" className="primary" onClick={saveProfile}>Salva modifiche</button></div>
          </div> : <div className="profile-summary">
            <div><span>Nome artista</span><strong>{settings.artistName}</strong></div>
            <div><span>Città</span><strong>{settings.city}</strong></div>
            <div><span>DAW</span><strong>{settings.daw}</strong></div>
            <div className="profile-summary-wide"><span>Bio</span><p>{settings.bio}</p></div>
            <div className="profile-summary-wide"><span>Generi</span><div className="genre-summary-chips">{settings.genres.map((genre) => <strong key={genre}>{genre}</strong>)}</div></div>
          </div>}

          <div className="producer-level-gamification-box">
            <h3>Livello Producer & Punti XP</h3>
            <div className="level-status-row">
              <div className="current-level-indicator">
                <span className="lvl-badge-big">LEVEL 03</span>
                <div>
                  <strong>CLUB READY</strong>
                  <span className="xp-metric">740 / 1.000 XP (+260 XP al Level 04)</span>
                </div>
              </div>
            </div>

            <div className="xp-breakdown-table">
              <h4>Come accumulare XP in modo organico:</h4>
              <div className="xp-rule-item">
                <span>Voto positivo ricevuto su una traccia</span>
                <strong>+10 XP</strong>
              </div>
              <div className="xp-rule-item">
                <span>Feedback costruttivo fornito a un collega</span>
                <strong>+15 XP (max 5/mese)</strong>
              </div>
              <div className="xp-rule-item">
                <span>Completamento lezione Academy</span>
                <strong>+25 XP</strong>
              </div>
              <div className="xp-rule-item">
                <span>Traccia selezionata per la Monthly Challenge</span>
                <strong>+150 XP</strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
