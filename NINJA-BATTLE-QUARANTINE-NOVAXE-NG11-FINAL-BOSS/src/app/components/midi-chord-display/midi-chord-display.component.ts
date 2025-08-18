
declare var $: any;
@Component({
  selector: 'app-midi-chord-display',
  templateUrl: './midi-chord-display.component.html',
  styleUrls: ['./midi-chord-display.component.scss']
})
export class MidiChordDisplayComponent implements OnInit  {
  @Input() set display( val:boolean ){
    this.visible = val;
  }
  @Input() set midi_chord( val:boolean ){
    this.cur_midi_chord = val;
  @Input() set midi_abc( val:boolean ){
    this.cur_midi_abc = val;
  @Output() visibleState = new EventEmitter<boolean>();
  public visible:boolean = false;
  public cur_midi_chord:any ;
  public cur_midi_abc:any = null;

  public constructor(public  public cm:ConfigModel) { }
  public ngAfterViewInit(){
    $("#midi-chord-display").draggable({
      handle: "#nvxMidi-chord-display"
    }));
  public ngOnInit(): void: void {
  public close(){
    this.visible = false;
    this.visibleState.emit(false)
  public outputVisible(state:boolean){
    this.visibleState.emit(state);
}
