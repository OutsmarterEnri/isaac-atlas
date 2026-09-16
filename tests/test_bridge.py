"""Optional Lua lifecycle tests: pip install lupa in the test environment."""
import unittest
from pathlib import Path
try:from lupa import LuaRuntime
except ImportError:LuaRuntime=None

@unittest.skipIf(LuaRuntime is None,'Optional Lua tests require lupa')
class BridgeTests(unittest.TestCase):
    def setUp(self):
        self.lua=LuaRuntime(unpack_returned_tuples=True)
        self.lua.execute('''
        callbacks={}; last=nil; flags={}; stage=10; playerType=0; clock=1000; clear=false; previous=nil
        ModCallbacks={MC_POST_GAME_STARTED=1,MC_POST_RENDER=2,MC_POST_GAME_END=3,MC_PRE_GAME_EXIT=4,MC_POST_NPC_DEATH=5,MC_POST_NEW_ROOM=6,MC_POST_UPDATE=7}
        GameStateFlag={STATE_BOSSRUSH_DONE=33,STATE_BLUEWOMB_DONE=40,STATE_MEGA_SATAN_DOOR_OPENED=49,STATE_MOTHER_HEART_DOOR_OPENED=52,STATE_BACKWARDS_PATH=48}
        EntityType={ENTITY_MOM=45,ENTITY_MOMS_HEART=78,ENTITY_ISAAC=102,ENTITY_SATAN=84,ENTITY_THE_LAMB=273,ENTITY_MEGA_SATAN_2=275,ENTITY_DELIRIUM=412,ENTITY_MOTHER=912,ENTITY_BEAST=951,ENTITY_ULTRA_GREED=406}
        RoomType={ROOM_BOSS=5}
        function RegisterMod() return {AddCallback=function(self,id,fn) callbacks[id]=fn end,SaveData=function(self,data) last=data end,HasData=function() return previous~=nil end,LoadData=function() return previous end} end
        package.preload['json']=function() return {encode=function(data) return data end,decode=function(data) return data end} end
        player={GetPlayerType=function()return playerType end,HasCollectible=function()return false end,GetCard=function()return 0 end}
        level={GetStage=function()return stage end,GetStageType=function()return 0 end}
        room={IsClear=function()return clear end,GetType=function()return 5 end}
        seeds={GetStartSeed=function()return 123 end,IsCustomRun=function()return false end}
        game={TimeCounter=900,Difficulty=1,Challenge=0,BossRushParTime=36000,BlueWombParTime=54000,
          GetNumPlayers=function()return 1 end,GetLevel=function()return level end,GetRoom=function()return room end,GetSeeds=function()return seeds end,
          GetStateFlag=function(self,id)return flags[id] or false end,IsPaused=function()return false end}
        function Game()return game end
        Isaac={GetPlayer=function()return player end,GetTime=function()return clock end,GetItemConfig=function()return {GetCollectibles=function()return {Size=10}end}end}
        ''')
        self.lua.execute((Path(__file__).resolve().parents[1]/'mod/isaac-atlas-bridge/main.lua').read_text())
        self.lua.execute('callbacks[1](nil,false)')
    def test_final_boss_waits_for_clear(self):
        self.lua.execute('callbacks[5](nil,{Type=102,Variant=0}); callbacks[7](); callbacks[2]()')
        self.assertEqual(len(self.lua.globals().last.events),0)
        self.lua.execute('clear=true; callbacks[7](); clock=3000; callbacks[2]()')
        self.assertEqual(self.lua.globals().last.events[1].boss,'Isaac')
    def test_void_transforms_do_not_count(self):
        self.lua.execute('stage=12; clear=true; callbacks[5](nil,{Type=102,Variant=0}); callbacks[7](); callbacks[2]()')
        self.assertEqual(len(self.lua.globals().last.events),0)
    def test_flags_not_reattributed_after_character_change(self):
        self.lua.execute('flags[33]=true; callbacks[7](); playerType=30; callbacks[7](); callbacks[2]()')
        self.assertEqual(len(self.lua.globals().last.events),1)
        self.assertEqual(self.lua.globals().last.events[1].playerType,0)
    def test_greedier_ignores_first_phase(self):
        self.lua.execute('game.Difficulty=3; clear=true; callbacks[5](nil,{Type=406,Variant=0}); callbacks[7](); callbacks[2]()')
        self.assertEqual(len(self.lua.globals().last.events),0)
        self.lua.execute('callbacks[5](nil,{Type=406,Variant=1}); callbacks[7](); clock=3000; callbacks[2]()')
        self.assertEqual(self.lua.globals().last.events[1].boss,'Ultra Greedier')
    def test_continue_keeps_events(self):
        self.lua.execute('flags[40]=true; callbacks[7](); callbacks[2](); previous=last; callbacks[1](nil,true)')
        self.assertEqual(self.lua.globals().last.events[1].boss,'Hush')
