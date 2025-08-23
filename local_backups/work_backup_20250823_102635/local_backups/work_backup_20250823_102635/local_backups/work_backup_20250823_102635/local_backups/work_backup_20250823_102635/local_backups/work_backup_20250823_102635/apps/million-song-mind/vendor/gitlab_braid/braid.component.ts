import { Component, OnInit, Input, NgZone } from '@angular/core';
import { SelectionModel } from '@models/selectionmodel/selectionmodel';
import { CurTonalityModel } from '@models/songmodel/cur-tonality-model';
import { Songmodel } from '@models/songmodel/songmodel';
import Tonalites 		from '@assets/braid_tonalities.json';

import { ConfigModel } from '@models/configmodel/configModel';

import { Subscription } from 'rxjs/Subscription';

import Font_chords_eq from '@assets/font_chords_eq.json';
import { chordType } from '@tonaljs/chord-type';
import { Note } from "@tonaljs/tonal";
import { chord } from '@tonaljs/chord';
import { Key } from '@tonaljs/tonal';

declare var $: any;

@Component({
  selector: 'app-braid',
  templateUrl: './braid.component.html',
  styleUrls: ['./braid.component.scss']
})
export class BraidComponent implements OnInit {

  public _chord:Array<string> = [];
  public _midi_chord:Array<string> = [];
  public tonic:Array<string> = [];
  public displayed_chord: string = '';
  public cur_score_chord: string = '';

  private maj_chords = ['M','maj7','5','maj9','maj11','maj13'];
  private min_chords = ['m','m7','m#5','m/ma7', 'm6', 'm9'];
  private half_dim_chords = ['m7b5'];
  private b7_chords = ['7','9','11','13'];
  private mbb7bb3 = ['m6/9'];
  private bb7bb3b5 = ['german'];
  private b7b5 = ['7b5'];
  private dim_chords = ['dim7','dim'];

  private score_follow:boolean = true;
  public display_as_roman:boolean = false;

  public tonality_focused:string='';
  // public display_lock_on_tonality:boolean=true;

  public chords_in_score:Array<string> = [];
  public braidType:string;
  

  // watcher of the input "chord" : 
  @Input() set cur_chord(valeur: Array<any>) {
    // if(this.score_follow) return
    
    this.change_midi_chord(valeur);
    console.log("midi_chord ",valeur)
  }

  @Input() set chordsInScore(valeur: Array<any>) {
    this.find_chords_in_score(valeur);
  }

  @Input() set braidModel(valeur: string) {
    this.braidType=valeur;
  }

  @Input() set is_roman(valeur: boolean) {
    console.log("roman display ",valeur)
    this.switch_to_roman(valeur);
  }

  private selectionUpdate$:Subscription;
  private curTonality$:Subscription;

  public chord_type_notes = {
    fifth_left:{up:'b7b5',down:'obb3bb7'},
    left:{up:'b7',down:'mb7b5'},
    center:{up:'b7',left:'', right:'m'},
    right:{up:'b7',down:'o'},
    fifth_right:{up:'b7b5',down:'obb3bb7'},
  }

  public chord_type_roman = {
    fifth_left:{up:'b7b5',down:'obb3bb7'},
    left:{up:'b7',down:'mb7b5'},
    center:{up:'b7',left:'', right:'m'},
    right:{up:'b7',down:'o'},
    fifth_right:{up:'b7b5',down:'obb3bb7'},
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
  
  public fifth_left_up_roman = ([... Tonalites["roman"].outer_left_up] as any).rotate(-3);
  public fifth_left_down_roman = ([... Tonalites["roman"].outer_left_down] as any).rotate(-3);
  public left_up_roman = ([... Tonalites["roman"].left_up] as any).rotate(-3)
  public left_down_roman = ([... Tonalites["roman"].left_down] as any).rotate(-3)
  
  public center_up_roman = Tonalites["roman"].center_major;
  public center_left_roman = [...Tonalites["roman"].center_major] 
  public center_right_roman = ([...Tonalites["roman"].center_minor_tonal] as any).rotate(-3);

  public right_up_roman = ([... Tonalites["roman"].right_up] as any).rotate(-3);
  public right_down_roman = ([... Tonalites["roman"].right_down] as any).rotate(-3);
  public fifth_right_up_roman = ([... Tonalites["roman"].outer_right_up] as any).rotate(-3);
  public fifth_right_down_roman = ([... Tonalites["roman"].outer_right_down] as any).rotate(-3);

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


  constructor(private sel:SelectionModel, private zone:NgZone, public cm:ConfigModel, private curTonality:CurTonalityModel, private sm:Songmodel) {

    this.selectionUpdate$ = this.sel.selected_Update$.subscribe(data=>{

      this.zone.run(()=>{
        this.lightSelectedChord(data);
      })
      
    });

    this.curTonality$ = this.curTonality.current_tonality$.subscribe((data)=>{ 

      let need_update; 
      if(data.is_locked_to_score == true){
        need_update = !(data.score_tonality == this.tonality_focused);
        this.tonality_focused = data.score_tonality;
        this.score_follow = true;
        this.rotate_arrays_for_tona(data.score_tonality);
      } else {
        need_update = !(data.tonality == this.tonality_focused);
        this.tonality_focused = data.tonality;
        this.score_follow =false;
        this.rotate_arrays_for_tona(data.tonality);
      }
      
      if(need_update) this.focus_tonality(this.tonality_focused);
      this.lightSelectedChord();

    });
  }
  

  ngOnInit(): void { 

  }

  ngOnDestroy():void{
    this.curTonality$.unsubscribe();
    this.selectionUpdate$.unsubscribe();
  }

  private lightSelectedChord(data=undefined){
    let m;
    if(data) m = data[0];
    else m = this.sel.getSelection()[0]

    if(!m || m.getType() == 'part'){ return; }
      
    let c = m.getChordsLine().split(' ')[0]

    if(!c) return;
    this.cur_score_chord = c;
    this.change_score_chord(this.cur_score_chord);
  }

  public hoverMe(e){
    $(e.currentTarget).addClass('zoom');
  }

  public showMe(e){
    let zoomedText = $(e.currentTarget).text();
    let divZone =  $('#zoomed');
    let spanZone = divZone.children();

    spanZone.text(zoomedText);

    divZone.stop(false, true).fadeIn(0, function() {
      divZone.addClass('zoom');
    });

    divZone.stop(false, true).fadeOut(5000, function() {
      divZone.removeClass('zoom');
    });
  }

  public hoverMeNot(e){
    $(e.currentTarget).removeClass('zoom');
  }

  public unlight_score(){
    this._chord = [];
  }

  public unlight_midi(){
    this._midi_chord = [];
  }
   

  public light_score(tonic, chordType){
    console.log('lighting : tonic ',tonic, ' chordType : ',chordType);

    this._chord.push((tonic+','+chordType))
    
    let enharm = Note.enharmonic(tonic);
    console.log("enharm =>", enharm)
    if(enharm != tonic) this._chord.push(enharm+','+chordType);

    if(tonic == 'B'){
      let other_tonic = 'Cb'
      let other_chordType = chordType;
      this._chord.push(other_tonic+','+other_chordType);

    }else if(tonic == 'E'){
      let other_tonic = 'Fb'
      let other_chordType = chordType;
      this._chord.push(other_tonic+','+other_chordType);

    }else if(tonic == 'F'){
      let other_tonic = 'E#'
      let other_chordType = chordType;
      this._chord.push(other_tonic+','+other_chordType);
    }


    if(chordType == 'obb3bb7'){
      let other_tonic = Note.transpose(tonic,'2M');
      let other_chordType = '7';
      this._chord.push(other_tonic+','+other_chordType);
    }

    // console.log("this._chord",this._chord)  
  }

  public light_midi(tonic, chordType){
    console.log('lighting midi: tonic ',tonic, ' chordType : ',chordType);

    this._midi_chord.push((tonic+','+chordType))
    
    let enharm = Note.enharmonic(tonic);
    console.log("enharm =>", enharm)
    if(enharm != tonic) this._midi_chord.push(enharm+','+chordType);

    if(tonic == 'B'){
      let other_tonic = 'Cb'
      let other_chordType = chordType;
      this._midi_chord.push(other_tonic+','+other_chordType);

    }else if(tonic == 'E'){
      let other_tonic = 'Fb'
      let other_chordType = chordType;
      this._midi_chord.push(other_tonic+','+other_chordType);

    }else if(tonic == 'F'){
      let other_tonic = 'E#'
      let other_chordType = chordType;
      this._midi_chord.push(other_tonic+','+other_chordType);
    }


    if(chordType == 'obb3bb7'){
      let other_tonic = Note.transpose(tonic,'2M');
      let other_chordType = '7';
      this._midi_chord.push(other_tonic+','+other_chordType);
    }

    // console.log("this._chord",this._chord)  
  }

  public focusBubble( posObj:any ){
    let idx = posObj.idx;
    let col = posObj.col;

    
    if(col == 'center_right'){

      setTimeout(()=>{
        ($('#center_bubble_right_'+idx)[0] as any).scrollIntoView({ behavior:'smooth',block: 'center' })
      },1)

    }else if(col=='center_left'){
      
      setTimeout(()=>{
        ($('#center_bubble_left_'+idx)[0] as any).scrollIntoView({ behavior:'smooth',block: 'center' });
      },1)
    }
  }

  // Converts chords notation example
  public change_score_chord(c:string):void{
    let regex = /([A-G][b#]{0,2})(.*)/;
    let n = c.match(regex);
    if(n==null)return;
    let tonic = n[1];
    let cur_chord_type = n[2];
    let chordType = '';
    if(this.maj_chords.indexOf(cur_chord_type) != -1){

      chordType = '';

    } else if(this.min_chords.indexOf(cur_chord_type) != -1){

      chordType = 'm';

    } else if(this.half_dim_chords.indexOf(cur_chord_type) != -1){

      chordType = 'mb7b5';

    } else if(this.b7_chords.indexOf(cur_chord_type) != -1){

      chordType = 'b7';

    } else if(this.mbb7bb3.indexOf(cur_chord_type) != -1){

      chordType = 'mbb7bb3';

    } else if(this.bb7bb3b5.indexOf(cur_chord_type) != -1){

      chordType = 'obb3bb7';

    } else if(this.b7b5.indexOf(cur_chord_type) != -1){

      chordType = 'b7b5';

    } else if(this.dim_chords.indexOf(cur_chord_type) != -1){

      chordType = 'o';

    } 

    this.unlight_score();
    this.light_score( tonic , chordType);
  }
  
  public change_midi_chord(valeur: Array<any>):void{

    if(!valeur['chords'].length || valeur['full_chord'].empty){
      this.displayed_chord = ' ';
      this.unlight_midi();
      return;
    } 

    let cur_chord_type = valeur['full_chord'].aliases[0];
    this.displayed_chord = valeur['chords'][0];
    
    console.log(cur_chord_type);

    let tonic = valeur['full_chord'].tonic.replace(/[0-9]$/,'');

    let chordType = '';
    let idx_pos = {idx:-1,col:''};

    if(this.maj_chords.indexOf(cur_chord_type) != -1){

      chordType = '';

    } else if(this.min_chords.indexOf(cur_chord_type) != -1){

      chordType = 'm';

    } else if(this.half_dim_chords.indexOf(cur_chord_type) != -1){

      chordType = 'mb7b5';

    } else if(this.b7_chords.indexOf(cur_chord_type) != -1){

      chordType = 'b7';

    } else if(this.mbb7bb3.indexOf(cur_chord_type) != -1){

      chordType = 'mbb7bb3';

    } else if(this.bb7bb3b5.indexOf(cur_chord_type) != -1){

      chordType = 'obb3bb7';

    } else if(this.b7b5.indexOf(cur_chord_type) != -1){

      chordType = 'b7b5';

    } else if(this.dim_chords.indexOf(cur_chord_type) != -1){

      chordType = 'o';

    } 

    this.unlight_midi();
    this.light_midi( tonic , chordType);
  }

  public focus_tonality(tona){

    console.log("%cscore Follow: ","font-size:20px", this.score_follow, 'tona :',tona)
    if(!tona)return;

    let idx_pos; 
    if(tona.endsWith('m')) idx_pos = {idx:this.center_right.indexOf(tona.slice(0,-1)),col:'center_right'};
    else idx_pos = {idx:this.center_left.indexOf(tona),col:'center_left'};
    
    this.focusBubble( idx_pos );

  }

  public switch_to_roman(valeur):void{
    var num:number;
    if(this.braidType != 'blues') num=3;
    else num=6;

    this.display_as_roman = valeur;

    if(!valeur){
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
    }else{
      if(this.tonality_focused.endsWith('m')){

        this.fifth_left_up_in_use = ([... this.fifth_left_up_roman ] as any).rotate(num);
        this.fifth_left_down_in_use = ([... this.fifth_left_down_roman ] as any).rotate(num);
        this.left_up_in_use = ([... this.left_up_roman ] as any).rotate(num);
        this.left_down_in_use = ([... this.left_down_roman ] as any).rotate(num);
        this.center_up_in_use = ([... this.center_up_roman ] as any).rotate(num);
        this.center_right_in_use = ([... this.center_right_roman ] as any).rotate(num);
        this.center_left_in_use = ([... this.center_left_roman ] as any).rotate(num);
        this.right_up_in_use = ([... this.right_up_roman ] as any).rotate(num);
        this.right_down_in_use = ([... this.right_down_roman ] as any).rotate(num);
        this.fifth_right_up_in_use = ([... this.fifth_right_up_roman ] as any).rotate(num);
        this.fifth_right_down_in_use = ([... this.fifth_right_down_roman ] as any).rotate(num);

        this.chord_type = this.chord_type_roman 
      }else{
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



  private rotate_arrays_for_tona(tona:string):void{
    
    if(!tona)return;

    if( tona.endsWith('m') ){
      tona = tona.slice(0,-1);
      tona = Key.minorKey(tona).relativeMajor;
    }

    this.fifth_left_up = this.braidType!='blues' ? Tonalites[tona].outer_left_up : ([...Tonalites[tona].outer_left_up] as any).rotate(3);
    this.fifth_left_down = this.braidType!='blues' ? Tonalites[tona].outer_left_down : ([...Tonalites[tona].outer_left_down] as any).rotate(3);
    this.left_up = this.braidType!='blues' ? Tonalites[tona].left_up : ([...Tonalites[tona].left_up] as any).rotate(3);
    this.left_down = this.braidType!='blues' ? Tonalites[tona].left_down : ([...Tonalites[tona].left_down] as any).rotate(3);
    
    this.center_up = this.braidType!='blues' ? Tonalites[tona].center_minor : ([... Tonalites[tona].center_major] as any);
    this.center_left = this.braidType!='blues' ? Tonalites[tona].center_major : ([... Tonalites[tona].center_major] as any).rotate(3);
    this.center_right = this.braidType!='blues' ? Tonalites[tona].center_minor : ([... Tonalites[tona].center_major] as any);

    
    this.right_up = this.braidType!='blues' ? Tonalites[tona].right_up : ([... Tonalites[tona].right_up] as any).rotate(3);
    this.right_down = this.braidType!='blues' ? Tonalites[tona].right_down : ([... Tonalites[tona].right_down] as any).rotate(3);
    this.fifth_right_up = this.braidType!='blues' ? Tonalites[tona].outer_right_up : ([... Tonalites[tona].outer_right_up] as any).rotate(3);
    this.fifth_right_down = this.braidType!='blues' ? Tonalites[tona].outer_right_down : ([... Tonalites[tona].outer_right_down] as any).rotate(3);

    

    this.switch_to_roman(this.display_as_roman);
  }

  private debug_rotate_jsons():void{
    return
    let ton = Tonalites;
    console.log(ton);

    // Tonalites['roman'].left_up.rotate(3);
    // Tonalites['roman'].left_down.rotate(3);
    // Tonalites['roman'].outer_left_up.rotate(3);
    // Tonalites['roman'].outer_left_down.rotate(3);

    // Tonalites['roman'].right_up.rotate(3);
    // Tonalites['roman'].right_down.rotate(3);
    // Tonalites['roman'].outer_right_up.rotate(3);
    // Tonalites['roman'].outer_right_down.rotate(3);
        
    console.log(JSON.stringify(Tonalites))

    // debugger
  }

  public svg_loaded():void{
    // console.log("%cscore Follow: ","font-size:20px", this.score_follow, 'tonality_focused :',this.tonality_focused)
    if(this.score_follow) this.focus_tonality(this.tonality_focused);
  }

  public find_chords_in_score(chords:any):void{
    if(!chords) return;
    this.chords_in_score = [];
    for(let i=0; i<chords.length; i++){
      // this.change_score_chord(chords[i], true);

      let regex = /([A-G][b#]{0,2})(.*)/;
      let n = chords[i].match(regex);
      if(n==null)return;
      let tonic = n[1];
      let cur_chord_type = n[2];
      let chordType = '';

      if(this.maj_chords.indexOf(cur_chord_type) != -1)chordType = '';
      else if(this.min_chords.indexOf(cur_chord_type) != -1)chordType = 'm';
      else if(this.half_dim_chords.indexOf(cur_chord_type) != -1)chordType = 'mb7b5';
      else if(this.b7_chords.indexOf(cur_chord_type) != -1)chordType = 'b7';
      else if(this.mbb7bb3.indexOf(cur_chord_type) != -1)chordType = 'mbb7bb3';
      else if(this.bb7bb3b5.indexOf(cur_chord_type) != -1)chordType = 'obb3bb7';
      else if(this.b7b5.indexOf(cur_chord_type) != -1)chordType = 'b7b5';
      else if(this.dim_chords.indexOf(cur_chord_type) != -1)chordType = 'o';

      this.chords_in_score.push((tonic+','+chordType))
      
      let enharm = Note.enharmonic(tonic);

      if(enharm != tonic) this.chords_in_score.push(enharm+','+chordType);

      if(tonic == 'B'){
        let other_tonic = 'Cb'
        let other_chordType = chordType;
        this.chords_in_score.push(other_tonic+','+other_chordType);
      }else if(tonic == 'E'){
        let other_tonic = 'Fb'
        let other_chordType = chordType;
        this.chords_in_score.push(other_tonic+','+other_chordType);
      }else if(tonic == 'F'){
        let other_tonic = 'E#'
        let other_chordType = chordType;
        this.chords_in_score.push(other_tonic+','+other_chordType);
      }

      if(chordType == 'obb3bb7'){
        let other_tonic = Note.transpose(tonic,'2M');
        let other_chordType = '7';
        this.chords_in_score.push(other_tonic+','+other_chordType);
      }  
      
    } 
    // debugger
    console.log('chords_in_score--- ',this.chords_in_score);
  }

  public get_bubble_class(name, type, arg1:string='medBubble', arg2:string=''){

    let c = arg1+' '+arg2+' ';
    let is_in_chord = this._chord.indexOf(name+','+type) != -1;
    let is_in_score = this.chords_in_score.indexOf(name+','+type) != -1;
    let is_in_midi = this._midi_chord .indexOf(name+','+type) != -1

    if(this.cm.isMidi_highlight_visible()){

      if(is_in_chord && is_in_midi){
        c+= "midi_active_green "
      }else if( is_in_chord && this.cm.isScore_highlight_visible()){
        c += "active ";
      }else if( is_in_midi ){
        c += "midi_active ";
      }
    }else if( is_in_chord  && this.cm.isScore_highlight_visible()){
        c += "active ";
    }


    if(is_in_score && this.cm.emphasis_chords){
      c += "erasenot";
      
    }else if(!is_in_score && this.cm.emphasis_chords){
      c += "erase";
    }
    return c;
  }

  public get_arrow_class(name1, type1, name2, type2, secondname1, secondtype1, secondname2, secondtype2, secondname3:string='', secondtype3:string='', name3:string='', type3:string='' ){

    let c = '';
    var is_in_chord:boolean;
    var is_in_midi:boolean;
    var is_in_chord_secondary:boolean;
    var is_in_midi_secondary :boolean;

    if(name3=='' && type3==''){
      var is_in_chord = this._chord.indexOf(name1+','+type1) != -1 || this._chord.indexOf(name2+','+type2) != -1;
      var is_in_midi = this._midi_chord.indexOf(name1+','+type1) != -1 || this._midi_chord.indexOf(name2+','+type2) != -1;
    }
    else{
      var is_in_chord = this._chord.indexOf(name1+','+type1) != -1 || this._chord.indexOf(name2+','+type2) != -1 || this._chord.indexOf(name3+','+type3) != -1;
      var is_in_midi = this._midi_chord.indexOf(name1+','+type1) != -1 || this._midi_chord.indexOf(name2+','+type2) != -1 || this._midi_chord.indexOf(name3+','+type3) != -1;
    }

    if(secondname3=='' && secondtype3==''){
      is_in_chord_secondary = this._chord.indexOf(secondname1+','+secondtype1) != -1 || this._chord.indexOf(secondname2+','+secondtype2) != -1;
      is_in_midi_secondary = this._midi_chord.indexOf(secondname1+','+secondtype1) != -1 || this._midi_chord.indexOf(secondname2+','+secondtype2) != -1;
    }
    else{
      is_in_chord_secondary = this._chord.indexOf(secondname1+','+secondtype1) != -1 || this._chord.indexOf(secondname2+','+secondtype2) != -1 || this._chord.indexOf(secondname3+','+secondtype3) != -1;
      is_in_midi_secondary = this._midi_chord.indexOf(secondname1+','+secondtype1) != -1 || this._midi_chord.indexOf(secondname2+','+secondtype2) != -1 || this._midi_chord.indexOf(secondname3+','+secondtype3) != -1;
    }
    

    if(this.cm.isMidi_highlight_visible()){

      if(is_in_chord && is_in_midi){
        c+= "midi_active_green "
      }else if( is_in_chord && this.cm.isScore_highlight_visible()){
        c += "active ";
      }else if( is_in_midi ){
        c += "midi_active ";

      }else if(is_in_chord_secondary && is_in_midi_secondary){
        c+= "midi_activeSecond_green "
      }else if( is_in_chord_secondary && this.cm.isScore_highlight_visible()){
        c += "activeSecond ";
      }else if( is_in_midi_secondary ){
        c += "midi_activeSecond ";
      }

    }else if( is_in_chord  && this.cm.isScore_highlight_visible()){
        c += "active ";
    }else if( is_in_chord_secondary  && this.cm.isScore_highlight_visible()){
        c += "activeSecond ";
    }

    return c;
  }

}
