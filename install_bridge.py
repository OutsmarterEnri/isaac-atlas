"""Install the optional companion into a detected Steam library, without touching game saves."""
from pathlib import Path
import argparse, shutil
from discovery import game_dirs, native_path

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--game-directory',help='Use when more than one installation is detected.')
    parser.add_argument('--update',action='store_true',help='Replace files of an existing Atlas bridge.')
    args=parser.parse_args()
    roots=[native_path(args.game_directory)] if args.game_directory else game_dirs()
    if len(roots)!=1:raise SystemExit('Installazione non univoca: specifica --game-directory.')
    root=roots[0]
    if not (root/'isaac-ng.exe').exists():raise SystemExit('Cartella del gioco non valida.')
    target=root/'mods/isaac-atlas-bridge'
    if target.exists() and not args.update:raise SystemExit('Bridge già presente. Usa --update per aggiornarla.')
    target.mkdir(parents=True,exist_ok=True)
    for filename in ('main.lua','metadata.xml'):
        shutil.copyfile(Path(__file__).parent/'mod/isaac-atlas-bridge'/filename,target/filename)
    print('Bridge installata. Riavvia Isaac, abilita Isaac Atlas Bridge nel menu Mods e avvia una run.')
if __name__=='__main__':main()
