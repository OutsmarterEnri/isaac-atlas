"""Synthetic images only: no copyrighted game art in fixtures."""
import json, struct, tempfile, unittest, zlib
from pathlib import Path
from unittest.mock import patch
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import local_art

def png(w=16,h=16):
    def chunk(t,b):return struct.pack('>I',len(b))+t+b+struct.pack('>I',zlib.crc32(t+b)&0xffffffff)
    return local_art.PNG+chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,6,0,0,0))+chunk(b'IDAT',zlib.compress((b'\0'+b'\xff\0\xff\xff'*w)*h))+chunk(b'IEND',b'')

class LocalArtTests(unittest.TestCase):
    def test_selection_excludes_unrelated_files_and_traversal(self):
        for n in ['resources/items.xml','resources/gfx/items/collectibles/test.png','resources/gfx/ui/completion_widget.png']:self.assertTrue(local_art.allowed_name(n))
        for n in ['../secret.png','resources/gfx/items/collectibles/../../secret.png','resources/sfx/test.wav','resources/gfx/ui/achievement/evil.exe','/resources/items.xml']:self.assertFalse(local_art.allowed_name(n))
    def test_maps_ids_and_uses_achievement_fallback(self):
        with tempfile.TemporaryDirectory() as temp:
            r=Path(temp);src=r/'extracted';dst=r/'cache'
            for rel in ['resources/gfx/items/collectibles/one.png','resources/gfx/ui/achievement/two.png','resources/gfx/ui/completion_widget.png']:
                p=src/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(png())
            (src/'resources/items.xml').write_text('<items><passive id="20" gfx="ONE.png"/></items>')
            (src/'resources/achievements.xml').write_text('<achievements><achievement id="2" gfx="two.png"/></achievements>')
            (src/'resources/gfx/ui/completion_widget.anm2').write_text('<AnimatedActor><Content><Layers><Layer Name="Heart" Id="1" SpritesheetId="0"/></Layers></Content><Animations><Animation Name="Idle"><LayerAnimations><LayerAnimation LayerId="1"><Frame Visible="false"/><Frame Visible="true" XCrop="0" YCrop="0" Width="8" Height="8"/></LayerAnimation></LayerAnimations></Animation></Animations></AnimatedActor>')
            m=local_art.build_manifest(src,dst,[{'id':1,'itemId':20,'category':'Oggetti'},{'id':2,'itemId':None,'category':'Altri sblocchi'},{'id':3,'itemId':None}])
            self.assertEqual(set(m['rewards']),{'1','2'});self.assertEqual(m['marks']["Mom's Heart"]['crop'],[0,0,8,8]);self.assertNotIn(str(src),json.dumps(m))
            with patch('local_art.cache_dir',return_value=dst):
                self.assertEqual(local_art.image_bytes(m['rewards']['1']['url'].rsplit('/',1)[-1]),png())
                for name in ['../config.json','a.png','0'*64+'.png/../../config.json']:
                    with self.assertRaises(ValueError):local_art.image_bytes(name)
    def test_http_images_and_import_token(self):
        import server, threading, http.client
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);(root/'blobs').mkdir();name='a'*64+'.png';(root/'blobs'/name).write_bytes(png())
            httpd=server.ThreadingHTTPServer(('127.0.0.1',0),server.Handler);thread=threading.Thread(target=httpd.serve_forever,daemon=True);thread.start()
            def request(method,path,headers=None,body=None):
                conn=http.client.HTTPConnection('127.0.0.1',httpd.server_port);conn.request(method,path,body,headers or {});response=conn.getresponse();result=(response.status,response.read());conn.close();return result
            try:
                with patch('local_art.cache_dir',return_value=root),patch.object(server.Handler,'log_message'),patch('local_art.start_import',return_value={'status':'importing'}) as start:
                    self.assertEqual(request('GET','/api/art/image/'+name),(200,png()))
                    self.assertEqual(request('GET','/api/art/image/../config.json')[0],404)
                    self.assertEqual(request('GET','/api/art/image/'+name,{'Sec-Fetch-Site':'cross-site'})[0],403)
                    self.assertEqual(request('POST','/api/art/import',{'Content-Type':'application/json'},'{}')[0],403);start.assert_not_called()
                    self.assertEqual(request('POST','/api/art/import',{'Content-Type':'application/json','X-Atlas-Token':server.SESSION_TOKEN},'{}')[0],200);start.assert_called_once()
            finally:httpd.shutdown();httpd.server_close();thread.join()
    def test_bad_image_or_xml_is_rejected(self):
        with self.assertRaises(ValueError):local_art.png_size(b'not an image')
        with tempfile.TemporaryDirectory() as temp:
            p=Path(temp)/'items.xml';p.write_text('<!DOCTYPE items [<!ENTITY x "test">]><items/>')
            with self.assertRaises(ValueError):local_art.xml(p)
    def test_failed_import_keeps_previous_manifest(self):
        with tempfile.TemporaryDirectory() as temp:
            r=Path(temp);(r/'manifest.json').write_text('{"version":1,"rewards":{"1":{}},"marks":{}}')
            with patch('local_art.cache_dir',return_value=r):
                with self.assertRaises(ValueError):local_art.install_from(r/'missing')
                self.assertIn('1',local_art.manifest()['rewards'])

if __name__=='__main__':unittest.main()
