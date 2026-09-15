import json, os, struct, sys, tempfile, time, unittest, threading, http.client
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import discovery, server, live


def synthetic_save(unlocked=()):
    data=bytearray(b'ISAACNGSAVE09R  '+b'\0'*4)
    for kind,width in enumerate([1,4,4,1,1,1,1,4,4,1],1):
        count=642 if kind==1 else 733 if kind==4 else 1
        payload=bytearray(count*width)
        if kind==1:
            for n in unlocked:payload[n]=1
        data+=struct.pack('<III',kind,len(payload),count)+payload
    data+=b'\0'*max(0,2048-len(data))
    crc=(~0xFEDCBA76)&0xffffffff
    for byte in data[16:]:crc=server.CRC_TABLE[(crc&255)^byte]^(crc>>8)
    return bytes(data)+struct.pack('<I',(~crc)&0xffffffff)


def snapshot(**kwargs):
    return dict(schema=1,state='running',frames=900,playerType=30,difficulty=1,stage=2,
                challenge=0,sequence=1,run='synthetic-run',items=[451],cards=[],custom=False,players=1,**kwargs)

class AtlasTests(unittest.TestCase):
    def test_save_integrity(self):
        original=synthetic_save([1,610]);self.assertEqual(server.parse_save(original)['unlocked'],[1,610])
        broken=bytearray(original);broken[40]^=1
        with self.assertRaises(ValueError):server.parse_save(broken)
        with self.assertRaises(ValueError):server.parse_save(original[:500])
    def test_three_slots_read_only(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            for n in (1,2,3):(root/f'rep+persistentgamedata{n}.dat').write_bytes(synthetic_save([n]))
            with patch('discovery.save_sources',return_value=[root]):
                for n in (1,2,3):
                    p=root/f'rep+persistentgamedata{n}.dat';before=p.read_bytes()
                    self.assertEqual(server.current_save(n)['unlocked'],[n]);self.assertEqual(p.read_bytes(),before)
                with self.assertRaises(ValueError):server.current_save(4)
    def test_multiple_profiles_require_choice(self):
        with patch('discovery.save_sources',return_value=[Path('/profile-a'),Path('/profile-b')]):
            with self.assertRaises(ValueError):discovery.source_path()
            self.assertEqual(discovery.source_path(discovery.source_id(Path('/profile-b'))),Path('/profile-b'))
            with self.assertRaises(ValueError):discovery.source_path('../private')
    def test_library_manifest(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);lib=root/'Other Library';(root/'steamapps').mkdir();(lib/'steamapps/common/Isaac').mkdir(parents=True)
            (root/'steamapps/libraryfolders.vdf').write_text('"libraryfolders" {"1" {"path" "'+str(lib).replace('\\','\\\\')+'"}}')
            (lib/'steamapps/appmanifest_250900.acf').write_text('"AppState" {"installdir" "Isaac"}')
            with patch('discovery.steam_roots',return_value=[root]):self.assertIn((lib/'steamapps/common/Isaac').resolve(),discovery.game_dirs())
    def test_local_cloud_disabled(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);docs=root/'Documents';local=docs/'My Games/Binding of Isaac Repentance+';local.mkdir(parents=True)
            (local/'options.ini').write_text('SteamCloud=0\n');(local/'persistentgamedata1.dat').write_bytes(synthetic_save())
            cloud=root/'userdata/account/250900/remote';cloud.mkdir(parents=True);(cloud/'rep+persistentgamedata1.dat').write_bytes(synthetic_save([1]))
            with patch('discovery.config',return_value={}),patch('discovery.steam_roots',return_value=[root]),patch('discovery.documents_dirs',return_value=[docs]):self.assertEqual(discovery.save_sources(),[local.resolve()])
    def test_live_lifecycle_and_slot(self):
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/'save2.dat';path.write_text(json.dumps(snapshot()))
            with patch('live.bridge_files',return_value=[path]):
                state=live.live_state();self.assertEqual(state['slot'],2);self.assertEqual(state['character'],'Tainted Eden');self.assertEqual(state['status'],'running')
                for status in ('paused','ended','menu'):
                    data=snapshot();data['state']=status;path.write_text(json.dumps(data));self.assertEqual(live.live_state()['status'],status)
                os.utime(path,(time.time()-30,time.time()-30));self.assertEqual(live.live_state()['status'],'stale')
                path.write_text('{');
                with self.assertRaises(ValueError):live.live_state()
                path.write_bytes(b' '*65537)
                with self.assertRaises(ValueError):live.live_state()
    def test_http_boundaries(self):
        httpd=server.ThreadingHTTPServer(('127.0.0.1',0),server.Handler)
        thread=threading.Thread(target=httpd.serve_forever,daemon=True);thread.start()
        port=httpd.server_port
        def request(path,headers=None):
            conn=http.client.HTTPConnection('127.0.0.1',port)
            conn.request('GET',path,headers=headers or {});response=conn.getresponse();body=response.read();conn.close()
            return response.status,body
        try:
            with patch.object(server.Handler,'log_message'):
                self.assertEqual(request('/api/progress?slot=4')[0],400)
                self.assertEqual(request('/api/progress?slot=1&slot=2')[0],400)
                self.assertEqual(request('/api/progress',{'Host':'evil.example'})[0],403)
                self.assertEqual(request('/api/live',{'Sec-Fetch-Site':'cross-site'})[0],403)
                self.assertEqual(request('/config.json')[0],404)
                with patch('server.current_save',side_effect=OSError('/private/profile/save.dat')):
                    status,body=request('/api/progress?slot=1');self.assertEqual(status,503);self.assertNotIn(b'/private',body)
        finally:httpd.shutdown();httpd.server_close();thread.join()
    def test_live_validation(self):
        for key,value in [('frames',-1),('playerType','Isaac'),('items',[True]),('schema',8),('run','x'*101),('state','invented')]:
            data=snapshot();data[key]=value
            with self.assertRaises(ValueError):live.validate(data)
        with patch('live.bridge_files',return_value=[]):self.assertEqual(live.live_state()['status'],'not_connected')

if __name__=='__main__':unittest.main()
