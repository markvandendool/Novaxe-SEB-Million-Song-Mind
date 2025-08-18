import { Component, OnInit, NgZone, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { CurTonalityModel } from '@models/songmodel/cur-tonality-model';
import { ConfigModel } from '@models/configmodel/configModel';
import { MidiService } from '@services/midi/midi.service';
import { CurChordModel } from '@models/songmodel/cur-chord-model';

@Component({
  selector: 'app-tonality-button',
  templateUrl: './tonality-button.component.html',
  styleUrls: ['./tonality-button.component.scss']
})

export class TonalityButtonComponent implements OnInit {

  private maj_chords = ['','M','maj7','5','maj9','maj11','maj13','6','Maj7','Maj9','M11','M13','maj9no5','M9sus4','Madd9','69'];
  private min_chords = ['m','m7','m#5','mMa7', 'm6', 'm9','m11','m7no5','m9no5','m11no5','madd9'];
  // private half_dim_chords = ['none'];
  private half_dim_chords = ['m7b5'];
  private seven_chords = ['7','9','11','13','7no5','9no5','13no5','13sus4','7add13'];
  private m69 = ['m69','m69'];
  private german = ['german'];
  private sevenb5 = ['7b5'];
  private dim_chords = ['dim','o','m7b5'];
  private dim7_chords = ['dim7'];



  public chordChangeSub$:Subscription;
  private curTonality$:Subscription;
  private midiControlUpdate$:Subscription;
  private show_score_chords_SUBJ_update$:Subscription;

  private show_score_chords:boolean = true;

  public _fifths    = ['C','G','D','A','E','B','Gb','Db','Ab','Eb','Bb','F'];
  public _fifths_sh    = ['C','G','D','A','E','B','F#','C#','G#','D#','A#','F'];
  public _mfifths   = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'Ebm', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'];
  public _roman  = ['IV', 'I', 'V', 'II', 'VI', 'III', 'VII', 'Tri','','bVI','bIII','bVII'];
  public _diminished  = ['Bo', 'F#o', 'C#o', 'G#o', 'D#o', 'A#o', 'E#o', 'Fo', 'Co', 'Go', 'Do', 'Ao', 'Eo'];


  public chords_F_positions = {'C':0,'G':1,'D':2,'A':3,'E':4,'B':5,'Gb':6,'F#':6,'Db':7,'Ab':8,'Eb':9,'Bb':10,'F':11};
  public chords_MF_positions = {'Am':0,'Em':1,'Bm':2,'F#m':3,'C#m':4,'G#m':5,'Ebm':6,'D#m':6,'Bbm':7,'Fm':8,'Cm':9,'Gm':10,'Dm':11};
  public x_roman:any = [25, 170, 305, 400, 438, 400, 290, 165, 25, -75, -110, -70];
  public y_roman:any = [125.36215, 85.36215, 125.36215, 215.36218, 360.36218, 495.36218, 600.36218, 635.36218, 600.36218, 495.36218, 360.36218, 215.36218];
  public rotation_times:number;

  // THE GREEN PART IS CENTERED AROUND THIS ONE
  public selected_green:any  = "C";


  public current_score_chord:string = '';
  public current_midi_chord:string = '';
  public selected_score_chord:any = null;

  public score_tonality:string = 'C';
  public selected_tonality:string = this.score_tonality;
  public hide:boolean = true;

  public lock_closed:boolean; 
  public is_locked:boolean=true;

  public mode:'major'|'minor'|'ionian'|'dorian'|'phrygian'|'lydian'|'mixolydian'|'aeolian'|'locrian'|'' = '';

  @Input() set is_opened(valeur: boolean) {
    if (valeur)
      this.showWheel();
    else
      this.hideWheel();
  }

  // MIDI CHORD INPUT
  @Input() set cur_chord_midi_chord(valeur: Array<any>) {
    this.change_midi_chord(valeur);
  }



  constructor( private cm:ConfigModel,
    private curTonality:CurTonalityModel, 
    private midi:MidiService, 
    private zone:NgZone, 
    private curChordMod:CurChordModel) {
      
    this.lock_closed = this.cm.isTonalityLockedToScore();

    // SUBSCRIPTION TO THE CURRENT TONALITY
    this.curTonality$ = this.curTonality.current_tonality$.subscribe((data)=>{ 
      
      // SET THE CURRENT TONALITY
      this.is_locked  = data.is_locked_to_score;

      this.score_tonality = data.scale_tona || data.part_tona || data.score_tona;
      this.selected_tonality = data.selected_tona; 
      
      if(this.is_locked){

        let mode = (this.score_tonality == data.scale_tona)?data.scale_mode:(this.score_tonality==data.part_tona)?data.part_mode:data.score_mode
        this.COF_set_roman_mode(this.score_tonality,mode);

      }else{

        this.COF_set_roman_mode(this.selected_tonality,data.selected_mode);
      }


      this.rotate_romans();
    });

    
    // SUBSCRIPTION to CURRENT SCORE CHORD
    this.chordChangeSub$ = this.curChordMod.current_chord$.subscribe((data)=>{
      
      if(!this.is_locked)return;

      //light the current score chord 
      this.selected_score_chord = data
      this.light_score()
    });
      

    // SUBSCRIPTION TO MIDI CONTROLS
    this.midiControlUpdate$ = this.midi.controlTabSubject.subscribe(data=>{
      
      let ctrl = this.cm.getAssignedControls(false);
      let o = ctrl[""+data];
      let number;
      let control_name;
      let control_action;


      if(o && o.length){
        for(let obj of o){
          number = obj.number;
          control_name = obj.control_name;
          control_action = obj.control_action;
          if(!eval("this."+control_name)) continue;
          this.zone.run(()=>{
            this.is_locked = false;
            this.unlight_score();
            eval("this."+control_name+"(\""+control_action+"\")");
          })
        }
      } else return
    })

    
    // SUBSCRIPTION TO SHOW_SCORE_CHORDS PARAMETER
    // this.show_score_chords_SUBJ_update$ = this.cm.global_show_score_chords_SUBJ$.subscribe(data=>{
    //   this.show_score_chords = data;
    //   this.light_score();
    // });
  }



  ngOnInit(): void {
  }

  ngOnDestroy():void{
    this.curTonality$.unsubscribe();
    this.chordChangeSub$.unsubscribe();
    this.midiControlUpdate$.unsubscribe();
    // this.show_score_chords_SUBJ_update$.unsubscribe();
  } 


  public changeTonality(tonality){

    let obj = {
      selected_tona:tonality.selected_tonality, 
      selected_mode:tonality.selected_mode,
      is_locked_to_score:this.is_locked,
     };
    this.curTonality.setTonality(obj);
  }



  public COF_set_roman_mode(tona,mode:'major'|'minor'|'ionian'|'dorian'|'phrygian'|'lydian'|'mixolydian'|'aeolian'|'locrian'|''='ionian'){

    
    if(!mode) mode = 'major';
    // mode = 'major'
    
    let shift = { 'ionian':0, '':0,'major':0, 'mixolydian':11, 'dorian':10, 'minor':9, 'aeolian':9, 'phrygian':8, 'locrian':7, 'lydian':1};

    let rotation_times = shift[mode];
    if(rotation_times == undefined){
      console.warn("COF_SET_ROMAN_MODE : wrong mode ! ('ionian'|'dorian'|'phrygian'|'lydian'|'mixolydian'|'aeolian'|'locrian'|'') : ", mode);
      // mode = '';
      rotation_times = 0;
    }
  
    let rota;
    if(this._fifths.indexOf(tona) == -1)
      rota = (this._fifths_sh.indexOf(tona)+rotation_times)%12;
    else
      rota = (this._fifths.indexOf(tona)+rotation_times)%12;
    
    let new_key;
    if(mode == 'minor' || mode == 'aeolian')new_key = this._mfifths[rota];
    else new_key = this._fifths[rota];

    this.mode = (mode=='aeolian')?'minor':mode;
    this.selected_green = (tona=='F#' && mode != 'minor' )?'Gb':new_key;
   
  }


  public light_off_tona(){
    var elems = document.querySelectorAll(".active-tonality");

    [].forEach.call(elems, function(el) {
        el.classList.remove("active-tonality");
    });
  }


  public light(e){
    $(e.currentTarget).addClass('active-tonality');
  }



  /**
   * Called upon tonality clicked on the COF
   * @param e 
   */
  public clickMe(e){

    this.light_off_tona();

    let selected_green = $(e.currentTarget).text()!='' ? $(e.currentTarget).text() : $(e.currentTarget).next().text();
    
    //For double chords, only F# & D#m will be shown (Gb & Ebm are not on the braid center)
    if(selected_green=='Gb|F#'||selected_green=='Ebm|D#m') selected_green = selected_green.split(/[|]+/).pop();
    
    this.is_locked = false;


    let is_minor = selected_green[selected_green.length-1] == 'm';
    let selected_mode = (is_minor)?'minor':'major';
    let selected_tonality = selected_green;
    if(is_minor) selected_tonality = selected_green.slice(0, selected_green.length - 1);

    this.changeTonality({selected_tonality:selected_tonality, selected_mode:selected_mode});
    
  }



  /**
   * When middle button is clicked
   */
  public toggle_lock_to_score(){
    this.is_locked = !this.is_locked;
    if(this.is_locked && !this.cm.tonality_button_always_open) this.hide = true;
    else this.hide = false
    
    this.curTonality.setTonality({is_locked_to_score:this.is_locked});

    // if(this.is_locked)this.COF_set_roman_mode('');
  }



  public showWheel(){
    this.hide = false;
  }


  public hideWheel(){
    if (!this.cm.tonality_button_always_open)
      this.hide = true;
  }



  public rotate_romans(){
    
    let test_tona;
    if(this.is_locked) test_tona = this.score_tonality;
    else test_tona = this.selected_tonality;

    if(test_tona == 'C#')test_tona = 'Db';
    else if(test_tona == 'G#')test_tona = 'Ab';
    else if(test_tona == 'D#')test_tona = 'Eb';

    if(test_tona in this.chords_F_positions)
      this.rotation_times = this.chords_F_positions[test_tona];
    else
      this.rotation_times = this.chords_MF_positions[test_tona]+3;

    if(!this.rotation_times)return;

    Object.keys(this.chords_F_positions).forEach((key)=>{
      this.chords_F_positions[key] = this.chords_F_positions[key]-this.rotation_times;
    })
    Object.keys(this.chords_MF_positions).forEach((key)=>{
      this.chords_MF_positions[key] = this.chords_MF_positions[key]-this.rotation_times;
    })

    this.x_roman.rotate(this.rotation_times);
    this.y_roman.rotate(this.rotation_times);
  }


  public getSimplifiedChordType(cur_chord_type){
    let chordType = '';
    let idx_pos = {idx:-1,col:''};

    if(this.maj_chords.indexOf(cur_chord_type) != -1){
      chordType = 'M';

    } else if(this.min_chords.indexOf(cur_chord_type) != -1){
      chordType = 'm';

    } else if(this.half_dim_chords.indexOf(cur_chord_type) != -1){
      chordType = 'm7b5';

    } else if(this.seven_chords.indexOf(cur_chord_type) != -1){
      chordType = '7';

    } else if(this.m69.indexOf(cur_chord_type) != -1){
      chordType = 'm69';

    } else if(this.german.indexOf(cur_chord_type) != -1){
      chordType = 'german';

    } else if(this.sevenb5.indexOf(cur_chord_type) != -1){
      chordType = '7b5';

    } else if(this.dim_chords.indexOf(cur_chord_type) != -1){
      chordType = 'dim';

    } else if(this.dim7_chords.indexOf(cur_chord_type) != -1){
      chordType = 'dim7'
    }

    chordType = (chordType[0]=="m" && chordType!='m7b5')?"m":chordType;
    return chordType;
  } 



  /*
   * Receives the midi chord and changes the cur_chord_type then call the light.
   * @param chord 
   * @returns 
   */
  public change_midi_chord(chord: Array<any>):void{
    if(!chord['chords'].length || chord['full_chord'].empty){
      this.unlight_midi();
      return;
    } 

    let cur_chord_type = chord['full_chord'].aliases[0];
    // this.current_midi_chord = chord['chords'][0];
    let chordType = this.getSimplifiedChordType(cur_chord_type);

    let tonic = chord['full_chord'].tonic.replace(/[0-9]$/,'');

    this.unlight_midi();
    this.light_midi( tonic , chordType);
  }



  public unlight_midi(){
    this.current_midi_chord = " ";
  }



  public light_midi(tonic, chordType){
    
    chordType = (chordType[0]=="m" && chordType!='m7b5')?"m":chordType;
    // if(chordType != 'dim7' && chordType !='m' && chordType != 'dim' )chordType =''; 
    // else if(this.min_chords.indexOf(chordType) != -1) chordType = 'm'; // on a trouvé chordType dans les accords mineurs.

    if(chordType == 'M' || this.seven_chords.indexOf(chordType)!=-1)chordType = ''; //chordType est un accord majeur ou un accord 7
    else if(this.min_chords.indexOf(chordType) != -1) chordType = 'm'; // on a trouvé chordType dans les accords mineurs.
    else if(this.dim_chords.indexOf(chordType) != -1) chordType = 'dim';
    
    // console.log("MIDI =---------------- =  chordType =>", chordType)
    this.current_midi_chord = tonic + chordType;
    // console.log("this.current_midi_chord =>", this.current_midi_chord)
  }



  /**
   * Light the COF with the current score chord.
   * @returns 
   */
  public light_score(){

    if(!this.selected_score_chord)return;
    let chordType = this.selected_score_chord.chordType;
    let tonic = this.selected_score_chord.root;

    // if(chordType != 'dim7' && chordType != 'dim' && chordType != 'o' && chordType[0] !='m' )chordType ='';
    // if(chordType != '7' && chordType != 'dim' && chordType != 'o' && chordType[0] !='m' )chordType ='';
    // else chordType = 'm';

    
    // if(this.dim7_chords.indexOf(chordType)!=-1 || this.dim_chords.indexOf(chordType)!=-1){
    //   chordType = this.getSimplifiedChordType(this.selected_score_chord.chordType);

    // }
    if(chordType == 'M' || this.seven_chords.indexOf(chordType)!=-1 || this.maj_chords.indexOf(chordType)!=-1)chordType = ''; //chordType est un accord majeur ou un accord 7
    else if(this.min_chords.indexOf(chordType) != -1) chordType = 'm'; // on a trouvé chordType dans les accords mineurs.
    else if(this.dim_chords.indexOf(chordType) != -1) chordType = 'dim';
    
    // console.log("---------------------------chordType =>", chordType)
    if(this.show_score_chords) this.current_score_chord = tonic + chordType;
    else this.unlight_score();
  }



  public unlight_score(){
    this.current_score_chord = null;
  }



  public toggle_leave_open(){
    // this.cm.setTonalityLockedToScore(!this.cm.isTonalityLockedToScore());
    this.cm.set_tonality_button_always_open(!this.cm.get_tonality_button_always_open())

    if(this.cm.get_tonality_button_always_open()) this.showWheel()
  }

}
