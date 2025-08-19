import { Component, OnInit, Input, Output, EventEmitter, NgZone, AfterViewInit } from '@angular/core';

import { SelectionModel } from '@models/selectionmodel/selectionmodel';
import { TransportService } from '@services/transport/transport.service';
import { CurChordModel } from '@models/songmodel/cur-chord-model';

import { CurTonalityModel } from '@models/songmodel/cur-tonality-model';
import { Songmodel } from '@models/songmodel/songmodel';
import { SongInfo } from '@models/songmodel/song-info';

import Tonalites from '@assets/braid_tonalities.json';

import { MidiService } from '@services/midi/midi.service';

import { ConfigModel } from '@models/configmodel/configModel';

import { Subscription } from 'rxjs';

import Font_chords_eq from '../../../assets/font_chords_eq.json';
import { chordType } from '@tonaljs/chord-type';
import { ChordType, Note, Mode } from "@tonaljs/tonal";
import { Chord } from '@tonaljs/tonal';
import { Key } from '@tonaljs/tonal';

declare var $: any;

@Component({
  selector: 'app-braid',
  templateUrl: './braid.component.html',
  styleUrls: ['./braid.component.scss']
})
export class BraidComponent implements OnInit, AfterViewInit {

  public _chord: Array<string> = [];
  public _midi_chord: Array<string> = [];
  public tonic: Array<string> = [];
  public cur_score_chord: string = '';

  private maj_chords = ['', 'M', 'maj7', '5', 'maj9', 'maj11', 'maj13', '6', 'Maj7', 'Maj9', 'M11', 'M13', 'maj9no5', 'M9sus4', 'Madd9', 'sus2', '69'];
  private min_chords = ['m', 'm7', 'm#5', 'mMa7', 'm6', 'm9', 'm11', 'm7no5', 'm9no5', 'm11no5', 'madd9'];
  private half_dim_chords = ['m7b5'];
  private seven_chords = ['7', '9', '11', '13', '7no5', '9no5', '13no5', '13sus4', '7add13'];
  private m69 = ['m69'];
  private german = ['german'];
  private sevenb5 = ['7b5'];
  private dim_chords = ['dim'];
  private dim_seven_chords = ['dim7'];

  private score_follow: boolean = true;
  public display_as_roman: boolean = false;

  public tonality_focused: string = '';
  // public display_lock_on_tonality:boolean=true;

  public chords_in_score: Array<string> = [];
  public chords_in_emphasis: Array<string> = ["Am"];
  public braidType: string;
  public tonas_displayed = [8];


  @Output() askChordsInScore = new EventEmitter<string>();
  // watcher of the input "chord" : 
  @Input() set cur_chord(valeur: Array<any>) {
    // if(this.score_follow) return

    this.change_midi_chord(valeur);
    // console.log("midi_chord ",valeur)
  }

  @Input() set chordsInScore(valeur: Array<any>) {
    this.find_chords_in_score(valeur);
  }

  @Input() set braidModel(valeur: string) {
    this.braidType = valeur;
  }

  @Input() set is_roman(valeur: boolean) {
    // console.log("roman display ",valeur)
    this.switch_to_roman(valeur);
  }

  @Input() set one_tona_mode(valeur: number) {
    switch (valeur) {
      case 1:
        this.tonas_displayed = [7, 8];
        break;
      case 2:
        this.tonas_displayed = [8];
        break;
      case 3:
        this.tonas_displayed = [8, 9];
        break;
      case 4:
        this.tonas_displayed = [7, 8, 9];
        break;
      default:
        this.tonas_displayed = [8];
        break;
    }
  }

  @Input() set zoom_val(valeur: number) {
    $('.braid-svg').css('transform', 'scale(' + valeur + ')');
    let val = valeur.toString();
    // console.log(val);
    let top: number;

    switch (val) {
      case '0.4':
        top = -760;
        break;
      case '0.5':
        top = -630;
        break;
      case '0.6':
        top = -510;
        break;
      case '0.7':
        top = -380;
        break;
      case '0.8':
        top = -260;
        break;
      case '0.9':
        top = -140;
        break;
      case '1':
        top = 0;
        break;
      case '1.1':
        top = 110;
        break;
      case '1.2':
        top = 240;
        break;
      case '1.3':
        top = 360;
        break;
      case '1.4':
        top = 490;
        break;
      case '1.5':
        top = 620;
        break;
      case '1.6':
        top = 740;
        break;
      case '1.7':
        top = 860;
        break;
      case '1.8':
        top = 990;
        break;
      case '1.9':
        top = 1110;
        break;
      case '2':
        top = 1250;
        break;
      default:
        top = 0;
        break;
    }
    $('.braid-svg').css('top', top + 'px');
  }


  private chordChangeSub$: Subscription;
  private displayNotesMode_SUBJ_update$: Subscription;

  private show_score_chords_SUBJ_update$: Subscription;

  private curTonality$: Subscription;

  public chord_type_notes = {
    fifth_left: { up: '7b5', down: 'german' },
    left: { up: '7', down: 'm7b5' },
    center: { up: '7', left: 'M', right: 'm' },
    right: { up: '7', down: 'dim' },
    fifth_right: { up: '7b5', down: 'german' },
  }

  public chord_type_roman = {
    fifth_left: { up: '7b5', down: 'german' },
    left: { up: '7', down: 'm7b5' },
    center: { up: '7', left: 'M', right: 'm' },
    right: { up: '7', down: 'dim' },
    fifth_right: { up: '7b5', down: 'german' },
  }

  public chord_type = this.chord_type_notes;

  public fifth_left_up = Tonalites["C"].outer_left_up;
  public fifth_left_down = Tonalites["C"].outer_left_down;
  public left_up = Tonalites["C"].left_up;
  public left_down = Tonalites["C"].left_down;
  public center_up = Tonalites["C"].center_minor;
  public center_right = Tonalites["C"].center_minor;
  public center_left = Tonalites["C"].center_major;
  public right_up = Tonalites["C"].right_up;
  public right_down = Tonalites["C"].right_down;
  public fifth_right_up = Tonalites["C"].outer_right_up;
  public fifth_right_down = Tonalites["C"].outer_right_down;

  public fifth_left_up_roman = ([...Tonalites["roman"].outer_left_up] as any).rotate(-3);
  public fifth_left_down_roman = ([...Tonalites["roman"].outer_left_down] as any).rotate(-3);
  public left_up_roman = ([...Tonalites["roman"].left_up] as any).rotate(-3)
  public left_down_roman = ([...Tonalites["roman"].left_down] as any).rotate(-3)

  public center_up_roman = Tonalites["roman"].center_major;
  public center_left_roman = [...Tonalites["roman"].center_major]
  public center_right_roman = ([...Tonalites["roman"].center_minor_tonal] as any).rotate(-3);
  // ["G#", "C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb"]
  public center_modes = ["none", "none", "none", "none", "none", "none", "none", "lydian", "ionian", "mixolydian", "dorian", "aeolian", "phrygian", "locrian", "none", "none", "none"];
  public roman_mode = 'ionian';
  public roman_mode_engaged = false;

  public right_up_roman = ([...Tonalites["roman"].right_up] as any).rotate(-3);
  public right_down_roman = ([...Tonalites["roman"].right_down] as any).rotate(-3);
  public fifth_right_up_roman = ([...Tonalites["roman"].outer_right_up] as any).rotate(-3);
  public fifth_right_down_roman = ([...Tonalites["roman"].outer_right_down] as any).rotate(-3);

  public fifth_left_up_in_use = this.fifth_left_up;
  public fifth_left_down_in_use = this.fifth_left_down;
  public left_up_in_use = this.left_up;
  public left_down_in_use = this.left_down;
  public center_up_in_use = this.center_up;
  public center_left_in_use = this.center_left;
  public center_right_in_use = this.center_right;
  public right_up_in_use = this.right_up;
  public right_down_in_use = this.right_down;
  public fifth_right_up_in_use = this.fifth_right_up;
  public fifth_right_down_in_use = this.fifth_right_down;

  private midiControlUpdate$: Subscription;
  public Translate = Font_chords_eq;


  constructor(
    private sel: SelectionModel,
    private zone: NgZone,
    public cm: ConfigModel,
    private curTonality: CurTonalityModel,
    private sm: Songmodel,
    public si: SongInfo,
    private midi: MidiService,
    private transport: TransportService,
    private curChordMod: CurChordModel
  ) {

    this.displayNotesMode_SUBJ_update$ = this.cm.displayNotesMode_SUBJ_update$.subscribe(data => {
      this.zone.run(() => {
        if (data == 'letters') {
          this.si.braid_param_roman = true;
        } else {
          this.si.braid_param_roman = false;
        }
      })
    });

    this.show_score_chords_SUBJ_update$ = this.cm.global_show_score_chords_SUBJ$.subscribe(data => {

      // this.zone.run(()=>{
      this.askChordsInScore.next('find');
      this.si.braid_param_show_score_chords = data;
      // })
    });


    this.chordChangeSub$ = this.curChordMod.current_chord$.subscribe((data) => {

      // CHANGING CHORD
      // let c = m.getBeat(data.beat).chord;
      if (!data.root) return;

      this.cur_score_chord = data.root + data.chordType;
      console.log("Braid received chord =>", this.cur_score_chord)

      this.change_score_chord(this.cur_score_chord);
    });

    this.curTonality$ = this.curTonality.current_tonality$.subscribe((data) => {

      this.change_tonality(data);

    });

    this.midiControlUpdate$ = this.midi.controlTabSubject.subscribe(data => {

      let ctrl = this.cm.getAssignedControls(false);
      let o = ctrl["" + data];
      let number;
      let control_name;
      let control_action;

      if (o && o.length) {
        for (let obj of o) {
          number = obj.number;
          control_name = obj.control_name;
          control_action = obj.control_action;
          this.zone.run(() => {
            if (eval("this." + control_name)) eval("this." + control_name + "(\"" + control_action + "\")");
          })
        }
      } else return
    })
  }


  ngOnInit(): void {
    // this.reset();
    // this.si = this.sm.getInfos();
  }

  public reset() {
    this.display_as_roman = false;
  }

  ngAfterViewInit(): void {
    // this.remove_all_tonas();
    $('.braid-svg').draggable({ axis: 'x' });
  }

  ngOnDestroy(): void {
    this.curTonality$.unsubscribe();
    this.midiControlUpdate$.unsubscribe();
    this.chordChangeSub$.unsubscribe();
    this.show_score_chords_SUBJ_update$.unsubscribe();
    this.displayNotesMode_SUBJ_update$.unsubscribe();
  }

  // Receives : {tonality: 'C', is_locked_to_score: true, score_tonality: 'C', mode:'aeolian'}
  private change_tonality(new_tona) {

    let need_update;
    let mode = 'ionian';

    if (new_tona.is_locked_to_score == true) {
      let tona = new_tona.scale_tona || new_tona.part_tona || new_tona.score_tona;
      mode = (tona == new_tona.scale_tona) ? new_tona.scale_mode : (tona == new_tona.part_tona) ? new_tona.part_mode : new_tona.score_mode

      need_update = !(tona == this.tonality_focused);
      let mode_rot = this.get_mode_rotation(tona, (mode as any));

      this.tonality_focused = mode_rot[0];
      // this.tonality_focused = tona;

      this.score_follow = true;
      this.rotate_arrays_for_tona(tona, mode); // TEMPORARY FIX TO PREVENT REDRAW ETC
      this.add_emphasis_diatonic_scale(tona, mode);

    } else {

      need_update = !(new_tona.selected_tona == this.tonality_focused);
      // this.tonality_focused = new_tona.selected_tona;
      let tona = new_tona.selected_tona;
      mode = new_tona.selected_mode;
      let mode_rot = this.get_mode_rotation(tona, (mode as any));

      this.tonality_focused = mode_rot[0];

      this.score_follow = false;
      mode = new_tona.selected_mode;
      this.rotate_arrays_for_tona(new_tona.selected_tona, mode); // TEMPORARY FIX TO PREVENT REDRAW ETC
      this.add_emphasis_diatonic_scale(new_tona.selected_tona, mode);
    }

    this.focus_tonality(this.tonality_focused, mode);
  }


  public hoverMe(e) {
    $(e.currentTarget).addClass('zoom');
  }

  public showMe(e) {
    let zoomedText = $(e.currentTarget).text();
    let divZone = $('#zoomed');
    let spanZone = divZone.children();

    spanZone.text(zoomedText);

    divZone.stop(false, true).fadeIn(0, function () {
      divZone.addClass('zoom');
    });

    divZone.stop(false, true).fadeOut(5000, function () {
      divZone.removeClass('zoom');
    });
  }

  public hoverMeNot(e) {
    $(e.currentTarget).removeClass('zoom');
  }

  public unlight_score() {
    this._chord = [];
  }

  public unlight_midi() {
    this._midi_chord = [];
  }


  public light_score(tonic, chordType) {
    console.log('lighting : tonic ', tonic, ' chordType : ', chordType);

    this._chord.push((tonic + chordType))

    let enharm = Note.enharmonic(tonic);
    // console.log("enharm =>", enharm)
    if (enharm != tonic) this._chord.push(enharm + chordType);

    if (tonic == 'B') {
      let other_tonic = 'Cb'
      let other_chordType = chordType;
      this._chord.push(other_tonic + other_chordType);

    } else if (tonic == 'E') {
      let other_tonic = 'Fb'
      let other_chordType = chordType;
      this._chord.push(other_tonic + other_chordType);

    } else if (tonic == 'F') {
      let other_tonic = 'E#'
      let other_chordType = chordType;
      this._chord.push(other_tonic + other_chordType);
    }


    if (chordType == 'german') {
      let other_tonic = Note.transpose(tonic, '2M');
      let other_chordType = '7';
      this._chord.push(other_tonic + other_chordType);
    }
    console.log("this._chord =>", this._chord)
  }

  public light_midi(tonic, chordType) {
    // console.log('lighting midi: tonic ',tonic, ' chordType : ',chordType);

    this._midi_chord.push((tonic + chordType))
    // console.log("this._midi_chord =>", this._midi_chord)

    let enharm = Note.enharmonic(tonic);
    // console.log("enharm =>", enharm)
    if (enharm != tonic) this._midi_chord.push(enharm + chordType);

    if (tonic == 'B') {
      let other_tonic = 'Cb'
      let other_chordType = chordType;
      this._midi_chord.push(other_tonic + other_chordType);

    } else if (tonic == 'E') {
      let other_tonic = 'Fb'
      let other_chordType = chordType;
      this._midi_chord.push(other_tonic + other_chordType);

    } else if (tonic == 'F') {
      let other_tonic = 'E#'
      let other_chordType = chordType;
      this._midi_chord.push(other_tonic + other_chordType);

    } else if (tonic == 'C') {
      let other_tonic = 'B#'
      let other_chordType = chordType;
      this._midi_chord.push(other_tonic + other_chordType);
    }


    if (chordType == 'german') {
      let other_tonic = Note.transpose(tonic, '2M');
      let other_chordType = '7';
      this._midi_chord.push(other_tonic + other_chordType);
    }


  }

  public focusBubble(posObj: any) {
    let idx = posObj.idx;
    let col = posObj.col;
    let type: string;

    switch (this.braidType) {
      case 'tonal':
        type = 'T_';
        break;
      case 'blues':
        type = 'B_';
        break;
      case 'new1':
        type = 'N1_';
        break;
      case 'new2':
        type = 'N2_';
        break;
      default:
        type = 'T_';
    }

    if (idx == -1) return;

    if (col == 'center_right') {

      setTimeout(() => {
        ($('#center_bubble_right_' + type + idx)[0] as any).scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 1)

    } else if (col == 'center_left') {

      setTimeout(() => {
        ($('#center_bubble_left_' + type + idx)[0] as any).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 1)

    } else if (col == 'center_up') {

      setTimeout(() => {
        ($('#center_bubble_up_' + type + idx)[0] as any).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 1)
    }

  }

  // Converts chords notation example
  public change_score_chord(c: string): void {
    let regex = /([A-G][b#]{0,2})(.*)/;
    let n = c.split('/')[0].match(regex);
    if (n == null) return;
    let tonic = n[1];
    let cur_chord_type = n[2];

    this.unlight_score();

    // console.log("cur_chord_type =>", cur_chord_type)
    if (this.maj_chords.indexOf(cur_chord_type) != -1) {

      cur_chord_type = 'M';

    } else if (this.min_chords.indexOf(cur_chord_type) != -1) {

      cur_chord_type = 'm';

    } else if (this.half_dim_chords.indexOf(cur_chord_type) != -1) {

      cur_chord_type = 'm7b5';

    } else if (this.seven_chords.indexOf(cur_chord_type) != -1) {

      cur_chord_type = '7';

    } else if (this.m69.indexOf(cur_chord_type) != -1) {

      cur_chord_type = 'm69';

    } else if (this.german.indexOf(cur_chord_type) != -1) {

      cur_chord_type = 'german';

    } else if (this.sevenb5.indexOf(cur_chord_type) != -1) {

      cur_chord_type = '7b5';

    } else if (this.dim_chords.indexOf(cur_chord_type) != -1) {

      cur_chord_type = 'dim';

    } else if (this.dim_seven_chords.indexOf(cur_chord_type) != -1) {
      // For dim7 chords we also light their enharmonic chords like : Cdim == Adim == F#dim == D#dim
      cur_chord_type = 'dim7';
      let n = Note.transpose(tonic, "3m");
      let other_dims = [n];
      for (let i = 0; i < 2; i++) {
        n = Note.simplify(Note.transpose(n, "3m"));
        other_dims.push(n);
      }
      for (let i = 0; i < other_dims.length; i++) this.light_score(other_dims[i], cur_chord_type);

    }

    this.light_score(tonic, cur_chord_type);
  }

  public change_midi_chord(valeur: Array<any>): void {

    if (!valeur['chords'].length || valeur['full_chord'].empty) {
      this.unlight_midi();
      return;
    }

    this.unlight_midi();
    let cur_chord_type = valeur['full_chord'].aliases[0];

    // console.log(cur_chord_type);

    let tonic = valeur['full_chord'].tonic.replace(/[0-9]$/, '');

    let idx_pos = { idx: -1, col: '' };

    if (this.maj_chords.indexOf(cur_chord_type) != -1) {

      cur_chord_type = 'M';

    } else if (this.min_chords.indexOf(cur_chord_type) != -1) {

      cur_chord_type = 'm';

    } else if (this.half_dim_chords.indexOf(cur_chord_type) != -1) {

      cur_chord_type = 'm7b5';

    } else if (this.seven_chords.indexOf(cur_chord_type) != -1) {

      cur_chord_type = '7';

    } else if (this.m69.indexOf(cur_chord_type) != -1) {

      cur_chord_type = 'm69';

    } else if (this.german.indexOf(cur_chord_type) != -1) {

      cur_chord_type = 'german';

    } else if (this.sevenb5.indexOf(cur_chord_type) != -1) {

      cur_chord_type = '7b5';

    } else if (this.dim_chords.indexOf(cur_chord_type) != -1) {

      cur_chord_type = 'dim';

    } else if (this.dim_seven_chords.indexOf(cur_chord_type) != -1) {

      // For dim7 chords we also light their enharmonic chords like : Cdim == Adim == F#dim == D#dim
      cur_chord_type = 'dim7';
      let n = Note.transpose(tonic, "3m");
      let other_dims = [n];
      for (let i = 0; i < 2; i++) {
        n = Note.simplify(Note.transpose(n, "3m"));
        other_dims.push(n);
      }
      for (let i = 0; i < other_dims.length; i++) this.light_midi(other_dims[i], cur_chord_type);

    }

    this.light_midi(tonic, cur_chord_type);
  }

  public focus_tonality(tona, mode) {

    // console.log("%cscore Follow: ","font-size:20px", this.score_follow, 'tona :',tona)
    if (!tona) return;

    let idx_pos;
    // if(tona.endsWith('m')) idx_pos = {idx:this.center_right.indexOf(tona.slice(0,-1)),col:'center_right'};
    if (this.roman_mode == 'aeolian' || this.roman_mode == 'minor' || this.roman_mode == 'm') idx_pos = { idx: this.center_left.indexOf(tona), col: 'center_right' };
    else if (this.braidType == 'blues') idx_pos = { idx: this.center_up.indexOf(tona), col: 'center_up' };
    else idx_pos = { idx: this.center_left.indexOf(tona), col: 'center_left' };

    this.focusBubble(idx_pos);

  }

  public switch_to_roman(valeur): void {
    var num: number;
    if (this.braidType != 'blues') num = 3;
    else num = 6;

    this.display_as_roman = valeur;

    if (!valeur) {
      this.fifth_left_up_in_use = this.fifth_left_up;
      this.fifth_left_down_in_use = this.fifth_left_down;
      this.left_up_in_use = this.left_up;
      this.left_down_in_use = this.left_down;

      this.center_up_in_use = this.center_up;
      this.center_right_in_use = this.center_right;
      this.center_left_in_use = this.center_left;

      this.right_up_in_use = this.right_up;
      this.right_down_in_use = this.right_down;
      this.fifth_right_up_in_use = this.fifth_right_up;
      this.fifth_right_down_in_use = this.fifth_right_down;
      this.chord_type = this.chord_type_notes
    } else {
      if (this.roman_mode == 'minor' || this.roman_mode == 'aeolian') {

        // this.fifth_left_up_in_use = ([... this.fifth_left_up_roman ] as any).rotate(num);
        // this.fifth_left_down_in_use = ([... this.fifth_left_down_roman ] as any).rotate(num);
        // this.left_up_in_use = ([... this.left_up_roman ] as any).rotate(num);
        // this.left_down_in_use = ([... this.left_down_roman ] as any).rotate(num);
        // this.center_up_in_use = ([... this.center_up_roman ] as any).rotate(num);
        // this.center_right_in_use = ([... this.center_right_roman ] as any).rotate(num);
        // this.center_left_in_use = ([... this.center_left_roman ] as any).rotate(num);
        // this.right_up_in_use = ([... this.right_up_roman ] as any).rotate(num);
        // this.right_down_in_use = ([... this.right_down_roman ] as any).rotate(num);
        // this.fifth_right_up_in_use = ([... this.fifth_right_up_roman ] as any).rotate(num);
        // this.fifth_right_down_in_use = ([... this.fifth_right_down_roman ] as any).rotate(num);

        // this.chord_type = this.chord_type_roman 


        this.fifth_left_up_in_use = this.fifth_left_up_roman;
        this.fifth_left_down_in_use = this.fifth_left_down_roman;
        this.left_up_in_use = this.left_up_roman;
        this.left_down_in_use = this.left_down_roman;

        this.center_up_in_use = this.center_up_roman;
        this.center_right_in_use = this.center_right_roman;
        this.center_left_in_use = this.center_left_roman;

        this.right_up_in_use = this.right_up_roman;
        this.right_down_in_use = this.right_down_roman;
        this.fifth_right_up_in_use = this.fifth_right_up_roman;
        this.fifth_right_down_in_use = this.fifth_right_down_roman;
        this.chord_type = this.chord_type_roman;
      } else {
        this.fifth_left_up_in_use = this.fifth_left_up_roman;
        this.fifth_left_down_in_use = this.fifth_left_down_roman;
        this.left_up_in_use = this.left_up_roman;
        this.left_down_in_use = this.left_down_roman;

        this.center_up_in_use = this.center_up_roman;
        this.center_right_in_use = this.center_right_roman;
        this.center_left_in_use = this.center_left_roman;

        this.right_up_in_use = this.right_up_roman;
        this.right_down_in_use = this.right_down_roman;
        this.fifth_right_up_in_use = this.fifth_right_up_roman;
        this.fifth_right_down_in_use = this.fifth_right_down_roman;
        this.chord_type = this.chord_type_roman;
      }

    }
  }



  private rotate_arrays_for_tona(tona: string, mode: string = 'ionian'): void {

    if (!tona) return;

    // if( mode == 'aeolian' || mode == 'minor' || mode == 'm' ){
    //   tona = Key.minorKey(tona).relativeMajor;
    // }

    this.fifth_left_up = this.braidType != 'blues' ? Tonalites[tona].outer_left_up : ([...Tonalites[tona].outer_left_up] as any).rotate(3);
    this.fifth_left_down = this.braidType != 'blues' ? Tonalites[tona].outer_left_down : ([...Tonalites[tona].outer_left_down] as any).rotate(3);
    this.left_up = this.braidType != 'blues' ? Tonalites[tona].left_up : ([...Tonalites[tona].left_up] as any).rotate(3);
    this.left_down = this.braidType != 'blues' ? Tonalites[tona].left_down : ([...Tonalites[tona].left_down] as any).rotate(3);

    this.center_up = this.braidType != 'blues' ? Tonalites[tona].center_minor : ([...Tonalites[tona].center_major] as any);
    this.center_left = this.braidType != 'blues' ? Tonalites[tona].center_major : ([...Tonalites[tona].center_major] as any).rotate(3);
    this.center_right = this.braidType != 'blues' ? Tonalites[tona].center_minor : ([...Tonalites[tona].center_major] as any);


    this.right_up = this.braidType != 'blues' ? Tonalites[tona].right_up : ([...Tonalites[tona].right_up] as any).rotate(3);
    this.right_down = this.braidType != 'blues' ? Tonalites[tona].right_down : ([...Tonalites[tona].right_down] as any).rotate(3);
    this.fifth_right_up = this.braidType != 'blues' ? Tonalites[tona].outer_right_up : ([...Tonalites[tona].outer_right_up] as any).rotate(3);
    this.fifth_right_down = this.braidType != 'blues' ? Tonalites[tona].outer_right_down : ([...Tonalites[tona].outer_right_down] as any).rotate(3);



    this.switch_to_roman(this.display_as_roman);
  }

  private debug_rotate_jsons(): void {
    return
    // console.log(ton);

    // Tonalites['roman'].left_up.rotate(3);
    // Tonalites['roman'].left_down.rotate(3);
    // Tonalites['roman'].outer_left_up.rotate(3);
    // Tonalites['roman'].outer_left_down.rotate(3);

    // Tonalites['roman'].right_up.rotate(3);
    // Tonalites['roman'].right_down.rotate(3);
    // Tonalites['roman'].outer_right_up.rotate(3);
    // Tonalites['roman'].outer_right_down.rotate(3);

    // console.log(JSON.stringify(Tonalites))

    // debugger
  }

  public svg_loaded(): void {
    // console.log("%cscore Follow: ","font-size:20px", this.score_follow, 'tonality_focused :',this.tonality_focused)
    if (this.score_follow) this.focus_tonality(this.tonality_focused, 'ionian');
  }

  public find_chords_in_score(chords: any): void {
    if (!chords) return;

    this.chords_in_score = [];
    for (let i = 0; i < chords.length; i++) {
      // this.change_score_chord(chords[i], true);

      let regex = /([A-G][b#]{0,2})(.*)/;
      let n = chords[i].split('/')[0].match(regex);
      if (n == null) return;
      let tonic = n[1];
      let cur_chord_type = n[2];
      let chordType = '';

      if (this.maj_chords.indexOf(cur_chord_type) != -1) chordType = 'M';
      else if (this.min_chords.indexOf(cur_chord_type) != -1) chordType = 'm';
      else if (this.half_dim_chords.indexOf(cur_chord_type) != -1) chordType = 'm7b5';
      else if (this.seven_chords.indexOf(cur_chord_type) != -1) chordType = '7';
      else if (this.m69.indexOf(cur_chord_type) != -1) chordType = 'm69';
      else if (this.german.indexOf(cur_chord_type) != -1) chordType = 'german';
      else if (this.sevenb5.indexOf(cur_chord_type) != -1) chordType = '7b5';
      else if (this.dim_chords.indexOf(cur_chord_type) != -1) chordType = 'dim';
      else if (this.dim_seven_chords.indexOf(cur_chord_type) != -1) chordType = 'dim7';

      this.chords_in_score.push((tonic + chordType))

      let enharm = Note.enharmonic(tonic);

      if (enharm != tonic) this.chords_in_score.push(enharm + chordType);

      if (tonic == 'B') {
        let other_tonic = 'Cb'
        let other_chordType = chordType;
        this.chords_in_score.push(other_tonic + other_chordType);
      } else if (tonic == 'E') {
        let other_tonic = 'Fb'
        let other_chordType = chordType;
        this.chords_in_score.push(other_tonic + other_chordType);
      } else if (tonic == 'F') {
        let other_tonic = 'E#'
        let other_chordType = chordType;
        this.chords_in_score.push(other_tonic + other_chordType);
      }

      if (chordType == 'german') {
        let other_tonic = Note.transpose(tonic, '2M');
        let other_chordType = '7';
        this.chords_in_score.push(other_tonic + other_chordType);
      }

    }
    // debugger
    console.log('chords_in_score--- ', this.chords_in_score);
  }

  public get_bubble_class(name, type = "", arg1: string = 'medBubble', arg2: string = '') {

    let c = arg1 + ' ' + arg2 + ' ';
    let is_in_chord;
    let is_in_score;
    let is_in_emphasis;
    let is_in_midi;

    // if(type === "M")type=''; //fix to get Majors to emphasis

    if (type == "dim") {
      is_in_chord = this._chord.indexOf(name + "dim7") != -1 || this._chord.indexOf(name + type) != -1;
      is_in_score = this.chords_in_score.indexOf(name + "dim7") != -1 || this.chords_in_score.indexOf(name + type) != -1;
      is_in_emphasis = this.chords_in_emphasis.indexOf(name + "dim7") != -1 || this.chords_in_emphasis.indexOf(name + type) != -1;
      is_in_midi = this._midi_chord.indexOf(name + "dim7") != -1 || this._midi_chord.indexOf(name + type) != -1
    } else {

      is_in_chord = this._chord.indexOf(name + type) != -1;
      is_in_score = this.chords_in_score.indexOf(name + type) != -1;
      is_in_emphasis = this.chords_in_emphasis.indexOf(name + type) != -1;
      is_in_midi = this._midi_chord.indexOf(name + type) != -1

    }

    if (this.si.getBraid_param_show_midi()) {

      if (is_in_chord && is_in_midi) {
        c += "midi_active_green "
      } else if (is_in_chord && this.si.getBraid_param_show_score_chords()) {
        c += "active ";
      } else if (is_in_midi) {
        c += "midi_active ";
      }
    } else if (is_in_chord && this.si.getBraid_param_show_score_chords()) {
      c += "active ";
    }
    // console.log("this.si.getBraid_param_show_score_chords() =>", this.si.getBraid_param_show_score_chords())


    // console.log("this.si.braid_param_emph_score_chords =>", this.chords_in_emphasis)
    // if((is_in_score || is_in_emphasis) && this.si.braid_param_emph_score_chords ){
    //   c += "erasenot";

    // }else if(!(is_in_score || is_in_emphasis) && this.si.braid_param_emph_score_chords){
    //   c += "erase";
    // }

    if ((is_in_score && this.si.braid_param_emph_score_chords) || (is_in_emphasis && this.si.braid_param_emph_diatonic_scale)) {
      c += "erasenot";

    } else if ((!is_in_score && this.si.braid_param_emph_score_chords) || (!is_in_emphasis && this.si.braid_param_emph_diatonic_scale)) {
      c += "erase";
    }

    if (c == 'active') debugger
    return c;
  }

  public get_arrow_class(name1, type1, name2, type2, secondname1, secondtype1, secondname2, secondtype2, secondname3: string = '', secondtype3: string = '', name3: string = '', type3: string = '') {

    let c = '';
    var is_in_chord: boolean;
    var is_in_midi: boolean;
    var is_in_chord_secondary: boolean;
    var is_in_midi_secondary: boolean;

    if (name3 == '' && type3 == '') {
      var is_in_chord = this._chord.indexOf(name1 + type1) != -1 || this._chord.indexOf(name2 + type2) != -1;
      var is_in_midi = this._midi_chord.indexOf(name1 + type1) != -1 || this._midi_chord.indexOf(name2 + type2) != -1;
    }
    else {
      var is_in_chord = this._chord.indexOf(name1 + type1) != -1 || this._chord.indexOf(name2 + type2) != -1 || this._chord.indexOf(name3 + type3) != -1;
      var is_in_midi = this._midi_chord.indexOf(name1 + type1) != -1 || this._midi_chord.indexOf(name2 + type2) != -1 || this._midi_chord.indexOf(name3 + type3) != -1;
    }

    if (secondname3 == '' && secondtype3 == '') {
      is_in_chord_secondary = this._chord.indexOf(secondname1 + secondtype1) != -1 || this._chord.indexOf(secondname2 + secondtype2) != -1;
      is_in_midi_secondary = this._midi_chord.indexOf(secondname1 + secondtype1) != -1 || this._midi_chord.indexOf(secondname2 + secondtype2) != -1;
    }
    else {
      is_in_chord_secondary = this._chord.indexOf(secondname1 + secondtype1) != -1 || this._chord.indexOf(secondname2 + secondtype2) != -1 || this._chord.indexOf(secondname3 + secondtype3) != -1;
      is_in_midi_secondary = this._midi_chord.indexOf(secondname1 + secondtype1) != -1 || this._midi_chord.indexOf(secondname2 + secondtype2) != -1 || this._midi_chord.indexOf(secondname3 + secondtype3) != -1;
    }


    if (this.si.getBraid_param_show_midi()) {

      if (is_in_chord && is_in_midi) {
        c += "midi_active_green "
      } else if (is_in_chord && this.si.getBraid_param_show_score_chords()) {
        c += "active ";
      } else if (is_in_midi) {
        c += "midi_active ";

      } else if (is_in_chord_secondary && is_in_midi_secondary) {
        c += "midi_activeSecond_green "
      } else if (is_in_chord_secondary && this.si.getBraid_param_show_score_chords()) {
        c += "activeSecond ";
      } else if (is_in_midi_secondary) {
        c += "midi_activeSecond ";
      }

    } else if (is_in_chord && this.si.getBraid_param_show_score_chords()) {
      c += "active ";
    } else if (is_in_chord_secondary && this.si.getBraid_param_show_score_chords()) {
      c += "activeSecond ";
    }

    return c;
  }

  public toggle_braid_score_chords() {
    this.askChordsInScore.next('find');
    this.zone.run(() => {
      this.si.braid_param_emph_score_chords = !this.si.braid_param_emph_score_chords;
    })
  }

  public toggle_diatonic_scale_braid() {
    this.zone.run(() => {
      this.si.braid_param_emph_diatonic_scale = !this.si.braid_param_emph_diatonic_scale;
    })
  }

  public toggle_simplified_braid() {
    this.zone.run(() => {
      this.si.braid_param_simplified_braid = !this.si.braid_param_simplified_braid;
    })
  }

  public toggle_one_tona_braid() {
    this.zone.run(() => {
      this.si.braid_param_emph_one_tona = !this.si.braid_param_emph_one_tona;
    })
  }

  public add_emphasis_diatonic_scale(tonic: string = "C", mode: string = "major") {
    let k = Key;
    let c = Chord;
    let m = Mode;
    let ct = ChordType;
    //console.log(k)
    //console.log(c);
    //console.log(m);
    //console.log(ct);
    if (!mode) mode = 'major';
    let diatonic_chords;
    if (mode == 'ionian' || mode == 'dorian' || mode == 'phrygian' || mode == 'lydian' || mode == 'mixolydian' || mode == 'aeolian' || mode == 'locrian') {

      diatonic_chords = (m as any).triads(mode, tonic).map((e, i) => {

        let regex = /([ABCDEFG][#b]{0,2})(.*)/
        let r = regex.exec(e);

        if (r && r[2] == '') return e + "M";
        else return e

      });

      // ?? DEPREC ??
      // shifting scale chords to get right mode
      let shift = {
        'ionian': 0, 'dorian': 1, 'phrygian': 2, 'lydian': 3, 'mixolydian': 4, 'aeolian': 5, 'locrian': 6, '': 0
      }
      let rotation = shift[mode];
      diatonic_chords = diatonic_chords.rotate(-rotation);

      diatonic_chords.push(diatonic_chords[4].slice(0, -1) + "7");
      diatonic_chords.push(diatonic_chords[6].replace('dim', 'm7b5').replace('M', '7'));

    } else {

      if (mode == "major")
        diatonic_chords = (m as any).triads(mode, tonic).map((e, i) => { if (i == 0 || i == 3 || i == 4) return e + "M"; else return e })
      // diatonic_chords = (m as any).seventhChords("major","C") // Doesnt work...for now
      else
        diatonic_chords = (m as any).triads(mode, tonic).map((e, i) => {
          if (i == 2 || i == 5 || i == 6) return e + "M";
          else if (i == 4) { return e.slice(0, -1) + "M"; }
          else return e
        })

      if (!diatonic_chords.length) {

        console.warn('Braid : no diatonic chords found...');
        return;
      }
      diatonic_chords.push(diatonic_chords[4].slice(0, -1) + "7");
      diatonic_chords.push(diatonic_chords[6].replace('dim', 'm7b5').replace('M', '7'));
      if (mode == 'minor') {
        diatonic_chords.push(diatonic_chords[1].replace('dim', 'm7b5'))
        diatonic_chords.push(m.notes('ionian', tonic).slice(-1)[0] + 'dim');
      }
    }

    this.chords_in_emphasis = [];
    for (let chord of diatonic_chords) {
      this.add_emphasis_chord(chord);
    }
    console.log("this.chords_in_emphasis =>", this.chords_in_emphasis)
  }

  public add_emphasis_chord(chord: string = "C") {
    if (this.chords_in_emphasis.indexOf(chord) == -1) this.chords_in_emphasis.push(chord)
  }
  public remove_emphasis_chord(chord: string = "") {
    let idx = this.chords_in_emphasis.indexOf(chord);
    if (idx != -1) this.chords_in_emphasis.splice(idx, 1);
  }

  public toggle_outer_bubbles() {
    $(".smallBubble.outer").toggle();
    $(".arrows-ext").toggle();
  }

  public remove_all_tonas() {
    for (let i = 0; i <= 16; i++) {
      if (i == 7 || i == 8 || i == 9) continue
      $("#whole_tona_" + i).hide()
      $("#whole_tona_background_" + i).hide()
      $("#whole_tona_intermediate_" + i).hide()
    }
    $("#whole_tona_background_7").hide()
    $("#whole_tona_background_9").hide()
    $("#rectV_9").hide();
    $("#arrows_T_9").hide();
    $("#arrowsMidL_T_9").hide();
    $("#arrowsMidR_T_9").hide();

  }

  public show_all_tonas() {
    return new Promise(
      resolve => {

        let hold = 0;
        let fct = () => {
          // console.log(hold)
          hold++;
          if (hold == 40) {
            // console.log("resolllllved")
            resolve('resolved')
          }
        }

        for (let i = 0; i < 15; i++) {
          if (i == 7 || i == 8 || i == 9) continue
          $("#whole_tona_" + i).show("fast", fct);
          $("#whole_tona_background_" + i).show("fast", fct)
          $("#whole_tona_intermediate_" + i).show("fast", fct)
        }
        $("#rectV_9").show("fast", fct);
        $("#arrows_T_9").show("fast", fct);
        $("#arrowsMidL_T_9").show("fast", fct);
        $("#arrowsMidR_T_9").show("fast", fct);

      })
  }

  public async debug() {
    // this.add_emphasis_diatonic_scale();
    // this.toggle_outer_bubbles();
    // debugger
    this.show_all_tonas().then(() => {
      let tona = { tonality: 'C', is_locked_to_score: true, score_tonality: 'D' }
      this.change_tonality(tona);
      setTimeout(() => { this.remove_all_tonas(); }, 1);
    })
  }

  public is_prev_tona(idx) {
    return this.tonas_displayed.indexOf(idx + 1) != -1
  }
  public is_next_tona(idx) {
    return this.tonas_displayed.indexOf(idx - 1) != -1
  }
  public is_cur_tona(idx) {
    return this.tonas_displayed.indexOf(idx) != -1
  }



  public COF_set_roman_mode(mode: 'ionian' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'aeolian' | 'locrian' | '' = 'ionian') {


    if (mode == '') this.roman_mode_engaged = false;
    else this.roman_mode_engaged = true;

    const modes = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian', ''];
    if (modes.indexOf(mode) == -1) {
      console.warn("COF_SET_ROMAN_MODE : wrong mode ! ('ionian'|'dorian'|'phrygian'|'lydian'|'mixolydian'|'aeolian'|'locrian'|'') : ", mode);
      mode = 'ionian';
      // return;
    }
    this.roman_mode = mode;
    // debugger
    // this.add_emphasis_diatonic_scale(valeur.scale, valeur.mode);
    this.add_emphasis_diatonic_scale(this.tonality_focused, (mode == '') ? 'major' : mode);

  }

  public get_mode_rotation(tona, mode: 'major' | 'minor' | 'ionian' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'aeolian' | 'locrian' | '' = 'ionian') {


    if (!mode) mode = 'major';
    // mode = 'major'

    let shift = { 'ionian': 0, '': 0, 'major': 0, 'mixolydian': 11, 'dorian': 10, 'minor': 9, 'aeolian': 9, 'phrygian': 8, 'locrian': 7, 'lydian': 1 };

    let rotation_times = shift[mode];
    if (rotation_times == undefined) {
      console.warn("COF_SET_ROMAN_MODE : wrong mode ! ('ionian'|'dorian'|'phrygian'|'lydian'|'mixolydian'|'aeolian'|'locrian'|'') : ", mode);
      // mode = '';
      rotation_times = 0;
    }

    let _fifths = ['C', 'G', 'D', 'A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
    let _fifths_sh = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
    let _mfifths = ['A', 'E', 'B', 'F#', 'C#', 'G#', 'Eb', 'Bb', 'F', 'C', 'G', 'D'];

    if (tona == 'C#') tona = 'Db';
    else if (tona == 'G#') tona = 'Ab';
    else if (tona == 'D#') tona = 'Eb';
    else if (tona == 'A#') tona = 'Bb';
    else if (tona == 'F#') tona = 'Gb';

    let rota;
    let new_key;
    if (_fifths.indexOf(tona) == -1) {

      rota = (_fifths_sh.indexOf(tona) + rotation_times) % 12;
      new_key = _fifths_sh[rota];
    } else {
      rota = (_fifths.indexOf(tona) + rotation_times) % 12;
      new_key = _fifths[rota];
    }

    // if(mode == 'minor' || mode == 'aeolian')new_key = _mfifths[rota];

    let selected_mode = (mode == 'aeolian') ? 'minor' : mode;
    // let selected_green = (tona=='F#' && mode != 'minor')?'Gb':new_key;
    let selected_green = (new_key == 'Gb') ? 'F#' : new_key;
    this.roman_mode = selected_mode;
    return [selected_green, selected_mode];

  }
}
