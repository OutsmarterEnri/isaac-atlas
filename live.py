"""Read only the companion mod's bounded JSON snapshots. No process memory access."""
import json, time
from pathlib import Path
from discovery import game_dirs, config, native_path

NORMAL=['Isaac','Magdalene','Cain','Judas','???','Eve','Samson','Azazel','Lazarus','Eden','The Lost','Lazarus','Judas','Lilith','Keeper','Apollyon','The Forgotten','The Forgotten','Bethany','Jacob and Esau','Jacob and Esau']
TAINTED=['Isaac','Magdalene','Cain','Judas','???','Eve','Samson','Azazel','Lazarus','Eden','Lost','Lilith','Keeper','Apollyon','Forgotten','Bethany','Jacob']
CHARACTERS=dict(enumerate(NORMAL+['Tainted '+n for n in TAINTED]+['Tainted Lazarus','Tainted Jacob','Tainted Forgotten']))

def bridge_files():
    cfg=config()
    roots=[native_path(cfg['game_directory'])] if cfg.get('game_directory') else game_dirs()
    return [p for root in roots for folder in ('data','data/repentance+','mods')
            for p in (root/folder/'isaac-atlas-bridge').glob('save[123].dat')]

def validate(data):
    if not isinstance(data,dict) or data.get('schema')!=1:raise ValueError('Versione bridge non supportata.')
    if data.get('state') not in ('running','paused','ended','menu'):raise ValueError('Stato non valido.')
    for key in ('frames','playerType','difficulty','stage','challenge','sequence'):
        value=data.get(key)
        if type(value)!=int or not 0<=value<=2147483647:raise ValueError('Dati live non validi.')
    if not isinstance(data.get('run'),str) or len(data['run'])>100:raise ValueError('Run non valida.')
    items=data.get('items',[])
    # Lua JSON can encode empty arrays as objects.
    if items=={}:items=[]
    if not isinstance(items,list) or len(items)>2048 or any(type(i)!=int or i<1 or i>100000 for i in items):raise ValueError('Inventario non valido.')
    cards=data.get('cards',[])
    if cards=={}:cards=[]
    if not isinstance(cards,list) or len(cards)>4 or any(type(i)!=int or i<0 or i>100000 for i in cards):raise ValueError('Carte non valide.')
    return {k:data[k] for k in ('schema','state','frames','playerType','difficulty','stage','challenge','sequence','run')} | {
        'character':CHARACTERS.get(data['playerType'],'Personaggio moddato'),
        'items':items,'cards':cards,'custom':data.get('custom') is True,
        'players':data.get('players',1) if type(data.get('players',1))==int else 1}

def live_state():
    files=bridge_files()
    if not files:return {'status':'not_connected','message':'Avvia una run con Isaac Atlas Bridge abilitata. Consulta la guida Modalità live.'}
    path=max(files,key=lambda p:p.stat().st_mtime_ns)
    before=path.stat()
    if before.st_size>65536:raise ValueError('Snapshot live troppo grande.')
    with path.open('rb') as stream:raw=stream.read(65537)
    after=path.stat()
    if before.st_mtime_ns!=after.st_mtime_ns or len(raw)>65536:raise ValueError('Snapshot in aggiornamento.')
    data=validate(json.loads(raw))
    age=max(0,time.time()-after.st_mtime)
    data.update(slot=int(path.stem[-1]),age=round(age,1))
    # Never present an old snapshot as an active run, including after a crash.
    data['status']='stale' if age>8 else data['state']
    return data
