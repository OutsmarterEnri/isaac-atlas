# Indice delle fonti

[← README](../README.md#fonti-e-attribuzioni)

## Casi d’uso distribuiti

Questo elenco comprende tutte le pagine presenti nei riferimenti di `dist/data/strategies.json`. Le singole note specificano l’associazione fra affermazione e fonte; l’elenco non sostituisce quei riferimenti.

- [Blank Card](https://bindingofisaacrebirth.wiki.gg/wiki/Blank_Card)
- [Book of Shadows](https://bindingofisaacrebirth.wiki.gg/wiki/Book_of_Shadows)
- [Brimstone Bombs](https://bindingofisaacrebirth.wiki.gg/wiki/Brimstone_Bombs)
- [C Section](https://bindingofisaacrebirth.wiki.gg/wiki/C_Section)
- [Death Certificate](https://bindingofisaacrebirth.wiki.gg/wiki/Death_Certificate)
- [Diplopia](https://bindingofisaacrebirth.wiki.gg/wiki/Diplopia)
- [Magic Skin](https://bindingofisaacrebirth.wiki.gg/wiki/Magic_Skin)
- [Rock Bottom](https://bindingofisaacrebirth.wiki.gg/wiki/Rock_Bottom)
- [Spindown Dice](https://bindingofisaacrebirth.wiki.gg/wiki/Spindown_Dice)
- [Wild Card](https://bindingofisaacrebirth.wiki.gg/wiki/Wild_Card)

## Catalogo e riferimenti tecnici

- [Isaac Save Viewer, snapshot usato](https://github.com/Zamiell/isaac-save-viewer/tree/57d96c3f6a27aa2d95b4af30b4e80b8bec4b7d2d): catalogo e descrizione del formato, inclusi i riferimenti Kaitai/Blade presenti nel progetto.
- [Isaac Save Manager](https://github.com/Demorck/Isaac-save-manager): confronto tecnico del formato.
- [IsaacScript](https://github.com/IsaacScript/isaacscript): identificatori e nomenclatura.
- [Wiki: Achievements](https://bindingofisaacrebirth.wiki.gg/wiki/Achievements).
- [Wiki: Repentance+](https://bindingofisaacrebirth.wiki.gg/wiki/Achievements/Repentance%2B).
- [Wiki Fandom](https://bindingofisaacrebirth.fandom.com/wiki/Binding_of_Isaac:_Rebirth_Wiki).

Il [catalogo completo](../dist/data/catalog.json) conserva i collegamenti wiki e Fandom per ciascuna ricompensa.

## API del gioco

- [ModReference / SaveData](https://wofsauge.github.io/IsaacDocs/rep/ModReference.html).
- [Game / TimeCounter e stato della partita](https://wofsauge.github.io/IsaacDocs/rep/Game.html).
- [EntityPlayer / personaggio e inventario](https://wofsauge.github.io/IsaacDocs/rep/EntityPlayer.html).
- [Isaac / GetTime e accesso ai giocatori](https://wofsauge.github.io/IsaacDocs/rep/Isaac.html).
- [Seeds / IsCustomRun](https://wofsauge.github.io/IsaacDocs/rep/Seeds.html).

## Fonte esclusa dalla distribuzione pubblica

[External Item Descriptions, commit consultato](https://github.com/wofsauge/External-Item-Descriptions/tree/b6010e390ef2f429d4d4659974a5d505fba89b43): descrizioni italiane e inglesi e interazioni utilizzate nella versione locale precedente. Le tabelle importate non sono incluse nella distribuzione pubblica. Nella candidata 1.0, `notes.json` contiene soltanto alcune nuove sintesi originali, ciascuna con fonte e ambito dichiarati.

## Aggiornamento e attribuzione

Ultima consultazione dei contenuti annotata nel catalogo delle strategie: 2026-09-15. Questo documento elenca la provenienza; non certifica che ogni pagina sia immutata o che tutte le meccaniche siano state nuovamente verificate nella patch corrente.

I casi d’uso sono riassunti originali. Nomi e immagini del gioco restano dei rispettivi titolari. Condizioni di distribuzione e materiali esclusi sono descritti in [THIRD_PARTY.md](../THIRD_PARTY.md).

## Pianificatore, eventi e nuova interfaccia desktop

- [Chest](https://bindingofisaacrebirth.wiki.gg/wiki/The_Chest), [Dark Room](https://bindingofisaacrebirth.wiki.gg/wiki/Dark_Room), [The Void](https://bindingofisaacrebirth.wiki.gg/wiki/The_Void), [Corpse](https://bindingofisaacrebirth.wiki.gg/wiki/Corpse), [A Strange Door](https://bindingofisaacrebirth.wiki.gg/wiki/A_Strange_Door), [Greed Mode](https://bindingofisaacrebirth.wiki.gg/wiki/Greed_Mode): riferimenti dei percorsi standard; le condizioni sono esplicite nelle proposte.
- [EntityType](https://wofsauge.github.io/IsaacDocs/rep/enums/EntityType.html), [GameStateFlag](https://wofsauge.github.io/IsaacDocs/rep/enums/GameStateFlag.html): identificatori e segnali usati dalla Bridge, confrontati con gli enum dell’installazione del gioco senza ridistribuirne i file.
- [API pywebview](https://pywebview.flowrl.com/api/): finestra, cartelle e profilo persistente del desktop.
- [PyInstaller](https://pyinstaller.org/): distribuzione Windows con runtime incluso.

Le sintesi originali in `notes.json` riportano direttamente fonte, ambito e data di verifica documentale. Non sono descrizioni estratte da EID.

## Importazione immagini locali

- [IsaacDocs — Getting Started](https://wofsauge.github.io/IsaacDocs/rep/faq/GettingStarted.html): ResourceExtractor e aggiornamento dopo patch.
- Mapping delle immagini verificato sui file `items.xml`, `achievements.xml` e `completion_widget.anm2` della propria installazione. Questi file non vengono redistribuiti.
