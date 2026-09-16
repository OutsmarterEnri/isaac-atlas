"""Native Windows window over the same local application, with an embedded Python runtime."""
import argparse, json, os, threading, webbrowser
from pathlib import Path
from urllib.parse import urlsplit
from runtime import data_dir, VERSION
from server import Handler, ThreadingHTTPServer

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--smoke-test',action='store_true');parser.add_argument('--ui-smoke-test',action='store_true');args=parser.parse_args()
    # A separate stable origin keeps desktop preferences across launches.
    httpd=ThreadingHTTPServer(('127.0.0.1',8767),Handler)
    thread=threading.Thread(target=httpd.serve_forever,daemon=True);thread.start()
    if args.smoke_test:
        import urllib.request
        try:
            with urllib.request.urlopen('http://127.0.0.1:8767/api/session') as response:
                assert json.load(response)['version']==VERSION
            with urllib.request.urlopen('http://127.0.0.1:8767/data/catalog.json') as response:
                assert len(json.load(response))==641
            (data_dir()/'smoke-ok.txt').parent.mkdir(parents=True,exist_ok=True)
            (data_dir()/'smoke-ok.txt').write_text('Isaac Atlas '+VERSION+' resources and HTTP OK')
        finally:httpd.shutdown();httpd.server_close()
        return
    import webview
    window=None
    class API:
        def local(self):
            return window and (window.get_current_url() or '').startswith('http://127.0.0.1:8767/')
        def choose_directory(self):
            if not self.local():return None
            selected=window.create_file_dialog(webview.FileDialog.FOLDER)
            return selected[0] if selected else None
        def compact(self, enabled):
            if not self.local() or type(enabled)!=bool:return
            window.resize(480,760) if enabled else window.resize(1280,900)
            window.on_top=enabled
    webview.settings['ALLOW_DOWNLOADS']=True
    webview.settings['ALLOW_FILE_URLS']=False
    window=webview.create_window('Isaac Atlas '+VERSION,'http://127.0.0.1:8767/',js_api=API(),width=1280,height=900,min_size=(400,550),background_color='#141815')
    def check_ui():
        if not args.ui_smoke_test:return
        import time
        try:
            for _ in range(100):
                time.sleep(.2)
                if window.evaluate_js("Boolean(document.querySelector('#open-settings') && window.pywebview && window.pywebview.api)"):
                    data_dir().mkdir(parents=True,exist_ok=True)
                    (data_dir()/'ui-smoke-ok.txt').write_text('WebView2, local UI and native bridge OK')
                    break
        finally:window.destroy()
    try:webview.start(check_ui,gui='edgechromium' if os.name=='nt' else None,private_mode=False,storage_path=str(data_dir()/'browser'))
    finally:httpd.shutdown();httpd.server_close()

if __name__=='__main__':
    try:main()
    except Exception as error:
        if os.name=='nt':
            import ctypes
            ctypes.windll.user32.MessageBoxW(None,'Impossibile avviare Isaac Atlas. Chiudi altre istanze desktop e verifica Microsoft Edge WebView2.\n'+str(error),'Isaac Atlas',0x10)
        else:raise
