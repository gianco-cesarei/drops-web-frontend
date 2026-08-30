import React, { useState, useEffect } from 'react'

type Tag = 'front' | 'back' | 'desktop'

interface SubTask {
  title: string
  tags: Tag[]
}

interface Task {
  id: string
  title: string
  benefit?: string
  subtasks: SubTask[]
}

interface Section {
  n: number
  name: string
  short: string
  intro: string
  tasks: Task[]
  archive?: boolean
}

const DEFAULT_SECTIONS: Section[] = [
  {
    n: 1,
    name: 'Downloader Singolo & Tracce Esclusive',
    short: 'Download singolo',
    intro:
      "Gestione dell'acquisizione di singole tracce audio da sorgenti esterne, con ottimizzazioni per la scena underground e materiali esclusivi.",
    tasks: [
      {
        id: '1.1',
        title: 'Download diretto da YouTube per tracce esclusive',
        benefit:
          "Scarica all'istante l'audio da video YouTube che ospitano tracce, remix o bootleg rari non pubblicati altrove, senza ricorrere a convertitori web esterni instabili o pieni di pubblicità.",
        subtasks: [
          {
            title: 'Integrazione libreria di estrazione audio (yt-dlp)',
            tags: ['back'],
          },
          {
            title: 'Interfaccia di input e feedback di progresso',
            tags: ['front'],
          },
        ],
      },
      {
        id: '1.2',
        title: 'Download singolo multi-sorgente con selezione qualità',
        benefit:
          'Salva sul dispositivo o nel cloud qualsiasi singola traccia da YouTube o SoundCloud scegliendo la qualità desiderata e organizzandola in cartelle.',
        subtasks: [
          {
            title: 'Opzioni di conversione e formati (MP3 vs FLAC/HQ)',
            tags: ['back'],
          },
        ],
      },
    ],
  },
  {
    n: 2,
    name: 'Gestione Playlist & Download Multiplo',
    short: 'Playlist & batch',
    intro:
      'Interfaccia e logica di rete per gestire set completi e intere playlist di etichette senza sovraccaricare le API esterne.',
    tasks: [
      {
        id: '2.1',
        title: 'Anteprima, filtri e selezione brani prima del download',
        benefit:
          'Vedi la lista completa delle tracce di una playlist (YT) o di un set (SC) prima di scaricarla, selezionando solo i brani che ti interessano ed escludendo in automatico quelli già in libreria.',
        subtasks: [
          {
            title: 'Limite massimo elementi risolti in simultanea',
            tags: ['back'],
          },
          {
            title: 'Selezione tramite checkbox e filtro duplicati',
            tags: ['front'],
          },
        ],
      },
    ],
  },
  {
    n: 3,
    name: 'Cloud Storage & Libreria Utente',
    short: 'Cloud & libreria',
    intro:
      'Spostamento del baricentro della libreria utente dal disco locale a una soluzione cloud sicura, con streaming privato e organizzazione automatica.',
    tasks: [
      {
        id: '3.1',
        title: 'Salvataggio e organizzazione della propria musica in cloud',
        benefit:
          'Archivia e tieni al sicuro la tua musica scaricata in uno spazio cloud privato legato al tuo account per liberare spazio locale.',
        subtasks: [
          {
            title: 'Configurazione dello storage personale (Cloudflare R2)',
            tags: ['back'],
          },
          {
            title: 'Ricerca testuale e filtri nel catalogo cloud',
            tags: ['front'],
          },
        ],
      },
      {
        id: '3.2',
        title: 'Riproduttore musicale cloud e streaming privato',
        benefit:
          'Ascolta in streaming la musica salvata nel tuo archivio cloud privato direttamente dal browser, ovunque e su qualsiasi dispositivo.',
        subtasks: [
          {
            title: 'Generazione di link sicuri per lo streaming (Presigned URLs)',
            tags: ['back'],
          },
          {
            title: "Riproduttore audio persistente e coda d'ascolto",
            tags: ['front'],
          },
        ],
      },
    ],
  },
  {
    n: 4,
    name: 'Integrazione Streaming & Sync Preferiti',
    short: 'Sync preferiti',
    intro:
      "Connessione alle piattaforme esterne per importare le selezioni e i metadati accumulati dall'utente.",
    tasks: [
      {
        id: '4.1',
        title: 'Sincronizzazione automatica e download dei preferiti Spotify',
        benefit:
          'Collega il tuo account Spotify e importa in Drops i brani "Mi Piace" per verificare quali sono scaricabili o già in tuo possesso ed estrarne i metadati.',
        subtasks: [
          {
            title: 'Algoritmo di matching tra metadati Spotify e sorgenti audio',
            tags: ['back'],
          },
          {
            title: 'Interfaccia di gestione dei preferiti importati',
            tags: ['front'],
          },
        ],
      },
      {
        id: '4.2',
        title: 'Importazione automatica dei "Likes" da SoundCloud e YouTube',
        benefit:
          'Tieni traccia dei brani a cui metti "Like" su SoundCloud e YouTube e importali in blocco per aggiungerli alla coda di download.',
        subtasks: [
          {
            title: 'Connessione e recupero dei preferiti senza API proprietarie',
            tags: ['back'],
          },
        ],
      },
    ],
  },
  {
    n: 5,
    name: 'Corso DJ & Producing Online (Learning Hub)',
    short: 'Learning Hub',
    intro:
      "Portale didattico privato per formare l'utente nell'arte del DJing e della produzione con strumenti interattivi.",
    tasks: [
      {
        id: '5.1',
        title: 'Portale di formazione per DJ e produttori (lezioni e dispense)',
        benefit:
          "Impara mixaggio e produzione in un'area riservata organizzata in moduli didattici, video-lezioni, schede tecniche e test di autovalutazione.",
        subtasks: [
          {
            title: "Struttura dell'area didattica e hosting dei video",
            tags: ['front', 'back'],
          },
        ],
      },
      {
        id: '5.2',
        title: 'Mappa interattiva delle scuole di musica e cabine DJ',
        benefit:
          'Trova accademie musicali, sale prove, studi di registrazione e cabine DJ a noleggio vicino a te su una mappa geografica interattiva.',
        subtasks: [
          {
            title: "Integrazione della mappa geografica dei punti d'interesse",
            tags: ['front'],
          },
        ],
      },
      {
        id: '5.3',
        title: 'Crate didattici di tracce e player di beatmatching',
        benefit:
          "Esercitati sul beatmatching direttamente dal browser con un player speciale dotato di regolatore di velocità (Pitch Control) su pacchetti di tracce selezionate per difficoltà.",
        subtasks: [
          {
            title: 'Regolatore di velocità audio (Pitch Control) via Web Audio API',
            tags: ['front'],
          },
          {
            title: 'Selezione e catalogazione dei pacchetti didattici (Crate)',
            tags: ['back'],
          },
        ],
      },
      {
        id: '5.4',
        title: 'Gamification Producer, Livelli XP e Badge Verified ✓',
        benefit:
          'Scala i 4 livelli producer da Bedroom a Breakthrough, accumula XP e ottieni la spunta di verifica collegando i tuoi account social ufficiali.',
        subtasks: [
          {
            title: 'Gestione profilo e verifica social reattiva con calcolo XP',
            tags: ['front'],
          },
          {
            title: 'API profilo/social per persistenza cloud e verifica account reale',
            tags: ['back'],
          },
        ],
      },
    ],
  },
  {
    n: 6,
    name: 'Grafo Discovery & Motore Suggest',
    short: 'Discovery & Suggest',
    intro:
      'Il motore di curatela e raccomandazione orientato alla musica elettronica underground (Minimal, Deep House, Techno).',
    tasks: [
      {
        id: '6.1',
        title: 'Sistema di ricerca e applicazione foto degli articoli',
        benefit:
          "Progettare un sistema che ricerca e applica la foto di copertina ideale agli articoli. Le immagini attuali non sono soddisfacenti ed è prioritario stabilire una procedura convalidata per la selezione visiva.",
        subtasks: [
          {
            title: 'Algoritmo di ricerca immagini tramite API esterne (Unsplash/Google)',
            tags: ['back'],
          },
          {
            title: 'Interfaccia editor per approvare, ritagliare e applicare la foto in un click',
            tags: ['front'],
          },
        ],
      },
      {
        id: '6.2',
        title: 'Motore "Drops Suggest" e grafo di etichette, party e artisti',
        benefit:
          'Esplora le connessioni tra etichette di nicchia, party underground e DJ per scoprire nuove tracce affini al tuo gusto tramite consigli intelligenti.',
        subtasks: [
          {
            title: 'Visualizzazione del grafo relazionale e navigazione',
            tags: ['front'],
          },
          {
            title: 'Algoritmo di raccomandazione',
            tags: ['back'],
          },
        ],
      },
      {
        id: '6.3',
        title: 'Guide editoriali pratiche per il settore musicale',
        benefit:
          'Leggi guide super-sintetiche e aggiornate su come pubblicare la tua musica, stampare in vinile nel 2026 e gestire i codici ISRC/UPC per proteggere i tuoi diritti.',
        subtasks: [
          {
            title: 'Gestione dei contenuti editoriali (CMS leggero vs file statici)',
            tags: ['front', 'back'],
          },
        ],
      },
    ],
  },
  {
    n: 7,
    name: 'Analisi Audio & Preparazione DJ',
    short: 'Analisi & prep DJ',
    intro:
      'Utility locali e cloud per arricchire i metadati e strutturare i file audio per la riproduzione su hardware professionale.',
    tasks: [
      {
        id: '7.1',
        title: 'Analizzatore di BPM automatico nel cloud',
        benefit:
          "Scopri all'istante il BPM esatto delle tracce scaricate grazie a un'analisi automatica lato server, senza installare motori di analisi pesanti sul computer.",
        subtasks: [
          {
            title: 'Algoritmo e posizionamento del calcolo del BPM',
            tags: ['back'],
          },
        ],
      },
      {
        id: '7.2',
        title: 'Editor tag ID3 ed esportazione per DJ hardware (Rekordbox)',
        benefit:
          'Correggi i tag ID3 dei brani (artista, titolo, copertina, BPM) ed esporta le tracce ordinate in cartelle su una chiavetta USB pronta per i lettori CDJ professionali.',
        subtasks: [
          {
            title: 'Scrittura fisica dei metadati sui file esportati',
            tags: ['desktop', 'front'],
          },
        ],
      },
    ],
  },
  {
    n: 8,
    name: 'Archivio Attività Completate',
    short: 'Completati',
    archive: true,
    intro: 'Registro delle funzionalità storiche e strutturali già testate e in produzione.',
    tasks: [
      {
        id: '8.1',
        title: 'Raccolta storica degli obiettivi completati',
        benefit:
          "Tieni traccia dell'affidabilità generale dell'app verificando le milestone superate e i bug fix applicati nel tempo.",
        subtasks: [
          {
            title: 'Rilascio Drops Hub & Producer Academy LMS (4 Moduli, 12 Lezioni, Video Player)',
            tags: ['front'],
          },
          {
            title: 'DJ Lab Dual-Deck con Pitch Control continuo (±8%, step 0.05%) e routing audio Master/Cue',
            tags: ['front'],
          },
          {
            title: 'Mini-Player Audio Globale persistente a fondo pagina',
            tags: ['front'],
          },
          {
            title: 'Directory Partner Studi di Registrazione & Cabine DJ (Roma, Milano, Berlino, Londra)',
            tags: ['front'],
          },
          {
            title: 'Schede Artista Pubbliche con statistiche editoriali e badge ✓ Verified',
            tags: ['front'],
          },
          {
            title: 'Producer Settings con connessione social live e selezione generi',
            tags: ['front'],
          },
          {
            title: 'Academy UI compatta: header raggruppato, pannelli a scroll interno, accordion LMS singolo e Settings lettura/modifica',
            tags: ['front'],
          },
          {
            title: 'Split dei 3 monorepo, rate limit fix Discogs/Cloudflare e Spotify OAuth',
            tags: ['front', 'back'],
          },
        ],
      },
    ],
  },
]

const LOCAL_STORAGE_KEY = 'drops.developer.roadmap.v3'

export default function DeveloperRoadmap() {
  const [sections, setSections] = useState<Section[]>([])
  const [active, setActive] = useState(0)
  
  // Stati di Editing & Form
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTaskData, setEditingTaskData] = useState<Task | null>(null)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskData, setNewTaskData] = useState<Task>({ id: '', title: '', benefit: '', subtasks: [] })
  const [isAddingSection, setIsAddingSection] = useState(false)
  const [newSectionData, setNewSectionData] = useState({ name: '', short: '', intro: '' })

  // Caricamento dei dati salvati o di default
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (stored) {
        setSections(JSON.parse(stored))
      } else {
        setSections(DEFAULT_SECTIONS)
      }
    } catch {
      setSections(DEFAULT_SECTIONS)
    }
  }, [])

  // Salvataggio dei dati in localStorage
  const saveSections = (newSections: Section[]) => {
    setSections(newSections)
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSections))
    } catch (e) {
      console.error('Impossibile salvare in localStorage', e)
    }
  }

  if (sections.length === 0) return <div style={{ padding: '40px', textAlign: 'center' }}>Caricamento Roadmap…</div>

  const section = sections[active]

  // --- FUNZIONI DI GESTIONE TASK ---

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskData.title.trim()) return

    const taskNum = section.tasks.length + 1
    const generatedId = `${section.n}.${taskNum}`
    const finalTask: Task = {
      ...newTaskData,
      id: generatedId,
    }

    const updatedSections = sections.map((s, idx) => {
      if (idx === active) {
        return { ...s, tasks: [...s.tasks, finalTask] }
      }
      return s
    })

    saveSections(updatedSections)
    setIsAddingTask(false)
    setNewTaskData({ id: '', title: '', benefit: '', subtasks: [] })
  }

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTaskData || !editingTaskData.title.trim()) return

    const updatedSections = sections.map((s, idx) => {
      if (idx === active) {
        return {
          ...s,
          tasks: s.tasks.map((t) => (t.id === editingTaskId ? editingTaskData : t)),
        }
      }
      return s
    })

    saveSections(updatedSections)
    setEditingTaskId(null)
    setEditingTaskData(null)
  }

  const handleDeleteTask = (taskId: string) => {
    if (!window.confirm(`Sei sicuro di voler eliminare il task ${taskId}?`)) return

    const updatedSections = sections.map((s, idx) => {
      if (idx === active) {
        const filteredTasks = s.tasks.filter((t) => t.id !== taskId)
        const reindexedTasks = filteredTasks.map((t, index) => ({
          ...t,
          id: `${s.n}.${index + 1}`,
        }))
        return { ...s, tasks: reindexedTasks }
      }
      return s
    })

    saveSections(updatedSections)
    if (editingTaskId === taskId) {
      setEditingTaskId(null)
      setEditingTaskData(null)
    }
  }

  const handleMoveTaskPriority = (index: number, direction: 'up' | 'down') => {
    const updatedTasks = [...section.tasks]
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= updatedTasks.length) return

    // Scambia i task
    const temp = updatedTasks[index]
    updatedTasks[index] = updatedTasks[targetIdx]
    updatedTasks[targetIdx] = temp

    // Riassegna gli ID progressivi
    const reindexedTasks = updatedTasks.map((t, idx) => ({
      ...t,
      id: `${section.n}.${idx + 1}`,
    }))

    const updatedSections = sections.map((s, idx) => {
      if (idx === active) {
        return { ...s, tasks: reindexedTasks }
      }
      return s
    })

    saveSections(updatedSections)
  }

  const handleMoveTaskToSection = (taskId: string, targetSectionN: number) => {
    const taskToMove = section.tasks.find((t) => t.id === taskId)
    if (!taskToMove) return

    const updatedSections = sections.map((s) => {
      if (s.n === section.n) {
        const filtered = s.tasks.filter((t) => t.id !== taskId)
        const reindexed = filtered.map((t, index) => ({
          ...t,
          id: `${s.n}.${index + 1}`,
        }))
        return { ...s, tasks: reindexed }
      }
      if (s.n === targetSectionN) {
        const newTaskList = [...s.tasks, taskToMove]
        const reindexed = newTaskList.map((t, index) => ({
          ...t,
          id: `${s.n}.${index + 1}`,
        }))
        return { ...s, tasks: reindexed }
      }
      return s
    })

    saveSections(updatedSections)
    setEditingTaskId(null)
  }

  // --- FUNZIONI DI GESTIONE SEZIONE ---

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSectionData.name.trim() || !newSectionData.short.trim()) return

    const newN = sections.length > 0 ? Math.max(...sections.map(s => s.n)) + 1 : 1
    const newSection: Section = {
      n: newN,
      name: newSectionData.name,
      short: newSectionData.short,
      intro: newSectionData.intro,
      tasks: [],
    }

    // Inserisci prima dell'archivio (se presente)
    const archiveIndex = sections.findIndex(s => s.archive)
    let updated: Section[] = []
    if (archiveIndex !== -1) {
      updated = [...sections]
      updated.splice(archiveIndex, 0, newSection)
    } else {
      updated = [...sections, newSection]
    }

    saveSections(updated)
    setIsAddingSection(false)
    setNewSectionData({ name: '', short: '', intro: '' })
    setActive(archiveIndex !== -1 ? archiveIndex : updated.length - 1)
  }

  // --- HELPER DI EDITING SUBTASK NEI FORM ---

  const addSubtaskToForm = (isNew: boolean) => {
    const emptySub: SubTask = { title: '', tags: ['front'] }
    if (isNew) {
      setNewTaskData(prev => ({ ...prev, subtasks: [...prev.subtasks, emptySub] }))
    } else if (editingTaskData) {
      setEditingTaskData(prev => prev ? ({ ...prev, subtasks: [...prev.subtasks, emptySub] }) : null)
    }
  }

  const updateSubtaskInForm = (isNew: boolean, subIndex: number, field: keyof SubTask, value: any) => {
    const updateFn = (prev: Task) => {
      const subs = [...prev.subtasks]
      subs[subIndex] = { ...subs[subIndex], [field]: value }
      return { ...prev, subtasks: subs }
    }

    if (isNew) {
      setNewTaskData(prev => updateFn(prev))
    } else if (editingTaskData) {
      setEditingTaskData(prev => prev ? updateFn(prev) : null)
    }
  }

  const removeSubtaskFromForm = (isNew: boolean, subIndex: number) => {
    const updateFn = (prev: Task) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, idx) => idx !== subIndex)
    })

    if (isNew) {
      setNewTaskData(prev => updateFn(prev))
    } else if (editingTaskData) {
      setEditingTaskData(prev => prev ? updateFn(prev) : null)
    }
  }

  return (
    <div className="dev-container">
      <style>{CUSTOM_STYLES}</style>

      {/* HEADER DELLA PAGINA */}
      <header className="dev-page-header">
        <div>
          <span className="dev-kicker">Pianificazione Strategica</span>
          <h1 className="dev-headline">Developer Cave</h1>
        </div>
      </header>

      <div className="dev-grid">
        {/* COLONNA SINISTRA: SIDEBAR */}
        <aside className="dev-sidebar">
          <span className="dev-sidebar-label">Sezioni Progetto</span>
          <nav className="dev-sidebar-nav">
            {sections.map((s, idx) => (
              <button
                key={s.n}
                type="button"
                className={`dev-sidebar-btn ${idx === active ? 'is-active' : ''} ${s.archive ? 'is-archive' : ''}`}
                onClick={() => {
                  setActive(idx)
                  setEditingTaskId(null)
                  setIsAddingTask(false)
                }}
              >
                <span className="dev-tab-n">{s.archive ? '✓' : s.n}</span>
                <span className="dev-tab-name">{s.short}</span>
                <span className="dev-tab-count">{s.tasks.length}</span>
              </button>
            ))}
          </nav>

          {!isAddingSection ? (
            <button
              type="button"
              className="secondary add-section-trigger"
              onClick={() => setIsAddingSection(true)}
            >
              + Aggiungi Sezione
            </button>
          ) : (
            <form onSubmit={handleAddSection} className="add-section-form">
              <h4>Nuova Sezione</h4>
              <input
                type="text"
                placeholder="Nome completo (es. Cloud Storage & Libreria)"
                required
                value={newSectionData.name}
                onChange={e => setNewSectionData(prev => ({ ...prev, name: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Titolo breve menu (es. Cloud & libreria)"
                required
                value={newSectionData.short}
                onChange={e => setNewSectionData(prev => ({ ...prev, short: e.target.value }))}
              />
              <textarea
                placeholder="Breve introduzione/obiettivo della sezione"
                rows={2}
                value={newSectionData.intro}
                onChange={e => setNewSectionData(prev => ({ ...prev, intro: e.target.value }))}
              />
              <div className="form-actions">
                <button type="submit" className="primary btn-sm">Salva</button>
                <button type="button" className="secondary btn-sm" onClick={() => setIsAddingSection(false)}>Annulla</button>
              </div>
            </form>
          )}
        </aside>

        {/* COLONNA DESTRA: CONTENUTO */}
        <section className="dev-content">
          <header className={`dev-section-heading ${section.archive ? 'is-archive' : ''}`}>
            <span className="section-number-kicker">{section.archive ? 'Archivio Storico' : `Sezione ${section.n}`}</span>
            <h2>{section.name}</h2>
            <p className="section-intro">{section.intro}</p>
          </header>

          {/* GRID DEI TASK (4:5 ASPECT RATIO) */}
          <div className="tasks-grid">
            {section.tasks.map((task, index) => {
              const isEditing = editingTaskId === task.id

              if (isEditing && editingTaskData) {
                return (
                  <form onSubmit={handleUpdateTask} className="task-form-card" key={task.id}>
                    <h3>Modifica Task {task.id}</h3>
                    
                    <label>
                      Titolo Task
                      <input
                        type="text"
                        required
                        value={editingTaskData.title}
                        onChange={e => setEditingTaskData(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                      />
                    </label>

                    <label>
                      Descrizione / Beneficio
                      <textarea
                        rows={3}
                        value={editingTaskData.benefit || ''}
                        onChange={e => setEditingTaskData(prev => prev ? ({ ...prev, benefit: e.target.value }) : null)}
                      />
                    </label>

                    <div className="subtasks-editor">
                      <div className="subtasks-editor-header">
                        <h4>Sub-task</h4>
                        <button type="button" className="secondary btn-xs" onClick={() => addSubtaskToForm(false)}>
                          + Aggiungi Sub-task
                        </button>
                      </div>

                      {editingTaskData.subtasks.map((sub, sIdx) => (
                        <div className="subtask-editor-row" key={sIdx}>
                          <div className="subtask-editor-top">
                            <input
                              type="text"
                              placeholder="Titolo sub-task"
                              required
                              value={sub.title}
                              onChange={e => updateSubtaskInForm(false, sIdx, 'title', e.target.value)}
                            />
                            
                            <select
                              value={sub.tags[0] || 'front'}
                              onChange={e => updateSubtaskInForm(false, sIdx, 'tags', [e.target.value as Tag])}
                            >
                              <option value="front">Front-end</option>
                              <option value="back">Back-end</option>
                              <option value="desktop">Desktop</option>
                            </select>

                            <button type="button" className="delete-sub-btn" onClick={() => removeSubtaskFromForm(false, sIdx)}>
                              &times;
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="primary btn-sm">Salva</button>
                      <button type="button" className="secondary btn-sm" onClick={() => { setEditingTaskId(null); setEditingTaskData(null); }}>
                        Annulla
                      </button>
                    </div>
                  </form>
                )
              }

              return (
                <article className="discovery-card poster-card" key={task.id}>
                  {/* BACKGROUND GRADIENT PER LE TASK */}
                  <div className="card-bg-wrap">
                    <div className="card-bg-placeholder" style={{ background: 'linear-gradient(135deg, #1b261f 0%, #070a08 100%)' }}>
                      <span className="placeholder-brand">Drops Task</span>
                    </div>
                    <div className="card-gradient-overlay" />
                  </div>

                  {/* CONTENUTO IN SOVRAPPOSIZIONE */}
                  <div className="card-poster-content">
                    <div className="card-top-row">
                      <span className="content-badge">Task {task.id}</span>
                      
                      <div className="task-order-buttons">
                        <button
                          type="button"
                          className="order-btn"
                          disabled={index === 0}
                          onClick={() => handleMoveTaskPriority(index, 'up')}
                          title="Sposta Su"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className="order-btn"
                          disabled={index === section.tasks.length - 1}
                          onClick={() => handleMoveTaskPriority(index, 'down')}
                          title="Sposta Giù"
                        >
                          ▼
                        </button>
                      </div>
                    </div>

                    <div className="card-bottom-content">
                      <h2 className="card-title">
                        {task.title}
                      </h2>
                      <p className="card-summary">
                        {task.benefit}
                      </p>

                      {/* SUBTASK STATICHE (NON COLLAPSIBILI) */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <ul className="task-subtasks-preview">
                          {task.subtasks.map((sub, sIdx) => (
                            <li key={sIdx} className="task-subtask-item">
                              <span className="bullet">•</span>
                              <span className="subtask-title-text">{sub.title}</span>
                              {sub.tags && sub.tags.length > 0 && (
                                <span className={`subtask-mini-tag tag-${sub.tags[0]}`}>{sub.tags[0]}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* PULSANTI DI AZIONE */}
                      <div className="card-actions">
                        <button
                          type="button"
                          className="card-read-btn"
                          style={{ padding: '6px 12px', fontSize: '11px', height: 'auto', background: 'var(--color-accent)' }}
                          onClick={() => {
                            setEditingTaskId(task.id)
                            setEditingTaskData({ ...task })
                          }}
                        >
                          Modifica
                        </button>
                        
                        <button
                          type="button"
                          className="card-source-link"
                          style={{ padding: '5px 10px', fontSize: '11px', background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          Elimina
                        </button>

                        <select
                          aria-label="Sposta sezione"
                          value={section.n}
                          onChange={e => handleMoveTaskToSection(task.id, parseInt(e.target.value))}
                          className="card-section-move-select"
                        >
                          <option value={section.n}>Sposta…</option>
                          {sections.map(s => s.n !== section.n && (
                            <option key={s.n} value={s.n}>{s.short}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {/* AGGIUNGI NUOVO TASK */}
          {!isAddingTask ? (
            <button
              type="button"
              className="primary add-task-trigger"
              onClick={() => setIsAddingTask(true)}
            >
              + Aggiungi Task a questa Sezione
            </button>
          ) : (
            <form onSubmit={handleAddTask} className="task-form-card">
              <h3>Aggiungi Nuovo Task</h3>

              <label>
                Titolo Task
                <input
                  type="text"
                  placeholder="Es. Sviluppo sistema di tagging"
                  required
                  value={newTaskData.title}
                  onChange={e => setNewTaskData(prev => ({ ...prev, title: e.target.value }))}
                />
              </label>

              <label>
                Descrizione / Beneficio
                <textarea
                  placeholder="Descrivi come questo task migliora concretamente l'esperienza dell'utente..."
                  rows={3}
                  value={newTaskData.benefit || ''}
                  onChange={e => setNewTaskData(prev => ({ ...prev, benefit: e.target.value }))}
                />
              </label>

              <div className="subtasks-editor">
                <div className="subtasks-editor-header">
                  <h4>Sub-task</h4>
                  <button type="button" className="secondary btn-xs" onClick={() => addSubtaskToForm(true)}>
                    + Aggiungi Sub-task
                  </button>
                </div>

                {newTaskData.subtasks.map((sub, sIdx) => (
                  <div className="subtask-editor-row" key={sIdx}>
                    <div className="subtask-editor-top">
                      <input
                        type="text"
                        placeholder="Titolo sub-task"
                        required
                        value={sub.title}
                        onChange={e => updateSubtaskInForm(true, sIdx, 'title', e.target.value)}
                      />
                      
                      <select
                        value={sub.tags[0] || 'front'}
                        onChange={e => updateSubtaskInForm(true, sIdx, 'tags', [e.target.value as Tag])}
                      >
                        <option value="front">Front-end</option>
                        <option value="back">Back-end</option>
                        <option value="desktop">Desktop</option>
                      </select>

                      <button type="button" className="delete-sub-btn" onClick={() => removeSubtaskFromForm(true, sIdx)}>
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button type="submit" className="primary btn-sm">Crea Task</button>
                <button type="button" className="secondary btn-sm" onClick={() => setIsAddingTask(false)}>
                  Annulla
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}

const CUSTOM_STYLES = `
.dev-container {
  max-width: 1208px;
  margin: 0 auto;
  padding: 1.5rem clamp(14px, 3vw, 24px) 4rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: var(--color-text, #151815);
}

.dev-page-header {
  border-bottom: 1px solid var(--color-border, #dce1dc);
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
}

.dev-kicker {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-accent-strong, #15803d);
  margin-bottom: 0.4rem;
}

.dev-headline {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 900;
  margin: 0;
  letter-spacing: -0.03em;
  color: var(--color-text, #151815);
}

/* LAYOUT GRID */
.dev-grid {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: clamp(1.5rem, 3.5vw, 3rem);
  align-items: start;
}

/* SIDEBAR RAIL */
.dev-sidebar {
  position: sticky;
  top: 90px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dev-sidebar-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted, #626862);
  margin-bottom: 0.2rem;
}

.dev-sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dev-sidebar-btn {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--color-text-muted, #626862);
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dev-sidebar-btn:hover {
  background: var(--color-surface-subtle, #f2f4f1);
  color: var(--color-text, #151815);
}

.dev-sidebar-btn.is-active {
  background: var(--color-accent-soft, #dcfce7);
  border-color: rgba(34, 197, 94, 0.22);
  color: var(--color-accent-strong, #15803d);
  font-weight: 800;
}

.dev-sidebar-btn .dev-tab-n {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--color-surface-subtle, #f2f4f1);
  color: var(--color-text-muted, #626862);
  font-size: 0.75rem;
  font-weight: 700;
}

.dev-sidebar-btn.is-active .dev-tab-n {
  background: var(--color-accent, #22c55e);
  color: #05230f;
}

.dev-sidebar-btn .dev-tab-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dev-sidebar-btn .dev-tab-count {
  font-size: 0.75rem;
  opacity: 0.75;
}

.dev-sidebar-btn.is-archive {
  margin-top: 10px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border, #dce1dc);
  border-radius: 0 0 10px 10px;
}

.add-section-trigger {
  width: 100%;
  font-size: 0.8rem;
  padding: 8px;
  margin-top: 8px;
  border-style: dashed;
}

.add-section-form {
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #dce1dc);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-section-form h4 {
  margin: 0 0 4px;
  font-size: 0.85rem;
  font-weight: 800;
}

.add-section-form input, .add-section-form textarea {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--color-border-strong, #c8cec8);
  border-radius: 6px;
  font-size: 0.8rem;
}

.add-section-form input {
  height: 34px;
}

/* CONTENT CONTAINER */
.dev-content {
  min-width: 0;
}

.dev-section-heading {
  margin-bottom: 2rem;
}

.section-number-kicker {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--color-accent-strong, #15803d);
  letter-spacing: 0.08em;
}

.dev-section-heading.is-archive .section-number-kicker {
  color: var(--color-text-muted, #626862);
}

.dev-section-heading h2 {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0.3rem 0 0.8rem;
  letter-spacing: -0.02em;
}

.section-intro {
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text-muted, #626862);
  max-width: 70ch;
}

/* TASKS GRID */
.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 20px;
  margin-bottom: 2.5rem;
}

/* CUSTOM TOP ROW STUFF */
.task-order-buttons {
  display: flex;
  gap: 4px;
}

.order-btn {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #edf3ee;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 8px;
  cursor: pointer;
  display: grid;
  place-items: center;
  padding: 0;
}

.order-btn:hover:not(:disabled) {
  background: var(--color-accent, #22c55e);
  color: #05230f;
  border-color: var(--color-accent);
}

.order-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* STATIC SUBTASKS PREVIEW INSIDE 4:5 CARD */
.task-subtasks-preview {
  list-style: none;
  margin: 0 0 12px 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 110px;
  overflow-y: auto;
  border-top: 1px dashed rgba(255,255,255,0.08);
  padding-top: 10px;
}

.task-subtask-item {
  font-size: 0.76rem;
  color: #a1a1aa;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  line-height: 1.35;
}

.task-subtask-item .bullet {
  color: var(--color-accent, #22c55e);
}

.task-subtask-item .subtask-title-text {
  flex: 1;
  min-width: 0;
}

.subtask-mini-tag {
  font-size: 8px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid;
  flex-shrink: 0;
  margin-left: 4px;
}

.subtask-mini-tag.tag-front {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  border-color: rgba(56, 189, 248, 0.3);
}

.subtask-mini-tag.tag-back {
  color: #a78bfa;
  background: rgba(167, 139, 250, 0.1);
  border-color: rgba(167, 139, 250, 0.3);
}

.subtask-mini-tag.tag-desktop {
  color: #f5a742;
  background: rgba(245, 167, 66, 0.1);
  border-color: rgba(245, 167, 66, 0.3);
}

/* CUSTOM FORM IN THE GRID CELL (FLEXIBLE HEIGHT) */
.task-form-card {
  background: var(--color-surface, #ffffff);
  border: 1.5px solid var(--color-border-strong, #c8cec8);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-form-card h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
}

.task-form-card label {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--color-text-muted, #626862);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-form-card input, .task-form-card textarea, .task-form-card select {
  width: 100%;
  margin-top: 4px;
  border: 1px solid var(--color-border-strong, #c8cec8);
  border-radius: 8px;
  padding: 8px 10px;
  font-family: inherit;
  font-size: 0.88rem;
  color: var(--color-text, #151815);
  background: var(--color-surface, #ffffff);
}

.task-form-card textarea {
  resize: vertical;
}

.subtasks-editor {
  border-top: 1px solid var(--color-border, #dce1dc);
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.subtasks-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subtasks-editor-header h4 {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 800;
}

.subtask-editor-row {
  border: 1px solid var(--color-border, #dce1dc);
  background: var(--color-surface-subtle, #f2f4f1);
  border-radius: 8px;
  padding: 8px;
}

.subtask-editor-top {
  display: grid;
  grid-template-columns: 1fr 90px 24px;
  gap: 6px;
  align-items: center;
}

.subtask-editor-top input {
  margin-top: 0;
  height: 30px;
  padding: 4px 8px;
  font-size: 0.8rem;
}

.subtask-editor-top select {
  margin-top: 0;
  height: 30px;
  padding: 4px 8px;
  font-size: 0.8rem;
}

.delete-sub-btn {
  background: var(--color-danger-soft, #fef3f2);
  border: 1px solid var(--color-danger, #b42318);
  color: var(--color-danger, #b42318);
  width: 24px;
  height: 30px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: grid;
  place-items: center;
  padding: 0;
}

.card-section-move-select {
  padding: 5px 8px;
  font-size: 11px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #edf3ee;
  max-width: 100px;
  cursor: pointer;
}

.card-section-move-select:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.card-section-move-select option {
  background: #111613;
  color: #edf3ee;
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.btn-sm {
  min-height: 36px !important;
  height: 36px !important;
  font-size: 0.8rem !important;
  padding: 0 12px !important;
  border-radius: 8px !important;
}

.btn-xs {
  height: 24px !important;
  font-size: 0.72rem !important;
  padding: 0 8px !important;
  border-radius: 6px !important;
}

/* ADD TASK TRIGGER */
.add-task-trigger {
  width: 100%;
  height: 48px;
  border-style: dashed;
  border-width: 1.5px;
  font-weight: 800;
  font-size: 0.9rem;
}

/* RESPONSIVE LAYOUT */
@media (max-width: 900px) {
  .dev-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .dev-sidebar {
    position: static;
  }
  .dev-sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 6px;
  }
  .dev-sidebar-btn {
    white-space: nowrap;
    grid-template-columns: auto auto;
    width: auto;
  }
  .dev-sidebar-btn .dev-tab-count {
    display: none;
  }
  .dev-sidebar-btn.is-archive {
    margin-top: 0;
    padding-top: 10px;
    border-top: 0;
  }
}
`;
