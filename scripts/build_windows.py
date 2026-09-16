"""Build a portable Windows directory; run inside a dedicated build environment."""
from pathlib import Path
import subprocess, sys, shutil, hashlib, json, importlib.metadata
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from runtime import VERSION
if sys.platform!='win32':raise SystemExit('Compila su Windows con Python 64 bit.')
subprocess.run([sys.executable,'-m','PyInstaller','--noconfirm','--clean','--windowed','--onedir','--name','IsaacAtlas',
    '--distpath',str(ROOT/'release'),'--workpath',str(ROOT/'build'),'--specpath',str(ROOT/'build'),
    '--add-data',str(ROOT/'dist')+';dist','--add-data',str(ROOT/'mod')+';mod','--add-data',str(ROOT/'crc_table.json')+';.',
    '--collect-all','webview',str(ROOT/'desktop.py')],check=True,cwd=ROOT)
folder=ROOT/'release/IsaacAtlas'
for name in ('README.md','LICENSE','THIRD_PARTY.md','PRIVACY.md','VERIFICHE.md','CHANGELOG.md'):
    shutil.copyfile(ROOT/name,folder/name)
shutil.copytree(ROOT/'docs',folder/'docs',dirs_exist_ok=True)
(folder/'tests').mkdir(exist_ok=True)
shutil.copyfile(ROOT/'tests/README.md',folder/'tests/README.md')
licenses=folder/'third-party-licenses';licenses.mkdir(exist_ok=True)
manifest=[]
for dist in importlib.metadata.distributions():
    name=dist.metadata['Name']
    if name.lower()=='lupa':continue # Test-only dependency, not distributed.
    entry={'name':name,'version':dist.version,'license':dist.metadata.get('License-Expression') or dist.metadata.get('License','See included notices')}
    manifest.append(entry)
    for item in dist.files or []:
        if any(word in Path(str(item)).name.lower() for word in ('license','copying','notice')):
            path=Path(dist.locate_file(item))
            if path.is_file() and path.stat().st_size<2000000:
                target=licenses/name/Path(str(item)).name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(path,target)
(licenses/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
python_license=Path(sys.base_prefix)/'LICENSE.txt'
if python_license.exists():shutil.copyfile(python_license,licenses/'Python-LICENSE.txt')
archive=shutil.make_archive(str(ROOT/'release'/('IsaacAtlas-'+VERSION+'-windows-x64')),'zip',ROOT/'release','IsaacAtlas')
digest=hashlib.sha256(Path(archive).read_bytes()).hexdigest()
Path(archive+'.sha256').write_text(digest+'  '+Path(archive).name+'\n')
print('Pacchetto compilato:',Path(archive).name)
