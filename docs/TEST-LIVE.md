# Scheda di collaudo live — Atlas rc.3 / Bridge 1.0.2

Le prove automatiche usano dati sintetici. Questa scheda verifica ciò che solo una partita reale può confermare. Tutte le righe partono da **da provare**: non sono risultati già ottenuti.

## Preparazione

1. Chiudi Isaac. Arresta il precedente server Atlas chiudendo la sua finestra terminale o premendo Ctrl+C al suo interno; chiudere solo la scheda browser non basta. Riapri **Apri Isaac Atlas.cmd** dalla cartella sorgente aggiornata e aggiorna la pagina con Ctrl+F5. Un vecchio `IsaacAtlas.exe` non incorpora queste modifiche: serve una nuova build.
2. In **Configurazione**, conferma che il gioco è chiuso e usa **Aggiorna Bridge**.
3. Riavvia Isaac, controlla la mod nel menu Mods e avvia o riprendi una run.
4. In Atlas verifica **Bridge 1.0.2**, apri **Registro di ciò che Atlas osserva** e scegli il filtro **Tutto**.
5. Attendi circa 2–3 secondi dopo ogni azione. La Bridge produce uno snapshot al secondo e Atlas lo legge ogni 1,5 secondi: eventi più brevi possono sfuggire.

Compila: data ___ · versione gioco ___ · slot ___ · personaggio ___ · altre mod ___ · modalità ___

## Prove principali

| ID | Situazione e azione | Risultato atteso | Esito / note |
|---|---|---|---|
| L01 | Entra in una stanza normale, tesoro, boss e negozio. | Il tipo è corretto; una riga di ingresso per ogni passaggio. Tesoro e boss non sono invertiti. | Da provare |
| L02 | Ripulisci una stanza con nemici. | Compare il passaggio a stanza ripulita, senza ripetersi a ogni aggiornamento. | Da provare |
| L03 | Osserva cuore rosso, mezzo cuore, anima, nero e osso quando disponibili. | Etichette corrispondenti; ogni cuore è un pickup distinto. | Da provare |
| L04 | Osserva monete, chiavi, bombe, batterie e sacchi. | Nessun tipo viene scambiato per un oggetto collezionabile. | Da provare |
| L05 | Osserva casse normali, dorate/chiuse, rosse e altre varianti incontrate. | Tutte sono riconosciute come casse. Non viene promesso il contenuto. | Da provare |
| L06 | Osserva un trinket accanto a un oggetto. | Il trinket rimane distinto dall'oggetto; nessuna sinergia da collisione fra ID. I nomi non disponibili restano identificativi numerici. | Da provare |
| L07 | Osserva carta, runa e pillola. | Runa separata dalla carta; pillola indicata per colore, senza svelare l'effetto sconosciuto. Alcuni nomi restano numerici. | Da provare |
| L08 | Lascia scivolare un pickup o spostalo senza raccoglierlo. | Il movimento non aggiunge righe duplicate. | Da provare |
| L09 | Raccogli uno di due pickup dello stesso tipo. | Una sola riga «Non più presente»; l'altro resta distinto. La rimozione non è automaticamente chiamata acquisto/raccolta. | Da provare |
| L10 | Rerolla un oggetto o fai restock nel negozio. | Il cambio è registrato come cambiamento oppure rimozione/nuova presenza, secondo l'identità assegnata dal gioco. | Da provare |
| L11 | Entra in shop, osserva un prezzo e acquista. | Il prezzo in monete coincide. L'oggetto scompare dal registro delle presenze. Costi speciali restano esplicitamente codici, non monete. | Da provare |
| L12 | Incontra D20, Diplopia, Wild Card o Spindown Dice. | Il segnale corrisponde al pickup effettivo. Diplopia usa l'ID 347. Una combinazione completa non è garantita dal solo oggetto. | Da provare |
| L13 | Pausa e riprendi la partita. | Stato corretto, cronologia conservata, nessuna nuova sessione fittizia. | Da provare |
| L14 | Torna al menu e riprendi la stessa run. | Registro consultabile anche nel menu; ripresa senza ristampare tutti gli eventi boss già osservati. | Da provare |
| L15 | Passa al piano seguente. | Il piano fa parte dell'identità della stanza: anche un indice uguale produce un nuovo ingresso. | Da provare |
| L16 | Prova separatamente gli slot 1, 2 e 3. | Sessioni distinguibili nel log. Gli obiettivi usano solo lo slot selezionato; avviso se diverso da quello live. | Da provare |
| L17 | Ferma temporaneamente il server Atlas e riavvialo senza ricaricare la pagina. | Il registro conserva le righe durante l'errore e torna ad aggiornarsi; nessuna cancellazione silenziosa. | Da provare |
| L18 | Filtra per pickup, poi svuota il registro senza cambiare stanza. | Filtro corretto; svuotamento non ristampa subito lo stesso snapshot. | Da provare |

## Mappa e limiti intenzionali

| ID | Situazione e azione | Risultato atteso | Esito / note |
|---|---|---|---|
| M01 | Esplora una parte del piano con celle adiacenti non visibili. | Possibili indizi verso nord/sud/est/ovest, con cella, forza bassa/media e motivazione. Nessuna percentuale inventata. | Da provare |
| M02 | Verifica un indizio aprendo il muro suggerito. | Può riuscire o fallire: registra entrambi. Un indizio non garantisce accessibilità o assenza di una stanza ordinaria inesplorata. | Da provare |
| M03 | Scopri una Secret o Super Secret oppure rendine visibile l'icona. | Compare come **nota**, distinta da un'ipotesi. Il semplice contorno di una stanza non ne svela il tipo. | Da provare |
| M04 | Incontra una stanza grande o a L sulla mappa. | Le celle occupate dalla stanza grande/a L sono escluse dai candidati; gli indizi restano disponibili. Due celle della stessa stanza contano come una sola adiacenza. | Da provare |
| M05 | Gioca con Curse of the Lost. | Mappa nascosta: niente suggerimenti di posizione. | Da provare |
| M06 | Cerca un'Ultra Secret non rivelata; successivamente scoprila. | Prima: dati insufficienti, nessuna posizione estratta dal livello nascosto. Dopo: stanza nota. **La previsione Ultra Secret resta da implementare.** | Da provare |
| M07 | Entra in una dimensione alternativa, se disponibile. | Nessuna stanza segreta della dimensione precedente viene presentata come presente in quella corrente. | Da provare |
| M08 | Gioca con Curse of the Blind e osserva un piedistallo. | «Oggetto non identificato», senza nome o suggerimento derivato dall'ID nascosto. | Da provare |

## Casi limite

| ID | Situazione | Risultato atteso | Esito / note |
|---|---|---|---|
| E01 | Una stanza contiene oltre 128 pickup. | Avviso di lista parziale; il collegamento continua. Nessuna rimozione dedotta da uno snapshot troncato. | Da provare |
| E02 | Entra in una Devil Room o altra stanza con indice speciale negativo. | Nessun errore di validazione che interrompa tutto il live. | Da provare |
| E03 | Incontra un pickup aggiunto da una mod. | Tipo non classificato e identificativo, anziché associazione inventata. | Da provare |
| E04 | Accumula più di 200 righe. | Restano le 200 più recenti; interfaccia utilizzabile. | Da provare |
| E05 | Run con seed personalizzato, sfida o cooperativa. | Osservazioni della stanza disponibili; suggerimenti automatici di sblocco sospesi. | Da provare |
| E06 | Restringi la finestra e usa Tab per filtro e pulsante Svuota. | Controlli raggiungibili, testo leggibile, nessuno scorrimento orizzontale della pagina. | Da provare |

## Come riportare un problema

ID prova: ___ · azione: ___ · atteso: ___ · osservato: ___ · versione Bridge: ___

Copia le righe pertinenti del registro e indica se il difetto si ripete. Non servono salvataggi, account Steam o percorsi personali. Per gli indizi di mappa annota anche i tentativi falliti: servono per valutare l'euristica, che non è una probabilità calibrata.

Prima di dichiarare la 1.0 stabile: completare le prove principali e quelle di mappa, registrare i casi non incontrati come non testati e verificare separatamente il nuovo pacchetto Windows. Il push dei sorgenti e una release binaria sono verifiche diverse.

## Rocce speciali (Bridge 1.0.2)

| ID | Azione | Risultato atteso | Esito |
|---|---|---|---|
| R01 | Entra in una stanza con una tinted rock. | Avviso Tinted rock e riga nel registro, con posizione e cella. Nessuna riga duplicata a ogni aggiornamento. | Da provare |
| R02 | Distruggi la roccia e attendi 2–3 secondi. | Avviso rimosso; nel registro «Roccia speciale non più presente». | Da provare |
| R03 | Osserva roccia normale e super tinted rock. | Nessun avviso per quella normale; dicitura specifica per la super tinted ancora integra. | Da provare |

La scansione considera le rocce della stanza corrente attraverso le API; non analizza screenshot e non garantisce ricompense. In stanze grandi una roccia può trovarsi nella porzione fuori dall'inquadratura corrente.
