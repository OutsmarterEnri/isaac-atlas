# Test

Regressioni live: `node tests/live.cjs` (nessuna dipendenza npm). Browser live isolato: `node tests/live-browser.cjs`, con Playwright installato; crea un server statico temporaneo e simula tutte le API, senza leggere salvataggi. Con Edge: imposta `ATLAS_BROWSER=msedge`. Prove reali: [scheda live](../docs/TEST-LIVE.md).

Backend, senza dipendenze: `python -m unittest discover -s tests -v`.

Browser, opzionale: avvia il server; installa Playwright in un ambiente di sviluppo (`npm install --no-save playwright`, `npx playwright install chromium`), poi esegui `node tests/browser.cjs`. Per Edge già installato imposta `ATLAS_BROWSER=msedge`; per una porta diversa `ATLAS_URL=http://127.0.0.1:8766`. Tutte le risposte relative a salvataggi e run vengono simulate nella suite browser. Il test non scrive file del gioco e usa un contesto browser temporaneo.

## Candidata 1.0

- Callback Lua: installa `lupa==2.8` nell’ambiente di test e ripeti la suite Python. Se manca, i test Lua risultano esplicitamente saltati.
- Planner: `node tests/planner.cjs` (nessuna dipendenza npm).
- Flussi nuovi: `node tests/v1-browser.cjs` con Playwright; porta predefinita 8768, modificabile tramite `ATLAS_URL`.
- Desktop: `IsaacAtlas.exe --smoke-test` verifica servizio e catalogo; `--ui-smoke-test` apre e chiude automaticamente WebView2. Per isolare i dati, imposta `ATLAS_DATA_DIR` a una cartella temporanea prima di avviarli. Il test crea un file di esito nella cartella dati.

Immagini locali: `node tests/art-browser.cjs` con Playwright e server sulla porta 8769 (o `ATLAS_URL`). Usa PNG e risposte sintetiche. I test Python `test_local_art.py` verificano parser, mapping e confini HTTP senza richiedere Isaac.

Assistente contestuale: `node tests/assistant.cjs` verifica memoria, risorse, ingredienti, incompatibilità e suggerimenti ignorati. Le prove browser live includono dettagli persistenti, ignora/ripristina e layout mobile. Prove in gioco A01–A12: [scheda assistente](../docs/ASSISTANT.md).

Navigazione dedicata e layout fisso: `tests/live-browser.cjs` verifica isolamento delle viste, icone, requisiti sfide e assenza di scroll/sovrapposizioni a 720p, 768p e 1080p. `tests/planner.cjs` include sequenze senza duplicati, cumulativi, priorità, difficoltà e save completato. [Prove manuali P01–P10](../docs/PAGES-PLANNER.md#collaudo-manuale).
