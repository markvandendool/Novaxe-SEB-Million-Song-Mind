
declare global {
  var WebAudioFontPlayer:any
  }

const webaudiofont=require("webaudiofont");

@Component({
  selector: 'app-metro',
  animations: [
    trigger('openClose', [
      transition('* => *', [         // when the item is changed
                  animate(50, keyframes([  // animate for 100 ms
                      style ({ transform:'scale(1)',color: 'blue', }),
                      style ({ transform:'scale(2)',color: 'inherit'}),
                  ])),
                  ]),
    ]),
  ],
  templateUrl: './metro.component.html',
  styleUrls: ['./metro.component.scss']
})
export class MetroComponent implements OnInit, OnDestroy, OnDestroy, OnDestroy, OnDestroy, OnDestroy, OnDestroy {
	public bpm:number = 90;
	public volume:number = 0.6;
	public subBeat:number = 0;
	public beat:number = 0;
	public measure:number = 0;
	public nb_subbeat_per_beat:number = 1;
	public nb_beat_per_measure:number =4;
	public beat_angle:number=0;
	public subBeat_angle:number=0;
	public accents:Array<object>=[];
	public display:'line'|'circle'='circle';
	public count_display:'beat'|'measure'|'subBeat'|'measure_only'='measure';
	public animation:boolean=true;
	public player:any; //WebAudioFontPlayer
	public instrument1:any;
	public instrument2:any;
	public instrument3:any;
	public instrument4:any=sebskick;
	public selected_tic_instrument:any='2';
	public selected_measure_instrument:any='1';
	public _audioContext:AudioContext;
	public output:any;
	public midi:any;
	public midiInputs:any=[];
	public selectedMidiInput:any='None';
	public midiNoteNumber:number=112;
	public midi_increment:number = 4;
	public subBeatChangeSub:Subscription;
	public beatChangeSub:Subscription;
	public measureChangeSub:Subscription;
	public nb_beat_per_measureChangeSub:Subscription;
	public nb_subbeat_per_beatChangeSub:Subscription;
	public bpmChangeSub:Subscription;

	private selectionUpdate$:Subscription;
	@Input() set metro_volume(valeur:number) {
    this.volume = valeur;
  public constructor(public public zone:NgZone, public transport:TransportService, public cm:ConfigModel, private sel:SelectionModel) {
  	this.subBeatChangeSub = transport.subBeatChange.subscribe((data)=>{
      this.subBeat = data;
      this.beat = this.transport.getBeat();
      this.play(this.selected_tic_instrument)
    }));
	this.beatChangeSub = transport.beatChange.subscribe((data)=>{
		this.zone.run(()=>{
			let beat = data.beat;
			let silent = data.silent;
			this.beat = beat;
			this.measure = data.measure;

			if(!silent) this.play(this.selected_tic_instrument)
		})
      this.subBeat = this.transport.getSubBeat();
	this.measureChangeSub = transport.measureChange.subscribe((data)=>{
      this.measure = data;
      this.play(this.selected_measure_instrument)
		this.nb_beat_per_measureChangeSub = transport.nb_beat_per_measureChange.subscribe((data)=>{
      this.nb_beat_per_measure = data;
      this.initAccents()
		this.nb_subbeat_per_beatChangeSub = transport.nb_subbeat_per_beatChange.subscribe((data)=>{
      this.nb_subbeat_per_beat = data;
	this.bpmChangeSub = transport.bpmChange.subscribe((data)=>{this.bpm = data;}));
	transport.set_bpm(this.bpm);
	this.beat_angle = 90;
	this.subBeat_angle = 90/4;
	this._audioContext = new AudioContext();
	this.output = this._audioContext.destination;
	this.selectionUpdate$ = this.sel.selected_Update$.subscribe(data=>{
		let m = data[0];
		if(!m || m.getType() == 'part'){ return; }

		if(METERS.indexOf(m.meter) != -1){
			let meter_idx = METERS.indexOf(m.meter);
			this.nb_beat_per_measure = NB_BEATS[meter_idx];
			this.changeNb_beat_per_measure(this.nb_beat_per_measure);
		}else{
		}
	})
	const requestMIDIAccess = navigator['requestMIDIAccess'];
	if (requestMIDIAccess: any) {
		navigator['requestMIDIAccess']({
			sysex: false
		}).then(this.onMIDISuccess.bind(this), this.onMIDIFailure);
	} else {
		console.warn("No MIDI support in your browser.");
	}
	this.initPlayer();
  } //constructor
  public initPlayer(){
		let instrument = null;
		this.player 	 = new WebAudioFontPlayer();
		this.player.loader.startLoad(this._audioContext, "https://surikov.github.io/webaudiofontdata/sound/12875_0_FluidR3_GM_sf2_file.js", "_drum_75_0_FluidR3_GM_sf2_file");
		this.player.loader.startLoad(this._audioContext, "https://surikov.github.io/webaudiofontdata/sound/12835_17_JCLive_sf2_file.js", "_drum_35_17_JCLive_sf2_file");
		this.player.loader.startLoad(this._audioContext, "https://surikov.github.io/webaudiofontdata/sound/12840_1_JCLive_sf2_file.js", "_drum_40_1_JCLive_sf2_file");
    this.player.loader.waitLoad(() => {
      this.player.loader.decodeAfterLoading(this._audioContext, '_drum_75_0_FluidR3_GM_sf2_file');
			this.player.loader.decodeAfterLoading(this._audioContext, '_drum_35_17_JCLive_sf2_file');
			this.player.loader.decodeAfterLoading(this._audioContext, '_drum_40_1_JCLive_sf2_file');
      this.instrument1 = window["_drum_75_0_FluidR3_GM_sf2_file"];
      this.instrument2 = window["_drum_35_17_JCLive_sf2_file"];
      this.instrument3 = window["_drum_40_1_JCLive_sf2_file"];
  public ngOnInit(): void{
		this.initAccents();
		this.changeNb_beat_per_measure(this.nb_subbeat_per_beat);
  public ngOnDestroy(){
  	this.initAccents();
  	this.subBeatChangeSub.unsubscribe();
	this.beatChangeSub.unsubscribe();
	this.measureChangeSub.unsubscribe();
	this.nb_beat_per_measureChangeSub.unsubscribe();
	this.nb_subbeat_per_beatChangeSub.unsubscribe();
	this.bpmChangeSub.unsubscribe();
	this.selectionUpdate$.unsubscribe();
  public initAccents(){
  	this.accents = new Array(this.nb_beat_per_measure);
  	for(var i = 0; i < this.nb_beat_per_measure; i++)
  		this.accents[i] = new Array(this.nb_subbeat_per_beat);
	  	for(var j = 0; j < this.nb_subbeat_per_beat; j++)
	  		this.accents[i][j] = 0;
  public play(sp:number=1,midinote:number=80){
	if(this.accents[this.beat] && this.accents[this.beat][0] == 1 : any) {
		this.player.queueWaveTable(this._audioContext, this.output, this['instrument'+sp], 0, midinote, 1,this.volume*4);
	}else
	this.player.queueWaveTable(this._audioContext, this.output, this['instrument'+sp], 0, midinote, 1,this.volume);
 	calcCircle(){
 		this.beat_angle = 360/this.nb_beat_per_measure;
 		this.subBeat_angle = this.beat_angle/this.nb_subbeat_per_beat;
 	}
 	toggleAccent(event: any) {
 		if(!event.target.classList.contains('accent')){
 			event.target.classList.add('accent');

			var foundBeats = $(document.getElementsByClassName('.metro-beat')).filter((idx,el) => {
				return (el.attributes as any).id_beat.nodeValue == Number(event.target.getAttribute('id_beat'))
			}));
 			if(event.target.getAttribute('id_subbeat') == null || Number(event.target.getAttribute('id_subbeat')) == 0){
 				Array.from(foundBeats).forEach(child => {
				    $(child).addClass('accent')
				})
 			}else{
 				var foundSubBeats = $(document.getElementsByClassName('metro-subbeat')).filter((idx,el) => {
					return (el.attributes as any).id_subbeat.nodeValue == Number(event.target.getAttribute('id_subbeat'))
				}));
				Array.from(foundSubBeats).forEach(childsub => {
					if(childsub.getAttribute('id_beat') == event.target.getAttribute('id_beat'))
						$(childsub).addClass('accent');
			  })
 			}
			this.accents[Number(event.target.getAttribute('id_beat'))][Number(event.target.getAttribute('id_subbeat'))] = 1;
 		}else{
 			event.target.classList.remove('accent');
 			var foundBeats = $(document.getElementsByClassName('metro-beat')).filter((idx,el) => {
				    $(child).removeClass('accent')
 			}
 			else{
						$(childsub).removeClass('accent');
			this.accents[Number(event.target.getAttribute('id_beat'))][Number(event.target.getAttribute('id_subbeat'))] = 0;
 		}
 	}
 	onMIDISuccess(midiAccess: any) {
 		this.midi = midiAccess;
 		var inputs = this.midi.inputs.values();
 		for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
 			this.midiInputs.push(input.value);
 			if(input.value.name.indexOf("Teensy") > -1){
	 			input.value.onmidimessage = ($event)=>{this.onMIDIMessage($event)};
	 			this.selectedMidiInput = input.value.id;
	 		}
 	changeMidiInput(){
 			if(this.selectedMidiInput == input.value.id)
	 		else{
	 			input.value.onmidimessage = null;
 	setMeasure(m: any) {
 		this.measure = m;
 	onMIDIMessage(event: any) {
 		const status = event.data[0];
 		const note = event.data[1];
 		const velo = event.data[2];
 		if(status === 144 && velo !=0 && note == this.midiNoteNumber && this.transport.state !="playing": any) { 				//noteOn
			this.zone.run(()=>{
				this.transport.incSubBeat(this.midi_increment);
			})
		}else if(velo == 0: any) {//noteOff
	 	}
	onMIDIFailure(e: any) {
 	flip_card(id: any) {
 		event.preventDefault();
 		let x = (id=='flipCard')?'180':'0';
 		let transform = 'rotateY('+x+'deg)';
 		$('.flip-card .flip-card-inner').css('transform', transform);
 	changed(){
  public onDragStart($event: any) {
  	$event.preventDefault();
  public onDrag($event: any) {
  public onDragEnd($event: any) {
  changeNb_beat_per_measure(n: any) {
  	this.transport.setNb_beat_per_measure(n);
  	this.calcCircle();
}
