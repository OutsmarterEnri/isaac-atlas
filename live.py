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
    if not isinstance(data,dict) or data.get('schema') not in (1,2):raise ValueError('Versione bridge non supportata.')
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
    events=data.get('events',[])
    if events=={}:events=[]
    if not isinstance(events,list) or len(events)>128:raise ValueError('Eventi non validi.')
    clean_events=[]
    for event in events:
        if not isinstance(event,dict) or not isinstance(event.get('boss'),str) or len(event['boss'])>40 or type(event.get('playerType'))!=int:raise ValueError('Evento non valido.')
        clean_events.append({'boss':event['boss'],'character':CHARACTERS.get(event['playerType'],'Personaggio moddato')})
    extra={'events':clean_events,'bridgeVersion':str(data.get('bridgeVersion','0.1'))[:20]}
    for key in ('bossRushLimit','hushLimit','stageType'):
        value=data.get(key)
        if value is not None and (type(value)!=int or not 0<=value<=2147483647):raise ValueError('Contatore live non valido.')
        extra[key]=value
    for key in ('megaDoor','motherDoor','ascent'):extra[key]=data.get(key) is True
    pickups=data.get('pickups',[])
    if pickups=={}:pickups=[]
    if not isinstance(pickups,list) or len(pickups)>128:raise ValueError('Pickup live non validi.')
    clean_pickups=[]
    for pickup in pickups:
        if not isinstance(pickup,dict) or pickup.get('kind') not in ('collectible','card','rune','pill','coin','key','bomb','chest','heart','bag'):
            raise ValueError('Pickup live non valido.')
        if type(pickup.get('subtype',0))!=int or not 0<=pickup.get('subtype',0)<=100000:
            raise ValueError('Pickup live non valido.')
        price=pickup.get('price',0)
        if type(price)!=int or not -10000<=price<=10000: price=0
        clean_pickups.append({'kind':pickup['kind'],'subtype':pickup.get('subtype',0),
                              'price':price,
                              'x':round(float(pickup.get('x',0)),1) if isinstance(pickup.get('x',0),(int,float)) else 0,
                              'y':round(float(pickup.get('y',0)),1) if isinstance(pickup.get('y',0),(int,float)) else 0})
    extra['pickups']=clean_pickups
    rooms=data.get('secretCandidates',[])
    if rooms=={}:rooms=[]
    if not isinstance(rooms,list) or len(rooms)>32:raise ValueError('Candidati stanza non validi.')
    clean_rooms=[]
    for room in rooms:
        if not isinstance(room,dict) or room.get('kind') not in ('secret','supersecret','ultrasecret'):
            raise ValueError('Candidato stanza non valido.')
        confidence=room.get('confidence',0)
        if not isinstance(confidence,(int,float)) or not 0<=confidence<=1:raise ValueError('Confidenza non valida.')
        room_index=room.get('index',-1)
        if type(room_index)!=int or not -1<=room_index<=100000: raise ValueError('Indice stanza non valido.')
        clean_rooms.append({'kind':room['kind'],'confidence':round(float(confidence),2),'index':room_index,
                            'direction':str(room.get('direction',''))[:12],
                            'reason':str(room.get('reason',''))[:160]})
    extra['secretCandidates']=clean_rooms
    room=data.get('room',{})
    if room=={}: room={}
    if not isinstance(room,dict): raise ValueError('Stanza live non valida.')
    index=room.get('index',-1); room_type=room.get('type',0)
    if type(index)!=int or not -1<=index<=100000 or type(room_type)!=int or not 0<=room_type<=100: raise ValueError('Stanza live non valida.')
    extra['room']={'index':index,'type':room_type,'clear':room.get('clear') is True}
    return extra | {k:data[k] for k in ('schema','state','frames','playerType','difficulty','stage','challenge','sequence','run')} | {
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
