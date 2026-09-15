# Test

Backend, senza dipendenze: `python -m unittest discover -s tests -v`.

Browser, opzionale: avvia il server; installa Playwright in un ambiente di sviluppo (`npm install --no-save playwright`, `npx playwright install chromium`), poi esegui `node tests/browser.cjs`. Per Edge già installato imposta `ATLAS_BROWSER=msedge`; per una porta diversa `ATLAS_URL=http://127.0.0.1:8766`. Tutte le risposte relative a salvataggi e run vengono simulate nella suite browser. Il test non scrive file del gioco e usa un contesto browser temporaneo.
