# Drops — Developer Roadmap Plan (Frontend Reference)

Questo documento definisce la struttura strategica e le specifiche per l'implementazione della nuova **Pagina Developer** (`DeveloperRoadmap.tsx`) all'interno dell'applicazione Drops.

L'obiettivo è creare una pagina di pianificazione interattiva per lo sviluppo del progetto, dotata di un menu laterale (sidebar) a schede per navigare tra le diverse macro sezioni e di visualizzazioni ad accordion/collassabili per i dettagli tecnici.

---

## Struttura dell'Interfaccia Utente (UI) della Pagina Developer

1. **Sidebar Laterale Sinistra:**
   * Consente di cambiare il focus tra le 8 macro sezioni elencate di seguito.
   * La scheda selezionata deve risaltare visivamente.

2. **Area Contenuto Principale:**
   * **Titolo della Sezione:** Nome della macro area corrente.
   * **Introduzione/Focus:** Breve spiegazione dell'ambito tecnologico e dell'obiettivo strategico della sezione.
   * **Elenco dei Task:** Ciascun task deve avere un titolo chiaro incentrato sul beneficio concreto per l'utente.
   * **Sub-Task Collassabili:** Sotto ogni task, un elenco di sotto-attività che dettagliano le decisioni da prendere, le raccomandazioni e le azioni pratiche da svolgere, contrassegnate dai tag di competenza:
     * `[front]` (Astro/React/CSS)
     * `[back]` (FastAPI/Python/Docker/Supabase/R2)
     * `[desktop]` (Tauri v2/Rust/OS)

3. **Archivio Attività Completate:**
   * Una sezione o scheda speciale (Sezione 8) concepita a comparsa o collassata di default per tenere traccia delle milestone già consolidate senza ingombrare la visualizzazione attiva.

---

## Dettaglio delle Macro Sezioni, Task e Sub-Task

### Sezione 1: Downloader Singolo & Tracce Esclusive (YT/SC)
* **Introduzione:** Gestione dell'acquisizione di singole tracce audio da sorgenti esterne, con ottimizzazioni per la scena underground e materiali esclusivi.
1. **Task 1.1: Download Diretto da YouTube per tracce esclusive [COMPLETATO]**
   * *Miglioramento Utente:* Scarica all'istante l'audio da video YouTube che ospitano tracce, remix o bootleg rari non pubblicati altrove, senza dover ricorrere a convertitori web esterni instabili o pieni di pubblicità.
   * *a) Integrazione libreria di estrazione audio (yt-dlp)* `[back]`
     * **Stato:** Endpoint `/api/v1/download/create` con integrazione `yt-dlp`, fallback per link Radio Mix `list=RD...` e gestione asincrona.
   * *b) Interfaccia di input e feedback di progresso* `[front]`
     * **Stato:** Modulo di download con textarea multi-link, polling automatico dello stato, pulsante retry e coda dinamica.
2. **Task 1.2: Download Singolo Multi-Sorgente con selezione della qualità [COMPLETATO]**
   * *Miglioramento Utente:* Salva sul tuo dispositivo o nel cloud qualsiasi singola traccia da YouTube o SoundCloud scegliendo la qualità desiderata (MP3 320 kbps vs HQ Master Pesante) e organizzandola in cartelle.
   * *a) Opzioni di conversione e formati (MP3 vs FLAC/HQ)* `[back]` `[front]`
     * **Stato:** Selettore visivo di qualità a due opzioni (`🎵 MP3 (320 kbps)` vs `🔥 HQ Master (Pesante)`), memorizzazione preferenza ed estrazione audio HD.

---

### Sezione 2: Gestione Playlist & Download Multiplo
* **Introduzione:** Interfaccia e logica di rete per gestire set completi e intere playlist di etichette senza sovraccaricare le API esterne.
1. **Task 2.1: Anteprima, filtri e selezione brani da Playlist/Set prima del download [COMPLETATO]**
   * *Miglioramento Utente:* Vedi la lista completa delle tracce di una playlist (YT, Spotify o SoundCloud) nella modale bianca ad alta densità con ricerca e durata prima di inviarla alla coda.
   * *a) Limite massimo elementi risolti in simultanea* `[back]`
     * **Stato:** Endpoint `/api/v1/playlist/resolve` e Spotify resolver con paginazione e limite sicuro.
   * *b) Selezione tramite checkbox e filtro duplicati* `[front]`
     * **Stato:** Nuova modale bianca rettangolare `PlaylistDialog` con scroll ad alta densità (8-12 tracce visibili), numerazione, durata e filtro di ricerca rapido interno.

---

### Sezione 3: Cloud Storage & Libreria Utente
* **Introduzione:** Spostamento del baricentro della libreria utente dal disco locale a una soluzione in cloud sicura, con streaming privato e organizzazione automatica.
1. **Task 3.1: Salvataggio e organizzazione della propria musica in Cloud [COMPLETATO]**
   * *Miglioramento Utente:* Carica intere cartelle di file audio dal computer in Drops, analizza automaticamente metadati ID3, BPM e arricchimento Discogs, ed indicizza le cartelle caricate con nome e data di caricamento.
   * *a) Configurazione dello Storage Personale (Cloudflare R2 + Supabase)* `[back]` `[front]`
     * **Stato:** Implementata libreria in stile Apple Music (`FolderIngestionHub.tsx`) con Drag & Drop di intere cartelle, navigazione laterale Tutti i Brani / Cartelle / Sessioni, rinomina inline istantanea ed esportazione M3U Rekordbox.
   * *b) Ricerca testuale e filtri nel catalogo cloud* `[front]`
     * **Stato:** Ricerca rapida integrata su cartelle e tracce, filtri di genere e visualizzazione metadati Camelot Key / BPM.
2. **Task 3.2: Riproduttore Musicale Cloud e Streaming Privato [COMPLETATO]**
   * *Miglioramento Utente:* Ascolta in streaming la musica salvata nel tuo archivio cloud privato direttamente dal browser, ovunque ti trovi e su qualsiasi dispositivo.
   * *a) Generazione di link sicuri per lo streaming (Presigned URLs)* `[back]`
     * **Stato:** Generazione presigned URL R2 ed endpoint `/api/v1/download/{id}/file`.
   * *b) Riproduttore audio persistente e coda d'ascolto* `[front]`
     * **Stato:** Mini-player audio globale fisso a fondo pagina con routing `window.__drops_play_track` e hover play su colonna `#`.

---

### Sezione 4: Integrazione Streaming & Sync Preferiti
* **Introduzione:** Connessione alle piattaforme esterne per importare le selezioni e i metadati accumulati dall'utente.
1. **Task 4.1: Sincronizzazione automatica e download dei preferiti di Spotify [COMPLETATO]**
   * *Miglioramento Utente:* Collega il tuo account Spotify e importa in Drops i tuoi brani "Mi Piace" per verificare quali sono scaricabili o già in tuo possesso ed estrarne i metadati.
   * *a) Integrazione Spotify Web API e matching metadati* `[front]` `[back]`
     * **Stato:** Connessione OAuth Spotify, estrazione brani piaciuti, integrazione Discogs e calcolo BPM in libreria.
2. **Task 4.2: Importazione automatica da SoundCloud e YouTube [COMPLETATO]**
   * *Miglioramento Utente:* Tieni traccia dei brani e dei set a cui metti "Like" su SoundCloud e YouTube e importali in blocco per aggiungerli alla tua libreria e al DJ Lab.
   * *a) Risoluzione multi-sorgente e Crate Sync* `[front]` `[back]`
     * **Stato:** Implementato `MultiSourceSync.tsx` integrato in `PlatformSyncHub` con risoluzione link SoundCloud/YouTube, preset di set underground (Houghton, Timedance) e importazione nel Crate per DJ Lab.

---

### Sezione 5: Corso DJ & Producing Online (Learning Hub)
* **Introduzione:** Portale didattico privato volto a formare l'utente nell'arte del DJing e della produzione con strumenti interattivi.
1. **Task 5.1: Portale di Formazione per DJ e Produttori (Lezioni e Dispense) [COMPLETATO]**
   * *Miglioramento Utente:* Impara le tecniche di mixaggio e produzione musicale in un'area riservata organizzata in moduli didattici, video-lezioni, schede tecniche e test di autovalutazione.
   * *a) Struttura dell'area didattica e hosting dei video delle lezioni* `[front]` `[back]`
     * **Stato:** Implementata piattaforma Academy con 4 moduli (12 lezioni), player video, layout desktop senza scroll pagina, pannelli a scroll interno e capitoli accordion esclusivi: aprire un capitolo chiude quello precedente. Navigazione raggruppata nell'header e responsive verificato da mobile a desktop.
2. **Task 5.2: Directory & Mappa delle Scuole di Musica e Cabine DJ Partner [COMPLETATO]**
   * *Miglioramento Utente:* Trova accademie musicali fisiche, sale prove, studi di registrazione e cabine DJ a noleggio vicino a te visualizzandoli su una mappa e directory geografica interattiva.
   * *a) Integrazione directory spazi e punti d'interesse* `[front]`
     * **Stato:** Implementata la directory partner con filtri per città (Roma, Milano, Berlino, Londra), tipologia di studio, schede attrezzatura e tariffe orarie convenzionate.
3. **Task 5.3: DJ Lab con Beatmatching & Pitch Control Continuo [COMPLETATO]**
   * *Miglioramento Utente:* Esercitati sul beatmatching direttamente dal browser con un player dual-deck dotato di Pitch Slider continuo (±8%, step 0.05%), calcolo BPM live, Sync, EQ a 3 bande, Crossfader e routing audio separato per Master (Casse) e Cue (AirPods/Cuffie via Web Audio `setSinkId`).
   * *a) Motore audio e controlli di trasporto* `[front]`
     * **Stato:** Implementato il componente `DJLab.tsx` con Web Audio API, cue mix virtuale e supporto multi-output.
4. **Task 5.4: Gamification Producer, Livelli XP (01–04) & Badge Verified ✓ [COMPLETATO UI / BACKEND IN PAUSA]**
   * *Miglioramento Utente:* Scala i 4 livelli producer da Bedroom a Breakthrough, accumula XP e ottieni la spunta di verifica collegando i tuoi account social ufficiali.
   * *a) Gestione profilo e verifica social reattiva* `[front]`
     * **Stato:** Implementato `ProducerSettings.tsx` con anteprima badge, generi mostrati come chip fissi, modalità Modifica esplicita, massimo 4 generi e regole XP anti-spam. Rotella Settings disponibile accanto al nome account e al profilo pubblico Academy.
     * **Dipendenza aperta:** Backend profilo/social congelato e in pausa per selezione congiunta delle piattaforme definitive. Modalità demo locale esplicita.

---

### Sezione 6: Grafo Discovery & Motore Suggest
* **Introduzione:** Il motore di curatela e raccomandazione orientato alla musica elettronica underground (scena Minimal, Deep House, Techno).
1. **Task 6.1: Motore "Drops Suggest" & Grafo di Etichette, Party e Artisti [COMPLETATO]**
   * *Miglioramento Utente:* Esplora le connessioni tra le etichette discografiche di nicchia, i party underground e i DJ per scoprire nuove tracce affini al tuo gusto attraverso consigli intelligenti.
   * *a) Visualizzazione del grafo relazionale e drawer Suggest* `[front]`
     * **Stato:** Implementato il grafo interattivo SVG in `BrainGraph.tsx` con nodi clusterizzati, drawer laterale dei consigli con affinità stilistica e pulsante di anteprima nel Mini-Player globale.
2. **Task 6.2: Guide Editoriali pratiche per il settore musicale [COMPLETATO]**
   * *Miglioramento Utente:* Leggi guide super-sintetiche e aggiornate su come pubblicare la tua musica, stampare in vinile nel 2026, e gestire i codici ISRC/UPC per proteggere i tuoi diritti.
   * *a) Gestione dei contenuti editoriali (CMS leggero vs file statici)* `[front]` `[back]`
     * **Stato:** 8 guide editoriali complete con metadati, blocchi HTML e layout Astro SEO (`/item/...`).

---

### Sezione 7: Analisi Audio & Preparazione DJ
* **Introduzione:** Utility locali e cloud per arricchire i metadati e strutturare i file audio per la riproduzione su hardware professionale.
1. **Task 7.1: Analizzatore di BPM automatico nel Cloud [COMPLETATO]**
   * *Miglioramento Utente:* Scopri all'istante il BPM esatto delle tracce scaricate e inviate all'Academy grazie all'analisi automatica onset/tempo asincrona sul server.
   * *a) Algoritmo e posizionamento del calcolo del BPM* `[back]` `[front]`
     * **Stato:** Implementato modulo di calcolo BPM asincrono con endpoint `/api/v1/academy/submissions/{id}/analyze-bpm` e trigger automatico su frontend dopo upload su R2.
2. **Task 7.2: Editor Tag ID3 ed Esportazione per DJ Hardware (Rekordbox) [COMPLETATO]**
   * *Miglioramento Utente:* Correggi i tag ID3 dei tuoi brani (artista, titolo, copertina, BPM, Camelot Key) ed esporta le tracce ordinate in cartelle su una chiavetta USB pronta all'uso per i lettori CDJ professionali.
   * *a) Gestione metadati e organizzazione cartelle USB* `[front]` `[desktop]`
     * **Stato:** Implementato `RekordboxExporter.tsx` con form ID3 v2.4, formattazione pattern nomi file, cartelle per genere/artista e generazione pacchetto USB drive.

---

### Sezione 8: Archivio Attività Completate (Completati)
* **Introduzione:** Registro delle funzionalità storiche e strutturali già testate e in produzione.
1. **Task 8.1: Raccolta storica degli obiettivi completati**
   * *Miglioramento Utente:* Tieni traccia dell'affidabilità generale dell'app verificando le milestone superate e i bug fix applicati nel tempo.
    * *a) Rilascio Drops Hub, Producer Academy & DJ Lab (Agosto 2026)* `[front]` `[back]`
      * Libreria Cloud in stile Apple Music (`FolderIngestionHub.tsx`): caricamento drag & drop di intere cartelle dal desktop, navigazione con viste Tutti i Brani / Cartelle / Sessioni, rinomina istantanea inline (`✏️`), hero con grande artwork, statistiche ed esportazione playlist M3U Rekordbox.
      * Passata generale UI e sezioni collassabili a scorrimento (Accordion) su Download, Content, Spotify Sync e Producer Settings per compattare la vista ed eliminare il disordine visivo.
      * Motore di ricerca e filtro rapido articoli prima del contenuto in `/app/content` con visualizzazione a scorrimento, filtri categoria e bozze/pubblicati.
      * Selettore qualità audio download con switch a due pulsanti: `🎵 MP3 (320 kbps)` (leggero) e `🔥 HQ Master (Pesante)` (Lossless FLAC/WAV).
      * Portale Didattico Academy LMS con 4 Moduli e 12 Lezioni.
      * DJ Lab Dual-Deck con Pitch Slider continuo (±8%, step 0.05%), Hot Cue pads, Auto Beat Loops, Color FX e routing audio separato (Cassa Master + AirPods Cue via `setSinkId`).
      * Ricerca Globale Spotlight (`Cmd+K` / `Ctrl+K`) con indicizzazione istantanea e risultati categorizzati (Tracce, Artisti, Etichette, Academy, Guide).
      * Editor Tag ID3 ed Esportatore USB Rekordbox (`RekordboxExporter.tsx`).
      * Grafo Discovery Brain con Drawer Suggest Underground e anteprima audio live.
      * Mini-Player Audio Globale persistente a fondo pagina.
      * Directory Partner Studi di Registrazione e Cabine DJ (Roma, Milano, Berlino, Londra).
      * Schede Artista Pubbliche con statistiche editoriali, waveform, tracce e badge `✓ Verified`.
      * Producer Settings con connessione social interattiva e selezione generi musicali fino a 4.
    * *b) Funzionalità di base consolidate* `[front]` `[back]`
      * Split dei 3 monorepo e pulizia del codice morto.
      * Risoluzione dello schermo nero sul mini-player (blocco delle dimensioni dell'artwork a 56x56).
      * Gestione rate limit di Discogs (coda pacizzata con sleep di 300ms e thread pool securizzata).
      * Estrazione IP reale del client Cloudflare per superare il blocco di rate limit globale.
      * Spotify OAuth iniziale con reindirizzamenti dinamici.
