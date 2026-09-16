"""Resource and private user-data locations for source and frozen builds."""
from pathlib import Path
import os, sys
VERSION = '1.0.0-rc.1'
ROOT = Path(__file__).resolve().parent

def data_dir():
    if os.environ.get('ATLAS_DATA_DIR'):
        return Path(os.environ['ATLAS_DATA_DIR']).expanduser()
    if getattr(sys, 'frozen', False):
        return Path(os.environ.get('LOCALAPPDATA', str(Path.home()/'.local/share'))) / 'IsaacAtlas'
    return ROOT

def config_path():
    return data_dir()/'config.json'
