# Verifiche della beta

## Automatiche

- Parser: struttura, checksum, file troncati, tre slot distinti e lettura senza modifiche.
- Rilevamento: librerie Steam aggiuntive, più profili con scelta esplicita, salvataggi locali quando Steam Cloud è disattivato.
- HTTP: Host e richieste cross-site rifiutati, configurazione non esposta, errori senza percorsi privati.
- Live: schema, dimensioni massime, file incompleti, slot, stato running/paused/ended/menu e scadenza dei dati.
- Browser: timer, checklist manuale, cambio slot, run speciali, profili separati, dettaglio e assenza di overflow a 375/768/1440 pixel.

Comandi e dipendenze opzionali in `tests/README.md`. Tutti i dati dei test distribuiti sono sintetici.

## Verifica reale

Il collegamento con la mod è stato provato su Windows e Steam Repentance+: il servizio riceve personaggio, slot e timer di una run effettiva. Nessun file personale viene incluso come fixture. Questa prova non copre tutte le modalità, i personaggi, i sistemi operativi o ogni combinazione di mod.
