import { Component, OnInit, OnDestroy, AfterViewInit, NgZone, Output, EventEmitter } from '@angular/core';

import { Songmodel } from '@models/songmodel/songmodel';
import { SongInfo } from '@models/songmodel/song-info'; 

import { CurTonalityModel } from '@models/songmodel/cur-tonality-model';
import { ConfigModel } from '@models/configmodel/configModel';
import { SelectionModel } from '@models/selectionmodel/selectionmodel';
import { DisplayService } from '@services/display/displayService';
import { MinimalRenderService } from '@services/display/minimal-render.service';
import { BindingsService,KEYS } from '@services/bindings/bindings.service';

import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { Subscription } from 'rxjs';

import { TonalityButtonComponent } from '@components/tonality-button/tonality-button.component';

import { TransportService } from '@services/transport/transport.service';

import { AudioPlayer } from '@services/audioplayer/audioplayer.service';

import { ChordDetectService } from '@services/chord-detect/chord-detect.service';

import { MidiService } from '@services/midi/midi.service';

import abcjs from 'abcjs';
import { YoutubeService } from '@services/youtube-service/youtube.service';

import BINDINGS from '@assets/bindings.json';
import { type } from 'os';

declare global {
  var abcjs:any;
}


@Component({
    selector: 'app-song',
    templateUrl: './song.component.html',
    styleUrls: ['./song.component.scss'],
    standalone: false
})
export class SongComponent implements OnInit, OnDestroy,AfterViewInit {
  
  public braidModel:'tonal'|'blues'|'new1'|'new2'|'new3' = 'tonal';

  public sub:Subject<number>;
  private abcString:string;
  private abcString$:Subscription;
  private selectionUpdate$:Subscription;
  private beat_selectionUpdate$:Subscription;

  public cur_midi_chord$:Subscription;
  public cur_midi_chord:any = {chords:[]};

  public cur_midi_notes_guitar$:Subscription;
  public cur_midi_notes_guitar:Array<number> = []; 

  public cur_midi_notes_piano$:Subscription;
  public cur_midi_notes_piano:Array<number> = []; 

  public midiControlUpdate$:Subscription;

  public cur_midi_abc$:Subscription;
  public cur_midi_abc:any = {l:"",r:""};
  public cur_chord:Array<string>=[];
  public cur_midi_ctrl:any;
    
  private binding$:any; //Observable ..
  private binding_shift$:any; //Observable ..

  private paper:any; //reference to canvas

  public modalInfos = true;
  public modalImport = false;
  public modalExport = false;
  public imported_controls = '';
  public exported_controls = '';

  public braid_focus_tona:string = '';

  public midi_ctrl_note_selected:string = "60";
  public midi_ctrl_fct_selected:string = "COF_set_roman_mode";
  public midi_ctrl_opt_selected:string = "C";
  public midi_ctrl_tab:any;
  public midi_ctrl_midi_notes_tab;
  public midi_ctrl_functions:Array<string> = BINDINGS;
  public midi_ctrl_options:Array<string> = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B","Db","Eb","Gb","Ab","Bb"];
  
  public chords_from_dico:any;

  public show_video:boolean=false;

  nb_measures_per_line:any=[];
  private measure:Subject<number>;

  public emphasisMode: 'major'|'minor' = 'major';
  public emphasisScale: "c"|"c#"|"db"|"d"|"d#"|"eb"|"e"|"f"|"f#"|"gb"|"g"|"g#"|"ab"|"a"|"a#"|"bb"|"b" = "c";
  public emphasisScaleMode:any = {mode:'major', scale:'c'};
  public oneTonaMode:number = 2;
  public isBefore:boolean = false;
  public isAfter:boolean = false;
  public zoomVal:number = 1;

  public display_Y:boolean=false;
  public display_Y_strip:boolean=false;
  public display_note_mode:boolean=false;

  public stateObj:any;

  @Output() displayChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(public route: ActivatedRoute, 
              private sm:Songmodel, 
              public si:SongInfo, 
              public sel:SelectionModel,
              public cm:ConfigModel, 
              public transport:TransportService, 
              public dm:DisplayService, 
              private ap:AudioPlayer, 
              private yt:YoutubeService, 
              private miniRender:MinimalRenderService, 
              private keys:BindingsService,
              private midi_detect_chord:ChordDetectService,
              private curTonaModel:CurTonalityModel,
              private zone:NgZone,
              private midi:MidiService
              ) {

    this.stateObj = {};
    this.stateObj["isVideoSide"]= null; 
    this.stateObj["fretboardWasOn"]=null;
    this.stateObj["pianoWasOn"]=null;

    this.cur_midi_chord$ = this.midi_detect_chord.cur_midi_chord.subscribe( (chords_obj) =>{ //Subscription to chord detection service.
      
      this.cur_midi_chord = chords_obj;
      // console.log("this.cur_midi_chord =>", this.cur_midi_chord)
    });
    
    this.cur_midi_abc$ = this.midi_detect_chord.cur_abc_notes.subscribe( (abc_obj) =>{ //Subscription to chord detection service.
      this.zone.run(()=>{
        this.cur_midi_abc = abc_obj;
      })
    });

    this.cur_midi_notes_guitar$ = this.midi_detect_chord.cur_guit_notes.subscribe( (midi_guit_notes) =>{ //Subscription to chord detection service.
      this.cur_midi_notes_guitar = [...midi_guit_notes];
    });

    this.cur_midi_notes_piano$ = this.midi_detect_chord.cur_piano_notes.subscribe( (midi_piano_notes) =>{ //Subscription to chord detection service.
      this.cur_midi_notes_piano = [...midi_piano_notes];
    });

    // DEPREC ??
    // this.midiControlUpdate$ = this.midi.controlTabSubject.subscribe(data=>{
    //   this.zone.run(()=>{
      //   setTimeout(() => {
        //       this.cur_midi_ctrl = null; 
        //     }, 200);
        //   })
        // })
        
        this.midiControlUpdate$ = this.midi.controlTabSubject.subscribe(data=>{
          
          let ctrl = this.cm.getAssignedControls(false);
          let o = ctrl[""+data];
          let number;
          let control_name;
          let control_action;
          this.zone.run(()=>{
            this.cur_midi_ctrl = data; //used for green light temoin
            setTimeout(() => {
                this.cur_midi_ctrl = null; 
              }, 200);
            });
          
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



    // this.curTonaModel.current_tonality$.subscribe((tona)=>{ 
    //   if(tona.is_locked_to_score){
    //     this.emphasisMode = (tona.part_tona.slice(-1)=='m')?'minor':'major';
    //     this.emphasisScale = (tona.part_tona.slice(-1)=='m')?tona.part_tona.slice(0,-1):tona.score_tonality;
    //     this.updateEmphasisScale()
    //   }else{
    //     this.emphasisMode = (tona.part_tona.slice(-1)=='m')?'minor':'major';
    //     this.emphasisScale = (tona.part_tona.slice(-1)=='m')?tona.part_tona.slice(0,-1):tona.tonality;
    //     this.updateEmphasisScale()
    //   }
    // });

    this.midi_ctrl_midi_notes_tab = []
    for(let i = 0; i < 127;i++){
      this.midi_ctrl_midi_notes_tab.push(i);
    }
    
  }

  ngOnInit() {
    // console.log("SONG COMPONENT : ngOnInit");

    this.measure = new Subject();
    this.measure.next(1);  
    this.modalInfos = !this.cm.is_tutorial_skipped();
    this.refreshMidiCtrlTab();
    
    // Subscribe to route data to wait for SongResolver to complete
    this.route.data.subscribe(data => {
      console.log("SongComponent: Route data received", data);
      // The SongResolver has completed, now we can render the score
      setTimeout(() => {
        this.dm.renderFromModel();
      }, 100);
    });
    
    this.abcString$ = this.dm.abcString$.subscribe(abcString=>{
      // console.log('abcString received in song part: '+abcString);
      this.abcString = abcString;
      this.renderAbcWithOptions();
    });

    this.init_bindings();

    this.beat_selectionUpdate$ = this.transport.beatChange.subscribe(data=>{

      this.disLight_all();
      
      let H = this.sm.getMeasures_hash();
      
      // try{
        // if(this.show_video)return;
        let m = this.sel.getSelection();

        for(let i=0; i < m.length; i++){
          if(m[i].getType() == 'part') continue;
          
          // this.highlightMeasure(pos,line);
          this.highlightBeat(data); // data => {beat: 0, silent: false, measure: 0}
          // console.log("pos =>", pos)

          this.cur_chord = [m[0].getBeats()[data.beat].getChord()];
          
          
        }
    })

    this.selectionUpdate$ = this.sel.selected_Update$.subscribe(data=>{
      // console.log("%cselectionUpdate in song component","font-size:20px;color:green;")
      return;
      this.disLight_all();
      console.log("disLight_all ")
      
      if(!data || !data[0])return;
      
      let hash = this.sm.getMeasures_hash();
      
        // if(this.show_video)return;

        for(let i=0; i < data.length; i++){
          if(data[i].getType() == 'part') continue;
          
          // let line = data[i].lig;
          // let pos = data[i].pos;
          let line = hash[data[i].getIdx()].lig;
          let pos = hash[data[i].getIdx()].pos

          // this.highlightMeasure(pos,line);
          // console.log('%c===============',"color:red;font-size:4rem;")
          // console.log("line =>", line)
          // console.log("pos =>", pos)

          if(data[0].chords) this.cur_chord = data[0].chords.split(' ');

        }
      // }catch(e){
      //   debugger
      // }
      // console.log('SONG INFO _-------------> '+this.si.braid_param_roman);
      this.si = this.sm.getInfos();

    });

    // this.transport.measureChange.subscribe(
    //     data => {
    //       // if(this.follow_on) {
    //       //   let x = this.getMeasureLine(data%this.sm.getMeasures().length);
    //       //   console.log("getMeasureLine => ");
    //       //   console.log(x);
    //       //   this.highlightMeasure(x.measure,x.line); 
    //       // }
    //       // console.log("MEASURE CHANGED !");
    //     },
    //     error => { console.log('Error : ', error); }
    //   );
    
  }
  
  
  public savePrefs():void{
    this.cm.saveInCookie();
  }

  ngOnDestroy() {
    // console.log("SONG COMPONENT : DESTROY");
    this.savePrefs();
    this.abcString$.unsubscribe();
    this.binding$.unsubscribe()
    // this.measure.unsubscribe();
    this.selectionUpdate$.unsubscribe();
    this.beat_selectionUpdate$.unsubscribe();
    this.cur_midi_chord$.unsubscribe();
    this.cur_midi_abc$.unsubscribe();
    this.cur_midi_notes_guitar$.unsubscribe();
    this.cur_midi_notes_piano$.unsubscribe();
    this.midiControlUpdate$.unsubscribe();
  }
  
  ngAfterViewInit(){
    // console.log("SONG COMPONENT INIT ngAfterViewInit");
    // this.dm.renderFromModel(); // Removed - now called after route data is loaded
    this.paper = document.querySelector("#abcCanvas");
    
    setTimeout(()=>{
      this.transport.setBeat(0,true);
      this.highlightBeat({beat: 0, silent: true, measure: 0});
    },100);// Waiting for first render to select first measure

  }

  /**
   * get the line of the measure m
   * Number of measures per line is given by this.nb_measures_per_line of form [n1,n2,...nx]
   * nx being the number of measures for each line.
   * 
   * @param {[int]} m measure number
   */
  getMeasureLine(m){
    console.log("get measure line m => ",m);
    // console.log("this.nb_measures_per_line => ",this.nb_measures_per_line);

    for(var i = 0; i < this.nb_measures_per_line.length; i++){
      //if this measure number is > number of measures of this line
      if(m >= this.nb_measures_per_line[i]){
        m -= this.nb_measures_per_line[i];
        continue;
      }
      if(m <= this.nb_measures_per_line[i]){
        // if(i==0)m+=1;
       return {measure:m, line:i};
       }
    }
    return {measure:0, line:0};
  }

  measureClicked(abcelem, tuneNumber, classes, analysis, drag, mouseEvent){
    
    console.log("%c============",'font-size:4em;color:red')
    console.log('measureClicked');

    let m = Number( classes.match(/abcjs-m([0-9]+)/)[1] );
    let l = Number( classes.match(/abcjs-l([0-9]+)/)[1] );
    let b = Number( classes.match(/abcjs-n([0-9]+)/)[1] );
    let mm = Number( classes.match(/abcjs-mm([0-9]+)/)[1] ); // POURQUOI ??????? BUG DANS LA LIB ABCJS ?????

    console.log("l =>", l)
    console.log("m =>", m)
    console.log("b =>", b)
    console.log("mm =>", mm)
    

    let H = this.sm.getMeasures_hash();
    let M=0;
    // for(var h of object.getownpropertynames(h)){
    //   if( (h[h].lig == l && h[h].pos == m )|| (h[h].lig == l && h[h].pos == m )){
    //     m=number(h);
    //     break;
    //   }
    // }
    let measure = this.sm.getMeasureByIdx(mm);
    // let measure = this.sm.getPart( this.sm.getMeasures_hash()[M].part ).getMeasure( this.sm.getMeasures_hash()[M].meas );
    this.sel.setSelection([ measure ],b);
    
    let t = measure.getBeat(b).getAudioRegion().start

    if(!t)t=measure.getAudioRegion().start;
    this.ap.setCurrentTime(t);
    this.yt.seekTo(t);
    this.transport.setMeasure(mm);
    this.transport.setBeat(Number(b));
  }


  disLight_all(){
    this.paper = document.querySelector("#abcCanvas");

    //Change back red elements to black.
    let elements;
    elements = document.querySelectorAll('.abcjsNoteSelected, .abcjsMeasureSelected') as any;

    for(let i of elements){
      i.classList.remove('abcjsNoteSelected');
      i.classList.remove('abcjsMeasureSelected');
    }

  }

  private highlightMeasure(m,l){
    //color new highlighted elements in red.
    let elements = this.paper.querySelectorAll('.abcjs-chord.abcjs-m'+m+'.abcjs-l'+l+','+'.abcjs-annotation.abcjs-m'+m+'.abcjs-l'+l) as any;

    if(!elements.length){
      console.warn('songComponent: highLightMeasure => Nothing to select : returning.');
      return;
    }

    for(let e of elements){
      e.classList.add('abcjsNoteSelected');
    }


    if(this.cm.isAutoScroll()){
     let elements = this.paper.querySelectorAll( '.abcjs-clef.abcjs-l'+l );
     // abcjs-staff-extra abcjs-clef abcjs-l3 abcjs-m0 abcjs-mm14 abcjs-v0
     if(!elements.length){
       console.warn( "error : song component highlightMeasure() => no elements to scroll to." );
       return;
     }
     this.checkInView(elements);
   }

  }

  private highlightBeat(data){
    //color new highlighted elements in red.
    // abcjs-rest abcjs-d0-125 abcjs-l0 abcjs-m0 abcjs-mm0 abcjs-v0 abcjs-n0
    let elements_chord = this.paper.querySelectorAll('.abcjs-mm'+data.measure+'.abcjs-n'+data.beat) as any;
    let elements_measure = this.paper.querySelectorAll('.abcjs-mm'+data.measure) as any;
    
    if(!elements_chord.length){
      console.warn('songComponent: highLightMeasure => Nothing to select : returning.');
      // debugger
      return;
    }
    
    for(let e of elements_measure){
      // console.log("e =>", e)
      e.classList.add('abcjsMeasureSelected');
    }
    for(let e of elements_chord){
      // console.log("e =>", e)
      e.querySelector('.abcjs-chord').classList.add('abcjsNoteSelected');
    }


    if(this.cm.isAutoScroll()){
    //  let elements = this.paper.querySelectorAll( '.abcjs-mm'+data.measure );
     // abcjs-staff-extra abcjs-clef abcjs-l3 abcjs-m0 abcjs-mm14 abcjs-v0
     if(!elements_measure.length){
       console.warn( "error : song component highlightMeasure() => no elements to scroll to." );
       return;
     }
     this.checkInView(elements_measure);
   }
  }

  checkInView(elem) {

    var container = $(".song");
    var contHeight = container.height();
    var contTop = container.scrollTop();
    var contBottom = contTop + contHeight ;

    var elemTop = $(elem).offset().top - container.offset().top;
    var elemBottom = elemTop + $(elem).height();
    
    // console.log("elemTop => ",elemTop);
    // console.log("elemBottom => ",elemBottom);

    var isIn = ( elemTop <=screen.height - (screen.height*0.4) && elemTop > 100)

    if(isIn)return; //if into view
    // console.log('ELEMENT NOT IN VIEW : SCROLLING ');

    let behavior = ( this.ap.getState() ) ?'instant':'smooth';
    elem[0].scrollIntoView({
      behavior: 'instant',
      block: 'center'
    });
  }


  onResize(){
   this.renderAbcWithOptions(); 
  }


  renderAbcWithOptions(){

    if( this.cm.minimalRendering ){

      this.miniRender.render('abcCanvas');

      let canvas = document.getElementById('abcCanvas');
      canvas.style.overflow='hidden';
      canvas.style.height='';


    }else{

      // console.log("this.abcString => ",this.abcString);
      setTimeout(()=>{

        let staffwidth = (window.innerWidth>900)?window.innerWidth*0.6: window.innerWidth*0.9;
        // wrap:{
        //   minSpacing:4,
        //   maxSpacing:3,
        //   preferredMeasuresPerLine:3
        // },
        // viewportVertical:true,
        
        abcjs.renderAbc('abcCanvas', this.abcString, {
          visualTranspose:this.sm.getTranspose(),
          staffwidth:staffwidth, 
          add_classes:true, 
          clickListener:this.measureClicked.bind(this),
          responsive:'resize',
          format:{
            partsbox: true,
          }
        });
      },10)    
    }
  }

  private init_bindings():void{

    this.binding$ = this.keys.match( [ KEYS.ESCAPE, KEYS.E ] , []).subscribe(() => {


      let e:any= event;
      //======================================
      //FOR NOW CHECK IF WE ARE ON THE SONG SCREEN
      if(e.path[0].tagName == "INPUT")return;
      let inEditor = $(document.activeElement).parents('.song').length || $(document.activeElement).hasClass('song');
      if(!inEditor) return;  
      e.stopPropagation();
      e.preventDefault();
      //=======================================


      switch(e.keyCode){
        case KEYS.ESCAPE :
          this.cm.setEditor_visible(false);
          this.cm.setMetro_visible(false);
          this.cm.setCircle_visible(false);
          this.cm.setDico_visible(false);
          this.cm.setOptions_visible(false);
        break;

        case KEYS.E : 
          if(e.path[0].tagName == "INPUT")return;
          this.cm.setEditor_visible(true);
          break;
      }
    });
  }

  close_tutoModal(skip_tuto:boolean){

    if(!skip_tuto){
      var leg=$('#tuto-modal-iframe').attr("src");
      $('#tuto-modal-iframe').attr("src",leg);
      this.modalInfos=false;

    }else{
      this.cm.tutorial_skipped = true;
      this.cm.saveInCookie();
    }

  }

  public refresh_tonality():void{
    this.curTonaModel.refreshTonality();
  }

  public refreshMidiCtrlTab():void{
    this.midi_ctrl_tab = this.cm.getAssignedControls();
    // console.log("this.midi_ctrl_tab =>", this.midi_ctrl_tab)
  }


  public addShortcut():void{
    this.cm.addAssignedControl(Number(this.midi_ctrl_note_selected), this.midi_ctrl_fct_selected, this.midi_ctrl_opt_selected)
    this.refreshMidiCtrlTab();
    this.cm.saveInCookie();
  }

  public removeShortcut(midi_note,e):void{
    console.log(" remove shortcut: ",e);
    this.cm.removeAssignedControl(midi_note, e);
    this.refreshMidiCtrlTab();
    this.cm.saveInCookie();
  }

  public update_chords_in_score(){
    this.chords_from_dico = Object.keys(this.sm.getChordsInScore());
    // this.cm.saveInCookie();
  }

  public change_piano_display(e){
    this.cm.set_piano_visible(e);
    this.cm.saveInCookie();
  }

  public change_fretboard_display(e){
    this.cm.set_fretboard_visible(e);
    this.cm.saveInCookie();
  }

  public export_control_bindings(){
    this.exported_controls = JSON.stringify(this.cm.getAssignedControls(),undefined, 4 );
  }
  public import_control_bindings(){
    this.zone.run(()=>{
      this.cm.import_controls(JSON.parse(this.imported_controls));
      this.refreshMidiCtrlTab();
    })
  }

  public toggle_video_card(toggle:string=''){
    
    let tgl = (toggle=="off")?false:(toggle=="on")?true:undefined;

    this.zone.run(()=>{
      if(typeof tgl == 'undefined'){

        if(this.show_video == false)this.flip_card('flipCardVideo');
        else this.flip_card('flipCardVideoBack');
      }else{
        if(tgl) this.flip_card('flipCardVideo');
        else this.flip_card('flipCardVideoBack');
      }

    })

  }

  public flip_card(id){
    event.preventDefault();
    console.log('flip_card');
    let x = (id=='flipCardVideo')?'180':'0';
    let transform = 'rotateY('+x+'deg)';

    $('.flip-card-video .flip-card-inner').css('transform', transform);

    if(id == 'flipCardVideoBack') {
      this.show_video=false;
    } else {
      this.show_video=true; //this.show_video = 'flipCardVideo'
      // Check if YouTube player needs to be created when video card is shown
      setTimeout(() => {
        this.yt.checkAndCreatePlayer();
      }, 100); // Small delay to ensure DOM is updated
    }
  }

  // public updateEmphasisScale(){
  //   this.emphasisScaleMode = new Object({ mode: this.emphasisMode, scale : this.emphasisScale });
  // }

  public updateOneTona(){
    if(this.isBefore && !this.isAfter)
      this.oneTonaMode = 1;
    else if(!this.isBefore && !this.isAfter)
      this.oneTonaMode = 2;
    else if(!this.isBefore && this.isAfter)
      this.oneTonaMode = 3;
    else if(this.isBefore && this.isAfter)
      this.oneTonaMode = 4;
  }

  public updateZoom(val){
    this.zoomVal = val;
  }

  public toggle_one_tona_before_braid(){
   this.isBefore = !this.isBefore;
   this.updateOneTona(); 
  }
  
  public toggle_one_tona_after_braid(){
    this.isAfter = !this.isAfter;
    this.updateOneTona();
  }

  public toggle_roman_display_braid(){
    this.si.braid_param_roman = !this.si.braid_param_roman;
  }

  public toggle_fretboard(toggle:string=''){
    let tgl = (toggle=="off")?false:(toggle=="on")?true:undefined;

    if(typeof tgl == 'undefined')
      this.cm.display_fretboard = !this.cm.display_fretboard;
    else
      this.cm.display_fretboard = tgl;
  }

  public toggle_midi_chord(toggle:boolean=false){
    this.cm.display_midi_chord = !this.cm.display_midi_chord;
  }

  public toggle_piano(toggle:string=''){
    let tgl = (toggle=="off")?false:(toggle=="on")?true:undefined;

    if(typeof tgl == 'undefined')
      this.cm.display_piano = !this.cm.display_piano;
    else
      this.cm.display_piano = tgl;
  }

  public manage_yt_tab(){
    if(this.cm.is_chordstrip_visible())
      this.cm.set_chordstrip_visible(!this.cm.is_chordstrip_visible());
    else
      this.display_Y=false;
    this.cm.set_audio_visible(!this.cm.is_audio_visible());
  }

  public manage_strip_tab(){
    if(this.cm.is_audio_visible())
      this.cm.set_audio_visible(!this.cm.is_audio_visible());
    else
      this.display_Y=false;
    this.cm.set_chordstrip_visible(!this.cm.is_chordstrip_visible());
  }

  public change_novaxe_notation(){
    this.cm.toggleNovaxeNotation();
  }
  
  public debug(){
    // console.log(this.route);
    // console.log(this.si);
    // console.log(this.sel);
    // console.log(this.cm);
    // console.log(this.dm);
    // console.log(this.miniRender);
    // console.log(this.keys);
    // console.log(this.midi_detect_chord);
    // console.log(this.curTonaModel);
    // console.log(this.zone);
    console.log(this.midi);
    
    // console.log(this.transport);
    // console.log(this.ap);
    // console.log(this.yt);
    console.log(this.sm);
    
    // ======TO DEBUG MIDI CTRL
    // let debug_ctrl = "toggle_fretboard_rotate_180";
    // if(!this.cm)
    // if(!this.cm.getAssignedControls().length)
    // this.cm.addAssignedControl(1,debug_ctrl,'true')
    // this.midi.emitDebugControlMessage(1);
  }

  public change_novaxe_numbers_sync(){
    this.cm.set_letters_Numbers_sync(!this.cm.get_letters_Numbers_sync())
    this.cm.sendDisplayNoteMode();
  }

  public change_novaxe_numbers_display_note_mode(){
    if(this.cm.get_letters_Numbers_sync()){

      if(this.display_note_mode == false){

        this.cm.setDisplayNoteMode('letters');
      }else{
        this.cm.setDisplayNoteMode('numbers');
      }
      
      this.display_note_mode = !this.display_note_mode;
      this.cm.sendDisplayNoteMode();
    }
  }
  
  public global_toggle_letters_numbers(){
    this.change_novaxe_numbers_display_note_mode();
  }

  public change_novaxe_toggle_show_score_chords(){
    this.cm.setGlobalShowScoreChords(!this.cm.getGlobalShowScoreChords())
    this.cm.sendGlobalShowScoreChords();
  }

  public global_toggle_show_score_chords(){
    this.change_novaxe_toggle_show_score_chords();
  }
  
  public control_enter(event){
    event.stopPropagation();
    event.preventDefault();
    
    if(this.stateObj.isVideoSide===true)return;
    
    this.stateObj = {};
    this.stateObj["isVideoSide"]= null; 
    this.stateObj["fretboardWasOn"]=null;
    this.stateObj["pianoWasOn"]=null;

    this.stateObj.fretboardWasOn = this.cm.display_fretboard;
    this.stateObj.pianoWasOn     = this.cm.display_piano;
    
    this.stateObj.isVideoSide    = true;

    this.toggle_fretboard('off');
    this.toggle_piano('off');
    this.toggle_video_card('on');
  }

  public control_shift_enter(event){
    event.stopPropagation();
    event.preventDefault();
    this.stateObj.isVideoSide    = false;
    
    if(this.stateObj.fretboardWasOn) this.toggle_fretboard('on');
    if(this.stateObj.pianoWasOn) this.toggle_piano('on');

    this.toggle_video_card('off');
  }


  public changeMidiChordDisplayVisibleState(e){
    this.cm.set_midi_chord_display_visible(e);
  }
}
