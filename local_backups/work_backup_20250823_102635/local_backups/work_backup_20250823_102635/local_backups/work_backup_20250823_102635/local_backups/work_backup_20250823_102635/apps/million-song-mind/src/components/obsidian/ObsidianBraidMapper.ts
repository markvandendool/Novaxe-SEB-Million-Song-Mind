/**
 * Obsidian Braid Tonalities Mapper - Exact implementation of Obsidian's braid positioning system
 * Based on braid_tonalities.json from the Angular Obsidian app
 */

// Exact braid tonalities data from Obsidian
export const OBSIDIAN_BRAID_TONALITIES = {
  "empty": {
    "center_blues": [],
    "center_major": [],
    "center_minor": [],
    "left_up": [],
    "left_down": [],
    "outer_left_up": [],
    "outer_left_down": [],
    "right_up": [],
    "right_down": [],
    "outer_right_up": [],
    "outer_right_down": []
  },
  "roman": {
    "center_major": ["#V", "#I", "#IV", "VII", "III", "VI", "II", "V", "I", "IV", "bVII", "bIII", "bVI", "bII", "bV", "bI", "bIV"],
    "center_minor_tonal": ["#V", "#I", "#IV", "VII", "III", "VI", "II", "V", "I", "IV", "bVII", "bIII", "bVI", "bII", "#III", "#VI", "#II"],
    "center_minor": ["bI", "bIV", "VI", "II", "V", "I", "IV", "bVII", "bIII", "bVI", "bII", "bV", "VII", "III", "bbVII", "bbIII", "bbVI"],
    "left_up": ["VII", "III", "VI", "II", "V", "I", "IV", "bVII", "bIII", "bVI", "bII", "bV", "#V", "#I", "#IV"],
    "left_down": ["#ii", "#v", "#i", "#iv", "vii", "iii", "vi", "ii", "v", "i", "iv", "vii", "#vii", "#iii", "#vi"],
    "outer_left_up": ["#IV", "VII", "III", "VI", "II", "V", "I", "IV", "bVII", "bIII", "bVI", "bII", "#II", "#V", "#I"],
    "outer_left_down": ["#vi", "#ii", "#v", "#i", "#iv", "vii", "iii", "vi", "ii", "v", "i", "iv", "##iv", "#vii", "#iii"],
    "right_up": ["#V", "#I", "#IV", "VII", "III", "VI", "II", "V", "I", "IV", "bVII", "bIII", "", "#III", "#VI", "#II"],
    "right_down": ["vii#", "iii#", "#vi", "#ii", "#v", "#i", "#iv", "vii", "iii", "vi", "ii", "v", "##v", "##i", "##iv"],
    "outer_right_up": ["#II", "#V", "#I", "#IV", "VII", "III", "VI", "II", "V", "I", "IV", "bVII", "#VII", "#III", "#VI"],
    "outer_right_down": ["##iv", "#vii", "#iii", "#i", "#ii", "#v", "#i", "#iv", "vii", "iii", "vi", "ii", "##ii", "##v", "##i"]
  },
  "C": {
    "center_major": ["Ab", "Db", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb"],
    "center_minor": ["F", "Bb", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db"],
    "left_up": ["Ab", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb"],
    "left_down": ["C", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb"],
    "outer_left_up": ["Eb", "Ab", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db"],
    "outer_left_down": ["G", "C", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F"],
    "right_up": ["F", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb"],
    "right_down": ["A", "C##", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G#"],
    "outer_right_up": ["C", "F", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb"],
    "outer_right_down": ["E", "A", "C##", "F##", "B#", "E#", "A#", "D#", "B", "C#", "F#", "B", "E", "A", "D"]
  },
  "D": {
    "center_major": ["Bb", "Eb", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb"],
    "center_minor": ["G", "C", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb"],
    "left_up": ["Bb", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab"],
    "left_down": ["D", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C"],
    "outer_left_up": ["F", "Bb", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb"],
    "outer_left_down": ["A", "D", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G"],
    "right_up": ["G", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F"],
    "right_down": ["B", "D##", "G##", "C##", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A#"],
    "outer_right_up": ["D", "G", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C"],
    "outer_right_down": ["F#", "B", "D##", "G##", "C##", "F##", "B#", "E#", "C#", "D#", "G#", "C#", "F#", "B", "E"]
  },
  "A": {
    "center_major": ["F", "Bb", "Eb", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db"],
    "center_minor": ["D", "G", "C", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb"],
    "left_up": ["F", "Bb", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb"],
    "left_down": ["A", "D", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G"],
    "outer_left_up": ["C", "F", "Bb", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb"],
    "outer_left_down": ["E", "A", "D", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D"],
    "right_up": ["D", "G", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C"],
    "right_down": ["F#", "B", "D##", "G##", "C##", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E"],
    "outer_right_up": ["A", "D", "G", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G"],
    "outer_right_down": ["C#", "F#", "B", "D##", "G##", "C##", "F##", "B#", "E#", "C#", "D#", "G#", "C#", "F#", "B"]
  },
  "E": {
    "center_major": ["C", "F", "Bb", "Eb", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab"],
    "center_minor": ["A", "D", "G", "C", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F"],
    "left_up": ["C", "F", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb"],
    "left_down": ["E", "A", "C##", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D"],
    "outer_left_up": ["G", "C", "F", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F"],
    "outer_left_down": ["B", "E", "A", "C##", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A"],
    "right_up": ["A", "D", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G"],
    "right_down": ["C#", "F#", "A##", "D##", "G##", "C##", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B"],
    "outer_right_up": ["E", "A", "D", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D"],
    "outer_right_down": ["G#", "C#", "F#", "A##", "D##", "G##", "C##", "F##", "B#", "G#", "A#", "D#", "G#", "C#", "F#"]
  },
  "B": {
    "center_major": ["G", "C", "F", "Bb", "Eb", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb"],
    "center_minor": ["E", "A", "D", "G", "C", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C"],
    "left_up": ["G", "C", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F"],
    "left_down": ["B", "E", "G##", "C##", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A"],
    "outer_left_up": ["D", "G", "C", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C"],
    "outer_left_down": ["F#", "B", "E", "G##", "C##", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E"],
    "right_up": ["E", "A", "C##", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D"],
    "right_down": ["G#", "C#", "E##", "A##", "D##", "G##", "C##", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#"],
    "outer_right_up": ["B", "E", "A", "C##", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A"],
    "outer_right_down": ["D#", "G#", "C#", "E##", "A##", "D##", "G##", "C##", "F##", "D#", "E#", "A#", "D#", "G#", "C#"]
  },
  "F#": {
    "center_major": ["D", "G", "C", "F", "Bb", "Eb", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb"],
    "center_minor": ["B", "E", "A", "D", "G", "C", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G"],
    "left_up": ["D", "G", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C"],
    "left_down": ["F#", "B", "D##", "G##", "C##", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E"],
    "outer_left_up": ["A", "D", "G", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G"],
    "outer_left_down": ["C#", "F#", "B", "D##", "G##", "C##", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B"],
    "right_up": ["B", "E", "G##", "C##", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A"],
    "right_down": ["D#", "G#", "B##", "E##", "A##", "D##", "G##", "C##", "F##", "B#", "E#", "A#", "D#", "G#", "C#"],
    "outer_right_up": ["F#", "B", "E", "G##", "C##", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E"],
    "outer_right_down": ["A#", "D#", "G#", "B##", "E##", "A##", "D##", "G##", "C##", "A#", "B#", "E#", "A#", "D#", "G#"]
  },
  "Db": {
    "center_major": ["A", "D", "G", "C", "F", "Bb", "Eb", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F"],
    "center_minor": ["F#", "B", "E", "A", "D", "G", "C", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D"],
    "left_up": ["A", "D", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G"],
    "left_down": ["C#", "F#", "A##", "D##", "G##", "C##", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B"],
    "outer_left_up": ["E", "A", "D", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D"],
    "outer_left_down": ["G#", "C#", "F#", "A##", "D##", "G##", "C##", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#"],
    "right_up": ["F#", "B", "D##", "G##", "C##", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E"],
    "right_down": ["A#", "D#", "F###", "B##", "E##", "A##", "D##", "G##", "C##", "F##", "B#", "E#", "A#", "D#", "G#"],
    "outer_right_up": ["C#", "F#", "B", "D##", "G##", "C##", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B"],
    "outer_right_down": ["E#", "A#", "D#", "F###", "B##", "E##", "A##", "D##", "G##", "E#", "F##", "B#", "E#", "A#", "D#"]
  },
  "Ab": {
    "center_major": ["E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb", "A", "D", "G", "C"],
    "center_minor": ["Db", "Gb", "Cb", "Fb", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb", "A"],
    "left_up": ["E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb", "A", "D"],
    "left_down": ["Ab", "Db", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb"],
    "outer_left_up": ["Cb", "Fb", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb", "A"],
    "outer_left_down": ["Eb", "Ab", "Db", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db"],
    "right_up": ["Db", "Gb", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb", "A"],
    "right_down": ["F", "Bb", "Db#", "Gb#", "Cb#", "Fb#", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db"],
    "outer_right_up": ["Ab", "Db", "Gb", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb"],
    "outer_right_down": ["C", "F", "Bb", "Db#", "Gb#", "Cb#", "Fb#", "A", "D", "C", "D", "G", "C", "F", "Bb"]
  },
  "Eb": {
    "center_major": ["B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb", "A", "D", "G"],
    "center_minor": ["Ab", "Db", "Gb", "Cb", "Fb", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb"],
    "left_up": ["B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb", "A"],
    "left_down": ["Eb", "Ab", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db"],
    "outer_left_up": ["Gb", "Cb", "Fb", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb"],
    "outer_left_down": ["Bb", "Eb", "Ab", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab"],
    "right_up": ["Ab", "Db", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb"],
    "right_down": ["C", "F", "Ab#", "Db#", "Gb#", "Cb#", "Fb", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab"],
    "outer_right_up": ["Eb", "Ab", "Db", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"],
    "outer_right_down": ["G", "C", "F", "Ab#", "Db#", "Gb#", "Cb#", "Fb", "A", "G", "A", "D", "G", "C", "F"]
  },
  "Bb": {
    "center_major": ["F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb", "A", "D"],
    "center_minor": ["Eb", "Ab", "Db", "Gb", "Cb", "Fb", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"],
    "left_up": ["F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb"],
    "left_down": ["Bb", "Eb", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab"],
    "outer_left_up": ["Db", "Gb", "Cb", "Fb", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"],
    "outer_left_down": ["F", "Bb", "Eb", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb"],
    "right_up": ["Eb", "Ab", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"],
    "right_down": ["G", "C", "Eb#", "Ab#", "Db#", "Gb#", "Cb", "Fb", "A", "D", "G", "C", "F", "Bb", "Eb"],
    "outer_right_up": ["Bb", "Eb", "Ab", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb"],
    "outer_right_down": ["D", "G", "C", "Eb#", "Ab#", "Db#", "Gb#", "Cb", "Fb", "D", "E", "A", "D", "G", "C"]
  },
  "F": {
    "center_major": ["C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb", "A"],
    "center_minor": ["Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb"],
    "left_up": ["C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"],
    "left_down": ["F", "Bb", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb"],
    "outer_left_up": ["Ab", "Db", "Gb", "Cb", "Fb", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb"],
    "outer_left_down": ["C", "F", "Bb", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb"],
    "right_up": ["Bb", "Eb", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb"],
    "right_down": ["D", "G", "Bb#", "Eb#", "Ab#", "Db#", "Gb", "Cb", "Fb", "A", "D", "G", "C", "F", "Bb"],
    "outer_right_up": ["F", "Bb", "Eb", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db"],
    "outer_right_down": ["A", "D", "G", "Bb#", "Eb#", "Ab#", "Db#", "Gb", "Cb", "A", "B", "E", "A", "D", "G"]
  },
  "G": {
    "center_major": ["Eb", "Ab", "Db", "Gb", "Cb", "Fb", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"],
    "center_minor": ["C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab"],
    "left_up": ["Eb", "Ab", "Db", "Gb", "Cb", "Fb", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db"],
    "left_down": ["G", "C", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F"],
    "outer_left_up": ["Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab"],
    "outer_left_down": ["D", "G", "C", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C"],
    "right_up": ["C", "F", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab"],
    "right_down": ["E", "A", "C##", "F##", "B#", "E#", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D"],
    "outer_right_up": ["G", "C", "F", "G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb"],
    "outer_right_down": ["B", "E", "A", "C##", "F##", "B#", "E#", "A#", "D#", "B", "C#", "F#", "B", "E", "A"]
  }
} as const;

export type ObsidianKey = keyof typeof OBSIDIAN_BRAID_TONALITIES;
export type BraidPosition =
  | 'center_major'
  | 'center_minor'
  | 'left_up'
  | 'left_down'
  | 'outer_left_up'
  | 'outer_left_down'
  | 'right_up'
  | 'right_down'
  | 'outer_right_up'
  | 'outer_right_down';

/**
 * Get braid positions for a specific key - matches Obsidian's tonality system
 */
export function getBraidPositionsForKey(key: ObsidianKey) {
  return OBSIDIAN_BRAID_TONALITIES[key];
}

/**
 * Get chord position index in braid array for a specific key and position
 */
export function getChordPositionIndex(
  key: ObsidianKey,
  position: BraidPosition,
  chord: string
): number {
  const positions = getBraidPositionsForKey(key);
  const positionArray = positions[position] as string[];
  return positionArray.indexOf(chord);
}

/**
 * Check if chord exists in a specific braid position for a key
 */
export function isChordInBraidPosition(
  key: ObsidianKey,
  position: BraidPosition,
  chord: string
): boolean {
  return getChordPositionIndex(key, position, chord) !== -1;
}

/**
 * Get all possible positions for a chord in a specific key
 */
export function getChordPositions(key: ObsidianKey, chord: string): BraidPosition[] {
  const positions: BraidPosition[] = [];
  const keyData = getBraidPositionsForKey(key);

  for (const [position, chords] of Object.entries(keyData)) {
    if ((chords as string[]).includes(chord)) {
      positions.push(position as BraidPosition);
    }
  }

  return positions;
}

/**
 * Chord type definitions for braid - matches Obsidian's chord_type object
 */
export const OBSIDIAN_CHORD_TYPES = {
  fifth_left: { up: '7b5', down: 'german' },
  left: { up: '7', down: 'm7b5' },
  center: { up: '7', left: 'M', right: 'm' },
  right: { up: '7', down: 'dim' },
  fifth_right: { up: '7b5', down: 'german' }
} as const;

export default {
  OBSIDIAN_BRAID_TONALITIES,
  OBSIDIAN_CHORD_TYPES,
  getBraidPositionsForKey,
  getChordPositionIndex,
  isChordInBraidPosition,
  getChordPositions
};
