# Isaac Atlas 1.0.0-rc.1

## In breve

Candidata alla prima versione desktop: pianificatore delle run, configurazione guidata, eventi live, contenuti originali con fonti e preferiti trasferibili.

## Download e avvio

Pacchetto previsto: `IsaacAtlas-1.0.0-rc.1-windows-x64.zip`, con file `.sha256` associato. Estrai tutta la cartella e avvia `IsaacAtlas.exe`. Richiede Windows x64 e WebView2; Python è incluso. Le istruzioni complete sono in [DESKTOP.md](DESKTOP.md).

Per aggiornare da una versione precedente della Bridge, chiudi Isaac e usa **Configurazione e diagnostica → Aggiorna Bridge**, poi riavvia il gioco. Il lettore accetta ancora la Bridge precedente, ma i nuovi eventi richiedono schema 2.

I preferiti del browser non migrano automaticamente nel profilo desktop: esportali per slot e importali nel nuovo ambiente.

## Limiti dichiarati

- Nessuna certificazione completa dell’idoneità agli achievement.
- Percorsi standard e alcune condizioni di accesso; non tutti i prerequisiti e i metodi alternativi.
- Eventi boss verificati con simulazioni Lua; i test reali rappresentativi di ogni fase/personaggio restano da ampliare.
- Contenuti e sinergie selettivi. Niente sprite o tabelle EID senza permessi chiariti.
- Pacchetto non firmato digitalmente. Nessun aggiornamento automatico da rete.

## Pubblicazione

Queste note sono pronte per una **prerelease GitHub**, non attestano che sia già pubblicata. Prima del caricamento degli asset, pubblicare il sorgente corrispondente al pacchetto e controllare l’esito della CI. Includere ZIP, checksum e note; non includere cartelle `build`, configurazione, profili browser o salvataggi.
