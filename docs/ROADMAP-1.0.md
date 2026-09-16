# Milestone 1.0

## Funzioni implementate

1. **Configurazione e diagnostica**: percorsi dall’interfaccia, rilevamento automatico, report esportabile senza percorsi/account, installazione e aggiornamento Bridge guidati. Test di librerie aggiuntive e profili ambigui con filesystem sintetici.
2. **Pianificatore**: obiettivo principale, personaggio, difficoltà, percorsi standard, prerequisiti espliciti, priorità ai preferiti e ricompense compatibili. Percorsi opzionali distinti dalle tappe principali.
3. **Assistente live**: schema Bridge 2, boss osservati su piani coerenti e dopo lo svuotamento della stanza, Boss Rush/Hush tramite transizioni di flag, timer ordinari e segnali di accesso ad alcune porte. La conferma definitiva dipende dal salvataggio; gli eventi non certificano tutti i requisiti di una ricompensa.
4. **Contenuti**: descrizioni originali selettive, date/ambito delle verifiche documentali, note con fonti, ingredienti presenti/mancanti/non verificati. Materiali EID e sprite ancora esclusi; nessuna autorizzazione di terzi viene presunta.
5. **Desktop**: finestra WebView2, vista compatta in primo piano, selettore di cartella nativo, preferiti importabili/esportabili, build portatile Windows con Python incluso e checksum dell’archivio.

## Verifiche richieste per una release stabile

- Suite Python/Lua, regole del planner e flussi browser completati.
- Eseguibile compilato: avvio autonomo, risorse, UI WebView2 e comandi nativi.
- Installazione e run reali con la nuova Bridge; verificare anche alcuni boss e uscita/ripresa.
- Prova su almeno un secondo PC/utente. Le fixture di test non sostituiscono questa verifica.
- Revisione del contenuto dell’archivio, licenze delle dipendenze e documentazione.

Finché mancano prove reali rappresentative, il pacchetto è una **release candidate**, non una promessa di compatibilità universale. La copertura di note e prerequisiti resta dichiaratamente selettiva anche nella 1.0.
