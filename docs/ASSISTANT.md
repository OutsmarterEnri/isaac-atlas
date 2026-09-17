# Assistente del piano — Bridge 1.1.0

## Cosa cambia

Il pannello organizza i suggerimenti in quattro sezioni: **Da valutare adesso**, **Combinazioni**, **Prima di scendere** ed **Esplorazione**. Mostra tre schede per sezione e permette di espandere le altre. Prezzo o condizione principale restano visibili; ingredienti, procedura e fonti sono sotto **Condizioni e fonti**. Si può ignorare un suggerimento per il piano e ripristinarlo.

Monete, bombe, chiavi, cuori rossi/anima e cariche degli attivi provengono dal primo giocatore. I cuori sono mostrati convertendo le mezze unità del gioco; non costituiscono una simulazione completa della salute di ogni personaggio (ossa, cuori temporanei e trasformazioni hanno eccezioni). I costi speciali non vengono convertiti in monete. Le risorse mancanti su Bridge precedenti sono indicate come sconosciute, mai come zero.

La priorità è una regola di ordinamento Atlas, non una valutazione universale degli oggetti. Un ingrediente che completa una combinazione, una risorsa esaurita e una roccia speciale possono precedere un oggetto generico. Ogni acquisto viene confrontato separatamente con il denaro attuale: più schede non implicano che tutti gli acquisti siano finanziabili insieme. Non sono considerate automaticamente tutte le possibilità di cura, ricarica o accesso.

## Memoria e limiti

- Solo le stanze effettivamente osservate mentre Atlas è aperto vengono ricordate. Nessuna scansione remota dei loro pickup.
- La memoria resta nel browser, si azzera cambiando piano/run/slot/profilo o ricaricando la pagina. Il piano è distinto tramite stage, stageType e DungeonPlacementSeed della Bridge.
- Rientrare in una stanza aggiorna il suo contenuto e rimuove le opportunità non più presenti. Uno snapshot parziale non basta a dedurre rimozioni.
- Le altre stanze mostrano l'ultima osservazione, il tempo della run e **da ricontrollare**. Presenza, prezzo e accessibilità potrebbero essere cambiati; dimensioni alternative possono non essere più raggiungibili.
- Limiti: 128 stanze ricordate, fino a 256 pickup per stanza durante fusioni di snapshot parziali. Nessun salvataggio personale o snapshot viene aggiunto al repository.
- In cooperativa le combinazioni sono sospese; risorse e inventario riguardano il primo giocatore. Le ipotesi delle stanze segrete mantengono i limiti descritti nel README.
- La sequenza degli ultimi usi, il consumabile selezionato, l'esito dei reroll e la sostenibilità di un ciclo infinito non vengono dedotti. **Ingredienti posseduti** non significa **break garantito**.

## Sei regole iniziali

| Combinazione | Contesto rilevato | Verifiche lasciate al giocatore |
|---|---|---|
| D20 | Attivo/oggetto, riserve di pickup osservate, batterie, budget; blocco con Book of Virtues o Bethany | Effettiva ricarica, tipo di pickup, esiti casuali. Le casse aperte non contano come materiale utile in Repentance. |
| Diplopia + Wild Card | Ingredienti in inventario o visti; costo per recuperarli | Carta a terra, ordine di uso, ultimo effetto, vincoli delle scelte multiple |
| Jera + Wild Card | Rune/carte possedute o viste | Carta sul pavimento, sequenza; nessuna duplicazione di piedistalli o altre Jera |
| Clear Rune + Jera | Ingredienti, cariche, batteria osservata | Jera richiede 12 cariche ordinarie; una batteria non dimostra un ciclo sostenibile |
| Blank Card + 2 of Diamonds | Ingredienti, monete, cariche e batterie | Carica necessaria, consumabile selezionato e aumento dei prezzi Restock |
| Habit + Sharp Plug | Ingredienti | Salute, personaggio e attivo: nessun consiglio automatico di subire danno |

Il file `dist/assistant-rules.js` contiene brevi note originali, identificativi, ambito, data e collegamenti per ogni regola. Non usa un modello remoto e non invia i dati di gioco a servizi esterni. Per ampliare il catalogo bisogna aggiungere una regola verificata e testarne prerequisiti, ingredienti mancanti ed eccezioni.

## Fonti consultate il 16 settembre 2026

Contenuto delle pagine wiki consultato anche attraverso l'indice del motore di ricerca, perché l'apertura diretta di alcune pagine rispondeva 403. Si tratta di verifica documentale, non di una prova in gioco sulla patch installata.

- [D20](https://bindingofisaacrebirth.wiki.gg/wiki/D20): variante Repentance e interazione Book of Virtues.
- [Diplopia](https://bindingofisaacrebirth.wiki.gg/wiki/Diplopia) e [Wild Card](https://bindingofisaacrebirth.wiki.gg/wiki/Wild_Card): preparazione e ripetizione delle copie.
- [Jera](https://bindingofisaacrebirth.wiki.gg/wiki/Jera) e [Clear Rune](https://bindingofisaacrebirth.wiki.gg/wiki/Clear_Rune): consumabili, limitazioni e carica.
- [Blank Card](https://bindingofisaacrebirth.wiki.gg/wiki/Blank_Card), [Restock](https://bindingofisaacrebirth.wiki.gg/wiki/Restock) e [Steam Sale](https://bindingofisaacrebirth.wiki.gg/wiki/Steam_Sale): modifiche rispetto alle guide Afterbirth.
- [Habit](https://bindingofisaacrebirth.wiki.gg/wiki/Habit) e [Sharp Plug](https://bindingofisaacrebirth.wiki.gg/wiki/Sharp_Plug): sinergia e differenze Repentance+.
- [Discussione sul D20 in Greed](https://www.reddit.com/r/bindingofisaac/comments/1ia48f6): consultata come riscontro dell'esperienza dei giocatori; non usata come unica prova per una regola.
- [EntityPlayer](https://wofsauge.github.io/IsaacDocs/rep/EntityPlayer.html) e [Level](https://wofsauge.github.io/IsaacDocs/rep/Level.html): lettura risorse, attivi e identificazione del piano.

Sono state escluse le ricette obsolete «due Steam Sale = shop gratuito» e le istruzioni che assumono il vecchio comportamento di Blank Card con le rune. Nessuna garanzia deriva dalla sola popolarità di una guida.

## Test manuali aggiuntivi

Prima aggiorna Bridge a **1.1.0**, con Isaac chiuso, e riavvia il server Atlas. I vecchi eseguibili richiedono una nuova compilazione. Tutti gli esiti sotto sono ancora da compilare in gioco.

| ID | Azione | Risultato atteso | Esito |
|---|---|---|---|
| A01 | Visita lo shop con meno monete del prezzo di un oggetto. | Costo e monete mancanti visibili; nessuna promessa di acquisto immediato. | Da provare |
| A02 | Recupera monete e torna allo shop. | Budget aggiornato e residuo dopo il singolo acquisto. | Da provare |
| A03 | Lascia un oggetto interessante e cambia stanza. | Compare in Prima di scendere, con stanza e stato da ricontrollare. | Da provare |
| A04 | Torna, raccogli l'oggetto, poi esci. | La vecchia opportunità scompare dalla memoria aggiornata. | Da provare |
| A05 | Tieni Wild Card e incontra Diplopia. | Combinazione pertinente; ingrediente da recuperare distinto da quello posseduto. | Da provare |
| A06 | Possiedi Blank Card e Jera, ma non Clear Rune. | Nessuna combinazione Blank Card + Jera dichiarata completa. | Da provare |
| A07 | D20 con Book of Virtues/Bethany. | Avviso di interazione sfavorevole; niente procedura del ciclo D20 standard. | Da provare |
| A08 | Ultima bomba, tinted rock e indizio secret room. | Concorrenza fra usi della bomba esplicita. | Da provare |
| A09 | Ignora una scheda, attendi aggiornamenti, poi ripristinala. | Resta ignorata durante il piano; ripristino funzionante. | Da provare |
| A10 | Passa al piano successivo, avvia un'altra run o cambia slot. | Nessuna opportunità del vecchio contesto mescolata al nuovo. | Da provare |
| A11 | Apri Condizioni e fonti, attendi alcuni aggiornamenti. | Il dettaglio resta aperto e i link portano alle fonti della regola. | Da provare |
| A12 | Mostra molti suggerimenti o restringi la finestra. | Tre schede per gruppo, altre espandibili; contenuti leggibili e pulsanti utilizzabili. | Da provare |
