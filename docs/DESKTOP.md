# Desktop Windows

## Pacchetto portatile

Scarica l’archivio Windows dagli asset della release, quando pubblicata. Estrai **tutta** la cartella e avvia `IsaacAtlas.exe`. La sottocartella `_internal` deve restare accanto all’eseguibile. Python è incluso: l’utente non deve installarlo.

Richiede Windows x64 e Microsoft Edge WebView2 Runtime, normalmente presente sulle installazioni recenti di Windows. Se manca, installalo dal sito Microsoft: https://developer.microsoft.com/microsoft-edge/webview2/ . Il pacchetto non contiene un installer WebView2 né lo scarica automaticamente. L’eseguibile di questa prima distribuzione non è firmato digitalmente.

L’app desktop utilizza la porta locale **8767** e un profilo browser persistente. Configurazione e dati del profilo sono in `%LOCALAPPDATA%/IsaacAtlas`, separati dalle risorse del programma. Chiudere la finestra arresta il suo server. Se la porta è occupata, chiudi l’altra istanza desktop.

Il browser tradizionale rimane disponibile con `python launch.py` sulla porta 8765. Le due modalità hanno preferiti separati: usa Esporta/Importa per trasferirli. L’importazione aggiunge i preferiti allo slot attualmente collegato e non cancella quelli già presenti.

## Comandi nella finestra

- **Configurazione e diagnostica**: seleziona cartelle tramite dialogo nativo, salva la configurazione, installa o aggiorna la Bridge a gioco chiuso.
- **Vista compatta**: riduce la finestra e la mantiene in primo piano; mostra i dati della run. Non è un’iniezione o un overlay nel gioco.
- **Vista completa**: ripristina dimensioni e navigazione del taccuino.

## Compilazione

Su Windows, in un ambiente di sviluppo isolato:

```powershell
py -3 -m venv .venv
.venv\Scripts\python -m pip install -r requirements-desktop.txt
.venv\Scripts\python scripts/build_windows.py
```

Gli archivi e i checksum vengono scritti in `release/`, ignorata da Git. Lo script usa PyInstaller e include risorse locali, mod e avvisi di licenza. Non include configurazioni, salvataggi, log o il profilo browser.

Il workflow **Windows desktop build** può essere avviato manualmente dalla scheda Actions dopo il push. Produce un artifact scaricabile; non pubblica automaticamente una release GitHub.

Per il controllo del pacchetto:

```powershell
Get-FileHash release\IsaacAtlas-VERSIONE-windows-x64.zip -Algorithm SHA256
```

Confronta il risultato con il file `.sha256` associato. Un checksum verifica l’integrità dell’archivio, non sostituisce la fiducia nella fonte da cui lo scarichi.

### Immagini ufficiali opzionali

In Configurazione scegli **Importa / aggiorna immagini locali**. Richiede Windows e ResourceExtractor già presente nella cartella di Isaac. L’app mostra l’avanzamento e applica le immagini senza riavvio. Dopo una patch, ripeti l’operazione. L’importazione non richiede account e non scarica asset da Internet.

## Collaudo della prossima build

Il desktop resta un canale supportato: evita l’installazione di Python, offre selezione cartelle nativa e finestra in primo piano. Conviene conservarlo e verificarlo come prodotto separato dal browser. I vecchi ZIP non sono prove della rc.4: prima di distribuire un nuovo eseguibile, compilare dai sorgenti aggiornati e registrare gli esiti seguenti.

| Area | Prova richiesta |
| --- | --- |
| Avvio pulito | Windows senza Python; ZIP estratto in una cartella diversa, anche con spazi; WebView2 disponibile. |
| Primo utilizzo | Nessuna configurazione o nota privata: messaggi corretti, sorgenti e slot rilevati, nessun percorso dello sviluppatore. |
| Persistenza | Preferiti per tre slot, configurazione e note locali dopo chiusura, riapertura e sostituzione del pacchetto. |
| Desktop | Ridimensionamento, due monitor, DPI 100/125/150%, vista compatta e ritorno alla navigazione. |
| Live | Gioco aperto/chiuso, pausa, cambio piano, run ripresa, Bridge assente o precedente; niente dati obsoleti presentati come attuali. |
| Isolamento | Browser e desktop su porte diverse; chiusura arresta il server; seconda istanza gestita. |
| Packaging | ZIP privo di salvataggi, configurazioni, sprite e note private; fonti/licenze presenti; SHA256 verificato. |

Stato rc.4: **prove del binario da eseguire**. Le verifiche Edge dei sorgenti non vengono conteggiate come test WebView2. Iniziare con un pacchetto candidato locale, poi una prerelease per tester; promuovere a release dopo il collaudo. Non serve compilare a ogni ritocco CSS, ma ogni pacchetto condiviso deve identificare la versione dei sorgenti.
