import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CookieService } from 'ngx-cookie';

@Injectable()
export class ConfigModel {

	private autoScroll:boolean=true;

  private follow:boolean=true;

  public minimalRendering:boolean = false;

  private displayMode:'chords'|'analyse'|'both'='chords';

  public editor_visible:boolean=false;

  public metro_visible:boolean=false;

  public metroVolume:number = 0.6;

  public dico_visible:boolean=false;
  
  public options_visible:boolean=false;
  
  public chordsBrowse_visible:boolean=false;
  
  public tutorial_skipped:boolean = false;
  
  public midi_input_selected:string='';

  public control_input_selected:string='';
  
  public assigned_controls:any=[];
  
  // The braid / fifths circle menu
  public circle_visible:boolean=true;

    public fifths_visible:boolean=false;

    public braid_visible:boolean=true;

  public midi_is_guitar:boolean=false;

  public display_fretboard:boolean = false;

  public display_piano:boolean = false;

  public display_audio:boolean = true;

  public display_chordstrip:boolean = false;

  public tonalityLockedToScore:boolean = false;

  public braid_is_roman:boolean = false;

  public tonality_button_always_open:boolean = false;

  public emphasis_chords:boolean = false;

  public emphasis_scale:boolean = false;

  public braid_simpler:boolean = false;

  public braid_one_tona:boolean = false;

  public midi_highlight_visible:boolean=true;

  public score_highlight_visible:boolean=true;

  public novaxe_notation_on:boolean=false;

  public browse_dislplay_list:boolean=false;

  public letters_Numbers_sync:boolean=true;

  public display_midi_chord:boolean=false;

  public displayNotesMode:'numbers'|'letters'='numbers';

  public global_show_score_chords:boolean = true;

  private displayNotesMode_SUBJ = new Subject<any>();
	public displayNotesMode_SUBJ_update$ = this.displayNotesMode_SUBJ.asObservable();

  private global_show_score_chords_SUBJ = new Subject<any>();
  public global_show_score_chords_SUBJ$ = this.global_show_score_chords_SUBJ.asObservable();
  

  private letters_numbers_sync_subj = new Subject<any>();
	public letters_numbers_sync_update$ = this.letters_numbers_sync_subj.asObservable();
  



  constructor(private cookie: CookieService) {


    if( !this.loadFromCookie()  )this.saveInCookie();

    this.letters_numbers_sync_subj.next(this.letters_Numbers_sync);

  }

  public isEditor_visible(param: any):boolean{
    return this.editor_visible;
  }
  public isMetro_visible(param: any):boolean{
    return this.metro_visible;
  }
  public isCircle_visible(param: any):boolean{
    return this.circle_visible;
  }
  public isDico_visible(param: any):boolean{
    return this.dico_visible;
  }
  public isOptions_visible(param: any):boolean{
    return this.options_visible;
  }
  public isChordsBrowse_visible(param: any):boolean{
    return this.chordsBrowse_visible;
  }
  public isFifths_visible(param: any):boolean{
    return this.fifths_visible;
  }
  public isBraid_visible(param: any):boolean{
    return this.braid_visible;
  }
  public isMidi_highlight_visible(param: any):boolean{
    return this.midi_highlight_visible;
  }
  public isScore_highlight_visible(param: any):boolean{
    return this.score_highlight_visible;
  }
  public is_midi_guitar(param: any):boolean{
    return this.midi_is_guitar;
  }

  public set_midi_chord_display_visible(x: boolean) {
    this.display_midi_chord = x;
  }
  public is_midi_chord_display_visible(param: any):boolean{
    return this.display_midi_chord;
  }

  public is_fretboard_visible() {
    return this.display_fretboard;
  }

  public set_fretboard_visible(onOff: boolean) {
    this.display_fretboard = onOff;
  }

  public is_piano_visible() {
    return this.display_piano;
  }

  public set_piano_visible(onOff: boolean) {
    this.display_piano = onOff;
  }

  public is_audio_visible() {
    return this.display_audio;
  }

  public is_chordstrip_visible() {
    return this.display_chordstrip;
  }

  public set_audio_visible(onOff: boolean) {
    this.display_audio = onOff;
  }

  public set_chordstrip_visible(onOff: boolean) {
    this.display_chordstrip = onOff;
  }

  public setEditor_visible(onOff: boolean) {
    this.editor_visible = onOff;
  }

  public setMetro_visible(onOff: boolean) {
    this.metro_visible = onOff;
  }

  public setCircle_visible(onOff: boolean) {
    this.circle_visible = onOff;
  }

  public setDico_visible(onOff: boolean) {
    this.dico_visible = onOff;
  }

  public setOptions_visible(onOff: boolean) {
    this.options_visible = onOff;
  }

  public setChordsBrowse_visible(onOff: boolean) {
    this.chordsBrowse_visible = onOff;
  }

  public setFifths_visible(onOff: boolean) {
    this.fifths_visible = onOff;
  }

  public setBraid_visible(onOff: boolean) {
    this.braid_visible = onOff;
  }

  public setMidi_highlight_visible(onOff: boolean) {
    this.midi_highlight_visible = onOff;
  }

  public setScore_highlight_visible(onOff: boolean) {
    this.score_highlight_visible = onOff;
  }

  public set_midi_guitar(midi_guitar) {
    this.midi_is_guitar = midi_guitar;
  }

  public set_browse_dislplay_list(onOff: boolean) {
    this.browse_dislplay_list = onOff;
  }
  
  public set_letters_Numbers_sync(onOff: boolean) {
    this.letters_Numbers_sync = onOff;
    this.letters_numbers_sync_subj.next(this.letters_Numbers_sync);
  }

  public get_letters_Numbers_sync() {
    return this.letters_Numbers_sync;
  }

  public toggleChordsBrowse_visible(param: any):boolean{
    this.chordsBrowse_visible = !this.chordsBrowse_visible;
    return this.chordsBrowse_visible;
  }

  public toggleEditor_visible(param: any):boolean{
    this.editor_visible = !this.editor_visible;
    return this.editor_visible;
  }

  public toggleMetro_visible(param: any):boolean{
    this.metro_visible = !this.metro_visible;
    return this.metro_visible;
  }

  public toggleCircle_visible(param: any):boolean{
    this.circle_visible = !this.circle_visible;
    return this.circle_visible;
  }

  public toggleDico_visible(param: any):boolean{
    this.dico_visible = !this.dico_visible;
    return this.dico_visible;
  }

  public toggleOptions_visible(param: any):boolean{
    this.options_visible = !this.options_visible;
    return this.options_visible;
  }

  public is_tutorial_skipped(param: any):boolean{
    return this.tutorial_skipped;
  }

  public toggleFifths_visible(param: any):boolean{
    this.fifths_visible = !this.fifths_visible;
    return this.fifths_visible;
  }

  public toggleBraid_visible(param: any):boolean{
    this.braid_visible = !this.braid_visible;
    return this.braid_visible;
  }

  public toggleNovaxeNotation(param: any):boolean{
    this.novaxe_notation_on = !this.novaxe_notation_on;
    return this.novaxe_notation_on;
  }


  public getOptionsAsObject(param: any):Object{

    let obj = {};
    obj['autoScroll'] = this.autoScroll;
    obj['follow'] = this.follow;
    obj['minimalRendering'] = this.minimalRendering;
    obj['displayMode'] = this.displayMode;
    obj['tutorial_skipped'] = this.tutorial_skipped;
    obj['midiInput'] = this.midi_input_selected;
    obj['controlInput'] = this.control_input_selected;
    obj['midiIsGuitar'] = this.midi_is_guitar;
    obj['tonalityButtonAlwaysOpen'] = this.tonality_button_always_open;
    obj['assignedControls'] = this.assigned_controls;
    obj['display_piano'] = this.display_piano;
    obj['display_fretboard'] = this.display_fretboard;
    obj['novaxe_notation_on'] = this.novaxe_notation_on;
    obj['browse_dislplay_list'] = this.browse_dislplay_list;
    obj['letters_Numbers_sync'] = this.letters_Numbers_sync;
    obj['displayNotesMode'] = this.displayNotesMode;
    obj['global_show_score_chords'] = this.global_show_score_chords;

    return obj;
  }

  public setOptionsFromObject( obj:Object ):void{

    if(obj.hasOwnProperty('autoScroll')) this.setAutoScroll( obj['autoScroll'] );
    if(obj.hasOwnProperty('follow')) this.setFollow( obj['follow'] );
    if(obj.hasOwnProperty('minimalRendering')) this.minimalRendering = obj['minimalRendering'];
    if(obj.hasOwnProperty('displayMode')) this.displayMode = obj['displayMode'];
    if(obj.hasOwnProperty('tutorial_skipped')) this.tutorial_skipped = obj['tutorial_skipped'];
    if(obj.hasOwnProperty('midiInput')) this.midi_input_selected = obj['midiInput'];
    if(obj.hasOwnProperty('controlInput')) this.control_input_selected = obj['controlInput'];
    if(obj.hasOwnProperty('midiIsGuitar')) this.midi_is_guitar = obj['midiIsGuitar'];
    if(obj.hasOwnProperty('tonalityButtonAlwaysOpen')) this.tonality_button_always_open = obj['tonalityButtonAlwaysOpen'];
    if(obj.hasOwnProperty('assignedControls')) this.assigned_controls = obj['assignedControls'];
    if(obj.hasOwnProperty('display_piano')) this.display_piano = obj['display_piano'];
    if(obj.hasOwnProperty('display_fretboard')) this.display_fretboard = obj['display_fretboard'];
    if(obj.hasOwnProperty('novaxe_notation_on')) this.novaxe_notation_on = obj['novaxe_notation_on'];
    if(obj.hasOwnProperty('browse_dislplay_list')) this.browse_dislplay_list = obj['browse_dislplay_list'];
    if(obj.hasOwnProperty('letters_Number_sync')) this.letters_Numbers_sync = obj['letters_Number_sync'];
    if(obj.hasOwnProperty('displayNotesMode')) this.displayNotesMode = obj['displayNotesMode'];
    if(obj.hasOwnProperty('global_show_score_chords')) this.global_show_score_chords = obj['global_show_score_chords'];
  }

  public loadFromCookie(param: any):boolean{

    if( !this.cookie.getObject('options') ) return false;
} else this.setOptionsFromObject( this.cookie.getObject('options') )

    return true;
  }

  public saveInCookie(param: any):void{
    this.cookie.putObject('options',this.getOptionsAsObject());
    console.log("saved in cookie :)")
  }


	public isAutoScroll() {
		return this.autoScroll;
	}
	setAutoScroll(val: boolean) {
		this.autoScroll = val;
	}

  public isFollowOn() {
   return this.follow;
  }

  public setFollow(val: boolean) {
    this.follow = val;
  }


  public getDisplayNoteMode(param: any):'numbers'|'letters'{
    return this.displayNotesMode;
  }

  public setDisplayNoteMode(mode: 'numbers'|'letters') {
    this.displayNotesMode = mode;
  }

  public getGlobalShowScoreChords(param: any):boolean{
    return this.global_show_score_chords;
  }

  public setGlobalShowScoreChords(mode: boolean) {
    this.global_show_score_chords = mode;
  }

  public sendGlobalShowScoreChords() {
    this.global_show_score_chords_SUBJ.next(this.global_show_score_chords);
  }

  public sendDisplayNoteMode() {
    this.displayNotesMode_SUBJ.next(this.displayNotesMode);
  }

  public getDisplayMode(param: any):'chords'|'analyse'|'both'{
    return this.displayMode;
  }
  public setDisplayMode(dm:'chords'|'analyse'|'both'):void{
    this.displayMode = dm;
  }

  public getMidiInputSelected(param: any):string{
    return this.midi_input_selected;
  }

  public setMidiInputSelected(midiIn: any):void{
    this.midi_input_selected = midiIn
  }

  public getControlInputSelected(param: any):string{
    return this.control_input_selected;
  }

  public setControlInputSelected(midiIn: any):void{
    this.control_input_selected = midiIn
  }

  public removeAssignedControl(midiNoteNb, midiControlNb) {
    try{

      this.assigned_controls[midiNoteNb].splice(midiControlNb,1);
    }catch(e) {
      console.warn("Bad value in removeAssignedControl !")
      console.error(e)
    }
    
  }

  public addAssignedControl(midiControlNb: number, controlName:string, controlAction:string) {
    // TODO CHECK FOR BAD ARGS !
    
    if(!this.assigned_controls[midiControlNb] || !this.assigned_controls[midiControlNb].length) this.assigned_controls[midiControlNb] = []
    
    this.assigned_controls[midiControlNb].push( {
        number:midiControlNb,
        control_name:controlName,
        control_action:controlAction
      });
  }

  public import_controls(controls) {
    
    this.assigned_controls = [];
    for(let tab of controls) {
      if(tab.length) {
        for(let c of tab) {
          if(c.hasOwnProperty('number') && c.hasOwnProperty('control_name') && c.hasOwnProperty('control_action')){
            if(!this.assigned_controls[c.number])this.assigned_controls[c.number] = []
            this.assigned_controls[c.number].push(c);
          }
        }

      }
    }
  }

  public getAssignedControls(filtered: boolean=true) {
    if(filtered) {
        // TODO: Implement
    }
      return this.assigned_controls.filter(e=>e!=null);
} else return this.assigned_controls;
  }

  public isTonalityLockedToScore(param: any):boolean{
    return this.tonalityLockedToScore;
  }

  public setTonalityLockedToScore(val:boolean):void{
    this.tonalityLockedToScore = val;
  }

  public is_braid_roman(param: any):boolean{
    return this.braid_is_roman;
  }

  public set_braid_roman(value:boolean):void{
    this.braid_is_roman = value;
  }

  public set_tonality_button_always_open(val:boolean):boolean{
    this.tonality_button_always_open = val;
    return val;
  }

  public get_tonality_button_always_open(param: any):boolean{
    return this.tonality_button_always_open;
  }

  public set_novaxe_notation_on(val:boolean):boolean{
    this.novaxe_notation_on = val;
    return val;
  }

  public get_novaxe_notation_on(param: any):boolean{
    return this.novaxe_notation_on;
  }

  public set_emphasis_chords(val:boolean):void{
    this.emphasis_chords = val;
  }

  public set_emphasis_scale(val:boolean):void{
    this.emphasis_scale = val;
  }

  public set_braid_simpler(val:boolean):void{
    this.braid_simpler = val;
  }

  public get_braid_simpler(val:boolean):boolean{
    return this.braid_simpler;
  }

  public get_emphasis_chords(param: any):boolean{
    return this.emphasis_chords;
  }

  public get_emphasis_scale(param: any):boolean{
    return this.emphasis_scale;
  }
}
