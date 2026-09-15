"""Export an allowlisted, privacy-clean beta without third-party artwork/EID text."""
from pathlib import Path
import argparse, json, shutil
ROOT=Path(__file__).resolve().parents[1]
FILES=['CONTRIBUTING.md', 'SECURITY.md', 'docs/ARCHITECTURE.md', 'docs/SOURCES.md', '.github/ISSUE_TEMPLATE/bug_report.md', '.github/pull_request_template.md', 'preview.png']+['server.py','discovery.py','live.py','launch.py','install_bridge.py','config.example.json','crc_table.json',
       'LICENSE','README.md','LEGGIMI.md','PRIVACY.md','THIRD_PARTY.md','VERIFICHE.md','RELEASE_CHECKLIST.md','Apri Isaac Atlas.cmd',
       'dist/index.html','dist/style.css','dist/app.js','dist/live.js','dist/favicon.svg','dist/data/strategies.json',
       'mod/isaac-atlas-bridge/main.lua','mod/isaac-atlas-bridge/metadata.xml',
       'tests/test_atlas.py','tests/browser.cjs','tests/README.md','scripts/prepare_public.py']

def export(destination):
    dest=Path(destination).resolve()
    if dest==ROOT or ROOT in dest.parents:raise ValueError('La destinazione deve essere esterna alla cartella sorgente.')
    if dest.exists() and any(dest.iterdir()):raise ValueError('La destinazione deve essere vuota per evitare sovrascritture.')
    for name in FILES:
        target=dest/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(ROOT/name,target)
    catalog=json.loads((ROOT/'dist/data/catalog.json').read_text())
    for row in catalog:row['icon']=None
    (dest/'dist/data/catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2),encoding='utf-8')
    (dest/'dist/data/notes.json').write_text('{"entries": {}, "distribution": "public-beta-without-eid"}\n')
    p=dest/'dist/index.html';html=p.read_text(encoding='utf-8').replace('src="assets/achievements/637.png"','src="favicon.svg"').replace('alt="Dead God, traguardo del taccuino"','alt="Isaac Atlas"');p.write_text(html,encoding='utf-8')
    (dest/'dist/credits.html').write_text('''<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fonti · Isaac Atlas</title><link rel="stylesheet" href="style.css"><main><a href="/">← Isaac Atlas</a><h1>Fonti e attribuzioni</h1><p>Progetto non ufficiale. Codice GPL-3.0-only.</p><h2>Catalogo degli sblocchi</h2><p>Derivato da <a href="https://github.com/Zamiell/isaac-save-viewer">Isaac Save Viewer · Zamiell</a>, GPL-3.0, con modifiche documentate in THIRD_PARTY.md.</p><h2>Guide</h2><p>Le note originali sui casi d’uso rimandano alle pagine della wiki consultate. I contenuti sono selettivi e possono cambiare con le patch.</p><h2>Prima beta pubblica</h2><p>Sprite e descrizioni importate da EID sono esclusi in attesa di chiarire i diritti di redistribuzione. Le guide complete restano raggiungibili dalle schede. Nomi e marchi del gioco appartengono ai rispettivi titolari.</p></main></html>''',encoding='utf-8')
    (dest/'.gitignore').write_text('config.json\n__pycache__/\n*.py[cod]\n*.dat\n*.log\n.env\n.env.*\n.venv/\nnode_modules/\ntest-results/\nplaywright-report/\n')
    (dest/'.gitattributes').write_text('* text=auto\n*.py text eol=lf\n*.js text eol=lf\n*.lua text eol=lf\n*.cmd text eol=crlf\n')
    workflow=dest/'.github/workflows/tests.yml';workflow.parent.mkdir(parents=True,exist_ok=True)
    workflow.write_text('''name: Tests
on: [push, pull_request]
permissions:
  contents: read
jobs:
  python:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
        python: ['3.10', '3.13']
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python }}
      - run: python -m unittest discover -s tests -v
''')
    print('Distribuzione pubblica preparata: configurazioni, salvataggi, artwork ed EID esclusi.')
if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('destination');args=parser.parse_args();export(args.destination)
