import json, tempfile, threading, http.client, unittest, sys
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import settings, server, discovery, live

class ReleaseTests(unittest.TestCase):
    def test_settings_validation_and_atomic_write(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);path=root/'config.json'
            with patch('settings.config_path',return_value=path):
                settings.write_config({'save_directory':'','game_directory':''})
                before=path.read_bytes()
                with self.assertRaises(ValueError):settings.write_config({'game_directory':str(root)})
                self.assertEqual(before,path.read_bytes())
                with self.assertRaises(ValueError):settings.write_config({'unknown':'anything'})
                (root/'isaac-ng.exe').touch();settings.write_config({'game_directory':str(root)})
                self.assertEqual(json.loads(path.read_text())['game_directory'],str(root.resolve()))
    def test_bridge_install_and_update(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);(root/'isaac-ng.exe').touch()
            settings.install_bridge(str(root));target=root/'mods/isaac-atlas-bridge/main.lua'
            self.assertIn('schema=2',target.read_text())
            with self.assertRaises(ValueError):settings.install_bridge(str(root))
            settings.install_bridge(str(root),True)
            (root/'mods/isaac-atlas-bridge/metadata.xml').write_text('unrelated')
            with self.assertRaises(ValueError):settings.install_bridge(str(root),True)
    def test_protected_mutation(self):
        httpd=server.ThreadingHTTPServer(('127.0.0.1',0),server.Handler);thread=threading.Thread(target=httpd.serve_forever,daemon=True);thread.start()
        def post(headers,data='{}'):
            c=http.client.HTTPConnection('127.0.0.1',httpd.server_port);c.request('POST','/api/settings',data,headers);r=c.getresponse();r.read();c.close();return r.status
        headers={'Content-Type':'application/json','X-Atlas-Token':server.SESSION_TOKEN}
        try:
            with patch.object(server.Handler,'log_message'),patch('server.write_config',return_value={'saved':True}) as write:
                self.assertEqual(post({'Content-Type':'application/json'}),403);write.assert_not_called()
                self.assertEqual(post(headers|{'Origin':'https://evil.example'}),403);write.assert_not_called()
                self.assertEqual(post(headers),200);write.assert_called_once()
                self.assertEqual(post(headers,'['),400)
        finally:httpd.shutdown();httpd.server_close();thread.join()
    def test_schema_two_validation(self):
        from test_atlas import snapshot
        value=snapshot();value.update(schema=2,events=[{'boss':'Hush','playerType':30}],pickups=[{'kind':'collectible','subtype':166,'x':10,'y':20}],secretCandidates=[{'kind':'ultrasecret','confidence':0.72,'direction':'mappa','reason':'Tre collegamenti'}],bossRushLimit=36000,hushLimit=54000)
        clean=live.validate(value);self.assertEqual(clean['events'][0]['character'],'Tainted Eden');self.assertEqual(clean['pickups'][0]['subtype'],166);self.assertEqual(clean['secretCandidates'][0]['confidence'],0.72)
        value['events']=[{'boss':'Hush','playerType':'not a number'}]
        with self.assertRaises(ValueError):live.validate(value)

if __name__=='__main__':unittest.main()
