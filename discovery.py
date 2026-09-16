"""Discover known Steam locations; never scan arbitrary drives or choose an account silently."""
from pathlib import Path
import os, re, json, hashlib

from runtime import ROOT, config_path

def native_path(value):
    value = str(value).replace('\\', '/')
    if os.name != 'nt' and re.match(r'^[A-Za-z]:/', value):
        value = '/mnt/' + value[0].lower() + value[2:]
    return Path(value).expanduser()

def config():
    p = config_path()
    value=json.loads(p.read_text(encoding='utf-8')) if p.exists() else {}
    if not isinstance(value,dict):raise ValueError('La configurazione deve essere un oggetto JSON.')
    return value

def unique(paths):
    return list(dict.fromkeys(p.resolve() for p in paths if p.exists()))

def steam_roots():
    paths = []
    if os.environ.get('STEAM_PATH'): paths.append(native_path(os.environ['STEAM_PATH']))
    if os.name == 'nt':
        import winreg
        for hive, key, value in [(winreg.HKEY_CURRENT_USER, r'Software\Valve\Steam', 'SteamPath'),
                                  (winreg.HKEY_LOCAL_MACHINE, r'SOFTWARE\WOW6432Node\Valve\Steam', 'InstallPath')]:
            try:
                with winreg.OpenKey(hive, key) as k: paths.append(native_path(winreg.QueryValueEx(k, value)[0]))
            except OSError: pass
        paths.append(Path(os.environ.get('PROGRAMFILES(X86)', 'C:/Program Files (x86)')) / 'Steam')
    else:
        paths.extend([Path.home()/'.steam/steam', Path.home()/'.local/share/Steam',
                      Path.home()/'Library/Application Support/Steam', Path('/mnt/c/Program Files (x86)/Steam')])
    return unique(paths)

def libraries():
    roots = steam_roots(); paths = list(roots)
    for root in roots:
        p = root/'steamapps/libraryfolders.vdf'
        if p.exists():
            for value in re.findall(r'"path"\s*"([^"]+)"', p.read_text(errors='replace')):
                paths.append(native_path(value.replace('\\\\', '\\')))
    return unique(paths)

def game_dirs():
    paths=[]
    for library in libraries():
        manifest=library/'steamapps/appmanifest_250900.acf'
        if manifest.exists():
            match=re.search(r'"installdir"\s*"([^"]+)"',manifest.read_text(errors='replace'))
            if match: paths.append(library/'steamapps/common'/match[1])
    return unique(paths)

def documents_dirs():
    paths=[Path.home()/'Documents']
    if os.name=='nt':
        import winreg
        try:
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER,r'Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders') as key:
                paths.append(Path(os.path.expandvars(winreg.QueryValueEx(key,'Personal')[0])))
        except OSError: pass
    for library in libraries():
        paths.extend((library/'steamapps/compatdata/250900/pfx/drive_c/users').glob('*/Documents'))
    return unique(paths)

def save_sources():
    cfg=config(); explicit=cfg.get('save_directory') or cfg.get('save_path')
    if explicit:
        p=native_path(explicit);return [p.parent if p.suffix=='.dat' else p]
    cloud=[]
    for root in steam_roots():
        cloud.extend(p for p in (root/'userdata').glob('*/250900/remote') if any(p.glob('rep+persistentgamedata[123].dat')))
    local=[]; cloud_disabled=False
    for documents in documents_dirs():
        p=documents/'My Games/Binding of Isaac Repentance+'
        options=p/'options.ini'
        if options.exists() and re.search(r'^SteamCloud\s*=\s*0\s*$',options.read_text(errors='replace'),re.M):cloud_disabled=True
        if any(p.glob('persistentgamedata[123].dat')):local.append(p)
    # When Steam Cloud is disabled, its files may be stale.
    return unique(local if cloud_disabled else cloud or local)

def source_path(source=None):
    paths=save_sources()
    if source is not None:
        matches=[p for p in paths if source_id(p)==source]
        if len(matches)!=1:raise ValueError('Sorgente non disponibile. Ricarica la pagina.')
        return matches[0]
    if len(paths)==1:return paths[0]
    if not paths:raise ValueError('Nessun salvataggio Repentance+ trovato. Avvia il gioco e salva una partita, oppure configura save_directory in config.json.')
    raise ValueError('Più profili Steam trovati: seleziona la sorgente del salvataggio.')

def save_path(slot, source=None):
    p=source_path(source)
    prefix='rep+' if p.name=='remote' or any(p.glob('rep+persistentgamedata[123].dat')) else ''
    return p/f'{prefix}persistentgamedata{slot}.dat'

def source_id(path):
    return hashlib.sha256(str(path.resolve()).encode()).hexdigest()[:16]

def source_info():
    return [{'id':source_id(p),'label':f'{"Steam" if p.name=="remote" else "Locale"} · profilo {i+1}',
             'slots':[n for n in (1,2,3) if (p/f'rep+persistentgamedata{n}.dat').exists() or (p/f'persistentgamedata{n}.dat').exists()]}
            for i,p in enumerate(save_sources())]
