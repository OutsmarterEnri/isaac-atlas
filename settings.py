"""Explicit local settings mutations; never write to persistent game saves."""
from pathlib import Path
import json, os, tempfile, hashlib
from discovery import config, native_path, steam_roots, game_dirs, source_info
from runtime import ROOT, VERSION, config_path

def write_config(values):
    if not isinstance(values,dict) or set(values)-{'save_directory','game_directory'}:
        raise ValueError('Campi di configurazione non validi.')
    clean={}
    for key in ('save_directory','game_directory'):
        value=values.get(key,'')
        if not isinstance(value,str) or len(value)>4096:raise ValueError('Percorso non valido.')
        value=value.strip()
        if value:
            path=native_path(value)
            if not path.is_dir():raise ValueError('La cartella indicata non esiste.')
            if key=='game_directory' and not (path/'isaac-ng.exe').is_file():raise ValueError('Seleziona la cartella che contiene isaac-ng.exe.')
            if key=='save_directory' and not any(path.glob('*persistentgamedata[123].dat')):raise ValueError('Questa cartella non contiene i salvataggi dei tre slot.')
            value=str(path.resolve())
        clean[key]=value
    path=config_path();path.parent.mkdir(parents=True,exist_ok=True)
    fd,tmp=tempfile.mkstemp(prefix='.atlas-config-',dir=path.parent)
    try:
        with os.fdopen(fd,'w',encoding='utf-8') as out:json.dump(clean,out,ensure_ascii=False,indent=2)
        os.replace(tmp,path)
    finally:
        if os.path.exists(tmp):os.unlink(tmp)
    return {'saved':True}

def read_settings():
    value=config()
    return {'save_directory':str(value.get('save_directory','')),'game_directory':str(value.get('game_directory','')),'version':VERSION}

def install_bridge(game_directory='', update=False):
    roots=[native_path(game_directory)] if game_directory else ([native_path(config()['game_directory'])] if config().get('game_directory') else game_dirs())
    if len(roots)!=1:raise ValueError('Indica la cartella del gioco: installazione non univoca.')
    root=roots[0]
    if not (root/'isaac-ng.exe').is_file():raise ValueError('Cartella del gioco non valida.')
    target=root/'mods/isaac-atlas-bridge'
    if target.is_symlink():raise ValueError('La cartella della mod è un collegamento: installazione automatica interrotta.')
    if target.exists() and not update:raise ValueError('Bridge già presente. Scegli Aggiorna Bridge.')
    if target.exists() and any(target.iterdir()):
        metadata=target/'metadata.xml'
        if not metadata.is_file() or 'Isaac Atlas Bridge' not in metadata.read_text(errors='replace'):
            raise ValueError('La cartella esistente non è riconoscibile come Isaac Atlas Bridge.')
    target.mkdir(parents=True,exist_ok=True)
    for name in ('main.lua','metadata.xml'):
        p=target/name
        if p.is_symlink():raise ValueError('File della mod non valido.')
        content=(ROOT/'mod/isaac-atlas-bridge'/name).read_bytes()
        fd,tmp=tempfile.mkstemp(prefix='.atlas-',dir=target)
        try:
            with os.fdopen(fd,'wb') as stream:stream.write(content)
            os.replace(tmp,p)
        finally:
            if os.path.exists(tmp):os.unlink(tmp)
    return {'installed':True,'message':'Bridge installata. Riavvia Isaac e abilitala nel menu Mods.'}

def diagnostics():
    # Safe to export: no paths, account ids, seed or save contents.
    result={'version':VERSION,'steam_locations':len(steam_roots()),'game_installations':len(game_dirs()),'checks':[]}
    try:
        sources=source_info();result['profiles']=len(sources);result['slots_available']=[s['slots'] for s in sources]
        result['checks'].append({'name':'Salvataggi','ok':bool(sources),'message':f'{len(sources)} sorgenti rilevate.' if sources else 'Nessun salvataggio: scegli la cartella in Configurazione.'})
    except (ValueError,OSError):result['checks'].append({'name':'Configurazione','ok':False,'message':'Configurazione non leggibile: ripristina il rilevamento automatico.'})
    from live import live_state
    try:
        state=live_state();result['live_status']=state['status']
        result['checks'].append({'name':'Collegamento live','ok':state['status'] in ('running','paused','ended','menu'),'message':{'not_connected':'Avvia una run con la Bridge abilitata.','stale':'Il gioco non sta aggiornando la Bridge.'}.get(state['status'],state['status'])})
    except (ValueError,OSError):result['checks'].append({'name':'Collegamento live','ok':False,'message':'Dati della Bridge incompleti o incompatibili.'})
    roots=game_dirs();cfg=config()
    if cfg.get('game_directory'):roots=[native_path(cfg['game_directory'])]
    result['bridge_installed']=False;result['bridge_current']=False
    for root in roots:
        path=root/'mods/isaac-atlas-bridge/main.lua'
        if path.is_file():
            result['bridge_installed']=True
            result['bridge_current']=path.read_bytes()==(ROOT/'mod/isaac-atlas-bridge/main.lua').read_bytes()
    return result
