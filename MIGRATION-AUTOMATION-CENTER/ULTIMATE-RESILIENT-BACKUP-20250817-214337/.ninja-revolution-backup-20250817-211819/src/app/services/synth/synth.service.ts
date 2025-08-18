
export const ABC: any = abcjs;
@Injectable({
  providedIn: 'root'
})
export class SynthService  {
	public synth:any;
	private synthControl:any;
	private audioParams:any;
	private visualObj:any;
	private callback:any;
  public constructor(public ) { 
  	// console.log("SYNTH CONSTRUCTOR==============================");
  	this.synthControl = new ABC.synth.SynthController();
    this.synth = new ABC.synth.CreateSynth();
  }
  set_sound(on:boolean): void{
  	this.audioParams.voicesOff=!on;
    let options: {
      // soundFontUrl: "https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/" ,
      // soundFontUrl: "https://paulrosen.github.io/midi-js-soundfonts/abcjs/" ,
      // sequenceCallback: function(noteMapTracks, callbackContext: any) { return noteMapTracks; },
      // callbackContext: this,
      // onEnded: function(callbackContext),
      // pan: [ -0.5, 0.5 ]
    }
  	this.synth.init({ visualObj: this.visualObj, millisecondsPerMeasure: 500,options:options }).then(()=> {
  	  this.synthControl.setTune(this.visualObj, false, this.audioParams).then( ()=> {
  	    // console.log("Audio successfully loaded.")
  	    this.callback();
  	  }).catch(function (error: any) {
  	    console.warn("Audio problem:", error);
  	  }));
  	}).catch(function (error: any) {
  	  console.warn("Audio problem:", error);
  	}));
  public init( visualObj, audioParams, callback ) :void{
  	this.audioParams = audioParams;
  	this.visualObj = visualObj;
  	this.callback = callback;
	  this.synth.init({ visualObj: visualObj }).then(()=> {
	    this.synthControl.setTune(visualObj, true, audioParams).then( ()=> {
	      // console.log("Audio successfully loaded.")
	      callback();
	    }).catch(function (error: any) {
	      console.warn("Audio problem:", error);
	    }));
	  }).catch(function (error: any) {
	    console.warn("Audio problem:", error);
	  }));
	
  public load( selector, cursorControl, visualOptions: any) {
	  this.synthControl.load( selector, cursorControl, visualOptions );
  public play() :void{
  	this.synthControl.play();
  public stop(): void{
  	this.synthControl.pause();
}
