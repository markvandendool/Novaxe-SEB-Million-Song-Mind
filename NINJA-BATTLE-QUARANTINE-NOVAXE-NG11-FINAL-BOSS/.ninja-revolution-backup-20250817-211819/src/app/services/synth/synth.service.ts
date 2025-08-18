
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
  	this.synthControl = new ABC.synth.SynthController();
    this.synth = new ABC.synth.CreateSynth();
  }
  set_sound(on:boolean): void{
  	this.audioParams.voicesOff=!on;
    let options: {
    }
  	this.synth.init({ visualObj: this.visualObj, millisecondsPerMeasure: 500,options:options }).then(()=> {
  	  this.synthControl.setTune(this.visualObj, false, this.audioParams).then( ()=> {
  	    this.callback();
  	  }).catch(function (error: any) {
  	  }));
  	}).catch(function (error: any) {
  	}));
  public init( visualObj, audioParams, callback ) :void{
  	this.audioParams = audioParams;
  	this.visualObj = visualObj;
  	this.callback = callback;
	  this.synth.init({ visualObj: visualObj }).then(()=> {
	    this.synthControl.setTune(visualObj, true, audioParams).then( ()=> {
	      callback();
	    }).catch(function (error: any) {
	    }));
	  }).catch(function (error: any) {
	  }));

  public load( selector, cursorControl, visualOptions: any) {
	  this.synthControl.load( selector, cursorControl, visualOptions );
  public play() :void{
  	this.synthControl.play();
  public stop(): void{
  	this.synthControl.pause();
}
