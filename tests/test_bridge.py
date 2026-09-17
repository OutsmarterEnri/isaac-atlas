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
        LevelCurse={CURSE_OF_BLIND=64,CURSE_OF_THE_LOST=4}; curses=0
        PickupVariant={PICKUP_COLLECTIBLE=100,PICKUP_TAROTCARD=300,PICKUP_PILL=70,PICKUP_TRINKET=350,
          PICKUP_COIN=20,PICKUP_KEY=30,PICKUP_BOMB=40,PICKUP_CHEST=50,PICKUP_HEART=10,
          PICKUP_LIL_BATTERY=90,PICKUP_GRAB_BAG=69,PICKUP_LOCKEDCHEST=60}
        EntityType.ENTITY_PICKUP=5; entities={}
        current={GridIndex=84,ListIndex=0,DisplayFlags=5,VisitedCount=1,Data={Type=1,Shape=1}}
        descriptors={current}
        function RegisterMod() return {AddCallback=function(self,id,fn) callbacks[id]=fn end,SaveData=function(self,data) last=data end,HasData=function() return previous~=nil end,LoadData=function() return previous end} end
        package.preload['json']=function() return {encode=function(data) return data end,decode=function(data) return data end} end
        player={GetPlayerType=function()return playerType end,HasCollectible=function()return false end,GetCard=function()return 0 end}
        player.GetNumCoins=function()return 15 end;player.GetNumBombs=function()return 1 end;player.GetNumKeys=function()return 2 end
        player.GetHearts=function()return 3 end;player.GetMaxHearts=function()return 6 end;player.GetSoulHearts=function()return 2 end
        player.GetActiveItem=function(self,slot)return slot==0 and 166 or 0 end
        player.GetActiveCharge=function()return 6 end;player.GetBatteryCharge=function()return 0 end
        level={GetStage=function()return stage end,GetStageType=function()return 0 end}
        level.GetCurses=function()return curses end
        level.GetDungeonPlacementSeed=function()return 123456 end
        level.GetCurrentRoomDesc=function()return current end
        level.GetRooms=function()return {Size=#descriptors,Get=function(self,i)return descriptors[i+1]end}end
        level.GetRoomByIdx=function(self,i)for _,d in ipairs(descriptors)do if d.GridIndex==i then return d end end end
        room={IsClear=function()return clear end,GetType=function()return 5 end}
        GridEntityType={GRID_ROCKT=4,GRID_ROCK_SS=22}; grids={}
        room.GetGridSize=function()return 448 end
        room.GetGridEntity=function(self,i)return grids[i]end
        seeds={GetStartSeed=function()return 123 end,IsCustomRun=function()return false end}
        game={TimeCounter=900,Difficulty=1,Challenge=0,BossRushParTime=36000,BlueWombParTime=54000,
          GetNumPlayers=function()return 1 end,GetLevel=function()return level end,GetRoom=function()return room end,GetSeeds=function()return seeds end,
          GetStateFlag=function(self,id)return flags[id] or false end,IsPaused=function()return false end}
        function Game()return game end
        Isaac={GetPlayer=function()return player end,GetTime=function()return clock end,GetItemConfig=function()return {GetCollectibles=function()return {Size=10}end}end}
        Isaac.GetRoomEntities=function()return entities end
        Isaac.GetItemConfig=function()return {GetCollectibles=function()return {Size=10}end,
          GetCard=function(self,id)return {IsRune=function()return id==32 end}end}end
        function pickup(variant,subtype,id)
          return {Type=5,Variant=variant,SubType=subtype,InitSeed=id,Index=id,Position={X=20,Y=30},
            ToPickup=function()return {Price=15}end}
        end
        ''')
        self.lua.execute((Path(__file__).resolve().parents[1]/'mod/isaac-atlas-bridge/main.lua').read_text())
        self.lua.execute('callbacks[1](nil,false)')
    def test_final_boss_waits_for_clear(self):
        self.lua.execute('callbacks[5](nil,{Type=102,Variant=0}); callbacks[7](); callbacks[2]()')
        self.assertEqual(len(self.lua.globals().last.events),0)
        self.lua.execute('clear=true; callbacks[7](); clock=3000; callbacks[2]()')
        self.assertEqual(self.lua.globals().last.events[1].boss,'Isaac')

    def test_resources_and_active_slots(self):
        last=self.lua.globals().last
        self.assertEqual(last.resources.coins,15)
        self.assertEqual(last.resources.hearts,3)
        self.assertEqual(last.actives[1].id,166)
        self.assertEqual(last.actives[1].charge,6)
        self.assertEqual(last.floorId,'10:0:123456')
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

    def test_pickup_variants_and_price(self):
        self.lua.execute('entities={pickup(10,1,1),pickup(90,1,2),pickup(69,1,3),pickup(60,1,4),pickup(350,166,5),pickup(300,32,6),pickup(300,80,7),pickup(999,1,8)};callbacks[2]()')
        data=self.lua.globals().last.pickups
        self.assertEqual([data[i].kind for i in range(1,9)],['heart','battery','bag','chest','trinket','rune','card','unknown'])
        self.assertEqual(data[1].price,15)
        self.assertEqual(data[1].id,'1:1')

    def test_hidden_data_is_never_read(self):
        self.lua.execute('''
        local hidden=setmetatable({GridIndex=150,ListIndex=2,DisplayFlags=0,VisitedCount=0},
          {__index=function(self,k)if k=='Data' then error('Hidden data read')end end})
        descriptors={current,{GridIndex=140,ListIndex=1,DisplayFlags=5,VisitedCount=1,Data={Type=7,Shape=1}},hidden}
        callbacks[2]()
        ''')
        self.assertEqual(len(self.lua.globals().last.visibleRooms),2)
        self.assertEqual(self.lua.globals().last.visibleRooms[2].index,140)

    def test_unknown_icon_and_curses(self):
        self.lua.execute('descriptors={current,{GridIndex=85,ListIndex=1,DisplayFlags=1,VisitedCount=0,Data={Type=7,Shape=1}}};callbacks[2]()')
        self.assertEqual(self.lua.globals().last.visibleRooms[2].type,0)
        self.lua.execute('curses=68;entities={pickup(100,628,1)};clock=3000;callbacks[2]()')
        self.assertEqual(len(self.lua.globals().last.visibleRooms),0)
        self.assertEqual(self.lua.globals().last.pickups[1].subtype,0)
        self.assertTrue(self.lua.globals().last.pickups[1].hidden)

    def test_many_pickups_are_bounded(self):
        self.lua.execute('for i=1,150 do entities[i]=pickup(20,1,i)end;callbacks[2]()')
        self.assertEqual(len(self.lua.globals().last.pickups),128)
        self.assertTrue(self.lua.globals().last.pickupsTruncated)

    def test_tinted_rocks_exclude_rubble_and_ordinary_rocks(self):
        self.lua.execute('''
        grids[12]={State=0,GetType=function()return 4 end,Position={X=100,Y=200}}
        grids[13]={State=2,GetType=function()return 4 end,Position={X=100,Y=200}}
        grids[14]={State=0,GetType=function()return 2 end,Position={X=100,Y=200}}
        grids[15]={State=0,GetType=function()return 22 end,Position={X=200,Y=200}}
        callbacks[2]()
        ''')
        rocks=self.lua.globals().last.rocks
        self.assertEqual(len(rocks),2)
        self.assertEqual(rocks[1].index,12)
        self.assertEqual(rocks[2].kind,'super_tinted')
        self.lua.execute('grids[12].State=2;clock=3000;callbacks[2]()')
        self.assertEqual(len(self.lua.globals().last.rocks),1)
