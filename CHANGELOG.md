# Changelog

## [Unreleased]

### Changed

- Compattato header privato con navigazione raggruppata, ricerca `⌘K` ridotta e controlli account responsive.
- Academy desktop contenuta nel viewport con scroll interno per lezioni, review, risorse e strumenti.
- Curriculum Academy trasformato in accordion esclusivo: un solo capitolo aperto alla volta.
- Producer Settings mostra riepilogo e generi come chip; campi editabili solo tramite azione `Modifica`.
- Aggiunti accessi Settings accanto al nome account e al collegamento profilo pubblico Academy.
- Menu header ora esclusivi: apertura singola, chiusura esterna ed Escape con ritorno focus.
- Allineato invio Monthly Review al contratto backend `/presign`, incluso `size_bytes`; errore upload non dichiara più bozze inesistenti.

### Pending

- Persistenza cloud di profilo, generi e social: frontend pronto, ma API profilo/social non ancora disponibile nel backend.

## [0.2.0] - 2026-08-23

### Added

- Scelta tra traccia selezionata e playlist completa per URL YouTube contenenti video e playlist.
- Dialoghi download accessibili con gestione focus, tastiera ed Escape.

### Changed

- Risoluzione tipo URL delegata a `POST /api/v1/playlists/resolve` come fonte autorevole.
