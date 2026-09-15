# Sicurezza

Isaac Atlas è una beta locale. La versione corrente del ramo `main` è il riferimento per le correzioni; non sono promessi tempi di risposta o supporto per versioni precedenti.

## Ambito

Il server è destinato a `127.0.0.1` sullo stesso computer. Non dispone di autenticazione per accessi remoti e non deve essere pubblicato tramite port forwarding, tunnel o reverse proxy accessibili ad altri utenti.

Sono rilevanti problemi che consentono letture o scritture arbitrarie di file, accesso ai dati da origini non consentite, esposizione di informazioni private o esecuzione di codice attraverso input del tool.

## Segnalazioni

Se nella pagina GitHub è disponibile **Security → Report a vulnerability**, usa quel canale privato. Il suo funzionamento dipende dalle impostazioni del repository; non è attivato da questo file.

Se il canale privato non è disponibile, apri un'issue limitata a chiedere un contatto privato, senza pubblicare exploit, dati personali o dettagli sensibili. Non includere salvataggi o log reali non ripuliti. Non è attualmente configurato un indirizzo email dedicato.

Indica versione/commit interessato, impatto, ambiente e un esempio minimo con dati sintetici. Per problemi ordinari di funzionamento usa il modello di bug report.
