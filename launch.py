from pathlib import Path
import json, urllib.request, webbrowser, runpy, sys

try:
    response = urllib.request.urlopen('http://127.0.0.1:8765', timeout=2)
    if b'<title>Isaac Atlas' not in response.read(4096):
        raise RuntimeError('La porta 8765 è usata da un altro programma.')
    webbrowser.open('http://127.0.0.1:8765')
except urllib.error.URLError:
    sys.argv = ['server.py','--open']
    runpy.run_path(str(Path(__file__).with_name('server.py')),run_name='__main__')
