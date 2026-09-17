"""Read only the companion mod's bounded JSON snapshots. No process memory access."""
import json, time, math
from pathlib import Path
from discovery import game_dirs, config, native_path

NORMAL=['Isaac','Magdalene','Cain','Judas','???','Eve','Samson','Azazel','Lazarus','Eden','The Lost','Lazarus','Judas','Lilith','Keeper','Apollyon','The Forgotten','The Forgotten','Bethany','Jacob and Esau','Jacob and Esau']
TAINTED=['Isaac','Magdalene','Cain','Judas','???','Eve','Samson','Azazel','Lazarus','Eden','Lost','Lilith','Keeper','Apollyon','Forgotten','Bethany','Jacob']
CHARACTERS=dict(enumerate(NORMAL+['Tainted '+n for n in TAINTED]+['Tainted Lazarus','Tainted Jacob','Tainted Forgotten']))

def map_signals(rooms, current):
    """Qualitative hints using ONLY the visible map, never hidden descriptors."""
    kinds={7:'secret',8:'supersecret',29:'ultrasecret'}
    known=[{'kind':kinds[r['type']],'index':r['index'],'status':'known',
            'strength':'nota','direction':'mappa','reason':'Stanza visitata o icona visibile sulla mappa.'}
           for r in rooms if r['type'] in kinds]
    # GridIndex is the top-left anchor, including the missing corner of LTL.
    square=((0,0),(1,0),(0,1),(1,1))
    shapes={1:((0,0),),2:((0,0),),3:((0,0),),
            4:((0,0),(0,1)),5:((0,0),(0,1)),
            6:((0,0),(1,0)),7:((0,0),(1,0)),8:square,
            9:tuple(p for p in square if p!=(0,0)),
            10:tuple(p for p in square if p!=(1,0)),
            11:tuple(p for p in square if p!=(0,1)),
            12:tuple(p for p in square if p!=(1,1))}
    occupied={}; current_cells=set()
    for r in rooms:
        if r['shape'] not in shapes:
            return known, 'Stime sospese: forma stanza sconosciuta. Ultra Secret: dati insufficienti.'
        for dx,dy in shapes[r['shape']]:
            x,y=r['index']%13+dx,r['index']//13+dy
            if not (0<=x<13 and 0<=y<13):
                return known, 'Stime sospese: geometria fuori mappa.'
            cell=y*13+x; occupied[cell]=r
            if r['index']==current:current_cells.add(cell)
    if not current_cells:
        return known, 'Stime sospese: stanza corrente assente dalla mappa visibile.'
    def adjacent(index):
        x,y=index%13,index//13
        return [j for j,ok in ((index-1,x>0),(index+1,x<12),(index-13,y>0),(index+13,y<12)) if ok]
    directions={-1:'ovest',1:'est',-13:'nord',13:'sud'}
    known_kinds={r['kind'] for r in known}
    candidates=[]
    frontier={n for cell in current_cells for n in adjacent(cell)}-current_cells
    for index in sorted(frontier):
        if index in occupied: continue
        neighbours={occupied[j]['index'] for j in adjacent(index) if j in occupied}
        # A missing cell may still hold an ordinary unexplored room. No percentage.
        approaches=sorted({directions[index-cell] for cell in current_cells if index in adjacent(cell)})
        for kind in (('secret',) if len(neighbours)>=2 else ('secret','supersecret')):
            if kind in known_kinds: continue
            candidates.append({'kind':kind,'index':index,'status':'candidate',
                'strength':'media' if len(neighbours)>=2 else 'bassa',
                'direction':' / '.join(approaches),
                'reason':f'{len(neighbours)} stanze visibili distinte adiacenti; ipotesi geometrica, muri e stanze inesplorate non verificati.'})
    return known+candidates, 'Indizi qualitativi, non percentuali. Ultra Secret: nessuna stima affidabile con questi dati.'

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
    resources=data.get('resources')
    extra['resources']=None
    if resources is not None:
        if not isinstance(resources,dict) or any(type(resources.get(k))!=int or not 0<=resources[k]<=100000 for k in ('coins','bombs','keys','hearts','maxHearts','soulHearts')):
            raise ValueError('Risorse live non valide.')
        extra['resources']={k:resources[k] for k in ('coins','bombs','keys','hearts','maxHearts','soulHearts')}
    actives=data.get('actives',[])
    if actives=={}:actives=[]
    if not isinstance(actives,list) or len(actives)>4:raise ValueError('Attivi non validi.')
    extra['actives']=[]
    for active in actives:
        if not isinstance(active,dict) or any(type(active.get(k))!=int or not 0<=active[k]<=100000 for k in ('slot','id','charge','battery')) or active['slot']>3:raise ValueError('Cariche non valide.')
        extra['actives'].append({k:active[k] for k in ('slot','id','charge','battery')})
    floor_id=data.get('floorId','')
    if not isinstance(floor_id,str) or len(floor_id)>100:raise ValueError('Identità piano non valida.')
    extra['floorId']=floor_id
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
        if not isinstance(pickup,dict) or pickup.get('kind') not in ('collectible','card','rune','pill','coin','key','bomb','chest','heart','bag','battery','trinket','unknown'):
            raise ValueError('Pickup live non valido.')
        if type(pickup.get('subtype',0))!=int or not 0<=pickup.get('subtype',0)<=100000:
            raise ValueError('Pickup live non valido.')
        price=pickup.get('price',0)
        if type(price)!=int or not -10000<=price<=10000: price=0
        coordinates=[]
        for axis in ('x','y'):
            value=pickup.get(axis,0)
            if type(value) not in (int,float) or not math.isfinite(value) or abs(value)>100000: raise ValueError('Coordinate pickup non valide.')
            coordinates.append(round(value,1))
        clean_pickups.append({'kind':pickup['kind'],'subtype':pickup.get('subtype',0),
                              'id':str(pickup.get('id',''))[:80],
                              'hidden':pickup.get('hidden') is True,
                              'variant':pickup.get('variant',0) if type(pickup.get('variant',0))==int else 0,
                              'price':price,
                              'x':coordinates[0], 'y':coordinates[1]})
    extra['pickups']=clean_pickups
    extra['pickupsTruncated']=data.get('pickupsTruncated') is True
    rocks=data.get('rocks',[])
    if rocks=={}:rocks=[]
    if not isinstance(rocks,list) or len(rocks)>448:raise ValueError('Rocce non valide.')
    extra['rocks']=[]
    for rock in rocks:
        if not isinstance(rock,dict) or rock.get('kind') not in ('tinted','super_tinted'):raise ValueError('Tipo roccia non valido.')
        if type(rock.get('index'))!=int or not 0<=rock['index']<448:raise ValueError('Indice roccia non valido.')
        if any(type(rock.get(k)) not in (int,float) or not math.isfinite(rock[k]) or abs(rock[k])>100000 for k in ('x','y')):raise ValueError('Posizione roccia non valida.')
        extra['rocks'].append({k:rock[k] for k in ('kind','index','x','y')})
    extra['rocksSupported']='rocks' in data
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
    # Old Bridges exported hidden room types with an invented fixed confidence.
    # Validate for backwards compatibility, but never forward those suggestions.
    extra['secretCandidates']=[]
    room=data.get('room',{})
    if room=={}: room={}
    if not isinstance(room,dict): raise ValueError('Stanza live non valida.')
    index=room.get('index',-1); room_type=room.get('type',0)
    if type(index)!=int or not -1000<=index<=100000 or type(room_type)!=int or not 0<=room_type<=100: raise ValueError('Stanza live non valida.')
    list_index=room.get('listIndex',-1)
    if type(list_index)!=int or not -1<=list_index<=100000: raise ValueError('Identità stanza non valida.')
    extra['room']={'index':index,'listIndex':list_index,'type':room_type,'clear':room.get('clear') is True}
    visible=data.get('visibleRooms',[])
    if visible=={}: visible=[]
    if not isinstance(visible,list) or len(visible)>512: raise ValueError('Mappa visibile non valida.')
    safe=[]
    for r in visible:
        if not isinstance(r,dict) or any(type(r.get(k))!=int for k in ('index','shape','type')): raise ValueError('Stanza visibile non valida.')
        if not 0<=r['index']<169 or not 0<=r['shape']<=20 or not 0<=r['type']<=100: raise ValueError('Stanza visibile fuori intervallo.')
        safe.append({k:r[k] for k in ('index','shape','type')})
    if data.get('mapSuppressed') is True:
        extra['mapMessage']='Mappa nascosta: stime sospese.'
    elif 'visibleRooms' not in data:
        extra['mapMessage']='Aggiorna Bridge a 1.0.1 per gli indizi basati sulla mappa visibile.'
    else:
        extra['secretCandidates'],extra['mapMessage']=map_signals(safe,index)
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
