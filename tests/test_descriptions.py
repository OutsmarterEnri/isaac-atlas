import json, tempfile, unittest
from pathlib import Path
from unittest.mock import patch
import server

class DescriptionNotesTests(unittest.TestCase):
    def test_private_notes_and_bundled_priority(self):
        with tempfile.TemporaryDirectory() as directory:
            base=Path(directory);(base/'local-assets').mkdir()
            note={'description':['Effetto di prova'],'language':'it','descriptionSource':{'title':'Fonte','url':'https://example.org/item'}}
            (base/'local-assets/notes.json').write_text(json.dumps({'entries':{'21':note,'610':note,'99':{**note,'descriptionSource':{'url':'javascript:alert(1)'}}}}))
            with patch('server.data_dir',return_value=base):
                entries=server.description_notes()['entries']
            self.assertEqual(entries['21']['description'],['Effetto di prova'])
            self.assertNotEqual(entries['610']['description'],['Effetto di prova'])
            self.assertNotIn('99',entries)
    def test_missing_private_notes(self):
        with tempfile.TemporaryDirectory() as directory,patch('server.data_dir',return_value=Path(directory)):
            self.assertIn('610',server.description_notes()['entries'])
