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
1. **Task 1.1: Download Diretto da YouTube per tracce esclusive**
   * *Miglioramento Utente:* Scarica all'istante l'audio da video YouTube che ospitano tracce, remix o bootleg rari non pubblicati altrove, senza dover ricorrere a convertitori web esterni instabili o pieni di pubblicità.
   * *a) Integrazione libreria di estrazione audio (yt-dlp)* `[back]`
     * **Scelte & Raccomandazioni:** Usare la libreria `yt-dlp` installata direttamente sul backend FastAPI per estrarre l'audio in formato MP3 a 320kbps (Raccomandato per compatibilità ottimale con hardware DJ).
     * **Azione:** Sviluppare l'endpoint `/api/download/youtube-direct` con gestione asincrona delle code sul server.
   * *b) Interfaccia di input e feedback di progresso* `[front]`
     * **Scelte & Raccomandazioni:** Utilizzare un indicatore di caricamento globale con notifica di esito (Raccomandato per semplicità di sviluppo iniziale) o sviluppare un sistema di monitoraggio progressivo in tempo reale con Server-Sent Events (SSE).
     * **Azione:** Creare il modulo di input URL nella dashboard e gestire gli stati della richiesta.
2. **Task 1.2: Download Singolo Multi-Sorgente con selezione della qualità**
   * *Miglioramento Utente:* Salva sul tuo dispositivo o nel cloud qualsiasi singola traccia da YouTube o SoundCloud scegliendo la qualità desiderata e organizzandola in cartelle.
   * *a) Opzioni di conversione e formati (MP3 vs FLAC/HQ)* `[back]`
     * **Scelte & Raccomandazioni:** Limitare di default il download a MP3 ad alta qualità (320kbps) per ottimizzare lo storage (Raccomandato), o abilitare il download in formato lossless FLAC/WAV per SoundCloud HQ.
     * **Azione:** Configurare i parametri post-processor FFmpeg sul backend in base alla sorgente e alla scelta dell'utente.

---

### Sezione 2: Gestione Playlist & Download Multiplo
* **Introduzione:** Interfaccia e logica di rete per gestire set completi e intere playlist di etichette senza sovraccaricare le API esterne.
1. **Task 2.1: Anteprima, filtri e selezione brani da Playlist/Set prima del download**
   * *Miglioramento Utente:* Vedi la lista completa delle tracce di una playlist (YT) o di un set (SC) prima di scaricarla, potendo selezionare solo i brani che ti interessano davvero ed escludendo automaticamente quelli che hai già in libreria.
   * *a) Limite massimo elementi risolti in simultanea* `[back]`
     * **Scelte & Raccomandazioni:** Impostare un limite massimo di 100 tracce a playlist (Raccomandato) per evitare blocchi IP temporanei ed esaurimento di memoria sul server.
     * **Azione:** Configurare il controllo del limite ed eventualmente la paginazione all'interno dell'endpoint `/playlist/resolve`.
   * *b) Selezione tramite checkbox e filtro duplicati* `[front]`
     * **Scelte & Raccomandazioni:** Riconoscere automaticamente i file già presenti in locale o in cloud e deselezionarli per default (Raccomandato), lasciando all'utente la facoltà di forzare una sovrascrittura.
     * **Azione:** Creare la tabella dei brani trovati con checkbox dinamici e badge "Già presente".

---

### Sezione 3: Cloud Storage & Libreria Utente
* **Introduzione:** Spostamento del baricentro della libreria utente dal disco locale a una soluzione in cloud sicura, con streaming privato e organizzazione automatica.
1. **Task 3.1: Salvataggio e organizzazione della propria musica in Cloud**
   * *a) Configurazione dello Storage Personale (Cloudflare R2)* `[back]`
     * **Scelte & Raccomandazioni:** Utilizzare Cloudflare R2 (Raccomandato per i costi di traffico in uscita a $0) creando una cartella per ciascun utente sincronizzata con le credenziali Supabase.
     * **Azione:** Sviluppare la logica di upload asincrono su R2 al termine del download e salvare il percorso su database Supabase.
   * *b) Ricerca testuale e filtri nel catalogo cloud* `[front]`
     * **Scelte & Raccomandazioni:** Implementare una ricerca rapida client-side sui metadati (Raccomandato per reattività) o delegare le query di ricerca interamente a Supabase.
     * **Azione:** Disegnare la tabella di visualizzazione della libreria cloud con filtri di genere e barra di ricerca.
2. **Task 3.2: Riproduttore Musicale Cloud e Streaming Privato**
   * *Miglioramento Utente:* Ascolta in streaming la musica salvata nel tuo archivio cloud privato direttamente dal browser, ovunque ti trovi e su qualsiasi dispositivo.
   * *a) Generazione di link sicuri per lo streaming (Presigned URLs)* `[back]`
     * **Scelte & Raccomandazioni:** Generare URL firmati a scadenza (es. validità di 1 ora, Raccomandato) per proteggere i file audio da accessi esterni non autorizzati.
     * **Azione:** Sviluppare l'endpoint `/api/stream/{track_id}` che rilascia il link temporaneo.
   * *b) Riproduttore audio persistente e coda d'ascolto* `[front]`
     * **Scelte & Raccomandazioni:** Implementare un player audio fisso a fondo pagina (Raccomandato) che rimanga attivo navigando nell'app, con supporto a una coda di riproduzione dinamica.
     * **Azione:** Integrare lo stato del player nel contesto globale di React/Astro.

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
     * **Stato:** Implementata la piattaforma Academy con 4 moduli (12 lezioni), player video immersivo, layout compatto no-scroll e tab per invio tracce e download risorse.
2. **Task 5.2: Directory & Mappa delle Scuole di Musica e Cabine DJ Partner [COMPLETATO]**
   * *Miglioramento Utente:* Trova accademie musicali fisiche, sale prove, studi di registrazione e cabine DJ a noleggio vicino a te visualizzandoli su una mappa e directory geografica interattiva.
   * *a) Integrazione directory spazi e punti d'interesse* `[front]`
     * **Stato:** Implementata la directory partner con filtri per città (Roma, Milano, Berlino, Londra), tipologia di studio, schede attrezzatura e tariffe orarie convenzionate.
3. **Task 5.3: DJ Lab con Beatmatching & Pitch Control Continuo [COMPLETATO]**
   * *Miglioramento Utente:* Esercitati sul beatmatching direttamente dal browser con un player dual-deck dotato di Pitch Slider continuo (±8%, step 0.05%), calcolo BPM live, Sync, EQ a 3 bande, Crossfader e routing audio separato per Master (Casse) e Cue (AirPods/Cuffie via Web Audio `setSinkId`).
   * *a) Motore audio e controlli di trasporto* `[front]`
     * **Stato:** Implementato il componente `DJLab.tsx` con Web Audio API, cue mix virtuale e supporto multi-output.
4. **Task 5.4: Gamification Producer, Livelli XP (01–04) & Badge Verified ✓ [COMPLETATO]**
   * *Miglioramento Utente:* Scala i 4 livelli producer da Bedroom a Breakthrough, accumula XP e ottieni la spunta di verifica collegando i tuoi account social ufficiali.
   * *a) Gestione profilo e verifica social reattiva* `[front]`
     * **Stato:** Implementato `ProducerSettings.tsx` con anteprima live del badge, selezione generi musicali fino a 4 massimi e regole XP anti-spam.

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
   * *a) Rilascio Drops Hub, Producer Academy & DJ Lab (Agosto 2026)* `[front]`
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
