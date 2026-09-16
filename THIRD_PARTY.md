# Origine e diritti dei materiali

## Isaac Save Viewer

Catalogo degli achievement e informazioni per il formato dei salvataggi derivati da Zamiell/isaac-save-viewer, snapshot `57d96c3f6a27aa2d95b4af30b4e80b8bec4b7d2d`.

https://github.com/Zamiell/isaac-save-viewer

Licenza GPL-3.0, testo incluso in `LICENSE`. Modifiche Atlas: categorie, traduzioni dei requisiti comuni, collegamenti, metadati e quattro segreti Repentance+. Le attribuzioni agli autori originari restano valide. Il codice Atlas è distribuito sotto GPL-3.0-only; i materiali derivati mantengono anche le condizioni della loro fonte.

## Wiki e note

Le note sui casi d'uso sono riassunti originali, con collegamenti puntuali alle pagine consultate dentro `dist/data/strategies.json`. I link non implicano affiliazione o endorsement. Non sono incluse pagine complete della wiki. Gli effetti possono cambiare con le patch.

L’elenco completo delle pagine citate nelle note e dei riferimenti tecnici è in [docs/SOURCES.md](docs/SOURCES.md). Il README descrive il ruolo di ciascuna fonte. Per il confronto del formato e degli identificatori sono stati consultati anche [Isaac Save Manager](https://github.com/Demorck/Isaac-save-manager) e [IsaacScript](https://github.com/IsaacScript/isaacscript).

## Materiali esclusi dalla prima distribuzione pubblica

- Descrizioni e interazioni importate da External Item Descriptions (`wofsauge/External-Item-Descriptions`): permesso/licenza di redistribuzione da chiarire.
- Sprite di oggetti e achievement provenienti dal gioco, dalla wiki o da altri tracker: diritti di redistribuzione da chiarire separatamente dalla licenza del codice.
- Screenshot della versione locale che contengono questi materiali o progressi personali.

La versione pubblica usa un simbolo grafico originale al posto degli sprite e rimanda alle fonti per le descrizioni mancanti. La licenza GPL del repository non attribuisce diritti su nomi e marchi del gioco, che appartengono ai rispettivi titolari.

## API della mod

Implementazione originale basata sulla documentazione della community:
- https://wofsauge.github.io/IsaacDocs/rep/ModReference.html
- https://wofsauge.github.io/IsaacDocs/rep/Game.html
- https://wofsauge.github.io/IsaacDocs/rep/EntityPlayer.html

Nessun SDK, eseguibile o DLL del gioco è incluso.

## Desktop e build

La distribuzione desktop usa [pywebview](https://github.com/r0x0r/pywebview), [Python](https://www.python.org/), pythonnet e dipendenze di runtime. È compilata con [PyInstaller](https://pyinstaller.org/), il cui bootloader prevede una specifica eccezione di distribuzione. Versioni e testi di licenza rilevati nell’ambiente di build vengono raccolti nella cartella `third-party-licenses` del pacchetto, insieme alla licenza Python. Microsoft WebView2 è un prerequisito di sistema, non viene redistribuito dal progetto.

Le nuove descrizioni in `notes.json` sono brevi sintesi originali basate sulle fonti collegate, con ambito e data della verifica documentale; non sono una reintroduzione delle tabelle EID.

## Illustrazioni Atlas

I pittogrammi SVG di `dist/visuals.js` sono disegni originali del progetto, distribuiti con la licenza del codice. Sono simboli di navigazione e categorie, non sprite ufficiali né riproduzioni dei completion mark. Gli sprite già presenti in una copia locale restano separati dal repository pubblico.

## Asset locali opzionali

Atlas può importare immagini dalla copia del gioco installata dall’utente usando il ResourceExtractor fornito con Isaac. Immagini, file XML e ResourceExtractor non fanno parte del repository o del pacchetto distribuito e non vengono concessi sotto GPL da Atlas. I diritti restano ai titolari del gioco. Questa separazione descrive il funzionamento del progetto, non costituisce un’autorizzazione generale al riutilizzo degli asset.
