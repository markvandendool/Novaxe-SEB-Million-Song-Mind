
declare global {
  var Soundfont:any;
}
@Injectable({
  providedIn: 'root'
})
export class SoundfontService  {
  public piano:any;
  public audioCtx:any;
  public constructor(public ) {
    this.audioCtx = new AudioContext();
    Soundfont.instrument(this.audioCtx, 'acoustic_grand_piano').then((piano)=> {
      this.piano = piano;
    }));
  }
  public playNote(note:string){
    let time = this.audioCtx.currentTime;
    let duration = { duration: 0.8};
    let options = {};
    this.piano.play(note, time, duration, options);
  public playMidiNote(note:number){
