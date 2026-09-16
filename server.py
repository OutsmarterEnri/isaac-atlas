"""Isaac Atlas: read-only local save viewer. Python standard library only."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlsplit, parse_qs
from datetime import datetime, timezone
import argparse, hashlib, json, os, struct, webbrowser, secrets

from discovery import save_path, source_info
from live import live_state

from runtime import ROOT, VERSION
import local_art
from settings import read_settings, write_config, install_bridge, diagnostics
SESSION_TOKEN = secrets.token_urlsafe(32)
CRC_TABLE = json.loads((ROOT / 'crc_table.json').read_text())

def parse_save(data):
    if not 2048 <= len(data) <= 262144 or data[:16] != b'ISAACNGSAVE09R  ':
        raise ValueError('Formato del salvataggio non riconosciuto: serve Repentance+.')
    crc = (~0xFEDCBA76) & 0xffffffff
    for byte in data[16:-4]:
        crc = CRC_TABLE[(crc & 255) ^ byte] ^ (crc >> 8)
    if (~crc) & 0xffffffff != struct.unpack_from('<I', data, len(data)-4)[0]:
        raise ValueError('Il gioco sta aggiornando il salvataggio o il file non è integro. Nuovo tentativo tra 5 secondi.')
    chunks, offset = {}, 20
    for expected, width in enumerate([1,4,4,1,1,1,1,4,4,1], 1):
        if offset+12 > len(data)-4:
            raise ValueError('Salvataggio incompleto.')
        kind, _, count = struct.unpack_from('<III', data, offset)
        end = offset+12+count*width
        if kind != expected or count > 10000 or end > len(data)-4:
            raise ValueError('Struttura del salvataggio non supportata.')
        chunks[kind] = data[offset+12:end]
        offset = end
    flags = chunks[1]
    if len(flags) != 642 or any(x not in (0,1) for x in flags):
        raise ValueError('Questo lettore richiede lo slot di Repentance+ con 641 segreti.')
    return {'unlocked': [i for i in range(1,642) if flags[i]],
            'collected': [i for i, flag in enumerate(chunks[4]) if flag],
            'hash': hashlib.sha256(data).hexdigest()}

def current_save(slot=1, source=None):
    if type(slot) is not int or slot not in (1, 2, 3):
        raise ValueError('Slot non valido: scegli 1, 2 o 3.')
    path = save_path(slot, source)
    if not path.is_file():
        raise ValueError(f'Slot {slot} non disponibile: avvialo e salva una partita in Repentance+.')
    before = path.stat()
    data = path.read_bytes()
    after = path.stat()
    if before.st_mtime_ns != after.st_mtime_ns or before.st_size != after.st_size:
        raise ValueError('Salvataggio in aggiornamento: riprovo tra 5 secondi.')
    result = parse_save(data)
    result.update({'filename': path.name, 'slot': slot, 'version': 'Repentance+',
        'modified': datetime.fromtimestamp(after.st_mtime, timezone.utc).isoformat(),
        'checked': datetime.now(timezone.utc).isoformat()})
    return result

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT/'dist'), **kwargs)
    def do_GET(self):
        allowed = {f'127.0.0.1:{self.server.server_port}', f'localhost:{self.server.server_port}'}
        if self.headers.get('Host') not in allowed:
            self.send_error(403); return
        if self.headers.get('Sec-Fetch-Site') == 'cross-site':
            self.send_error(403); return
        route = urlsplit(self.path).path
        if route == '/api/art/manifest':
            self.respond(200,local_art.manifest());return
        if route == '/api/art/status':
            self.respond(200,local_art.status());return
        if route.startswith('/api/art/image/'):
            try:body=local_art.image_bytes(route.removeprefix('/api/art/image/'))
            except (OSError,ValueError):self.send_error(404);return
            self.send_response(200);self.send_header('Content-Type','image/png');self.send_header('Content-Length',str(len(body)));self.send_header('Cache-Control','private, max-age=86400');self.end_headers();self.wfile.write(body);return
        if route == '/api/session':
            self.respond(200, {'token':SESSION_TOKEN,'version':VERSION}); return
        if route == '/api/settings':
            try: self.respond(200, read_settings())
            except (ValueError,OSError): self.respond(503, {'error':'Configurazione non leggibile.'})
            return
        if route == '/api/diagnostics':
            try: self.respond(200, diagnostics())
            except (ValueError,OSError): self.respond(503, {'error':'Diagnostica non disponibile: controlla la configurazione.'})
            return
        if route == '/api/sources':
            try: self.respond(200, {'sources': source_info()})
            except (ValueError, OSError): self.respond(503, {'error':'Rilevamento non disponibile.'})
            return
        if route == '/api/live':
            try: self.respond(200, live_state())
            except (ValueError, OSError): self.respond(503, {'error':'Dati live non disponibili.'})
            return
        if route == '/api/progress':
            values = parse_qs(urlsplit(self.path).query, keep_blank_values=True).get('slot', ['1'])
            if len(values) != 1 or values[0] not in ('1', '2', '3'):
                self.respond(400, {'error': 'Slot non valido: scegli 1, 2 o 3.'}); return
            try:
                self.respond(200, current_save(int(values[0]), parse_qs(urlsplit(self.path).query).get('source', [None])[0]))
            except ValueError as exc:
                self.respond(503, {'error': str(exc)})
            except OSError:
                self.respond(503, {'error': 'File non leggibile. Riprovo tra 5 secondi.'})
            return
        super().do_GET()
    def do_POST(self):
        host=self.headers.get('Host','')
        allowed={f'127.0.0.1:{self.server.server_port}',f'localhost:{self.server.server_port}'}
        if host not in allowed or self.headers.get('Sec-Fetch-Site')=='cross-site' or self.headers.get('Origin') not in (None,'http://'+host):
            self.respond(403,{'error':'Origine non consentita.'});return
        if not secrets.compare_digest(self.headers.get('X-Atlas-Token',''),SESSION_TOKEN):
            self.respond(403,{'error':'Sessione non valida. Ricarica la pagina.'});return
        try:
            size=int(self.headers.get('Content-Length','0'))
            if not 0<size<=16384 or self.headers.get_content_type()!='application/json':raise ValueError('Richiesta non valida.')
            data=json.loads(self.rfile.read(size))
            route=urlsplit(self.path).path
            if route=='/api/art/import':
                if data!={}:raise ValueError('Richiesta non valida.')
                result=local_art.start_import()
            elif route=='/api/settings':result=write_config(data)
            elif route=='/api/bridge/install':
                if not isinstance(data,dict) or set(data)-{'game_directory','update'} or not isinstance(data.get('game_directory',''),str) or type(data.get('update',False)) is not bool:raise ValueError('Richiesta non valida.')
                result=install_bridge(data.get('game_directory',''),data.get('update',False))
            else:self.respond(404,{'error':'Operazione non disponibile.'});return
            self.respond(200,result)
        except (ValueError,TypeError):self.respond(400,{'error':'Importazione non avviata: salva la cartella corretta di Isaac in Configurazione.' if urlsplit(self.path).path=='/api/art/import' else 'Operazione non riuscita: controlla le cartelle e, per una Bridge esistente, scegli Aggiorna.'})
        except OSError:self.respond(503,{'error':'Impossibile scrivere la configurazione o installare la Bridge. Verifica i permessi della cartella.'})
    def respond(self, status, payload):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header('Content-Type','application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control','no-store')
        self.end_headers(); self.wfile.write(body)
    def end_headers(self):
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Referrer-Policy','no-referrer')
        self.send_header('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'")
        super().end_headers()
    def log_message(self, fmt, *args):
        if args and str(args[1:2]) != "('200',)":
            super().log_message(fmt,*args)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--open', action='store_true')
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
    print(f'Isaac Atlas: http://127.0.0.1:{args.port}',flush=True)
    if args.open: webbrowser.open(f'http://127.0.0.1:{args.port}')
    try: server.serve_forever()
    except KeyboardInterrupt: server.server_close()
