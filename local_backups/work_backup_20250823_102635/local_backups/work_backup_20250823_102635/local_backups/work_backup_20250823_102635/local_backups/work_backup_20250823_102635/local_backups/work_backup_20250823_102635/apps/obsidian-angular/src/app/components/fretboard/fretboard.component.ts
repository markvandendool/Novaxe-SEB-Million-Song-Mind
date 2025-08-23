import { Component, OnInit, AfterViewInit, Input, Output, NgZone, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';


import { ConfigModel } from '@models/configmodel/configModel';
import { SelectionModel } from '@models/selectionmodel/selectionmodel';
import { ChordDetectService } from '@services/chord-detect/chord-detect.service';
import { MusicUtilsService } from '@services/music-utils-service/music-utils.service';
import { Songmodel } from '@models/songmodel/songmodel';
import { TransportService } from '@services/transport/transport.service';

import { Chord, Scale, Note } from "@tonaljs/tonal";
import { CHORDS } from "@assets/chords/chords.js"
import { midi } from '@tonaljs/note';
import { detect } from '@tonaljs/chord-detect';

import { MidiService } from '@services/midi/midi.service';

declare var $: any;

@Component({
    selector: 'app-fretboard',
    templateUrl: './fretboard.component.html',
    styleUrls: ['./fretboard.component.scss'],
    standalone: false
})
export class FretboardComponent implements OnInit, AfterViewInit {

  // public chords_list = CHORDS.map( (e)=>{return e[2].split(' ')[0]} );
  public chords_list = CHORDS;
  public _chordName:string = '';
  private lit_chord = null;
  private cur_selection_measure:any=null;
  private cur_selection_beat:any=null;
  private cur_scale_full:any = {empty:true};
  private cur_chord_full:any = {empty:true};
  private no_score_selected_scale:any = {  scale_tona:'E', scale_type:'major',full_scale:Scale.get("e major")};
  private no_score_selected_chord:any = {  chord_tona:'D', chord_type:'minor',full_chord:Chord.get("D minor")};

  public visible:boolean = false;

  public animationTime:number = 5; // for ANIMATION #2
  public anim:Array<string> = ['Misty', 'Summertime', 'Fever', 'Misty-time', 'Off'];
  public selected_anim:string = 'Misty-time';


  public glowingBubbles:boolean = true;


  // ===============================TESTS DOUBLE ANIM !==============================
  // private animationFrame:any;
  // private t0:number;


  private selectionUpdate$:Subscription;
  private beat_selectionUpdate$:Subscription;

  private displayNotesMode_SUBJ_update$:Subscription;
  public displayNotesMode:boolean=false;

  private show_score_chords_SUBJ_update$:Subscription;

  private previous_midi_tab:any;

  @Input() set display( val:boolean ){
    this.visible = val;
  }
  @Output() displayChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() set cur_chord(chord){
    if(!this.cm.display_fretboard)return;

    if( this.score_follow == true ){
      // this.light_chord(chord);
      this.unlight_all_glow(); 
      this.unlight_finger_on_fretboard();
      this.light_chord(chord);
      this.lit_chord = chord;
      // this.light_finger(2, 2);
      
    }else{
      
      this.unlight_all_midi(); 
      
      this.unlight_finger_on_fretboard();
      this.light_chord(chord);
      this.lit_chord = chord;
      if(!chord.chords.length){
        this.chord_tona = '';
        this.chord_type = '';
      } else {
       this.chord_tona = chord.full_chord.tonic.replace(/[0-9]/g, '');
       this.chord_type = chord.full_chord.aliases[0];
      }
    }

  // ===============================TESTS DOUBLE ANIM !==============================
  
    // if(chord.full_chord.midi_notes.length) //note pushed
    //   this.start_finger_anim();
    
    // else //note released
    //   this.stop_finger_anim();
  }

  public bg:Array<string> = ['Classic', 'Dark'];
  public selected_bg:string = 'Dark';

  public xStringNotes:Array<number> = [-14,7,28,50.5,73,95.5,119,141.5,164,186.5,210,232.5,255,277.5,301,323.5,346,368.5,392,415.5,438,460.5,483,505.5,529.5];
  public xStringNotes2:Array<number> = [-12,18,54,87,119,146.5,174,200,224,247,268,290.5,310,329,347.5,367,385.5,404,422.5,441.5,460,478.5,497,515.5,533.5];
  public yStrings:Array<number> = [4.5, 21.5, 39, 57, 75, 93];
  public activeStrings:Array<boolean> = [true,true,true,true,true,true];
  public activeBubbles:boolean = true;
  public activeLosanges:boolean = true;
  public score_follow:true|false|'both' = true;
  public rotated:boolean = false;
  public right_handed:boolean = true;

  public scale_tona:'C#'| 'F#'| 'B'| 'E'| 'A'| 'D'| 'G'| 'C'| 'F'| 'Bb'| 'Eb'| 'Ab'| 'Db' | '' = 'C';
  public scale_type:string = 'major';
  public chord_tona:'C#'| 'F#'| 'B'| 'E'| 'A'| 'D'| 'G'| 'C'| 'F'| 'Bb'| 'Eb'| 'Ab'| 'Db' | '' = 'C';
  public chord_type:string = 'major';
  public chord_follow_score:boolean=true;
  public scale_follow_score:boolean=true;


  public notes_sharp = [
    ['E','F','F#','G','G#','A','A#','B','C','C#','D','D#','E','F','F#','G','G#','A','A#','B','C','C#','D','D#','E','F'],
    ['B','C','C#','D','D#','E','F','F#','G','G#','A','A#','B','C','C#','D','D#','E','F','F#','G','G#','A','A#','B','C'],
    ['G','G#','A','A#','B','C','C#','D','D#','E','F','F#','G','G#','A','A#','B','C','C#','D','D#','E','F','F#','G','G#'],
    ['D','D#','E','F','F#','G','G#','A','A#','B','C','C#','D','D#','E','F','F#','G','G#','A','A#','B','C','C#','D','D#'],
    ['A','A#','B','C','C#','D','D#','E','F','F#','G','G#','A','A#','B','C','C#','D','D#','E','F','F#','G','G#','A','A#'],
    ['E','F','F#','G','G#','A','A#','B','C','C#','D','D#','E','F','F#','G','G#','A','A#','B','C','C#','D','D#','E','F']
  ];

  public notes_flat = [
    ['E','F','Gb','G','Ab','A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B','C','Db','D','Eb','E','F'],
    ['B','C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B','C'],
    ['G','Ab','A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab'],
    ['D','Eb','E','F','Gb','G','Ab','A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B','C','Db','D','Eb'],
    ['A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb'],
    ['E','F','Gb','G','Ab','A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B','C','Db','D','Eb','E','F']
  ];

  public notes_midi = [
    [64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88],
    [59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83],
    [55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79],
    [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74],
    [45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69],
    [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64],
  ];

  public caged_position:Array<'C'|'A'|'G'|'E'|'D'> = [];
  public caged_filter:Array<number> = [];

  public notes_active = this.notes_flat;
  public active_scale = ['C','D','E','F','G','A','B'];
  public active_scale_quality = 'major';

  public active_intervals = ['1','2','3','4','5','6','7'];

  private midiControlUpdate$:Subscription;

  
  //======================================
  // la structure du fretboard est un tableau de tableau d'Objects.
  /*
  [
    [{},{},{},{},...]
    [{},{},{},{},...]
    [{},{},{},{},...]
    [{},{},{},{},...]
    [{},{},{},{},...]
    [{},{},{},{},...] 
  ]
  chacun des objets va contenir les parametres de cette case du fretboard.
  */
  public fb_struct:Array<Array<any>> = [];
//======================================

  constructor( private mu:MusicUtilsService, public sm:Songmodel, private cd:ChordDetectService, public sel:SelectionModel, public zone:NgZone,private midi:MidiService, public cm:ConfigModel, private transport:TransportService ) { 

    this.displayNotesMode = (this.cm.getDisplayNoteMode() == 'letters')?false:true; 

    this.construct_fretboard();
  }

  ngOnInit() { 

    
    this.displayNotesMode_SUBJ_update$ = this.cm.displayNotesMode_SUBJ_update$.subscribe(data=>{

      if(data == 'letters'){
        this.displayNotesMode = false; 
      }else{
        this.displayNotesMode = true; 
      }
    });

    this.show_score_chords_SUBJ_update$ = this.cm.global_show_score_chords_SUBJ$.subscribe(data=>{
      this.score_follow = data;
      this.toggle_midi(data);
      
      if(data==true && this.cur_selection_measure){
        let b = this.cur_selection_beat || 0;
          this.light_chord_from_measure(this.cur_selection_measure,b);
          this.chord_tona = this.cur_chord_full.tonic;
          this.chord_type = this.cur_chord_full.aliases ? this.cur_chord_full.aliases[0] : null;
        }
        this.unlight_finger_on_fretboard();
    });

    this.beat_selectionUpdate$ = this.transport.beatChange.subscribe(data=>{

      let m = this.sm.getMeasureByIdx(data.measure);
      if(!m )return;
      this.cur_selection_measure = m; 
      let b = data.beat;
      this.cur_selection_beat = b;

      this.change_animation_time(m); // set la durée de l'animation

      if(this.scale_follow_score) this.set_scale_from_measure(m);

      this.refresh_caged_position();

      if(!this.score_follow )return;
      
      if(this.chord_follow_score) {
        this.light_chord_from_measure(m,b);
        this.chord_tona = this.cur_chord_full.tonic;
        this.chord_type = this.cur_chord_full.aliases ? this.cur_chord_full.aliases[0] : null;
      } else {
        this.no_score_selected_chord.chord_tona = this.chord_tona; 
        // this.no_score_selected_chord.chord_type = this.chord_type; 
        // this.no_score_selected_chord.full_chord = this.cur_chord_full;
        
        this.no_score_selected_chord.full_chord = Chord.get(this.chord_tona+' '+this.chord_type);
        this.no_score_selected_chord.full_chord.midi_tab = [];
        this.no_score_selected_chord.full_chord.unfiltered_midi = [];
        this.light_chord({chords:[this.no_score_selected_chord.full_chord.symbol],full_chord:this.no_score_selected_chord.full_chord});
        }
    });

    // this.selectionUpdate$ = this.sel.selected_Update$.subscribe(data=>{
      
    //   return
    //   // this.cur_selection_measure = data; 
      
      
    //   let m = data[0]; // 'm' est la mesure sélectionnée
      
    //   if(!m || m.getType() == 'part'){ return; }
      
    //   this.zone.run(()=>{
        
    //     this.change_animation_time(m); // set la durée de l'animation

    //     if(this.scale_follow_score) this.set_scale_from_measure(m);

    //     this.refresh_caged_position();

    //     if(!this.score_follow )return;
        
    //     if(this.chord_follow_score) {
    //       this.light_chord_from_measure(m);
    //       this.chord_tona = this.cur_chord_full.tonic;
    //       this.chord_type = this.cur_chord_full.aliases ? this.cur_chord_full.aliases[0] : null;
    //     } else {
    //       this.no_score_selected_chord.chord_tona = this.chord_tona; 
    //       // this.no_score_selected_chord.chord_type = this.chord_type; 
    //       // this.no_score_selected_chord.full_chord = this.cur_chord_full;
          
    //       this.no_score_selected_chord.full_chord = Chord.get(this.chord_tona+' '+this.chord_type);
    //       this.no_score_selected_chord.full_chord.midi_tab = [];
    //       this.no_score_selected_chord.full_chord.unfiltered_midi = [];
    //       this.light_chord({chords:[this.no_score_selected_chord.full_chord.symbol],full_chord:this.no_score_selected_chord.full_chord});
    //       }
    //   })
    // });



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
          this.zone.run(()=>{
            if(eval("this."+control_name)) eval("this."+control_name+"(\""+control_action+"\")");
          })
        }
      } else return
    })

  }



  ngAfterViewInit() {
    $("#fretboard").draggable({
      handle: "#nvxFretboard"
    });
  }

  ngOnDestroy(){ 
    this.beat_selectionUpdate$.unsubscribe();
    this.midiControlUpdate$.unsubscribe();
  }


  // allume un losange à la position string/fret.
  // Si un time est fourni, alors la fonction eteind le losange au bout du temps.
  light_los(string:number, fret:number, time:number=null){
    // console.log("lighting string, fret=>", string, ' ',fret )
    this.fb_struct[string][fret].display_los = true;
    if(time){
      setTimeout(() => {
        this.unlight_los(string,fret);
      }, time);
    }
  }

  // eteint un losange à la position string/fret.
  unlight_los(string:number, fret:number){
    this.fb_struct[string][fret].display_los = false;
  }

  // eteint tous les losanges.
  unlight_all_los(){
    for(let s of this.fb_struct){
      for(let f of s){
        f.display_los = false;
      }
    }
  }

  // allume tous les losanges.
  light_all_los(){
    for(let s of this.fb_struct){
      for(let f of s){
        f.display_los = true;
      }
    }
  }
  
  // allume un losange au hasard
  light_random_los(){
    let s = Math.floor(Math.random() * (6)) 
    let f = Math.floor(Math.random() * (25)) 
    this.light_los(s,f);
  }





  // allume un finger à la position string/fret.
  // Si autre finger est allume sur la meme string, il l eteint et allume le nouveau
  light_finger(string:number, fret:number){
    for(let i=0; i<25; i++)
      if(this.fb_struct[string][i].display_fing == true)
        this.unlight_finger(string, i);
        
    this.fb_struct[string][fret].display_fing = true;
    this.fb_struct[string][fret].display_glow = true;
  }

  // eteint un finger à la position string/fret.
  unlight_finger(string:number, fret:number){
    this.fb_struct[string][fret].display_fing = false;
    this.fb_struct[string][fret].display_glow = false;
    this.fb_struct[string][fret].display_midi = false;
  }

  unlight_finger_on_string(string:number){
    for(let f = 0; f < this.fb_struct[string].length; f++){
      this.unlight_finger(string, f);
    }
  }

  unlight_finger_on_fretboard(){
    for(let s = 0; s < 6; s++) this.unlight_finger_on_string(s);
  }

  // allume un finger au hasard
  light_random_fing(){
    let s = Math.floor(Math.random() * (6)) 
    let f = Math.floor(Math.random() * (25)) 
    this.light_finger(s,f);
  }

  // allume 6 fingers au hasard
  light_all_fing(){
    let fingers_array:Array<Array<number>> = [];

    for(let i=0; i<6; i++){
      let s = Math.floor(Math.random() * (6));
      let f = Math.floor(Math.random() * (25));
      fingers_array.push([s,f]);
    }
    // console.log(fingers_array);
    for(let i=0; i<6; i++){
      this.light_finger(fingers_array[i][0], fingers_array[i][1]);
    }
  }

  


  // allume un bubble à la position string/fret.
  // Si un time est fourni, alors la fonction eteind le bubble au bout du temps.
  light_bub(string:number, fret:number, interval:string='R',time:number=null){
    // console.log("lighting bubble, fret=>", string, ' ',fret )
    this.fb_struct[string][fret].display_bub = true;
    this.fb_struct[string][fret].bubble_img = interval+'.png';

    if(time){
      setTimeout(() => {
        this.unlight_bub(string,fret);
      }, time);
    }
  }

    // allume un bubble à la position string/fret.
  // Si un time est fourni, alors la fonction eteind le bubble au bout du temps.
  light_midi(string:number, fret:number, interval:string='R',time:number=null){
    // console.log("lighting bubble, fret=>", string, ' ',fret )
    this.fb_struct[string][fret].display_midi = true;
    this.fb_struct[string][fret].midi_img = interval+'.png';

    if(time){
      setTimeout(() => {
        this.unlight_bub(string,fret);
      }, time);
    }
  }

  // eteint un bubble à la position string/fret.
  unlight_bub(string:number, fret:number){
    this.fb_struct[string][fret].display_bub = false;
    this.fb_struct[string][fret].display_glow = false;
    this.fb_struct[string][fret].display_midi = false;
  }

  // eteint un bubble à la position string/fret.
  unlight_midi(string:number, fret:number){
    this.fb_struct[string][fret].display_midi = false;
    this.fb_struct[string][fret].display_glow = false;
  }

  // eteint tous les bubbles.
  unlight_all_bub(){
    for(let s of this.fb_struct){
      for(let f of s){
        f.display_bub = false;
        f.display_glow = false;
        f.display_midi = false;
      }
    }
  }

  // eteint tous les bubbles.
  unlight_all_midi(){

    for(let i = this.previous_midi_tab.length-1; i > -1; i--){

      // if(this.previous_midi_tab[i] == null) {
        // console.log("midi_tab of ",i,' is null')
        // this.unlight_finger_on_string(5-i);
        let f_nb = this.notes_midi[5-i].indexOf(this.previous_midi_tab[i]);
        if(f_nb < 0) return
        this.fb_struct[5-i][f_nb].display_midi = false;
        this.fb_struct[5-i][f_nb].display_glow = false;

      // }else{
        // this.unlight_finger_on_string(5-i);
      // }
    }
  }

  unlight_all_glow(){
    for(let s of this.fb_struct){
      for(let f of s){
        f.display_glow = false;
      }
    }
  }

  // allume tous les bubbles.
  light_all_bub(){
    for(let s of this.fb_struct){
      for(let f of s){
        f.display_bub = true;
      }
    }
  }




  
  // construit le fretboard.
  construct_fretboard(){
    for( let i =0; i < 6; i++)
      this.fb_struct.push( new Array(25) );

    for( let i =0; i < 6; i++){
      for(let j = 0; j < 25; j++){
        this.fb_struct[i][j] = {
          string:i, 
          fret:j, 
          bubble_img: 'R.png', 
          midi_img: 'R.png', 
          text:j, 
          display_los:false, 
          display_bub:false,
          display_midi:false,
          display_glow:false,
          display_fing:false
        };
      }
    }
  }

  // rotation des bubbles / diamonds / fingers.
  rotateAll(full_rotation:boolean=false){
    let angle;
    let transDia;
    let transFing;

    if(this.right_handed && !full_rotation){
      if(!this.rotated){
        angle = "0";
        transDia = 0;
        transFing = 10;
        $(document.getElementsByClassName('finger-diamond')).attr('style', 'transform:rotate(0deg) translate(10px 24px)' ); //yellow losanges
      } else {
        angle = "-90";
        transDia = 0;
        transFing = -23
        $(document.getElementsByClassName('finger-diamond')).attr('style', 'transform:rotate(-90deg); transform-origin:25px 0px;' );//yellow losanges
      }  
    } else if(!full_rotation){ //left handed
        if(!this.rotated){
         angle = "0";
         // transDia = -5; ******OLD - ROTATING THE GUITAR PHYSICALLY******
         // transFing = -12;
         transDia = 0;
         transFing = 23;
        } else {
          angle = "90";
          // transDia = 0; ******OLD - ROTATING THE GUITAR PHYSICALLY******
          // transFing = 23;

          transDia = 0;
          transFing = -12;
        }
    } else if(full_rotation){
      
      let is_rotated = ($('#string_0_Diamond_0').children()[1].style.transform == 'rotate(180deg)' )?true:false;
      angle = is_rotated? "0":"180";
      if(is_rotated) $(document.getElementsByClassName('finger-diamond')).attr('style', 'transform:rotate(0deg); transform-origin:15px 30px;' );//yellow losanges
      else $(document.getElementsByClassName('finger-diamond')).attr('style', 'transform:rotate(180deg); transform-origin:13px 6px;' );//yellow losanges
      // transDia = -5; ******OLD - ROTATING THE GUITAR PHYSICALLY******
      // transFing = -12;
      transDia = 0;
      transFing = 23; 
    }
    
    let is_rotated = ($('#string_0_Diamond_0').children()[1].style.transform == 'rotate(180deg)' )?true:false;

    this.yStrings.forEach((string, s) => {
      this.xStringNotes.forEach((fret, f) => {

        let bubble = $('#string_'+s+'_Bubble_'+f);
        let diamond = $('#string_'+s+'_Diamond_'+f);

        if(this.right_handed){

          // ******OLD - ROTATING THE GUITAR PHYSICALLY******
          // $(diamond.children()[1]).attr('style','transform:translate(0px,'+transDia+'px) rotateZ('+angle+'deg) rotateX(0deg);'); 
          // bubble.css('transform','rotateZ('+angle+'deg) rotateX(0deg) scale(1.2)');
          // $(document.getElementsByClassName('finger-diamond')).css('transform', 'rotateZ('+angle+'deg) rotateX(0deg) translate('+transFing+'px, 23px)');
          
          // $(diamond.children()[1]).attr('style','transform:translate(0px,'+transDia+'px) rotateZ('+angle+'deg) rotateY(0deg);'); 
          $(diamond.children()[1]).attr('style','transform:rotate('+angle+'deg);transform-origin: 45% 45%;');
          bubble.css('transform','rotateZ('+angle+'deg) rotateY(0deg) scale(1.2)');
          // $(document.getElementsByClassName('finger-diamond')).attr('style', 'transform:rotate('+angle+'deg); transform-origin:24px 0px;' );
        }
        else{

          // ******OLD - ROTATING THE GUITAR PHYSICALLY******
          // $(diamond.children()[1]).attr('style','transform:translate(0px,'+transDia+'px) rotateZ('+angle+'deg) rotateX(180deg); transform-origin:center;'); 
          // bubble.css('transform','rotateZ('+angle+'deg) rotateX(180deg) scale(1.2)');
          // $(document.getElementsByClassName('finger-diamond')).css('transform', 'rotateZ('+angle+'deg) rotateX(180deg) translate(10px,'+transFing+'px)');
          
          $(diamond.children()[1]).attr('style','transform:translate(-5px,'+transDia+'px) rotateZ('+angle+'deg) rotateY(180deg); transform-origin:center;'); 
          bubble.css('transform','rotateZ('+angle+'deg) rotateY(180deg) scale(1.2)');
          // $(document.getElementsByClassName('finger-diamond')).attr('style', 'transform:rotate(180deg); transform-origin:13px 5px;' );
        }
        

      });
    }); 
  }

  set_scale(s:any){

    if(s.empty)console.warn('set_scale() : NO SCALE FOUND !')
  
    this.active_scale = [... s.notes]; //active_scale is a copy of notes found in the new scale
    
    // ----------------Modification affichage des #/b/##/bb-------------------------------------------
    
    //Par défaut on choisis d'afficher les notes avec des bémols
    this.notes_active = [... this.notes_flat];
    
    // si dans la nouvelle gamme choisie il y a des # alors on remplace les bémols affichés sur le fretboard par des #
    for( let n of this.active_scale)
      if(n.indexOf('#')!=-1){
        this.notes_active = [... this.notes_sharp]; // Copy of this.notes_sharp
        break;
      }
      
    // Si la nouvelle gamme contient des doubles altérations, alors on remplace les textes du fretboard par ces doubles altérations.
    for( let n of this.active_scale){
      if(n.indexOf('bb')!=-1 || n=='Cb' || n == 'Fb'){
        this.notes_active = this.mu.replace_double_alterations(n,this.notes_active);
      }
    }
  
    for( let n of this.active_scale ){
      if(n.indexOf('##')!=-1 || n=='B#' || n == 'E#'){
        this.notes_active = this.mu.replace_double_alterations(n, this.notes_active);
      }
    }
  
    // -----------------------On compose les textes affichés en mode degrees--------------------------
    
    this.active_intervals = [... s.intervals];
    
    this.active_intervals = this.active_intervals.map((e)=>{
      let r =  e.replace('M','').replace('m','b').replace('P','').replace('d','b').replace('A','#')
      return this.reverse(r);
    })
    // -----------------------------------------------------------------------------------------------
  
    this.active_scale_quality = this.mu.get_scale_quality(s.type);
  
    this.cur_scale_full = s;
  }//END OF set_scale

  public scale_clicked(){
    
    this.refresh_scale();
    
    // only if in score follow mode (not in midi mode)
    if(this.score_follow) {
      // this.set_scale_caged_for_selected_measure();
      // this.send_refresh_scale();
      this.no_score_selected_scale.scale_tona = this.scale_tona; 
      this.no_score_selected_scale.scale_type = this.scale_type; 
      this.no_score_selected_scale.full_scale = this.cur_scale_full;
    } else{
      this.scale_tona = this.no_score_selected_scale.scale_tona;
      this.scale_type = this.no_score_selected_scale.scale_type;
      this.cur_scale_full = this.no_score_selected_scale.full_scale;
    }

  }

  refresh_scale(){

    let s = Scale.get(this.scale_tona+' '+this.scale_type.toLowerCase());

    this.set_scale( s );

    this.refresh_caged_position();
    

  }//END of refresh_scale

  public send_refresh_scale(){
    this.sel.updateSelection();
  }


  private set_scale_caged_for_selected_measure(){
    
    if(this.cur_selection_measure && this.cur_selection_measure.length){
      let s = {
        caged_position:[...this.caged_position],
        caged_filter:[...this.caged_filter],
        scale_tona:this.scale_tona,
        scale_type:this.scale_type,
        full_scale:this.cur_scale_full
      }
      this.cur_selection_measure[0].addScale(s);
      // console.log("adding scale =>", s, 'in measure : ',this.cur_selection_measure);
    } 
    
  }


  private set_scale_from_measure(m){

    let sc = m.getScale();
    if(!sc.full_scale.empty){
      
      if(!this.score_follow) this.no_score_selected_scale = sc;

      this.scale_tona = sc.scale_tona;
      this.scale_type = sc.scale_type;
      // this.refresh_scale();
      this.set_scale( sc.full_scale );
    }
    if(sc.caged_filter) this.caged_filter = [...sc.caged_filter];
    if(sc.caged_position) this.caged_position = [...sc.caged_position];
    // console.log("sc.caged_position =>", sc.caged_position)
  }

  
  // function to reverse a string ('abcde' ==> 'edcba')
  public reverse = s => [].reduceRight.call(s, (a, b) => a + b);

  // function used with filter to get unique values in array
  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  
  refresh_caged_position(){

    let p = [];
    if( this.caged_position.length ) 
      for(let c = 0; c < this.caged_position.length; c++) 
        p = p.concat( this.mu.getCagedPosition(this.caged_position[c],this.scale_tona,this.active_scale_quality) ).filter(this.onlyUnique);

    this.caged_filter = p;
  }
  
  set_caged_position(p){

    let idx = this.caged_position.indexOf(p);
    if(idx > -1)
      this.caged_position.splice(idx,1);
    else this.caged_position.push(p);

    this.refresh_caged_position();
    if(this.scale_follow_score) this.set_scale_caged_for_selected_measure()
  }


  public chord_clicked(){
    
    this.unlight_all_bub(); 
    
    // this.refresh_scale();
    
    // only if in score follow mode (not in midi mode)
    if(this.chord_follow_score) {
      this.set_scale_caged_for_selected_measure();
      this.send_refresh_scale();
    } else{
      
      this.no_score_selected_chord.chord_tona = this.chord_tona; 
      this.no_score_selected_chord.chord_type = this.chord_type; 
      this.no_score_selected_chord.full_chord = Chord.get(this.chord_tona+" "+this.chord_type);
      this.no_score_selected_chord.full_chord.midi_tab = [];
      this.no_score_selected_chord.full_chord.unfiltered_midi = [];
      this.light_chord({chords:[this.no_score_selected_chord.full_chord.symbol],full_chord:this.no_score_selected_chord.full_chord});
    }

  }

  public light_chord(chord){

    if(!chord)return
      // }
      // if( !chord.full_chord )return
      
      try{
        
        // if(!chord.chords.length)return;
        this._chordName = chord.chords[0];

      // console.log("Fretboard 'chord' =>", chord)

      // let midi_tab = chord.full_chord.midi_notes;
      let midi_tab = chord.full_chord.unfiltered_midi;

      // REMOVE ALL LIGHTS
      if(midi_tab.length == 0){
        if(this.score_follow && this.activeBubbles && this.chord_follow_score) this.light_chord_from_selected_measure();
        else if(!this.chord_follow_score)this.light_tonaljs_chord(chord.full_chord);
        // this.unlight_all_bub();
        this._chordName = '';
        this.unlight_finger_on_fretboard();
        this.lit_chord = null;
      } 

      if(midi_tab.length > 6 ){
        console.warn('Guitar midi array > 6 ! Cutting some notes');
        midi_tab = midi_tab.slice(0,6);
      }
      
      // LIGHT/UNLIGHT NOTES
      for(let i = midi_tab.length-1; i > -1; i--){

        if(midi_tab[i] == null) {
          // console.log("midi_tab of ",i,' is null')
          this.unlight_finger_on_string(5-i);

        }else{

          let f = this.notes_midi[5-i].indexOf(midi_tab[i]);
          
          if(f == -1){
            console.warn("%cWARING : ",'color:red','note',midi_tab[i],' not found on string : ', 5-i)
            continue;
          }
          let int = chord.full_chord.intervals[chord.full_chord.midi_notes.indexOf(chord.full_chord.unfiltered_midi[i])];
          if(this.activeBubbles && this.score_follow != true)this.light_midi(5-i, f,int);
          this.light_finger(5-i, f);
          // this.light_los(5-i, f);
        }
      }
      this.previous_midi_tab = midi_tab;


    }catch(e){
      debugger
    }
  }


  public toggle_midi(e){
    
    if(e.target)
      if(e.target.id == 'toggle_midi_off' ){
        this.score_follow = true;
      } else if(e.target.id == 'toggle_midi_on' ){
        this.score_follow = false;
      }else{
        this.score_follow = 'both';
      }

    
    if(this.score_follow == true){ 
      // this.light_chord(this.lit_chord);
      this.chord_tona = '';
      this.chord_type = '';
      this.transport.refreshBeat();
      // this.set_scale( this.no_score_selected_scale.full_scale );
      // console.log("this.lit_chord =>", this.lit_chord)
    }else{

      if(this.score_follow == false) this.unlight_all_bub(); 
      this.transport.refreshBeat();
      
      let m = this.sel.getSelection()[0];
      if(!m || m.getType() == 'part'){ return; }
      this.set_scale_from_measure(m);
      this.light_chord_from_selected_measure();
      this.light_chord(this.lit_chord);
      this.refresh_caged_position();
    }
  }

  public toggle_scale_follow_score(){

    if(!this.scale_follow_score ){ 
      this.scale_tona = this.no_score_selected_scale.scale_tona;
      this.scale_type = this.no_score_selected_scale.scale_type;
      this.set_scale( this.no_score_selected_scale.full_scale );
    }else{
      let m = this.sel.getSelection()[0];
      if(!m || m.getType() == 'part'){ return; }
      this.set_scale_from_measure(m);
      // this.light_chord_from_selected_measure();
      // this.light_chord(this.lit_chord);
      this.refresh_caged_position();
    }
  }

  public toggle_chord_follow_score(){

    this.unlight_all_bub(); 

    if(!this.chord_follow_score ){ 
      // this.light_chord(this.lit_chord);
      this.chord_tona = this.no_score_selected_chord.chord_tona ; 
      this.chord_type = this.no_score_selected_chord.chord_type ; 
      
      this.no_score_selected_chord.full_chord = Chord.get(this.chord_tona+' '+this.chord_type);
      this.no_score_selected_chord.full_chord.midi_tab = [];
      this.no_score_selected_chord.full_chord.unfiltered_midi = [];
      this.light_chord({chords:[this.no_score_selected_chord.full_chord.symbol],full_chord:this.no_score_selected_chord.full_chord});
      
      // console.log("this.lit_chord =>", this.lit_chord)
    }else{
      this.light_chord_from_selected_measure();
      this.light_chord(this.lit_chord);
      this.chord_tona = this.cur_chord_full.tonic;
      this.chord_type = this.cur_chord_full.type;
      this.refresh_caged_position();
    }
  }

  public light_chord_from_selected_measure(){
    
    this.unlight_finger_on_fretboard();
    
    // let data = this.sel.getSelection();
    let data = this.cur_selection_measure;
    if(!data)return;

    let m = data[0];
      
    if(!m){
      // debugger
      return;
    }
      
    this.zone.run(()=>{
      this.light_chord_from_measure(m);
    })
  }

  public light_chord_from_measure( measure, beat?:number ){

    this.unlight_all_bub();

    let chord = null;
    
    // If the measure has no chord, return
    if(!measure.chords.replace(/\s/g, '').length)return;

    let chords = measure.chords.split(' ');
    if(chords.length) {
      if(beat!=undefined){

        if(beat<chords.length){

          chord=chords[beat].split('/')[0];

        }else{ 
          chord = '';
        }

      }else{
        
        chord = chords[0].split('/')[0];
      }

    }
    this._chordName = (chord!='')?chord:this._chordName;

    let c;
    if(this._chordName) c = Chord.get(this._chordName);
    if(c==undefined)return
    this.cur_chord_full = c;
    this.zone.run(()=>{
      this.light_tonaljs_chord(c);
    })

  }

  public light_tonaljs_chord(c){


    let notes = c.notes
    let full_notes = [];
    for(let i = 2; i < 7; i++){
      full_notes = full_notes.concat( notes.map((e)=>{return e+i.toString()}) );
    }

    full_notes = full_notes.map(Note.midi);

    let detected_chord = this.cd.detectMidi_as_chord(full_notes);

    let midi_notes = (detected_chord.full_chord as any).midi_notes;
    
    for(let i = 0; i < midi_notes.length; i++){
      for(let s = 0; s < 6; s++){
        let fret = this.notes_midi[s].indexOf( midi_notes[i]);
        if(  fret > -1 ) this.light_bub(s, fret, detected_chord.full_chord.intervals[i],null)
        
      }

    }

    this.chord_tona = c.tonic;
    this.chord_type = c.type;
  }

  public change_animation_time( measure ){ // for ANIMATION #2
    let p = this.sm.getMeasures_hash()[measure.getIdx()].part;
    let meter = this.sm.getPart(p).getMeter();
    let m = Number(meter.split('/')[0]);
    this.animationTime = (measure.getAudioRegion().end - measure.getAudioRegion().start)/m;
  }

  public onChange(newValue) {
    this.selected_anim = newValue;
  }

  public onBgChange(newValue) {
    this.selected_bg = newValue;
  }

  // ===============================TESTS DOUBLE ANIM !==============================

  // public start_finger_anim(){
  //   this.stop_finger_anim();
  //   this.t0 = performance.now();
  //   this.animationFrame = window.requestAnimationFrame(this.animate.bind(this));
  // }

  // public stop_finger_anim(){
  //   window.cancelAnimationFrame(this.animationFrame);
  //   if($(document.getElementById('pulse')).hasClass('p-fever'))
  //     $(document.getElementById('pulse')).removeClass('p-fever');
  //     this.selected_anim = "Misty";
  // }

  // private animate(){
  //   let delta = performance.now()-this.t0;
  //   if(delta > 500 && (this.selected_anim=='Misty' || this.selected_anim=='Summertime')){
  //     this.zone.run(()=>{
  //       this.selected_anim = "Fever";
  //       $("#pulse").addClass("p-misty");
  //     });
  //   }

  //   this.animationFrame = window.requestAnimationFrame(this.animate.bind(this));
  // }


  private set_fretboard_scale(scale){
    this.scale_type = scale.toLowerCase();
    if(this.scale_type == 'minor')this.scale_type = 'aeolian';
    this.scale_clicked();
  }

  private set_fretboard_key(tona){
    this.scale_tona = tona;
    this.scale_clicked();
  }

  private set_fretboard_caged(pos){
    this.set_caged_position(pos)
  }

  private set_fretboard_caged_all_off(){
    
    this.caged_position = [];
    this.refresh_caged_position();
    this.set_scale_caged_for_selected_measure()
  }

  public toggle_fretboard_display_mode(){
    
    // this.displayNotesMode=
  }

  private toggle_fretboard_chordtones(onoff){
    this.activeBubbles = !this.activeBubbles;
  }

  private toggle_fretboard_losanges(onoff){
    this.activeLosanges = !this.activeLosanges;
  }

  private toggle_fretboard_score_follow(onoff){
    if(this.score_follow == false) this.score_follow = 'both';
    else if(this.score_follow == 'both')this.score_follow = true;
    else this.score_follow = false;
    
    console.log("this.score_follow =>", this.score_follow)
    this.toggle_midi(this.score_follow);
  }

  private toggle_fretboard_rotate(onoff){
    this.rotated = !this.rotated;
    this.rotateAll();
  }

  private toggle_fretboard_rotate_180(onoff){
    // this.rotated = !this.rotated;
    this.rotateAll(true);
  }

  private toggle_fretboard_string(stringNb){
    if(stringNb>0 && stringNb < 7) this.activeStrings[stringNb-1] = !this.activeStrings[stringNb-1];
  }

  public toggle_hand(){
    this.right_handed = !this.right_handed;
    this.rotate_hands();
  }

  private rotate_hands(){
    if(!this.right_handed){
      $('#fret-grid').css('transform', 'rotateY(180deg)');
      $(document.getElementsByClassName('bg-text')).css({'transform' : 'rotateY(180deg)','transform-origin' : 'center', 'transform-box' : 'fill-box'});
      
      if(!this.rotated){
        $(document.getElementsByClassName('bubble')).css('transform', 'rotateY(180deg) scale(1.2)');
        $(document.getElementsByClassName('chords_notes_labels fret')).css({'transform' : 'rotateY(180deg) translate(5px, 0px)','transform-origin' : 'center'});
        $(document.getElementsByClassName('finger-diamond')).css('transform', 'rotateY(180deg) translate(-24px, 23px)');
      }
      else{
        $(document.getElementsByClassName('bubble')).css('transform', 'rotateZ(90deg) rotateY(180deg) scale(1.2)');
        $(document.getElementsByClassName('chords_notes_labels fret')).css({'transform' : 'rotateZ(90deg) rotateY(180deg) translate(5px, 5px)','transform-origin' : 'center'});
        $(document.getElementsByClassName('finger-diamond')).css('transform', 'rotateZ(90deg) rotateY(180deg) translate(-23px, -12px)');
      }
    } 
    else{
      $('#fret-grid').css('transform', 'rotateY(0deg)');
      $(document.getElementsByClassName('bg-text')).css({'transform' : 'rotateY(0deg)','transform-origin' : 'center', 'transform-box' : 'fill-box'});

      if(!this.rotated){
        $(document.getElementsByClassName('bubble')).css('transform', 'rotateY(0deg) scale(1.2)');
        $(document.getElementsByClassName('chords_notes_labels fret')).css({'transform' : 'rotateY(0deg)','transform-origin' : 'center'});
        $(document.getElementsByClassName('finger-diamond')).css('transform', 'rotateY(0deg) translate(10px, 23px)');
      }
      else{
        $(document.getElementsByClassName('bubble')).css('transform', 'rotateZ(-90deg) rotateY(0deg) scale(1.2)');
        $(document.getElementsByClassName('chords_notes_labels fret')).css({'transform' : 'rotateZ(-90deg) rotateY(0deg) translate(5px, 0px)','transform-origin' : 'center'});
        $(document.getElementsByClassName('finger-diamond')).css('transform', 'rotateZ(-90deg) rotateY(0deg) translate(-23px, 22px)');
      }
    }
  }

  //************************************************************************************//
  //******OLD!!!****** ROTATE HANDS BY ROTATING THE GUITAR PHYSICALLY ******************//
  //************************************************************************************//
  // private rotate_hands_old(){
  //   if(!this.right_handed){
  //     $('#fret-grid').css('transform', 'rotateX(180deg)');
  //     $(document.getElementsByClassName('stringToggle')).css({'transform' : 'rotate(180deg)','transform-origin' : 'center', 'transform-box' : 'fill-box'});
  //     $(document.getElementsByClassName('bg-text')).css({'transform' : 'rotateX(180deg)','transform-origin' : 'center', 'transform-box' : 'fill-box'});
      
  //     if(!this.rotated){
  //       $(document.getElementsByClassName('bubble')).css('transform', 'rotateX(180deg) scale(1.2)');
  //       $(document.getElementsByClassName('chords_notes_labels fret')).css({'transform' : 'rotateX(180deg) translate(0px, 5px)','transform-origin' : 'center'});
  //       $(document.getElementsByClassName('finger-diamond')).css('transform', 'rotateX(180deg) translate(10px, -12px)');
  //     }
  //     else{
  //       $(document.getElementsByClassName('bubble')).css('transform', 'rotateZ(90deg) rotateX(180deg) scale(1.2)');
  //       $(document.getElementsByClassName('chords_notes_labels fret')).css({'transform' : 'rotateZ(90deg) rotateX(180deg) translate(0px, 0px)','transform-origin' : 'center'});
  //       $(document.getElementsByClassName('finger-diamond')).css('transform', 'rotateZ(90deg) rotateX(180deg) translate(10px, 22px)');
  //     }
  //   } 
  //   else{
  //     $('#fret-grid').css('transform', 'rotateX(0deg)');
  //     $(document.getElementsByClassName('stringToggle')).css({'transform' : 'rotate(0deg)','transform-origin' : 'center', 'transform-box' : 'fill-box'});
  //     $(document.getElementsByClassName('bg-text')).css({'transform' : 'rotateX(0deg)','transform-origin' : 'center', 'transform-box' : 'fill-box'});

  //     if(!this.rotated){
  //       $(document.getElementsByClassName('bubble')).css('transform', 'rotateX(0deg) scale(1.2)');
  //       $(document.getElementsByClassName('chords_notes_labels fret')).css({'transform' : 'rotateX(0deg)','transform-origin' : 'center'});
  //       $(document.getElementsByClassName('finger-diamond')).css('transform', 'rotateX(0deg) translate(10px, 22px)');
  //     }
  //     else{
  //       $(document.getElementsByClassName('bubble')).css('transform', 'rotateZ(-90deg) rotateX(0deg) scale(1.2)');
  //       $(document.getElementsByClassName('chords_notes_labels fret')).css({'transform' : 'rotateZ(-90deg) rotateX(0deg) translate(5px, 0px)','transform-origin' : 'center'});
  //       $(document.getElementsByClassName('finger-diamond')).css('transform', 'rotateZ(-90deg) rotateX(0deg) translate(-24px, 22px)');
  //     }
  //   }
  // }
  //************************************************************************************//
  //************************************************************************************//
  //************************************************************************************//


  public close_fretboard(toggle:boolean=false){
    if(toggle)
      this.visible = !this.visible;
    else this.visible = false;
      this.displayChange.emit(this.visible);
  }
}//end of class



@Component({
    selector: '[fretboard-diamond]',
    styleUrls: ['./fretboard.component.scss'],
    template: `<svg:path d="M 0.20267886,17.651493 17.802677,0.05149334 35.402678,17.651493 17.802677,35.251499 Z" /><svg:text x="45%" y="60%" class="chords_notes_labels fret">{{text}}</svg:text>`,
    standalone: false
})

export class FretboardDiamondComponent {
  @Input() x: number = 0;
  @Input() y: number = 0;
  @Input() text: string = '';
}