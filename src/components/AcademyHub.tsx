import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { User } from '../api'
import DJLab from './DJLab'

interface Lesson {
  id: string
  title: string
  duration: string
  module: number
  description: string
  resources: { name: string; type: string; size: string }[]
  videoPlaceholderUrl?: string
}

const MODULES = [
  {
    id: 1,
    title: 'MODULO 01 — IDENTITY & WORKFLOW IN STUDIO',
    subtitle: 'Costruire le fondamenta: setup della DAW, organizzazione dei campioni e identità sonora.',
    lessons: [
      {
        id: '1.1',
        module: 1,
        title: 'Lezione 1.1: Organizzare Ableton / DAW per il Club',
        duration: '14:20',
        description: 'Template di avvio, routing delle tracce, raggruppamento percussioni e catena di pre-master.',
        resources: [
          { name: 'Template_Ableton_Drops_Club_v2.als', type: 'Ableton Project', size: '1.2 MB' },
          { name: 'Checklist_Session_Setup.pdf', type: 'Guida PDF', size: '420 KB' },
        ],
      },
      {
        id: '1.2',
        module: 1,
        title: 'Lezione 1.2: Crate Digging & Selezione Campioni',
        duration: '18:45',
        description: 'Come selezionare one-shot di qualità senza affollare il mix: transienti puliti e sample organici.',
        resources: [
          { name: 'Drops_Microhouse_Samplepack_Vol1.zip', type: 'Sample Pack', size: '68 MB' },
        ],
      },
      {
        id: '1.3',
        module: 1,
        title: 'Lezione 1.3: Connessione Social & Scheda Artista',
        duration: '08:15',
        description: 'Ottimizzare il profilo pubblico Drops, collegare SoundCloud e Instagram per il badge Verified ✓.',
        resources: [
          { name: 'Guida_Identita_Producer_2026.pdf', type: 'Guida PDF', size: '310 KB' },
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'MODULO 02 — DRUMS & LOW-END (IL CUORE DEL GENERE)',
    subtitle: 'Kick, sub-bass e percussioni microhouse per una cassa che spinge su sound-system Funktion-One.',
    lessons: [
      {
        id: '2.1',
        module: 2,
        title: 'Lezione 2.1: Kick & Sub Bass: Tuning e Separazione Frequenze',
        duration: '22:10',
        description: 'Come intonare la cassa alla scala del brano, pulire le basse con filtri a fase lineare e gestire il sidechain.',
        resources: [
          { name: 'Kick_Tuning_Chart.pdf', type: 'Cheat Sheet', size: '240 KB' },
          { name: 'LowEnd_Rack_Ableton.adg', type: 'Audio Rack', size: '85 KB' },
        ],
      },
      {
        id: '2.2',
        module: 2,
        title: 'Lezione 2.2: Percussioni Microhouse & Micro-timing',
        duration: '19:30',
        description: 'Shaker, rimshot e click fuori griglia (swing & groove extraction) per un andamento ipnotico.',
        resources: [
          { name: 'Groove_Pool_Presets.zip', type: 'Groove MIDI', size: '1.5 MB' },
        ],
      },
      {
        id: '2.3',
        module: 2,
        title: 'Lezione 2.3: Ghost Notes & Saturazione Armonica',
        duration: '15:50',
        description: 'Arricchire il pattern ritmico con saturatori valvolari leggeri e modulazioni LFO nascoste.',
        resources: [
          { name: 'Saturation_Chain_Preset.adg', type: 'Ableton Rack', size: '90 KB' },
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'MODULO 03 — ARRANGEMENT & FLOW DELLA TRACCIA',
    subtitle: 'Dal loop di 8 battute alla traccia completa da 7 minuti pensata per i set dei selector.',
    lessons: [
      {
        id: '3.1',
        module: 3,
        title: 'Lezione 3.1: Dalla Loop Station alla Struttura da 7 Minuti',
        duration: '26:00',
        description: 'Intro da mixaggio per DJ, accumulo graduale di tensione e gestione dei punti di drop.',
        resources: [
          { name: 'Arrangement_Grid_Template.pdf', type: 'Schema PDF', size: '520 KB' },
        ],
      },
      {
        id: '3.2',
        module: 3,
        title: 'Lezione 3.2: Break, Transizioni e Automazioni Ipnotiche',
        duration: '17:40',
        description: 'Filtri risonanti, code di delay e dissolvenze che mantengono la pista in sospensione.',
        resources: [
          { name: 'Filter_Automation_Examples.als', type: 'Ableton Project', size: '3.4 MB' },
        ],
      },
      {
        id: '3.3',
        module: 3,
        title: 'Lezione 3.3: Preparazione per la Monthly Challenge',
        duration: '11:15',
        description: 'Come testare la traccia su diversi impianti prima di inviarla al Guest Artist del mese.',
        resources: [
          { name: 'Submission_Checklist_Drops.pdf', type: 'Checklist', size: '190 KB' },
        ],
      },
    ],
  },
  {
    id: 4,
    title: 'MODULO 04 — MIXDOWN, LOUDNESS & CLUB READINESS',
    subtitle: 'EQ correttivo, headroom dinamico e preparazione per il mastering professionale su vinile e digitale.',
    lessons: [
      {
        id: '4.1',
        module: 4,
        title: 'Lezione 4.1: EQ Correttivo vs Creativo: Spazio nel Mix',
        duration: '21:30',
        description: 'Trovare ed eliminare risonanze aspre e creare finestre frequenziali per synths e pad.',
        resources: [
          { name: 'EQ_CheatSheet_Frequencies.pdf', type: 'Guida PDF', size: '380 KB' },
        ],
      },
      {
        id: '4.2',
        module: 4,
        title: 'Lezione 4.2: Dinamica, Buss Compression e LUFS per Club',
        duration: '28:10',
        description: 'Clipper morbidi vs limiter: come raggiungere impatto senza distruggere i transienti della batteria.',
        resources: [
          { name: 'Master_Buss_Preset_Rack.adg', type: 'Audio Rack', size: '110 KB' },
        ],
      },
      {
        id: '4.3',
        module: 4,
        title: 'Lezione 4.3: Esportazione Stem e Scheda Review con il Maestro',
        duration: '09:40',
        description: 'Come preparare i file a 24-bit/44.1kHz per il feedback personalizzato e per la release.',
        resources: [
          { name: 'Export_Guidelines_Vinile_Digitale.pdf', type: 'Manuale PDF', size: '450 KB' },
        ],
      },
    ],
  },
]

const ACADEMY_PROGRESS_KEY = 'drops.academy.progress.v1'
const LESSON_IDS = new Set(MODULES.flatMap((module) => module.lessons.map((lesson) => lesson.id)))

function getSavedLessons(): Set<string> {
  try {
    const raw = window.localStorage.getItem(ACADEMY_PROGRESS_KEY)
    const values = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(values) ? values.filter((id): id is string => typeof id === 'string' && LESSON_IDS.has(id)) : [])
  } catch {
    return new Set()
  }
}

export default function AcademyHub({ user }: { user?: User | null }) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(MODULES[0].lessons[0])
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => getSavedLessons())
  const [tab, setTab] = useState<'lessons' | 'djlab' | 'feedback' | 'resources'>('lessons')
  const [openModuleId, setOpenModuleId] = useState(1)

  // Feedback form state
  const [trackTitle, setTrackTitle] = useState('')
  const [trackBpm, setTrackBpm] = useState('126')
  const [trackGenre, setTrackGenre] = useState('Minimal House')
  const [focusArea, setFocusArea] = useState('Mixdown & Low-end')
  const [submissionNotice, setSubmissionNotice] = useState('')
  const [trackFile, setTrackFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')

  const isCurrentCompleted = completedLessons.has(selectedLesson.id)

  const toggleCompleted = (id: string) => {
    setCompletedLessons((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  useEffect(() => {
    try { window.localStorage.setItem(ACADEMY_PROGRESS_KEY, JSON.stringify([...completedLessons])) } catch {}
  }, [completedLessons])

  const handleFeedbackSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!trackFile) {
      setFileError('Seleziona un file WAV o MP3 prima di continuare.')
      return
    }
    setSubmissionNotice('Bozza pronta sul dispositivo. Invio non disponibile: servizio upload non ancora collegato.')
  }

  const selectTrackFile = (file?: File) => {
    setSubmissionNotice('')
    if (!file) return
    if (!['audio/wav', 'audio/x-wav', 'audio/mpeg'].includes(file.type)) {
      setTrackFile(null); setFileError('Formato non supportato. Usa WAV o MP3.'); return
    }
    if (file.size > 100 * 1024 * 1024) {
      setTrackFile(null); setFileError('File troppo grande. Limite: 100 MB.'); return
    }
    setTrackFile(file); setFileError('')
  }

  return (
    <main className="academy-page">
      {/* HEADER STUDENTE & PRODUCER STATUS */}
      <section className="academy-header-card">
        <div className="academy-header-left">
          <div className="academy-badge-group">
            <span className="badge-new-pill">NEW</span>
            <span className="academy-tag">PRODUCER ACADEMY & HUB</span>
          </div>
          <h1 className="academy-title">
            Bentornato, {user?.name || user?.username || 'Alex Rossi'}
            <span className="verified-badge-inline" title="Profilo Connesso Verificato">✓</span>
          </h1>
          <p className="academy-subtitle">
            Percorso avanzato di produzione musicale elettronica: 4 moduli pratici, video-lezioni, sample kit e sessioni di track review con i Guest Artist del collettivo.
          </p>
        </div>

        <div className="academy-header-right">
          <div className="producer-level-badge-box">
            <div className="level-label-row">
              <span className="level-number">LEVEL 03</span>
              <span className="level-title">CLUB READY</span>
            </div>
            <div className="xp-progress-bar-container">
              <div className="xp-progress-bar-fill" style={{ width: '74%' }}></div>
            </div>
            <div className="xp-details-row">
              <span>740 / 1.000 XP</span>
              <span>260 XP a BREAKTHROUGH</span>
            </div>
          </div>

          <div className="academy-quick-actions">
            <a href="/item/alex-rossi" className="button-link-secondary" target="_blank" rel="noreferrer">
              Profilo pubblico ↗
            </a>
            <a href="/app/settings" className="academy-settings-gear" aria-label="Apri impostazioni profilo" title="Impostazioni profilo">⚙</a>
          </div>
        </div>
      </section>

      {/* NAVIGATION TABS */}
      <nav className="academy-nav-tabs" aria-label="Sezioni Academy" role="tablist">
        <button
          className={`academy-tab-btn ${tab === 'lessons' ? 'active' : ''}`} role="tab" aria-selected={tab === 'lessons'}
          onClick={() => setTab('lessons')}
        >
          Lezioni {completedLessons.size}/12
        </button>
        <button
          className={`academy-tab-btn ${tab === 'djlab' ? 'active' : ''}`} role="tab" aria-selected={tab === 'djlab'}
          onClick={() => setTab('djlab')}
        >
          🎛️ DJ Lab (Beatmatching) <span className="badge-new-pill" style={{ marginLeft: '4px' }}>NEW</span>
        </button>
        <button
          className={`academy-tab-btn ${tab === 'feedback' ? 'active' : ''}`} role="tab" aria-selected={tab === 'feedback'}
          onClick={() => setTab('feedback')}
        >
          Track Review con Guest Artist
          <span className="notification-dot"></span>
        </button>
        <button
          className={`academy-tab-btn ${tab === 'resources' ? 'active' : ''}`} role="tab" aria-selected={tab === 'resources'}
          onClick={() => setTab('resources')}
        >
          Download Kit & Template DAW
        </button>
      </nav>

      {tab === 'djlab' && (
        <section className="academy-tab-panel" role="tabpanel" aria-label="DJ Lab Beatmatching">
          <DJLab />
        </section>
      )}

      {tab === 'lessons' && (
        <div className="academy-grid-layout academy-tab-panel" role="tabpanel">
          {/* PLAYER VIDEO CENTRALE */}
          <section className="academy-video-column">
            <div className="video-player-frame">
              <div className="video-mockup-screen">
                <div className="video-overlay-info">
                  <span className="video-tag">MODULO 0{selectedLesson.module} • {selectedLesson.duration}</span>
                  <h2 className="video-lesson-headline">{selectedLesson.title}</h2>
                </div>

                <div className="video-center-action">
                  <button className="video-play-button" disabled aria-label="Video non ancora disponibile">▶</button>
                  <span className="video-status-hint">Video non ancora disponibile</span>
                </div>

                <div className="video-bottom-controls">
                  <div className="video-timeline-bar">
                    <div className="video-timeline-filled" style={{ width: '0%' }}></div>
                  </div>
                  <div className="video-controls-row">
                    <div className="video-controls-left">
                      <button className="control-btn" disabled>Play</button>
                      <span className="video-timecode">--:-- / {selectedLesson.duration}</span>
                    </div>
                    <div className="video-controls-right">
                      <button className="speed-selector-btn" disabled>Velocità: 1.0x</button>
                      <button
                        className={`complete-toggle-btn ${isCurrentCompleted ? 'completed' : ''}`}
                        onClick={() => toggleCompleted(selectedLesson.id)}
                      >
                        {isCurrentCompleted ? '✓ Lezione Completata' : 'Segna come Completata (+25 XP)'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DETTAGLI LEZIONE & RISORSE */}
            <div className="lesson-details-card">
              <div className="lesson-meta-header">
                <div>
                  <span className="lesson-module-pill">Modulo 0{selectedLesson.module}</span>
                  <h3 className="lesson-card-title">{selectedLesson.title}</h3>
                </div>
                <span className="lesson-duration-badge">⏱ {selectedLesson.duration}</span>
              </div>

              <p className="lesson-description-text">{selectedLesson.description}</p>

              <div className="lesson-resources-section">
                <h4>Risorse & Materiali allegati a questa lezione:</h4>
                <div className="resources-list-grid">
                  {selectedLesson.resources.map((res, i) => (
                    <div key={i} className="resource-item-box">
                      <div className="resource-icon">📁</div>
                      <div className="resource-meta">
                        <span className="resource-name">{res.name}</span>
                        <span className="resource-sub">{res.type} • {res.size}</span>
                      </div>
                      <button className="resource-download-btn" disabled title="Risorsa non ancora pubblicata">Non disponibile</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SIDEBAR MODULI & INDICE LEZIONI */}
          <aside className="academy-curriculum-sidebar">
            <div className="curriculum-header">
              <h3>Programma del Corso</h3>
              <span className="curriculum-counter">{completedLessons.size}/12</span>
            </div>

            <div className="modules-accordion-list">
              {MODULES.map((mod) => (
                <div key={mod.id} className="module-group-box">
                  <button className="module-group-title" aria-expanded={openModuleId === mod.id} aria-controls={`module-${mod.id}-lessons`} onClick={() => setOpenModuleId(mod.id)}>
                    <span className="module-number-tag">M{mod.id}</span>
                    <span className="module-title-text">{mod.title}</span>
                    <span className="module-progress">{mod.lessons.filter((lesson) => completedLessons.has(lesson.id)).length}/3</span>
                    <span className="module-chevron" aria-hidden="true">{openModuleId === mod.id ? '−' : '+'}</span>
                  </button>

                  {openModuleId === mod.id && <div className="module-lessons-list" id={`module-${mod.id}-lessons`}>
                    {mod.lessons.map((les) => {
                      const isSelected = selectedLesson.id === les.id
                      const isDone = completedLessons.has(les.id)
                      return (
                        <button
                          key={les.id}
                          className={`curriculum-lesson-row ${isSelected ? 'active' : ''} ${isDone ? 'done' : ''}`}
                          onClick={() => {
                            setSelectedLesson(les)
                            setOpenModuleId(mod.id)
                          }}
                        >
                          <span className="lesson-check-icon">{isDone ? '✓' : '○'}</span>
                          <span className="lesson-row-title">{les.title}</span>
                          <span className="lesson-row-time">{les.duration}</span>
                        </button>
                      )
                    })}
                  </div>}
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {tab === 'feedback' && (
        <section className="academy-feedback-section academy-tab-panel" role="tabpanel">
          <div className="feedback-hero-banner">
            <div className="guest-artist-badge">GUEST ARTIST DI AGOSTO 2026</div>
            <h2>Monthly Track Review & Opening Slot Challenge</h2>
            <p>
              Invia una traccia in lavorazione per ricevere un feedback tecnico dettagliato su mix, sound design e arrangiamento. 
              Le 3 migliori tracce del mese verranno ascoltate dall&apos;Headliner e il vincitore aprirà l&apos;evento del collettivo MANIA a Roma.
            </p>
          </div>

          <div className="feedback-form-grid">
            <div className="feedback-form-card">
              <h3>Invia Traccia per la Review</h3>
              {submissionNotice && <div className="alert" role="status">{submissionNotice}</div>}
                <form onSubmit={handleFeedbackSubmit} className="feedback-form-stack">
                  <div className="form-row">
                    <label>
                      Titolo della Traccia / Versione
                      <input
                        type="text"
                        placeholder="Es. Orbital Dub (Pre-master v3)"
                        required
                        value={trackTitle}
                        onChange={(e) => setTrackTitle(e.target.value)}
                      />
                    </label>
                    <label>
                      BPM
                      <input
                        type="number"
                        value={trackBpm}
                        onChange={(e) => setTrackBpm(e.target.value)}
                      />
                    </label>
                  </div>

                  <div className="form-row">
                    <label>
                      Genere Principale
                      <select value={trackGenre} onChange={(e) => setTrackGenre(e.target.value)}>
                        <option value="Minimal House">Minimal House</option>
                        <option value="Microhouse">Microhouse / Rominimal</option>
                        <option value="Tech House">Tech House</option>
                        <option value="Hypnotic Techno">Hypnotic Techno</option>
                        <option value="Deep Tech">Deep Tech</option>
                      </select>
                    </label>

                    <label>
                      Ambito Principale su cui chiedi Focus
                      <select value={focusArea} onChange={(e) => setFocusArea(e.target.value)}>
                        <option value="Mixdown & Low-end">Mixdown & Low-end (Kick/Sub)</option>
                        <option value="Arrangiamento & Tensione">Arrangiamento & Dinamica</option>
                        <option value="Sound Design & Originalità">Sound Design & Originalità</option>
                        <option value="Club Readiness">Pronta per il Club / Sound-system</option>
                      </select>
                    </label>
                  </div>

                  <div className="file-dropzone-box">
                    <span className="dropzone-icon">🎵</span>
                    <span className="dropzone-title">Trascina qui il file audio (.WAV 24-bit o .MP3 320kbps)</span>
                    <span className="dropzone-sub">Dimensione massima: 100 MB</span>
                    <label className="button-link-secondary" style={{ marginTop: '8px' }}>
                      Seleziona file dal computer
                      <input className="sr-only" type="file" accept=".wav,.mp3,audio/wav,audio/mpeg" onChange={(event) => selectTrackFile(event.target.files?.[0])} />
                    </label>
                    {trackFile && <span className="dropzone-sub">{trackFile.name} · {(trackFile.size / 1024 / 1024).toFixed(1)} MB</span>}
                    {fileError && <span className="alert" role="alert">{fileError}</span>}
                  </div>

                  <div className="prefilled-artist-meta">
                    <span>Inviato da: <strong>{user?.name || user?.username || 'Alex Rossi'} ✓</strong> (LEVEL 03 — CLUB READY)</span>
                    <span>DAW: <strong>Ableton Live 12</strong></span>
                  </div>

                  <button type="submit" className="primary submit-feedback-btn">
                    Prepara bozza Review
                  </button>
                </form>
            </div>

            <div className="feedback-criteria-card">
              <h3>Come funziona la Valutazione</h3>
              <div className="criteria-list">
                <div className="criterion-row">
                  <strong>1. Low-End & Kick Separation (25%)</strong>
                  <p>Intonazione del kick, pulizia del sub e gestione delle collisioni a 40–120Hz.</p>
                </div>
                <div className="criterion-row">
                  <strong>2. Groove & Micro-timing (25%)</strong>
                  <p>Coerenza del timing delle percussioni, uso di ghost notes e swing ipnotico.</p>
                </div>
                <div className="criterion-row">
                  <strong>3. Arrangiamento & Fluidità (25%)</strong>
                  <p>Evoluzione nel tempo, transizioni tra sezioni e funzionalità per i DJ.</p>
                </div>
                <div className="criterion-row">
                  <strong>4. Originalità & Identità Sonora (25%)</strong>
                  <p>Carattere unico del sound design e scelta dei timbri.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {tab === 'resources' && (
        <section className="academy-resources-full academy-tab-panel" role="tabpanel">
          <h3>Tutti i Materiali Didattici & Kit di Produzione</h3>
          <div className="all-resources-grid">
            <div className="resource-card-large">
              <span className="res-pill">SAMPLE PACK</span>
              <h4>Drops Underground Microhouse Kit Vol. 1</h4>
              <p>Oltre 350 campioni one-shot registrati da macchine analogiche: 808 sub, rimshot percussivi, click organici e texture modulari.</p>
              <button className="button-link-accent" disabled>Risorsa non disponibile</button>
            </div>
            <div className="resource-card-large">
              <span className="res-pill">ABLETON TEMPLATE</span>
              <h4>Ableton Live 12 Club Setup & Routing Template</h4>
              <p>Template professionale con routing per bus di gruppo, catena di clip e monitoring con LUFS meter per ambienti club.</p>
              <button className="button-link-accent" disabled>Risorsa non disponibile</button>
            </div>
            <div className="resource-card-large">
              <span className="res-pill">E-BOOK & GUIDE</span>
              <h4>Manuale Pratico di Stampa su Vinile & ISRC (2026 Edition)</h4>
              <p>Guida completa a costi di galvanica, cutting, lacche, codici a barre UPC e diritti connessi SIAE/SPA.</p>
              <button className="button-link-accent" disabled>Risorsa non disponibile</button>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
