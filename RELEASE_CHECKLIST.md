# Prima pubblicazione

## Preparato

- Rilevamento automatico; nessun percorso personale nella configurazione distribuita.
- Avvio con Python standard, senza dipendenza da Codex.
- Mod locale opzionale, separata dai salvataggi persistenti.
- README, privacy, licenze, limiti della beta e test con dati sintetici.
- Esportazione pubblica con lista esplicita dei file ammessi; sprite, descrizioni EID, configurazioni personali e screenshot esclusi.

## Presentazione del repository

- Nome suggerito: `isaac-atlas`.
- Descrizione: «Taccuino locale per The Binding of Isaac: Repentance+: sblocchi, tre salvataggi e assistente opzionale per la partita in corso.»
- Topic suggeriti: `binding-of-isaac`, `repentance`, `achievement-tracker`, `python`, `lua`, `local-first`.
- Anteprima nel README generata con dati sintetici.
- Modelli per issue e pull request inclusi in `.github`; CONTRIBUTING.md e SECURITY.md presenti.
- Dopo la creazione del repository, abilitare le segnalazioni private di vulnerabilità nelle impostazioni di sicurezza se si intende offrire quel canale.
- Non abilitare GitHub Pages come se fosse l’app completa: la lettura locale richiede il server Python sul PC del giocatore.

Questi sono metadati suggeriti: nessuna impostazione remota è stata applicata.

## GitHub

La directory `isaac-atlas-public` preparata è il contenuto del repository pubblico. Non aggiungere la cartella di lavoro o l'intera directory della conversazione. Prima di commit/push:

1. `python -m unittest discover -s tests -v`
2. `git diff --cached --stat` e revisione dei file in staging.
3. Verifica l'identità Git che vuoi rendere pubblica (puoi usare l'indirizzo noreply di GitHub).
4. Crea un repository remoto vuoto, senza aggiungere un altro README o un’altra licenza tramite GitHub.
5. Dalla cartella pubblica, completa il primo commit:

   ```sh
   git add .
   git diff --cached --check
   git commit -m "Initial public beta of Isaac Atlas"
   ```

6. Copia l’URL del repository appena creato. Esegui `git remote add origin` seguito da quell’URL, quindi `git push -u origin main`. Se `origin` esiste già, verifica prima `git remote -v` e non sostituirlo automaticamente.
7. Controlla l’esito della CI nella scheda Actions e la resa di README, anteprima e collegamenti. La configurazione CI presente non prova da sola che un’esecuzione remota sia passata.

Nessun repository remoto è creato da questi script; nessun push è automatico. La beta pubblica iniziale ha descrizioni ridotte rispetto all'installazione locale, finché i diritti dei materiali esclusi non saranno chiariti.

## Candidata 1.0

Il workflow `Windows desktop build` genera l’archivio portatile e il checksum. Le note per la prerelease sono in [docs/RELEASE-1.0.md](docs/RELEASE-1.0.md). Il pacchetto va associato allo stesso sorgente che lo ha generato; non distribuire un binario senza rendere disponibile il codice corrispondente. `release/` resta fuori da Git: gli archivi appartengono agli asset della release, non alla cronologia dei sorgenti.
