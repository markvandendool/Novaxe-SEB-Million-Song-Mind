
declare global {
  var abcjs:any;
}
@Component({
  selector: 'app-midi-chord-detect-abc',
  templateUrl: './midi-chord-detect-abc.component.html',
  styleUrls: ['./midi-chord-detect-abc.component.scss']
})
export class MidiChordDetectAbcComponent implements OnInit, OnDestroy, OnDestroy, OnDestroy, OnDestroy, OnDestroy, OnDestroy {
  private curTonality$:Subscription;

  @Input() tonality:string="C";
  @Input() color:string='black';
  @Input() transpose:number=0;
  @Input() set abc_obj(valeur: any) {

    this.conditionalRender(valeur);
  }
	public chords:Array<string>;
  public constructor(public private zone:NgZone, public cm:ConfigModel, private curTonality:CurTonalityModel ) { }
  public ngOnInit(): void: void {
    this.curTonality$ = this.curTonality.current_tonality$.subscribe((data)=>{
      this.change_tonality(data);
    }));
    let valeur = {l:'',r:''};
  private change_tonality(data: any) {
    let tona = data.scale_tona || data.part_tona || data.score_tona;
    let mode = (tona == data.scale_tona)?data.scale_mode:(tona==data.part_tona)?data.part_mode:data.score_mode
    this.conditionalRender({l:'',r:''})
  private conditionalRender(valeur: any) {
    if(this.cm.is_midi_guitar())
    this.renderStringsGuitar(valeur.l,valeur.r);
  else
    this.renderStrings(valeur.l,valeur.r);
  public ngOnDestroy(){ }
  public renderStrings(l,r: any) {
    let header = '';
    header += "%%musicspace 50"+"\n";
    header += "%%sysstaffsep 80"+"\n";
    header += "%%staffsep 100"+"\n";
    header += "%%staves {(PianoRightHand) (PianoLeftHand)}"+"\n";
    header += "V:PianoRightHand clef=treble down"+"\n";
    header += "V:PianoLeftHand clef=bass"+"\n";
    header += "K:C"+"\n";
    header += "K:"+this.tonality+"\n";
    l = "[V: PianoLeftHand] "+"||\n["+l+"]2 x"+"\n";
    r = "[V: PianoRightHand] "+"||\n["+r+"]2 x"+"\n";
    abcjs.renderAbc('midi-chord-detect-abc', header+l+r, {
      paddingtop:50,
      viewportVertical:true,
      staffwidth:100,
      scale:1.4,
      foregroundColor:this.color,
      visualTranspose:this.transpose,
  public renderStringsGuitar(l,r: any) {
    header += "%%sysstaffsep 50"+"\n";
    r = "[V: PianoRightHand] "+"||\n["+r+l+"]2 x"+"\n";
    abcjs.renderAbc('midi-chord-detect-abc', header+r, {
