"""Import selected images from the user's installed game. Never ship game assets."""
from pathlib import Path, PurePosixPath
import hashlib, json, os, re, shutil, struct, subprocess, tempfile, threading
import xml.etree.ElementTree as ET
from discovery import config, native_path, game_dirs
from runtime import ROOT, data_dir

_LOCK=threading.Lock()
_state={'status':'idle','message':''}
PNG=b'\x89PNG\r\n\x1a\n'
LAYERS={"Mom's Heart":'Heart','Isaac':'Cross','Satan':'UpsideDownCross','Boss Rush':'Star','???':'Polaroid','The Lamb':'Negative','Mega Satan':'MegaSatan','Ultra Greedier':'Greed','Hush':'Hush','Mother':'Knife','The Beast':'DadsNote'}

def cache_dir():return data_dir()/'local-assets'

def allowed_name(name):
    p=PurePosixPath(name)
    if p.is_absolute() or '..' in p.parts or '\\' in name:return False
    return name in ('resources/items.xml','resources/achievements.xml','resources/gfx/ui/completion_widget.anm2','resources/gfx/ui/completion_widget.png') or (name.endswith('.png') and any(name.startswith('resources/gfx/'+prefix) for prefix in ('items/collectibles/','items/trinkets/','ui/achievement/')))

def png_size(data):
    if len(data)<33 or len(data)>2_000_000 or data[:8]!=PNG or data[12:16]!=b'IHDR':raise ValueError('Immagine non valida.')
    w,h=struct.unpack('>II',data[16:24])
    if not 0<w<=4096 or not 0<h<=4096:raise ValueError('Dimensioni immagine non valide.')
    return w,h

def xml(path):
    data=path.read_bytes()
    if len(data)>4_000_000 or b'<!DOCTYPE' in data.upper() or b'<!ENTITY' in data.upper():raise ValueError('Indice immagini non valido.')
    return ET.fromstring(data)

def build_manifest(extracted, destination, catalog):
    """IDs are taken from local XML, never guessed from localized display names."""
    root=Path(extracted).resolve(); destination=Path(destination);blobs=destination/'blobs';blobs.mkdir(parents=True,exist_ok=True)
    files={p.relative_to(root).as_posix().lower():p for p in root.rglob('*') if p.is_file() and p.resolve().is_relative_to(root)}
    def put(relative):
        p=files.get(relative.lower())
        if p is None or not allowed_name(relative.lower()):return None
        data=p.read_bytes();w,h=png_size(data);key=hashlib.sha256(data).hexdigest()
        (blobs/(key+'.png')).write_bytes(data)
        return {'url':'/api/art/image/'+key+'.png','width':w,'height':h}
    manifest={'version':1,'rewards':{},'marks':{}}
    achievements={}
    path=files.get('resources/achievements.xml')
    if path:
        for row in xml(path):
            if row.tag=='achievement' and row.get('id','').isdigit():achievements[int(row.get('id'))]=row.get('gfx','')
    items={}
    path=files.get('resources/items.xml')
    if path:
        for row in xml(path):
            if row.get('id','').isdigit() and row.tag in ('active','passive','familiar','trinket'):
                category='trinkets' if row.tag=='trinket' else 'collectibles'
                items[(category,int(row.get('id')))]=row.get('gfx','')
    for row in catalog:
        picture=None;item=row.get('itemId')
        if item:
            cat='trinkets' if row['category']=='Trinket' else 'collectibles';number=item-2000 if cat=='trinkets' else item
            name=items.get((cat,number),'')
            if name and PurePosixPath(name).name==name:picture=put('resources/gfx/items/'+cat+'/'+name)
        if not picture:
            name=achievements.get(row['id'],'')
            if name and PurePosixPath(name).name==name:picture=put('resources/gfx/ui/achievement/'+name)
        if picture:
            picture['kind']='achievement' if picture['width']>100 else 'item'
            manifest['rewards'][str(row['id'])]=picture
    path=files.get('resources/gfx/ui/completion_widget.anm2')
    if path:
        actor=xml(path);sheet=put('resources/gfx/ui/completion_widget.png')
        layers={x.get('Name'):x.get('Id') for x in actor.findall('./Content/Layers/Layer') if x.get('SpritesheetId')=='0'}
        animations={x.get('LayerId'):x for x in actor.findall('./Animations/Animation[@Name="Idle"]/LayerAnimations/LayerAnimation')}
        if sheet:
            for boss,name in LAYERS.items():
                layer=animations.get(layers.get(name));frames=[] if layer is None else [f for f in layer.findall('Frame') if f.get('Visible')=='true']
                if not frames:continue
                f=frames[0];x,y,w,h=[int(f.get(k,'0')) for k in ('XCrop','YCrop','Width','Height')]
                if min(x,y)>=0 and w>0 and h>0 and x+w<=sheet['width'] and y+h<=sheet['height']:
                    manifest['marks'][boss]=dict(sheet,crop=[x,y,w,h])
    if not manifest['rewards']:raise ValueError('Nessuna immagine compatibile trovata.')
    return manifest

def manifest():
    try:
        p=cache_dir()/'manifest.json'
        if p.stat().st_size>500_000:raise ValueError()
        value=json.loads(p.read_text(encoding='utf-8'))
        if value.get('version')!=1:raise ValueError()
        return value
    except (OSError,ValueError,AttributeError):return {'version':1,'rewards':{},'marks':{}}

def status():
    value=manifest()
    with _LOCK:return dict(_state,rewards=len(value['rewards']),marks=len(value['marks']))

def image_bytes(name):
    if not re.fullmatch(r'[a-f0-9]{64}\.png',name):raise ValueError('Immagine non valida.')
    base=(cache_dir()/'blobs').resolve();path=base/name
    if not path.resolve().is_relative_to(base):raise ValueError('Immagine non valida.')
    if path.stat().st_size>2_000_000:raise ValueError('Immagine non valida.')
    value=path.read_bytes();png_size(value);return value

def install_from(extracted):
    destination=cache_dir();destination.mkdir(parents=True,exist_ok=True)
    catalog=json.loads((ROOT/'dist/data/catalog.json').read_text(encoding='utf-8'))
    value=build_manifest(extracted,destination,catalog)
    fd,name=tempfile.mkstemp(prefix='.manifest-',dir=destination)
    try:
        with os.fdopen(fd,'w',encoding='utf-8') as stream:json.dump(value,stream)
        os.replace(name,destination/'manifest.json')
    finally:
        if os.path.exists(name):os.unlink(name)
    return value

def game_root():
    cfg=config();roots=[native_path(cfg['game_directory'])] if cfg.get('game_directory') else game_dirs()
    if len(roots)!=1 or not (roots[0]/'isaac-ng.exe').is_file():raise ValueError('Scegli e salva la cartella di Isaac prima di importare le immagini.')
    return roots[0]

def import_worker(root):
    global _state
    try:
        exe=root/'tools/ResourceExtractor/ResourceExtractor.exe';listing=exe.parent/'filelist.txt'
        if os.name!='nt' or not exe.is_file() or not listing.is_file():raise ValueError('Estrazione automatica disponibile su Windows con ResourceExtractor installato dal gioco.')
        # A filtered official file list avoids extracting audio, movies or unrelated content.
        names=[s.strip() for s in listing.read_text(encoding='utf-8-sig').splitlines() if allowed_name(s.strip())]
        if not names:raise ValueError('Elenco delle risorse non compatibile.')
        cache_dir().mkdir(parents=True,exist_ok=True)
        with tempfile.TemporaryDirectory(prefix='import-',dir=cache_dir()) as temp:
            stage=Path(temp)
            (stage/'filelist.txt').write_bytes(('\r\n'.join(names)+'\r\n').encode('utf-8'))
            # This extractor requires forward slashes even on Windows; backslashes corrupt lookup.
            process=subprocess.run([str(exe),root.as_posix(),stage.as_posix()],cwd=stage,input=b'\n\n',stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=180,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
            if process.returncode:raise ValueError('L’estrattore del gioco non ha completato l’importazione. Verifica i file di Isaac da Steam e riprova.')
            value=install_from(stage)
        message=f"Immagini locali pronte: {len(value['rewards'])} ricompense e {len(value['marks'])} simboli."
        result={'status':'ready','message':message}
    except subprocess.TimeoutExpired:result={'status':'error','message':'L’estrazione ha superato 3 minuti. Le immagini precedenti restano disponibili; riprova.'}
    except ValueError as e:result={'status':'error','message':str(e)}
    except (OSError,ET.ParseError):result={'status':'error','message':'Risorse non leggibili o incomplete. Verifica i file del gioco e riprova.'}
    except Exception:result={'status':'error','message':'Importazione non completata. Le immagini precedenti restano disponibili.'}
    with _LOCK:_state=result

def start_import():
    global _state
    root=game_root()
    with _LOCK:
        if _state['status']=='importing':return dict(_state)
        _state={'status':'importing','message':'Importazione delle immagini dal gioco in corso…'}
        threading.Thread(target=import_worker,args=(root,),daemon=True).start()
        return dict(_state)
