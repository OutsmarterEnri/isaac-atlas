# Changelog

## 1.0.0-rc.4 — 17 settembre 2026 · sorgenti

- Navigazione ordinata per live, pianificazione, priorità e consultazione; icone per tutte le pagine.
- Dashboard live a geometria stabile, registro separato e dettagli in dialogo.
- Sequenze di run per personaggio, priorità «Da sbloccare», copertura cumulativa e ricompense deduplicate.
- Icone personaggi e requisiti di accesso alle sfide.
- «Cosa fa» in evidenza; note private opzionali, recupero automatico e lettura senza cache. Rimossa la voce sulla raccolta.
- Include gli aggiornamenti Bridge 1.1.0 e assistente descritti sotto. Nessun nuovo binario distribuito; previsto collaudo desktop separato.

## 1.0.0-rc.3 — sorgenti, collaudo in gioco da completare

- Pagine dedicate Live Assistant, Registro live e Run Planner; dashboard desktop stabile, dettagli in dialogo. Preferiti «Da sbloccare» integrati nella sequenza di run; icone originali per personaggio e requisiti di accesso alle sfide. Planner con copertura cumulativa, priorità e deduplicazione delle ricompense.

- Bridge 1.1.0: risorse, cariche degli attivi e identità del piano. Assistente in quattro sezioni, memoria temporanea delle stanze, consigli shop contestuali e sei combinazioni documentate con ingredienti, limiti e fonti. Suggerimenti ignorabili per piano. Dettagli e nuove prove in `docs/ASSISTANT.md`.

- Aggiornamento Bridge 1.0.2: tinted rock e super tinted rock della stanza corrente, escluse quelle distrutte; avvisi e registro dedicati. Le forme della mappa 1–12 (incluse L e stanze grandi) non sospendono più tutti gli indizi; le adiacenze contano stanze distinte, non singole celle.

- Bridge 1.0.1: enumerazione corretta delle stanze, invio della sola mappa visibile; tipo stanza limitato a visite o icone visibili. Vecchi candidati al 90% scartati.
- Indizi geometrici qualitativi per Secret/Super Secret adiacenti alla stanza corrente, limitati a mappe note di stanze 1×1. Ultra Secret mostrata solo quando nota; previsione non implementata.
- Cuori, batterie, sacchi, varianti di casse, rune e trinket distinti; identità stabile, prezzo da EntityPickup e fallback per pickup sconosciuti. Piedistalli nascosti da Curse of the Blind non identificati.
- Registro per aggiunte/rimozioni/cambiamenti, conservato durante errori e menu, massimo 200 righe; avviso oltre 128 pickup. Rimangono possibili eventi mancati tra due campionamenti.
- Corretto ID Diplopia (347), associazioni catalogo limitate agli oggetti, etichette tesoro/boss corrette.
- Test Lua aggiornati, regressioni mappa/registro e prova browser con dati sintetici. Scheda manuale in `docs/TEST-LIVE.md`.
- Nessun nuovo eseguibile compilato con questo aggiornamento dei sorgenti.

## 1.0.0-rc.1 — candidata alla 1.0

- Configurazione delle cartelle nell’interfaccia e diagnostica esportabile senza percorsi personali.
- Installazione/aggiornamento Bridge guidati e selettore cartelle nativo nella versione desktop.
- Pianificazione per obiettivo, personaggio e difficoltà; percorsi compatibili, prerequisiti e tappe opzionali.
- Bridge schema 2: eventi boss, conservazione degli eventi in una run ripresa, limiti temporali e segnali di accesso alle porte.
- Distinzione fra eventi osservati, accessi rilevati e sblocchi confermati dal salvataggio.
- Descrizioni originali selettive con ambito/data di verifica; ingredienti delle sinergie presenti, mancanti o non verificati.
- Esportazione e importazione validata dei preferiti per slot.
- App Windows portatile con Python incluso, WebView2 e vista compatta in primo piano.
- Suite aggiuntive per configurazione, CSRF, installazione Bridge, callback Lua, planner e flussi browser.

Le note e la valutazione di accessibilità restano selettive. La release candidate richiede ancora prove rappresentative su altri PC e sulle modalità del gioco; non implica l’esecuzione della CI remota.

## 0.1 — prima beta pubblica

- Catalogo dei 641 segreti, tre slot, filtri e preferiti.
- Lettura locale con verifica del checksum.
- Prima Bridge opzionale con timer e checklist manuale.
- Distribuzione priva di salvataggi personali, sprite del gioco e tabelle EID.

### Aggiornamento grafico della candidata

- Bacheca con 12 simboli originali dei boss, filtri accessibili e conteggi delle ricompense per personaggio.
- Cornici per sprite locali, pittogrammi per le categorie pubbliche e dettagli illustrati.
- Stati selezionato/completato distinguibili anche senza colore; layout responsive e rispetto del movimento ridotto.
- La bacheca non interpreta i conteggi come completion mark Normal/Hard.

## 1.0.0-rc.2

- Importazione locale opzionale degli sprite ufficiali attraverso l’estrattore già installato con Isaac.
- Cache privata, manifest atomico, importazione in background e aggiornamento dall’interfaccia.
- Immagini per oggetti/achievement e simboli di completamento; grafica Atlas come alternativa.
- Asset e strumenti del gioco esclusi da Git e dalle distribuzioni.
