import unittest, sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import live
from test_atlas import snapshot

class LiveSignalsTests(unittest.TestCase):
    def test_resources_are_optional_but_validated_when_present(self):
        value=snapshot();self.assertIsNone(live.validate(value)['resources'])
        value.update(resources=dict(coins=15,bombs=1,keys=0,hearts=3,maxHearts=6,soulHearts=2),actives=[dict(id=166,slot=0,charge=6,battery=0)],floorId='floor-one')
        clean=live.validate(value);self.assertEqual(clean['resources']['hearts'],3);self.assertEqual(clean['floorId'],'floor-one')
        value['resources']['coins']=-1
        with self.assertRaises(ValueError):live.validate(value)

    def test_visible_geometry_produces_direction_without_percentages(self):
        rooms=[dict(index=84,type=1,shape=1),dict(index=72,type=1,shape=1)]
        signals,_=live.map_signals(rooms,84)
        east=next(s for s in signals if s['index']==85)
        self.assertEqual((east['kind'],east['strength'],east['direction']),('secret','media','est'))
        self.assertNotIn('confidence',east)
        self.assertFalse(any(s['kind']=='ultrasecret' for s in signals))

    def test_complex_shapes_abstain_and_known_rooms_remain_known(self):
        signals,message=live.map_signals([dict(index=84,type=1,shape=20),dict(index=140,type=29,shape=1)],84)
        self.assertEqual(len(signals),1)
        self.assertEqual(signals[0]['status'],'known')
        self.assertIn('sospese',message)

    def test_grid_edges_do_not_wrap(self):
        signals,_=live.map_signals([dict(index=12,type=1,shape=1)],12)
        self.assertNotIn(13,[s['index'] for s in signals])

    def test_legacy_secret_data_discarded_and_special_room_accepted(self):
        value=snapshot();value.update(room={'index':-6,'type':14},secretCandidates=[dict(kind='secret',confidence=.9,index=99)])
        result=live.validate(value)
        self.assertEqual(result['secretCandidates'],[])
        self.assertEqual(result['room']['index'],-6)

    def test_nonfinite_coordinates_rejected(self):
        for number in (float('nan'),float('inf')):
            value=snapshot();value['pickups']=[dict(kind='heart',subtype=1,x=number)]
            with self.assertRaises(ValueError):live.validate(value)

    def test_curse_suppresses_map(self):
        value=snapshot();value.update(mapSuppressed=True,visibleRooms=[dict(index=84,type=7,shape=1)])
        self.assertEqual(live.validate(value)['secretCandidates'],[])

    def test_l_room_does_not_disable_hints_elsewhere(self):
        rooms=[dict(index=97,type=1,shape=12),dict(index=112,type=1,shape=1)]
        signals,message=live.map_signals(rooms,112)
        west=next(s for s in signals if s['index']==111 and s['kind']=='secret')
        self.assertEqual(west['direction'],'ovest')
        self.assertEqual(west['strength'],'media')
        self.assertIn('2 stanze',west['reason'])  # two cells of same L count once
        self.assertNotIn('sospese',message)

    def test_all_shapes_occupy_their_real_cells(self):
        for shape in range(1,13):
            with self.subTest(shape=shape):
                signals,message=live.map_signals([dict(index=84,type=1,shape=shape)],84)
                self.assertNotIn('sospese',message)
                self.assertTrue(signals)
        signals,_=live.map_signals([dict(index=84,type=1,shape=8)],84)
        self.assertFalse({84,85,97,98}&{s['index'] for s in signals})

    def test_single_neighbour_does_not_exclude_secret_room(self):
        signals,_=live.map_signals([dict(index=84,type=1,shape=1)],84)
        self.assertEqual({s['kind'] for s in signals if s['index']==85},{'secret','supersecret'})

    def test_rock_validation(self):
        value=snapshot();value['rocks']=[dict(kind='tinted',index=12,x=20,y=40)]
        self.assertEqual(live.validate(value)['rocks'][0]['index'],12)
        value['rocks'][0]['x']=float('nan')
        with self.assertRaises(ValueError):live.validate(value)
