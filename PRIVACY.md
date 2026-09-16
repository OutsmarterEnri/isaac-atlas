# Dati locali

- Il server ascolta solo su `127.0.0.1`. Non è progettato per esposizione Internet/LAN.
- Legge le cartelle note di Steam e Isaac, i salvataggi e i file della sola mod Atlas. Non scansiona indiscriminatamente il disco.
- Nessun account, analitica, cookie pubblicitario o caricamento dei progressi online.
- Preferiti e slot scelto rimangono nel localStorage del browser; la checklist live rimane nella memoria della pagina. Cancellare i dati del sito elimina queste preferenze.
- L'app restituisce al browser solo le informazioni necessarie al taccuino. I percorsi personali non vengono inclusi nelle risposte ordinarie.
- Collegamenti a wiki/GitHub aprono siti esterni, soggetti alle loro politiche.
- Non pubblicare `config.json`, salvataggi, log di gioco, dati della mod o screenshot con informazioni personali. I test pubblici usano dati sintetici.

## Configurazione guidata e desktop

Le operazioni POST di configurazione e installazione Bridge richiedono il token della sessione e un’origine locale consentita. La pagina Configurazione mostra i percorsi scelti dall’utente sul suo stesso PC; il report diagnostico esportato li esclude. Non condividere screenshot di quei campi senza oscurarli.

Il desktop usa `%LOCALAPPDATA%/IsaacAtlas` per configurazione e profilo WebView2. I file dei preferiti esportati contengono soltanto formato, versione, slot e ID dei segreti, senza percorsi o account.
