# Verifiche di Isaac Atlas 1.0.0-rc.1

Verifica del 16 settembre 2026 su Windows x64 con Steam Repentance+.

## Automatiche: superate

- **17 test Python/Lua**: integrità e lettura dei tre slot, rilevamento librerie/profili, isolamento HTTP, validazione live, configurazione atomica e installazione/aggiornamento Bridge. Simulazioni Lua per stanza libera, trasformazioni nel Void, Greedier, cambio personaggio e ripresa run.
- **Planner JavaScript**: compatibilità percorsi, preferiti, esclusione sblocchi acquisiti e attribuzione eventi.
- **Browser con dati sintetici**: planner, osservato/confermato, scadenze, importazione valida/non valida, esportazione, configurazione, procedura Bridge, vista compatta e layout a 375/768/1440 pixel.
- **Pacchetto Windows compilato**: servizio autonomo, catalogo di 641 voci, apertura WebView2 e API nativa con profili temporanei, senza interprete Python esterno.

Comandi in [tests/README.md](tests/README.md). I test distribuiti usano dati sintetici. La suite browser simula le API e non sostituisce le prove della mod nel gioco.

## Verifica reale

Il collegamento originario è stato provato in una run su Windows e Steam Repentance+. Dopo l’aggiornamento è stato rilevato anche uno snapshot reale **schema 2 / Bridge 1.0.0**, con slot e personaggio: conferma scrittura e lettura del nuovo protocollo. Lo snapshot era scaduto all’ultima verifica e non conteneva eventi boss; non dimostra il rilevamento di tutti i boss.

Nessun salvataggio personale è incluso come fixture o nel pacchetto.

## Prima della versione stabile

- Provare eventi boss, uscita e ripresa in run reali rappresentative.
- Provare installazione e rilevamento su un secondo PC/utente.
- Verificare la CI sul commit da pubblicare.

La release candidate non certifica tutte le combinazioni di mod, personaggi o sistemi operativi.
