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
  status?: 'todo' | 'completed' | 'paused'
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
        status: 'completed',
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
          'Salva sul dispositivo o nel cloud qualsiasi singola traccia da YouTube o SoundCloud scegliendo la qualità desiderata (MP3 320 kbps vs HQ Master Pesante) e organizzandola in cartelle.',
        status: 'completed',
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
          'Vedi la lista completa delle tracce di una playlist (YT, Spotify o SoundCloud) nella modale bianca ad alta densità con ricerca e durata prima di inviarla alla coda.',
        status: 'completed',
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
          'Libreria in stile Apple Music con caricamento Drag & Drop di intere cartelle dal desktop, sidebar di navigazione, rinomina inline istantanea ed esportazione M3U Rekordbox.',
        status: 'completed',
        subtasks: [
          {
            title: 'Configurazione storage personale (Cloudflare R2 + Supabase)',
            tags: ['back', 'front'],
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
          'Ascolta in streaming la musica salvata nel tuo archivio cloud privato direttamente dal browser, con hover play sui brani e mini-player globale.',
        status: 'completed',
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
          'Collega il tuo account Spotify e importa in Drops i brani "Mi Piace" con metadati arricchiti da Discogs e stima del BPM.',
        status: 'completed',
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
        title: 'Importazione automatica da SoundCloud e YouTube',
        benefit:
          'Tieni traccia dei brani e set a cui metti "Like" su SoundCloud e YouTube e importali nel Crate per il DJ Lab.',
        status: 'completed',
        subtasks: [
          {
            title: 'Risoluzione multi-sorgente e Crate Sync',
            tags: ['front', 'back'],
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
          "Impara mixaggio e produzione in un'area riservata organizzata in 4 moduli didattici, 12 video-lezioni, pannelli a scroll interno e accordion esclusivo.",
        status: 'completed',
        subtasks: [
          {
            title: "Struttura dell'area didattica e hosting video con layout compatto",
            tags: ['front', 'back'],
          },
        ],
      },
      {
        id: '5.2',
        title: 'Mappa interattiva delle scuole di musica e cabine DJ partner',
        benefit:
          'Trova accademie musicali, sale prove, studi di registrazione e cabine DJ a noleggio (Roma, Milano, Berlino, Londra) su una directory geografica interattiva.',
        status: 'completed',
        subtasks: [
          {
            title: "Integrazione della directory partner con filtri città e attrezzatura",
            tags: ['front'],
          },
        ],
      },
      {
        id: '5.3',
        title: 'DJ Lab Dual-Deck con Pitch Control continuo e Beatmatching',
        benefit:
          "Esercitati sul beatmatching direttamente dal browser con un player dual-deck dotato di Pitch Slider continuo (±8%, step 0.05%), EQ a 3 bande e routing Master/Cue.",
        status: 'completed',
        subtasks: [
          {
            title: 'Motore audio Web Audio API con pitch continuo e cue routing via setSinkId',
            tags: ['front'],
          },
        ],
      },
      {
        id: '5.4',
        title: 'Gamification Producer, Livelli XP e Badge Verified ✓',
        benefit:
          'Scala i 4 livelli producer da Bedroom a Breakthrough, accumula XP con regole anti-spam e gestisci profilo/generi da Producer Settings.',
        status: 'paused',
        subtasks: [
          {
            title: 'Gestione profilo, generi (max 4) e anteprima badge reattiva',
            tags: ['front'],
          },
          {
            title: 'Backend profilo/social cloud: in attesa di selezione piattaforme definitive',
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
        title: 'Motore "Drops Suggest" e grafo di etichette, party e artisti',
        benefit:
          'Esplora le connessioni tra etichette di nicchia, party underground e DJ con grafo SVG interattivo e drawer laterale di raccomandazione.',
        status: 'completed',
        subtasks: [
          {
            title: 'Visualizzazione del grafo relazionale BrainGraph e drawer Suggest',
            tags: ['front'],
          },
        ],
      },
      {
        id: '6.2',
        title: 'Guide editoriali pratiche per il settore musicale',
        benefit:
          'Leggi guide super-sintetiche su come pubblicare la tua musica, stampare in vinile nel 2026, codici ISRC/UPC e borderò SIAE.',
        status: 'completed',
        subtasks: [
          {
            title: '8 guide editoriali complete con metadati SEO e rendering Astro',
            tags: ['front'],
          },
        ],
      },
      {
        id: '6.3',
        title: 'Sistema di ricerca e applicazione foto degli articoli',
        benefit:
          "Progettare un sistema che ricerca e applica la foto di copertina ideale agli articoli tramite selezione visiva convalidata.",
        status: 'todo',
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
          "Scopri all'istante il BPM esatto delle tracce caricate grazie al calcolo asincrono onset/tempo sul backend.",
        status: 'completed',
        subtasks: [
          {
            title: 'Endpoint asincrono /api/v1/academy/submissions/{id}/analyze-bpm',
            tags: ['back', 'front'],
          },
        ],
      },
      {
        id: '7.2',
        title: 'Editor tag ID3 ed esportazione per DJ hardware (Rekordbox)',
        benefit:
          'Correggi i tag ID3 dei brani (artista, titolo, copertina, BPM, Camelot Key) ed esporta le tracce ordinate in cartelle per chiavetta USB Rekordbox.',
        status: 'completed',
        subtasks: [
          {
            title: 'RekordboxExporter.tsx con form ID3 v2.4, formattazione cartelle e pacchetto USB',
            tags: ['front', 'desktop'],
          },
        ],
      },
    ],
  },
]

const LOCAL_STORAGE_KEY = 'drops.developer.roadmap.v8'

export default function DeveloperRoadmap() {
  const [sections, setSections] = useState<Section[]>([])
  const [active, setActive] = useState(0)
  
  // Accordion per sezioni e singoli task
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set())
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set())

  // Stati di Editing & Form
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTaskData, setEditingTaskData] = useState<Task | null>(null)
  const [addingTaskSectionN, setAddingTaskSectionN] = useState<number | null>(null)
  const [newTaskData, setNewTaskData] = useState<Task>({ id: '', title: '', benefit: '', subtasks: [] })
  const [isAddingSection, setIsAddingSection] = useState(false)
  const [newSectionData, setNewSectionData] = useState({ name: '', short: '', intro: '' })

  // Caricamento dei dati salvati o di default
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      let initialSections: Section[] = stored ? JSON.parse(stored) : DEFAULT_SECTIONS
      initialSections = initialSections.filter((s) => s.n !== 8)
      setSections(initialSections)

      // Trova la prima sezione che ha task non completati (in corso o da fare)
      const inProgressIndex = initialSections.findIndex((s) =>
        s.tasks.some((t) => t.status !== 'completed')
      )
      const activeSectionN = inProgressIndex !== -1 ? initialSections[inProgressIndex].n : initialSections[0]?.n

      // Chiudi per default tutte le sezioni tranne quella attiva
      const closedSecNumbers = initialSections
        .filter((s) => s.n !== activeSectionN)
        .map((s) => s.n)
      setCollapsedSections(new Set(closedSecNumbers))

      // Chiudi per default TUTTI i singoli task di ogni sezione
      const allTaskIds = initialSections.flatMap((s) => s.tasks.map((t) => t.id))
      setCollapsedTasks(new Set(allTaskIds))
    } catch {
      setSections(DEFAULT_SECTIONS)
      const allTaskIds = DEFAULT_SECTIONS.flatMap((s) => s.tasks.map((t) => t.id))
      setCollapsedTasks(new Set(allTaskIds))
    }
  }, [])

  // Scroll Spy per aggiornare la sidebar attiva durante lo scorrimento
  useEffect(() => {
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionN = Number(entry.target.getAttribute('data-section-n'))
            const foundIdx = sections.findIndex((s) => s.n === sectionN)
            if (foundIdx !== -1) {
              setActive(foundIdx)
            }
          }
        })
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0.1 }
    )

    const sectionElements = document.querySelectorAll('.dev-section-anchor')
    sectionElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [sections])

  // Salvataggio dei dati in localStorage
  const saveSections = (newSections: Section[]) => {
    setSections(newSections)
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSections))
    } catch (e) {
      console.error('Impossibile salvare in localStorage', e)
    }
  }

  const toggleSection = (n: number) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      return next
    })
  }

  const toggleTask = (id: string) => {
    setCollapsedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => {
    setCollapsedSections(new Set())
    setCollapsedTasks(new Set())
  }

  const collapseAll = () => {
    setCollapsedSections(new Set(sections.map((s) => s.n)))
  }

  const scrollToSection = (n: number, idx: number) => {
    setActive(idx)
    const el = document.getElementById(`dev-section-${n}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (sections.length === 0) return <div style={{ padding: '40px', textAlign: 'center' }}>Caricamento Roadmap…</div>

  // --- FUNZIONI DI GESTIONE TASK ---

  const handleAddTask = (e: React.FormEvent, sectionN: number) => {
    e.preventDefault()
    if (!newTaskData.title.trim()) return

    const targetSec = sections.find((s) => s.n === sectionN)
    if (!targetSec) return

    const taskNum = targetSec.tasks.length + 1
    const generatedId = `${sectionN}.${taskNum}`
    const finalTask: Task = {
      ...newTaskData,
      id: generatedId,
    }

    const updatedSections = sections.map((s) => {
      if (s.n === sectionN) {
        return { ...s, tasks: [...s.tasks, finalTask] }
      }
      return s
    })

    saveSections(updatedSections)
    setAddingTaskSectionN(null)
    setNewTaskData({ id: '', title: '', benefit: '', subtasks: [] })
  }

  const handleUpdateTask = (e: React.FormEvent, sectionN: number) => {
    e.preventDefault()
    if (!editingTaskData || !editingTaskData.title.trim()) return

    const updatedSections = sections.map((s) => {
      if (s.n === sectionN) {
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

  const handleDeleteTask = (taskId: string, sectionN: number) => {
    if (!window.confirm(`Sei sicuro di voler eliminare il task ${taskId}?`)) return

    const updatedSections = sections.map((s) => {
      if (s.n === sectionN) {
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

  const handleMoveTaskPriority = (sectionN: number, index: number, direction: 'up' | 'down') => {
    const sec = sections.find((s) => s.n === sectionN)
    if (!sec) return

    const updatedTasks = [...sec.tasks]
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= updatedTasks.length) return

    const temp = updatedTasks[index]
    updatedTasks[index] = updatedTasks[targetIdx]
    updatedTasks[targetIdx] = temp

    const reindexedTasks = updatedTasks.map((t, idx) => ({
      ...t,
      id: `${sec.n}.${idx + 1}`,
    }))

    const updatedSections = sections.map((s) => {
      if (s.n === sectionN) {
        return { ...s, tasks: reindexedTasks }
      }
      return s
    })

    saveSections(updatedSections)
  }

  const handleMoveTaskToSection = (taskId: string, currentSectionN: number, targetSectionN: number) => {
    const currentSec = sections.find((s) => s.n === currentSectionN)
    if (!currentSec) return
    const taskToMove = currentSec.tasks.find((t) => t.id === taskId)
    if (!taskToMove) return

    const updatedSections = sections.map((s) => {
      if (s.n === currentSectionN) {
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
  }

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

      {/* HEADER DELLA PAGINA CON CONTROLLI GLOBALI */}
      <header className="dev-page-header">
        <div className="dev-header-left">
          <span className="dev-kicker">Pianificazione Strategica</span>
          <h1 className="dev-headline">Developer Cave</h1>
          <p className="dev-header-sub">
            Flusso continuo di sviluppo: visualizza, espandi e gestisci le macro sezioni e i task tecnici di Drops.
          </p>
        </div>
        <div className="dev-header-actions">
          <button type="button" className="secondary btn-sm" onClick={expandAll}>
            Espandi Tutte
          </button>
          <button type="button" className="secondary btn-sm" onClick={collapseAll}>
            Riduci Tutte
          </button>
        </div>
      </header>

      <div className="dev-grid">
        {/* COLONNA SINISTRA: SIDEBAR STICKY CON SPY SCROLL */}
        <aside className="dev-sidebar">
          <span className="dev-sidebar-label">Sezioni Progetto</span>
          <nav className="dev-sidebar-nav">
            {sections.map((s, idx) => {
              const allDone = s.tasks.length > 0 && s.tasks.every(t => t.status === 'completed')
              return (
                <button
                  key={s.n}
                  type="button"
                  className={`dev-sidebar-btn ${idx === active ? 'is-active' : ''} ${s.archive ? 'is-archive' : ''}`}
                  onClick={() => scrollToSection(s.n, idx)}
                >
                  <span className={`dev-tab-n ${allDone ? 'is-done' : ''}`}>
                    {s.archive ? '✓' : allDone ? '✓' : s.n}
                  </span>
                  <span className="dev-tab-name">{s.short}</span>
                  <span className="dev-tab-count">{s.tasks.length}</span>
                </button>
              )
            })}
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
                placeholder="Nome completo (es. Cloud Storage)"
                required
                value={newSectionData.name}
                onChange={e => setNewSectionData(prev => ({ ...prev, name: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Titolo breve menu (es. Cloud)"
                required
                value={newSectionData.short}
                onChange={e => setNewSectionData(prev => ({ ...prev, short: e.target.value }))}
              />
              <textarea
                placeholder="Breve introduzione"
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

        {/* COLONNA DESTRA: CONTENUTO A SCORRIMENTO CONTINUO */}
        <div className="dev-content-feed">
          {sections.map((sec) => {
            const isCollapsed = collapsedSections.has(sec.n)
            const completedCount = sec.tasks.filter((t) => t.status === 'completed').length
            const isAllCompleted = sec.tasks.length > 0 && completedCount === sec.tasks.length

            return (
              <section
                key={sec.n}
                id={`dev-section-${sec.n}`}
                data-section-n={sec.n}
                className={`dev-section-card dev-section-anchor ${sec.archive ? 'is-archive' : ''} ${isAllCompleted ? 'is-completed-section' : ''}`}
              >
                {/* SECTION HEADER WITH ACCORDION TRIGGER */}
                <header className="dev-section-card-header" onClick={() => toggleSection(sec.n)}>
                  <div className="sec-header-left">
                    <div className="sec-badges-row">
                      <span className="section-number-kicker">
                        {sec.archive ? 'Archivio Storico' : `Sezione ${sec.n}`}
                      </span>
                      {isAllCompleted && (
                        <span className="sec-completed-badge">
                          ✓ {completedCount}/{sec.tasks.length} COMPLETATI
                        </span>
                      )}
                      {!isAllCompleted && sec.tasks.length > 0 && (
                        <span className="sec-progress-badge">
                          {completedCount}/{sec.tasks.length} completati
                        </span>
                      )}
                    </div>
                    <h2>{sec.name}</h2>
                    <p className="section-intro">{sec.intro}</p>
                  </div>
                  <div className="sec-header-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="btn-sort-pill btn-toggle-sec"
                      onClick={() => toggleSection(sec.n)}
                      aria-expanded={!isCollapsed}
                    >
                      {isCollapsed ? '▼ Espandi' : '▲ Riduci'}
                    </button>
                  </div>
                </header>

                {/* SECTION BODY (COLLAPSIBLE) */}
                {!isCollapsed && (
                  <div className="dev-section-body">
                    {/* TASKS LIST / GRID */}
                    <div className="tasks-grid">
                      {sec.tasks.map((task, index) => {
                        const isEditing = editingTaskId === task.id
                        const isTaskCollapsed = collapsedTasks.has(task.id)

                        if (isEditing && editingTaskData) {
                          return (
                            <form
                              onSubmit={(e) => handleUpdateTask(e, sec.n)}
                              className="task-form-card"
                              key={task.id}
                            >
                              <h3>Modifica Task {task.id}</h3>

                              <label>
                                Titolo Task
                                <input
                                  type="text"
                                  required
                                  value={editingTaskData.title}
                                  onChange={(e) =>
                                    setEditingTaskData((prev) => (prev ? { ...prev, title: e.target.value } : null))
                                  }
                                />
                              </label>

                              <label>
                                Descrizione / Beneficio
                                <textarea
                                  rows={3}
                                  value={editingTaskData.benefit || ''}
                                  onChange={(e) =>
                                    setEditingTaskData((prev) => (prev ? { ...prev, benefit: e.target.value } : null))
                                  }
                                />
                              </label>

                              <div className="subtasks-editor">
                                <div className="subtasks-editor-header">
                                  <h4>Sub-task</h4>
                                  <button
                                    type="button"
                                    className="secondary btn-xs"
                                    onClick={() => addSubtaskToForm(false)}
                                  >
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
                                        onChange={(e) =>
                                          updateSubtaskInForm(false, sIdx, 'title', e.target.value)
                                        }
                                      />

                                      <select
                                        value={sub.tags[0] || 'front'}
                                        onChange={(e) =>
                                          updateSubtaskInForm(false, sIdx, 'tags', [e.target.value as Tag])
                                        }
                                      >
                                        <option value="front">Front-end</option>
                                        <option value="back">Back-end</option>
                                        <option value="desktop">Desktop</option>
                                      </select>

                                      <button
                                        type="button"
                                        className="delete-sub-btn"
                                        onClick={() => removeSubtaskFromForm(false, sIdx)}
                                      >
                                        &times;
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="form-actions">
                                <button type="submit" className="primary btn-sm">
                                  Salva Modifiche
                                </button>
                                <button
                                  type="button"
                                  className="secondary btn-sm"
                                  onClick={() => {
                                    setEditingTaskId(null)
                                    setEditingTaskData(null)
                                  }}
                                >
                                  Annulla
                                </button>
                              </div>
                            </form>
                          )
                        }

                        if (isTaskCollapsed) {
                          return (
                            <article
                              key={task.id}
                              className={`dev-task-card is-collapsed ${task.status === 'completed' ? 'is-task-completed' : ''}`}
                              onClick={() => toggleTask(task.id)}
                            >
                              <div className="task-collapsed-row">
                                <div className="task-collapsed-left">
                                  <span className="task-id-badge">Task {task.id}</span>
                                  <span className="task-collapsed-title">{task.title}</span>
                                </div>
                                <div className="task-status-and-collapse" onClick={(e) => e.stopPropagation()}>
                                  <span className={`task-status-pill status-${task.status}`}>
                                    {task.status === 'completed' ? '✓ Completato' : task.status === 'paused' ? 'In Pausa' : 'In Corso / Da Fare'}
                                  </span>
                                  <button
                                    type="button"
                                    className="task-toggle-btn"
                                    onClick={() => toggleTask(task.id)}
                                    title="Espandi dettagli"
                                    aria-expanded="false"
                                  >
                                    ▼
                                  </button>
                                </div>
                              </div>
                            </article>
                          )
                        }

                        return (
                          <article
                            key={task.id}
                            className={`dev-task-card is-expanded ${task.status === 'completed' ? 'is-task-completed' : ''}`}
                          >
                            {/* TASK TOP ROW */}
                            <div className="task-top-row">
                              <div className="task-id-badge">Task {task.id}</div>
                              <div className="task-status-and-collapse">
                                <span className={`task-status-pill status-${task.status}`}>
                                  {task.status === 'completed' ? '✓ Completato' : task.status === 'paused' ? 'In Pausa' : 'In Corso / Da Fare'}
                                </span>
                                <button
                                  type="button"
                                  className="task-toggle-btn"
                                  onClick={() => toggleTask(task.id)}
                                  title="Riduci dettagli"
                                  aria-expanded="true"
                                >
                                  ▲
                                </button>
                              </div>
                            </div>

                            <h3 className="task-title" onClick={() => toggleTask(task.id)}>
                              {task.title}
                            </h3>

                            <div className="task-expanded-content">
                              {task.benefit && <p className="task-benefit">{task.benefit}</p>}

                              {task.subtasks.length > 0 && (
                                <div className="task-subtasks-section">
                                  <span className="subtasks-label">Attività &amp; Dettagli Tecnici</span>
                                  <ul className="subtasks-list">
                                    {task.subtasks.map((sub, sIdx) => (
                                      <li key={sIdx} className="subtask-item">
                                        <div className="subtask-tags">
                                          {sub.tags.map((tag) => (
                                            <span key={tag} className={`tag-badge tag-${tag}`}>
                                              [{tag}]
                                            </span>
                                          ))}
                                        </div>
                                        <span className="subtask-text">{sub.title}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {/* TASK ACTION BAR */}
                            <div className="task-card-footer">
                              <div className="task-crud-actions">
                                <button
                                  type="button"
                                  className="secondary btn-xs"
                                  onClick={() => {
                                    setEditingTaskId(task.id)
                                    setEditingTaskData(JSON.parse(JSON.stringify(task)))
                                  }}
                                >
                                  Modifica
                                </button>
                                <button
                                  type="button"
                                  className="btn-danger btn-xs"
                                  onClick={() => handleDeleteTask(task.id, sec.n)}
                                >
                                  Elimina
                                </button>
                              </div>

                              <div className="task-reorder-actions">
                                <button
                                  type="button"
                                  className="secondary btn-xs"
                                  disabled={index === 0}
                                  onClick={() => handleMoveTaskPriority(sec.n, index, 'up')}
                                  title="Aumenta priorità"
                                >
                                  &uarr;
                                </button>
                                <button
                                  type="button"
                                  className="secondary btn-xs"
                                  disabled={index === sec.tasks.length - 1}
                                  onClick={() => handleMoveTaskPriority(sec.n, index, 'down')}
                                  title="Diminuisci priorità"
                                >
                                  &darr;
                                </button>
                              </div>

                              <select
                                className="move-section-select"
                                value={sec.n}
                                onChange={(e) =>
                                  handleMoveTaskToSection(task.id, sec.n, Number(e.target.value))
                                }
                                title="Sposta in un'altra sezione"
                              >
                                <option disabled value={sec.n}>
                                  Sposta in...
                                </option>
                                {sections.map((s) => (
                                  <option key={s.n} value={s.n}>
                                    {s.short}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </article>
                        )
                      })}
                    </div>

                    {/* AGGIUNGI NUOVO TASK IN QUESTA SEZIONE */}
                    {addingTaskSectionN !== sec.n ? (
                      <button
                        type="button"
                        className="secondary add-task-trigger"
                        onClick={() => setAddingTaskSectionN(sec.n)}
                      >
                        + Aggiungi Task a {sec.short}
                      </button>
                    ) : (
                      <form onSubmit={(e) => handleAddTask(e, sec.n)} className="task-form-card">
                        <h3>Aggiungi Nuovo Task a {sec.name}</h3>

                        <label>
                          Titolo Task
                          <input
                            type="text"
                            placeholder="Es. Sviluppo sistema di tagging"
                            required
                            value={newTaskData.title}
                            onChange={(e) =>
                              setNewTaskData((prev) => ({ ...prev, title: e.target.value }))
                            }
                          />
                        </label>

                        <label>
                          Descrizione / Beneficio
                          <textarea
                            placeholder="Descrivi il beneficio per l'utente..."
                            rows={3}
                            value={newTaskData.benefit || ''}
                            onChange={(e) =>
                              setNewTaskData((prev) => ({ ...prev, benefit: e.target.value }))
                            }
                          />
                        </label>

                        <div className="subtasks-editor">
                          <div className="subtasks-editor-header">
                            <h4>Sub-task</h4>
                            <button
                              type="button"
                              className="secondary btn-xs"
                              onClick={() => addSubtaskToForm(true)}
                            >
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
                                  onChange={(e) =>
                                    updateSubtaskInForm(true, sIdx, 'title', e.target.value)
                                  }
                                />

                                <select
                                  value={sub.tags[0] || 'front'}
                                  onChange={(e) =>
                                    updateSubtaskInForm(true, sIdx, 'tags', [e.target.value as Tag])
                                  }
                                >
                                  <option value="front">Front-end</option>
                                  <option value="back">Back-end</option>
                                  <option value="desktop">Desktop</option>
                                </select>

                                <button
                                  type="button"
                                  className="delete-sub-btn"
                                  onClick={() => removeSubtaskFromForm(true, sIdx)}
                                >
                                  &times;
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="form-actions">
                          <button type="submit" className="primary btn-sm">
                            Crea Task
                          </button>
                          <button
                            type="button"
                            className="secondary btn-sm"
                            onClick={() => setAddingTaskSectionN(null)}
                          >
                            Annulla
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const CUSTOM_STYLES = `
.dev-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 1.5rem clamp(14px, 3vw, 28px) 6rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: var(--color-text, #ffffff);
}

.dev-page-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  flex-wrap: wrap;
}

.dev-header-left {
  flex: 1;
  min-width: 280px;
}

.dev-kicker {
  display: inline-block;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #22c55e;
  margin-bottom: 0.4rem;
}

.dev-headline {
  font-size: clamp(2rem, 3.2vw, 2.8rem);
  font-weight: 900;
  margin: 0 0 6px;
  letter-spacing: -0.04em;
  color: #ffffff;
}

.dev-header-sub {
  margin: 0;
  font-size: 0.92rem;
  color: #9ca3af;
  max-width: 65ch;
  line-height: 1.5;
}

.dev-header-actions {
  display: flex;
  gap: 8px;
}

/* LAYOUT GRID */
.dev-grid {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 32px;
  align-items: start;
}

/* SIDEBAR RAIL */
.dev-sidebar {
  position: sticky;
  top: 80px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #0b0f0c;
  border: 1px solid #1c2a1e;
  border-radius: 18px;
  padding: 16px;
}

.dev-sidebar-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  margin-bottom: 4px;
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
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: #9ca3af;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 650;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dev-sidebar-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.dev-sidebar-btn.is-active {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.35);
  color: #86efac;
  font-weight: 800;
}

.dev-sidebar-btn .dev-tab-n {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #141e16;
  border: 1px solid #233827;
  color: #9ca3af;
  font-size: 0.72rem;
  font-weight: 800;
}

.dev-sidebar-btn .dev-tab-n.is-done {
  background: #22c55e;
  border-color: #22c55e;
  color: #05230f;
}

.dev-sidebar-btn.is-active .dev-tab-n {
  border-color: #22c55e;
  color: #86efac;
}
.dev-sidebar-btn.is-active .dev-tab-n.is-done {
  background: #22c55e;
  color: #05230f;
}

.dev-sidebar-btn .dev-tab-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dev-sidebar-btn .dev-tab-count {
  font-size: 0.72rem;
  color: #6b7280;
  font-family: monospace;
}

.dev-sidebar-btn.is-archive {
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid #1c2a1e;
}

.add-section-trigger {
  width: 100%;
  font-size: 0.8rem;
  padding: 8px;
  margin-top: 4px;
  border-style: dashed;
}

.add-section-form {
  background: #111813;
  border: 1px solid #233827;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-section-form h4 {
  margin: 0 0 2px;
  font-size: 0.85rem;
  font-weight: 800;
  color: #ffffff;
}

.add-section-form input, .add-section-form textarea {
  width: 100%;
  padding: 6px 10px;
  background: #0a0e0b;
  border: 1px solid #1c2a1e;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #ffffff;
}
.add-section-form input:focus, .add-section-form textarea:focus {
  border-color: #22c55e;
  outline: none;
}

/* FEED A SCORRIMENTO CONTINUO */
.dev-content-feed {
  display: flex;
  flex-direction: column;
  gap: 28px;
  min-width: 0;
}

.dev-section-card {
  background: #0b0f0c;
  border: 1px solid #1c2a1e;
  border-radius: 18px;
  padding: 22px 24px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  scroll-margin-top: 80px;
}

.dev-section-card.is-completed-section {
  border-color: rgba(34, 197, 94, 0.35);
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.05);
}

.dev-section-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  cursor: pointer;
  user-select: none;
}

.sec-header-left {
  flex: 1;
  min-width: 0;
}

.sec-badges-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.section-number-kicker {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #22c55e;
  letter-spacing: 0.08em;
}

.sec-completed-badge {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.18);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #86efac;
}

.sec-progress-badge {
  font-size: 0.68rem;
  font-weight: 750;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: #9ca3af;
}

.dev-section-card-header h2 {
  font-size: 1.4rem;
  font-weight: 850;
  color: #ffffff;
  margin: 0 0 6px;
  letter-spacing: -0.02em;
}

.section-intro {
  margin: 0;
  font-size: 0.88rem;
  color: #9ca3af;
  line-height: 1.5;
  max-width: 75ch;
}

.btn-toggle-sec {
  flex-shrink: 0;
}

.dev-section-body {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid #152217;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* TASKS GRID */
.tasks-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dev-task-card {
  background: #101612;
  border: 1px solid #1c2a1e;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.15s ease;
}

.dev-task-card.is-collapsed {
  padding: 10px 14px;
  gap: 0;
  cursor: pointer;
}

.dev-task-card:hover {
  border-color: rgba(34, 197, 94, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  background: #131d16;
}

.dev-task-card.is-task-completed {
  border-color: rgba(34, 197, 94, 0.25);
  background: #0d140f;
}

.task-collapsed-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.task-collapsed-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.task-collapsed-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.task-id-badge {
  font-size: 0.72rem;
  font-weight: 800;
  color: #86efac;
  background: #152719;
  border: 1px solid #233827;
  padding: 2px 8px;
  border-radius: 6px;
  font-family: monospace;
  flex-shrink: 0;
}

.task-status-and-collapse {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.task-status-pill {
  font-size: 0.68rem;
  font-weight: 750;
  padding: 2px 7px;
  border-radius: 6px;
  white-space: nowrap;
}
.task-status-pill.status-completed {
  background: rgba(34, 197, 94, 0.15);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}
.task-status-pill.status-paused {
  background: rgba(234, 179, 8, 0.15);
  color: #fde047;
  border: 1px solid rgba(234, 179, 8, 0.3);
}
.task-status-pill.status-todo {
  background: rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
}

.task-toggle-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #9ca3af;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  font-size: 0.65rem;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 0.12s ease;
}
.task-toggle-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
  border-color: #22c55e;
}

.task-title {
  font-size: 0.98rem;
  font-weight: 750;
  color: #ffffff;
  margin: 0;
  line-height: 1.35;
  cursor: pointer;
}

.task-expanded-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-benefit {
  font-size: 0.8rem;
  color: #9ca3af;
  line-height: 1.45;
  margin: 0;
}

.task-subtasks-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-top: 1px dashed #1c2a1e;
  padding-top: 8px;
}

.subtasks-label {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #6b7280;
  letter-spacing: 0.06em;
}

.subtasks-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.subtask-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 0.78rem;
  color: #e2e8f0;
  line-height: 1.35;
}

.subtask-tags {
  display: flex;
  gap: 3px;
  flex-shrink: 0;
  margin-top: 1px;
}

.tag-badge {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 4px;
  font-family: monospace;
}
.tag-badge.tag-front {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
}
.tag-badge.tag-back {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
}
.tag-badge.tag-desktop {
  background: rgba(251, 146, 60, 0.15);
  color: #fb923c;
  border: 1px solid rgba(251, 146, 60, 0.3);
}

.subtask-text {
  flex: 1;
}

.task-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid #162218;
  flex-wrap: wrap;
}

.task-crud-actions, .task-reorder-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.move-section-select {
  padding: 3px 6px;
  font-size: 0.72rem;
  background: #141e16;
  border: 1px solid #233827;
  color: #9ca3af;
  border-radius: 6px;
  outline: none;
  cursor: pointer;
}
.move-section-select:hover {
  color: #ffffff;
  border-color: #22c55e;
}

.add-task-trigger {
  width: 100%;
  padding: 10px;
  border-style: dashed;
  font-size: 0.84rem;
  border-radius: 10px;
}

.task-form-card {
  background: #121a14;
  border: 1px solid #22c55e;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-form-card h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #ffffff;
}

.task-form-card label {
  font-size: 0.72rem;
  font-weight: 750;
  color: #9ca3af;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-form-card input, .task-form-card textarea, .task-form-card select {
  background: #090e0a;
  border: 1px solid #1c2a1e;
  border-radius: 8px;
  padding: 6px 10px;
  color: #ffffff;
  font-size: 0.82rem;
}
.task-form-card input:focus, .task-form-card textarea:focus {
  border-color: #22c55e;
  outline: none;
}

.subtasks-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid #1c2a1e;
  padding-top: 8px;
}

.subtasks-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.subtasks-editor-header h4 {
  margin: 0;
  font-size: 0.82rem;
  color: #ffffff;
}

.subtask-editor-row {
  background: #0a0e0b;
  border: 1px solid #1c2a1e;
  border-radius: 8px;
  padding: 6px;
}

.subtask-editor-top {
  display: grid;
  grid-template-columns: 1fr 90px 24px;
  gap: 6px;
  align-items: center;
}

.delete-sub-btn {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
  width: 24px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.form-actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 0.8rem;
}
.btn-xs {
  padding: 3px 8px;
  font-size: 0.72rem;
  border-radius: 6px;
}

@media (max-width: 900px) {
  .dev-grid {
    grid-template-columns: 1fr;
  }
  .dev-sidebar {
    position: static;
  }
  .dev-sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
  }
  .dev-sidebar-btn {
    grid-template-columns: auto auto;
    white-space: nowrap;
  }
}
`
