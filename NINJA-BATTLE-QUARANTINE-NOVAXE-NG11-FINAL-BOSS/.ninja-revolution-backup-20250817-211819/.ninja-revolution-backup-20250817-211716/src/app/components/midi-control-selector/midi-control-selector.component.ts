
@Component({
  selector: 'app-control-selector',
  templateUrl: './midi-control-selector.component.html',
  styleUrls: ['./midi-control-selector.component.scss']
})
export class MidiControlSelectorComponent implements OnDestroy {
	private plugged_inputs$:Subscription;
  private chosen_input$:Subscription;
	private midi_available$:Subscription;
  private midi_is_ready:boolean = false;
  public midi_ports:any=[];
  public selected_midi:string='';
  @Output() hasChanged = new EventEmitter<string>();
  public constructor(public  private midi: MidiService, private zone:NgZone, private cm:ConfigModel ) {
  	this.plugged_inputs$ = this.midi.plugged_inputs$.subscribe((data)=>{
      this.midi_ports = data;
  	}));

    this.midi_available$ = this.midi.MIDI_AVAILABLE$.subscribe((data)=>{
      if(data == false)return;
      this.midi_is_ready  = true;

      this.rebind_midi();
    }));
    this.chosen_input$ = this.midi.chosen_input_control$.subscribe((data)=>{
      if(!data.length) return;
      this.zone.run(()=>{
        this.cm.setControlInputSelected(data[0].value.name);
        this.selected_midi = data[0].value.name;
      })
  }
  public ngOnDestroy(){
    this.chosen_input$.unsubscribe();
    this.midi_available$.unsubscribe();
    this.plugged_inputs$.unsubscribe();
  rebind_midi(){
    if(this.cm.getControlInputSelected() != '') {
      let is_guitar = this.cm.is_midi_guitar();
      this.midi.bindControlInput(this.cm.getControlInputSelected());
    }
  change_midi_port(event): void {
    let is_guitar = this.cm.is_midi_guitar();
    this.midi.bindControlInput(event.target.value);
    this.hasChanged.emit('changed');
}
