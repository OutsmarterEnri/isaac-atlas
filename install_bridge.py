"""Install the optional companion into a detected Steam library, without touching game saves."""
from pathlib import Path
import argparse, shutil
from discovery import game_dirs, native_path

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--game-directory',help='Use when more than one installation is detected.')
    parser.add_argument('--update',action='store_true',help='Replace files of an existing Atlas bridge.')
    args=parser.parse_args()
    from settings import install_bridge
    try: install_bridge(args.game_directory or '', args.update)
    except (ValueError,OSError) as error: raise SystemExit(str(error))
    print('Bridge installata. Riavvia Isaac, abilita Isaac Atlas Bridge nel menu Mods e avvia una run.')
if __name__=='__main__':main()
