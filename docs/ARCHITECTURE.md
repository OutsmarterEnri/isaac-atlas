# Architettura e API locali

[← README](../README.md)

## Componenti

| File | Responsabilità |
| --- | --- |
| `server.py` | Server HTTP su loopback, file statici da `dist`, parser e verifica del checksum dei salvataggi. |
| `discovery.py` | Percorsi Steam e Documenti, librerie aggiuntive, configurazione privata e scelta della sorgente. |
| `live.py` | Scelta dello snapshot Bridge più recente, validazione e rilevamento dei dati obsoleti. |
| `dist/app.js` | Catalogo, filtri, sincronizzazione dei progressi, slot e preferiti. |
| `dist/live.js` | Stato live, confronto dello slot, checklist e suggerimenti basati sulle note. |
| `mod/isaac-atlas-bridge/main.lua` | Esportazione dello stato della run attraverso le API Lua del gioco. |

Non ci sono database o servizi esterni richiesti. Tutti gli endpoint sono di sola lettura. L'API è interna alla beta e può cambiare; non è un servizio pubblico autenticato.

## Endpoint

URL predefinito: `http://127.0.0.1:8765`.

| Metodo e percorso | Risposta |
| --- | --- |
| `GET /api/sources` | Oggetto `sources` con ID opachi derivati dai percorsi, etichette generiche e slot disponibili. Nessun percorso in chiaro. |
| `GET /api/progress?slot=1` | Progressi dello slot nella sola sorgente rilevata. `slot` ammette 1, 2 o 3; se omesso vale 1. |
| `GET /api/progress?slot=2&source=ID` | Progressi di una sorgente presente nella risposta di `/api/sources`. Necessario quando sono rilevati più profili. |
| `GET /api/live` | Stato dello snapshot più recente della mod; lo slot viene ricavato dal nome del file. |

Le risposte JSON includono `Cache-Control: no-store`. Il server verifica l'header `Host` e rifiuta richieste dichiarate cross-site. Questi controlli non sostituiscono l'autenticazione: non esporre il server al di fuori del PC.

### Progressi

Campi principali: `slot`, `version`, `unlocked` (ID dei segreti), `collected` (ID degli oggetti raccolti), `hash` del file, `filename` senza percorso, `modified` e `checked` in formato ISO con fuso UTC.

Un checksum valido indica integrità del file, non autenticità dell'acquisto o idoneità della run agli achievement. Il checksum è quello previsto dal formato; non è una prova crittografica della provenienza.

### Stato live

Lo snapshot della mod usa `schema: 1`. Campi esportati: `state`, `sequence`, `run`, `frames`, `playerType`, `difficulty`, `stage`, `challenge`, `custom`, `players`, `items` e `cards`. Il servizio aggiunge `character`, `slot`, `age` in secondi e `status`.

- `frames` viene da `Game().TimeCounter`; la visualizzazione converte 30 frame in un secondo.
- `run` è un identificatore di sessione ottenuto dal seed e dal tempo di avvio rilevato dalla mod; serve ad azzerare la checklist. Non identifica un account.
- `items` e `cards` rappresentano il primo giocatore. Le opportunità attuali usano gli ID degli oggetti, non un riconoscimento completo di tutte le carte e sinergie.
- Lo snapshot massimo accettato è 65.536 byte. Vengono controllati tipi, intervalli, schema e stabilità del file durante la lettura.

| `status` | Significato |
| --- | --- |
| `not_connected` | Nessun file della mod trovato. |
| `running` | Partita attiva e snapshot recente. |
| `paused` | Pausa segnalata dalla mod. |
| `ended` | Fine partita segnalata dalla mod. |
| `menu` | Uscita dalla partita segnalata dalla mod. |
| `stale` | Ultimo file aggiornato da oltre otto secondi. |

`error` è uno stato dell'interfaccia in caso di richiesta fallita, non uno stato esportato dal gioco. Senza dati live freschi l'app nasconde timer e obiettivi invece di estrapolarli.

### Errori HTTP

- `400`: parametro `slot` vuoto, duplicato o non valido.
- `403`: Host non consentito o richiesta dichiarata cross-site.
- `503`: sorgente/file non disponibile, formato non valido o lettura momentaneamente impossibile.
- `404`: risorsa statica assente; `config.json` si trova fuori dalla directory pubblicata.

## Frequenze e conservazione

| Dato | Aggiornamento / conservazione |
| --- | --- |
| Salvataggio persistente | Richiesta ogni 5 secondi e aggiornamento manuale. |
| File della mod | Circa ogni secondo durante la run, più callback di avvio/uscita/fine. |
| Interfaccia live | Richiesta ogni 1,5 secondi; soglia di obsolescenza di 8 secondi. |
| Preferiti | `localStorage`, separati per sorgente e slot. |
| Slot selezionato | `localStorage`. |
| Checklist | Memoria della pagina; azzerata quando cambia sessione, sorgente/slot di riferimento o al ricaricamento. |

La Bridge scrive soltanto i suoi file `save1.dat`, `save2.dat`, `save3.dat`. Il lettore cerca `isaac-atlas-bridge` sotto `data`, `data/repentance+` e `mods` della cartella del gioco. La posizione normalmente osservata è `data/isaac-atlas-bridge`.

## Confini della beta

Il gioco assegna lo slot alla mod, ma non fornisce al collegamento un'identità Steam verificata. Con più sorgenti rilevate vengono sospesi i suggerimenti automatici; scegliere un profilo non prova l'associazione alla run. Il filtro degli obiettivi usa personaggio e difficoltà, senza simulare il percorso completo della partita.
