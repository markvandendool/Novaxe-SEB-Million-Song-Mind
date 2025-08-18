
declare global {
  var WebAudioFontPlayer:any
}
const webaudiofont=require("webaudiofont");
@Injectable({providedIn: 'root'})
export class GuitarService  {
		private player:any;
		private selected_instrument:any;
		private _audioContext:AudioContext;
		private output:any;
    private midiNotesTab$:Subscription;
  public constructor(public private midi:MidiService) {
    this._audioContext = new AudioContext();
    this.output = this._audioContext.destination;
    this.player     = new WebAudioFontPlayer();
    this.load_instrument(271, ()=>{
      this.midiNotesTab$ = this.midi.notesTabSubject.subscribe((notes) => {
          if(notes.length) this.play(notes[0] )
      }));
    }));
   }
   play(midinote:number=60, delay_ms:number=0, duration:number=1, volume:number=1, bend_factor:number=2 ){
    let pitchEnvelope = [];
    var when = this._audioContext.currentTime + delay_ms;
    if(midinote==60)
      pitchEnvelope = [
        {pitch:64,when:(duration/4)},
      ];
    this.player.queueWaveTable(this._audioContext, this.output, this.selected_instrument, when, midinote, duration, 1/3,pitchEnvelope);
  public setAudioContext(){
  	this._audioContext = new AudioContext();
  	this.output = this._audioContext.destination;
  }
  public getAllInstruments(){
  	return this.player.loader.instrumentKeys();
  }
  public getInstrumentInfo(instr:number=0){
  	return this.player.loader.instrumentInfo(instr);
  load_instrument(n:number=270, callback:any=null){
    /*OK INSTRUMENTS LIST :
      270 "https://surikov.github.io/webaudiofontdata/sound/0253_Acoustic_Guitar_sf2_file.js", "_tone_0253_Acoustic_Guitar_sf2_file"
    */
    var info=this.player.loader.instrumentInfo(n)
  	this.player.loader.startLoad(this._audioContext, info.url, info.variable);
  	this.player.loader.waitLoad(() => {
  		this.selected_instrument=window[info.variable];
  		this.player.cancelQueue(this._audioContext);
      if(callback) callback();
  	}));
