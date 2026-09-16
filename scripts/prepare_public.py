"""Export an allowlisted, privacy-clean beta without third-party artwork/EID text."""
from pathlib import Path
import argparse, json, shutil
ROOT=Path(__file__).resolve().parents[1]
FILES=['CONTRIBUTING.md', 'SECURITY.md', 'docs/ARCHITECTURE.md', 'docs/SOURCES.md', '.github/ISSUE_TEMPLATE/bug_report.md', '.github/pull_request_template.md', 'preview.png']+['server.py','discovery.py','live.py','launch.py','install_bridge.py','config.example.json','crc_table.json',
       'LICENSE','README.md','LEGGIMI.md','PRIVACY.md','THIRD_PARTY.md','VERIFICHE.md','RELEASE_CHECKLIST.md','Apri Isaac Atlas.cmd',
       'dist/index.html','dist/style.css','dist/app.js','dist/live.js','dist/favicon.svg','dist/data/strategies.json',
       'mod/isaac-atlas-bridge/main.lua','mod/isaac-atlas-bridge/metadata.xml',
       'tests/test_atlas.py','tests/browser.cjs','tests/README.md','scripts/prepare_public.py']
FILES += ['dist/visuals.js','docs/RELEASE-1.0.md','dist/credits.html','runtime.py', 'settings.py', 'desktop.py', 'requirements-desktop.txt', 'CHANGELOG.md', 'docs/DESKTOP.md', 'docs/ROADMAP-1.0.md', 'dist/planner-core.js', 'dist/planner.js', 'dist/settings.js', 'tests/test_release.py', 'tests/test_bridge.py', 'tests/planner.cjs', 'tests/v1-browser.cjs', 'scripts/build_windows.py', '.github/workflows/windows-build.yml', '.github/workflows/tests.yml', 'dist/data/notes.json']

def export(destination):
    dest=Path(destination).resolve()
    if dest==ROOT or ROOT in dest.parents:raise ValueError('La destinazione deve essere esterna alla cartella sorgente.')
    if dest.exists() and any(dest.iterdir()):raise ValueError('La destinazione deve essere vuota per evitare sovrascritture.')
    for name in FILES:
        target=dest/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(ROOT/name,target)
    catalog=json.loads((ROOT/'dist/data/catalog.json').read_text())
    for row in catalog:row['icon']=None
    (dest/'dist/data/catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2),encoding='utf-8')
    notes=json.loads((ROOT/'dist/data/notes.json').read_text(encoding='utf-8'))
    if notes.get('distribution')!='original-summaries':raise ValueError('Esporta soltanto le sintesi originali approvate, non tabelle EID.')
    p=dest/'dist/index.html';html=p.read_text(encoding='utf-8').replace('src="assets/achievements/637.png"','src="favicon.svg"').replace('alt="Dead God, traguardo del taccuino"','alt="Isaac Atlas"');p.write_text(html,encoding='utf-8')
    shutil.copyfile(ROOT/'dist/credits.html',dest/'dist/credits.html')
    (dest/'.gitignore').write_text('config.json\n__pycache__/\n*.py[cod]\n*.dat\n*.log\n.env\n.env.*\n.venv/\nbuild/\nrelease/\n*.spec\nbrowser/\nsmoke-ok.txt\nnode_modules/\ntest-results/\nplaywright-report/\n')
    (dest/'.gitattributes').write_text('* text=auto\n*.py text eol=lf\n*.js text eol=lf\n*.lua text eol=lf\n*.cmd text eol=crlf\n')
    print('Distribuzione pubblica preparata: configurazioni, salvataggi, artwork ed EID esclusi.')
if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('destination');args=parser.parse_args();export(args.destination)
