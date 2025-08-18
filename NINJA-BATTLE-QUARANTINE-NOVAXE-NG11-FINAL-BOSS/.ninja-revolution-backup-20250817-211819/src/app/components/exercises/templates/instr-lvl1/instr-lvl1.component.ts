
@Component({
  selector: 'app-instr-lvl1',
  templateUrl: './instr-lvl1.component.html',
  styleUrls: ['./instr-lvl1.component.scss']
})
export class InstrLvl1Component implements OnInit, OnDestroy, OnDestroy, OnDestroy, OnDestroy, OnDestroy, AfterViewInit  {
	@Output() askNext     = new EventEmitter<boolean>(); //output answer
	public receivedData:any;
  private midiNotesTab$:Subscription;
  public constructor(public private midi:MidiService, private zone:NgZone) { }
  public ngOnInit(): void: void {
    this.midiNotesTab$ = this.midi.notesTabSubject.subscribe((data)=>{
      if(!data.length)return;
      this.zone.run(()=>{this.start();}));
    }));
  }
  public ngAfterViewInit(): void {
    setTimeout(()=>{
      $("#start_button").focus();
    },10);
    $('.preload').attr('src', function(i,a: any) {
            $(this).attr('src','')
                .removeClass('preload')
                .attr('src',a);
        }));
  public start():void{
  	this.askNext.emit(true);
}
