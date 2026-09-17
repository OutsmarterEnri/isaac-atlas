# Pagine dedicate e pianificazione degli sblocchi

Aggiornamento dei sorgenti del 17 settembre 2026. Bridge resta 1.1.0: nessuna modifica alla mod in questo aggiornamento.

## Navigazione

- **Sblocchi**: catalogo e filtri esistenti.
- **Da sbloccare**: i vecchi preferiti vengono mantenuti per profilo e slot, senza migrazioni distruttive. Danno priorità alla sequenza del planner. Gli sblocchi completati non sono più pianificati; nel catalogo si possono mostrare disattivando «Nascondi sbloccati».
- **Per personaggio**: icone vettoriali originali accanto ai nomi, con variazione per i Tainted. Non vengono distribuiti sprite del gioco.
- **Sfide**: requisito per accedere alla sfida, distinto dal requisito per ottenere la ricompensa. Sono coperte le 45 sfide numerate; le Daily restano separate. Il segreto nel save conferma l'accesso quando esiste una corrispondenza nel catalogo.
- **Live Assistant**: dashboard dedicato, privo del catalogo. Quattro riquadri stabili mostrano un segnale prioritario ciascuno; contatori e frecce permettono di consultare gli altri senza scrollare. Condizioni, fonti e lista completa degli obiettivi si aprono in un dialogo. Nessuna rotazione automatica che interrompa la lettura.
- **Run Planner**: sequenza dei percorsi, priorità e ricompense nuove per ciascuna run.
- **Registro live**: pagina separata, stessi limiti e filtri del registro precedente.

Le pagine hanno un indirizzo locale (`#live`, `#planner`, ecc.), supportano ricaricamento e navigazione avanti/indietro. A desktop, il dashboard è progettato per almeno 1000×700 pixel CSS: verificato a 1280×720, 1366×768 e 1920×1080. Su finestre piccole o zoom elevato torna scorrevole per mantenere leggibili i controlli.

## Cosa ottimizza il planner

Il motore confronta tutte le combinazioni dei percorsi standard disponibili nella modalità scelta. Cerca il minor numero di percorsi che copra gli obiettivi rappresentati nel modello, poi ordina quel gruppo dando priorità ai preferiti e ai nuovi sblocchi. La modalità consigliata include Hard e Greedier, così una run Greed separata non viene proposta se Greedier può coprirne gli obiettivi.

Le ricompense non sono ricontate nelle run successive. Gli obiettivi cumulativi possono essere raggiunti dalla combinazione di più run. Home include, come azione condizionale distinta, l'accesso alla stanza del Tainted: occorre portare Red Key, Cracked Key o un altro mezzo adatto.

Il numero mostrato **non è il minimo assoluto del gioco**: presume vittorie, accessi disponibili e completamento delle tappe opzionali. Non calcola durata, abilità personale, probabilità dei portali o strategie con R Key. Delirium mantiene un percorso dedicato; un portale favorevole in un'altra run può risparmiare una partita. Boss Rush, Hush e Mega Satan rimangono condizionati da tempi, risorse e accessi. Gli obiettivi non rappresentabili sono elencati separatamente. Il piano si ricalcola dai nuovi sblocchi salvati: non inventa completion mark Hard mancanti dal dato disponibile.

## Fonti

- [Tabella delle sfide di IsaacGuru](https://isaacguru.com/challenges/isaac_repentance): controllo documentale dei requisiti il 17 settembre 2026; la pagina identifica il proprio ambito Repentance. Correzioni sintetiche originali per i prerequisiti non completi nel catalogo, con fonte visibile nell'app. Non equivale al collaudo di ogni sfida in Repentance+.
- [The Chest](https://bindingofisaacrebirth.wiki.gg/wiki/The_Chest), [Dark Room](https://bindingofisaacrebirth.wiki.gg/wiki/Dark_Room), [The Void](https://bindingofisaacrebirth.wiki.gg/wiki/The_Void), [Corpse](https://bindingofisaacrebirth.wiki.gg/wiki/Corpse), [A Strange Door](https://bindingofisaacrebirth.wiki.gg/wiki/A_Strange_Door), [Greed Mode](https://bindingofisaacrebirth.wiki.gg/wiki/Greed_Mode): riferimenti dei percorsi esistenti, mantenuti nelle schede del planner.
- [Fonti dell'assistente](ASSISTANT.md): combinazioni, condizioni e limiti.

## Collaudo manuale

| Prova | Azione | Risultato atteso |
|---|---|---|
| P01 | Apri Live Assistant su secondo monitor e cambia più stanze | Riquadri stabili; nessuna crescita della pagina a risoluzione desktop |
| P02 | Osserva più pickup utili insieme | Conteggio aumenta; frecce mostrano gli altri segnali; condizioni complete nel dialogo |
| P03 | Apri Registro live, poi torna al live | Cronologia presente, dashboard separato |
| P04 | Seleziona Cain e Hard + Greedier nel planner | Sequenza con ricompense non duplicate, tappe opzionali esplicite |
| P05 | Segna A Pound of Flesh in Da sbloccare | Run Home anticipata se l'oggetto manca nello slot scelto |
| P06 | Cambia slot e poi torna al primo | Progressi e priorità separati; piano ricalcolato |
| P07 | Completa un obiettivo e lascia salvare Isaac | Ricompensa esclusa dalla nuova pianificazione |
| P08 | Apri Sfide e confronta #7, #11, #29 nel gioco | Accesso e ricompensa distinti; prerequisiti aggiuntivi leggibili |
| P09 | Naviga con Tab, apri/chiudi un dettaglio; usa Indietro | Focus utilizzabile e ritorno alla pagina precedente |
| P10 | Riduci la finestra o aumenta molto lo zoom | Layout scorrevole, contenuti raggiungibili |

Avvio: riavvia Atlas da sorgente, ricarica con Ctrl+F5 e seleziona Live Assistant. Nessun nuovo eseguibile viene generato da questa modifica; una build desktop precedente richiede ricompilazione.
