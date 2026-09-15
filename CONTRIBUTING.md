# Contribuire a Isaac Atlas

[← README](README.md)

Sono utili segnalazioni riproducibili, correzioni ai requisiti, miglioramenti di accessibilità e compatibilità, e note sui casi d'uso accompagnate da fonti.

## Segnalare un problema

Usa il modello di issue e indica sistema operativo, versione Python, versione del gioco, modalità usata e passaggi per riprodurre il problema. Specifica comportamento atteso e osservato.

Non allegare salvataggi reali, configurazioni complete, dati della mod, identificativi Steam o log non ripuliti. Uno screenshot può essere utile dopo aver rimosso informazioni personali. Le segnalazioni di sicurezza seguono [SECURITY.md](SECURITY.md).

## Proporre una modifica

1. Crea un branch dal ramo `main`.
2. Mantieni la modifica concentrata su un problema concreto.
3. Esegui `python -m unittest discover -s tests -v`.
4. Per modifiche all'interfaccia, esegui anche la suite browser descritta in [tests/README.md](tests/README.md) e controlla tastiera e layout mobile.
5. Aggiorna README o documentazione quando cambia il comportamento.
6. Apri una pull request con problema, risultato e verifiche svolte; dichiara quelle non eseguite.

Usa dati sintetici per i test. Non aggiungere fixture ricavate da salvataggi personali. Mantieni il server limitato a loopback e la lettura dei salvataggi priva di scritture.

## Note, fonti e immagini

- Ogni nuova nota deve citare una fonte pertinente e descrivere le condizioni e le eccezioni importanti.
- Usa riassunti originali: non copiare intere descrizioni o pagine senza verificarne i diritti.
- Non reintrodurre sprite o tabelle EID nella distribuzione pubblica finché le relative condizioni non sono chiarite.
- Aggiorna [docs/SOURCES.md](docs/SOURCES.md) e [THIRD_PARTY.md](THIRD_PARTY.md) quando aggiungi nuove fonti o materiali.
- La modifica deve essere distribuibile secondo la licenza del progetto; non attribuire ad Atlas i diritti su materiali di terzi.

## Distribuzione

`scripts/prepare_public.py` esporta in una cartella nuova e vuota una lista esplicita di file ammessi, escludendo configurazioni personali e materiali non destinati alla distribuzione. Non è un comando di aggiornamento sul repository corrente e non esegue commit o push.

La checklist finale si trova in [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md).
