# tests/test_mapper_demo.py
import unittest
from src.mapping.huv_to_catalog import map_window

class TestMapperDemo(unittest.TestCase):
    def test_family1_root_triads(self):
        romans = ["I","V","vi","IV"]
        invs = [0,0,0,0]
        exts = [[],[],[],[]]
        bin = map_window(romans, invs, exts)
        self.assertIsNotNone(bin)
        self.assertEqual(bin.family_index, 1)
        self.assertEqual(bin.rotation, 0)
        self.assertEqual(bin.inversion_bin, "root")
        self.assertEqual(bin.extension_bin, "triads")

if __name__ == "__main__":
    unittest.main()
