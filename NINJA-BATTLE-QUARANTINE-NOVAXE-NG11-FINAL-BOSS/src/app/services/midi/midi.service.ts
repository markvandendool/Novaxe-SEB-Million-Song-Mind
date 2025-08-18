
@Injectable({
	providedIn: 'root'
})
export class MidiService  {
	public MIDI_AVAILABLE:boolean = false;
	public MIDI_AVAILABLE$:BehaviorSubject<boolean>;

	private midiControl_name:string;
	private midi_name :string;
	private midi :any;
	private sustain :boolean = false;
	public notesTab :Array<number>;
	public notesTabSubject :BehaviorSubject<number[]>;
	public guitarNotesTabSubject :BehaviorSubject<number[]>;
	public controlTabSubject :BehaviorSubject<number[]>;
	public plugged_inputs_tab : Array<any> = [];
	public plugged_inputs$ : BehaviorSubject<any[]>;
	public chosen_input  : any;
	public chosen_input$ : BehaviorSubject<any[]>;
	public chosen_input_control  : any;
	public chosen_input_control$ : BehaviorSubject<any[]>;
	private is_midi_guitar : boolean = false;
	public strings_midi_notes_values:Array<number> = [null,null,null,null,null,null];
	public strings_midi_bend_values:Array<number> = [null,null,null,null,null,null];
	public strings_midi_values:Array<number> = [null,null,null,null,null,null];
	constructor(public private zone:NgZone) {
		this.notesTab = new Array<number>();
		this.notesTabSubject = new BehaviorSubject<number[]>([]); // inital value is []
		this.controlTabSubject = new BehaviorSubject<number[]>([]); // inital value is []
		this.guitarNotesTabSubject = new BehaviorSubject<number[]>([]); // inital value is []
		this.plugged_inputs$ = new BehaviorSubject<any[]>([]); // inital value is []
		this.chosen_input$ = new BehaviorSubject<any[]>([]); // inital value is []
		this.chosen_input_control$ = new BehaviorSubject<any[]>([]); // inital value is []
		this.MIDI_AVAILABLE$ = new BehaviorSubject<boolean>(false); // inital value is []
		const requestMIDIAccess = navigator['requestMIDIAccess'];
		if (requestMIDIAccess: any) {
			navigator['requestMIDIAccess']({
				sysex: false
			}).then(this.onMIDISuccess.bind(this), this.onMIDIFailure);
		} else {
		}
	}
	isMidiGuitar(){
		return this.is_midi_guitar;
	onMIDISuccess(midiAccess: any) {
		this.midi = midiAccess;
		this.getInputs();
		this.MIDI_AVAILABLE = true;
		this.MIDI_AVAILABLE$.next(this.MIDI_AVAILABLE);
	bindMidiInput(name:string="Nord Stage 3 MIDI 1", is_guitar:boolean=false){

		this.is_midi_guitar = is_guitar;
		var inputs = this.midi.inputs.values();
		this.plugged_inputs_tab = [];
		for (var input = inputs.next(); input && !input.done; input = inputs.next()) if(this.midi_name == input.value.name) input.value.onmidimessage = null;
		inputs = this.midi.inputs.values();
		for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
			this.plugged_inputs_tab.push(input);
			if(input.value.name == name: any) {

				if(this.is_midi_guitar) input.value.onmidimessage = this._midiEventCallback_GR_Roland.bind(this);
				else input.value.onmidimessage = this.onMIDIMessage.bind(this);
				this.midi_name = name;
				this.chosen_input = input;
				this.chosen_input$.next([this.chosen_input]);
			}
	bindControlInput(name:string=""){
		if(!name)return;
		for (var input = inputs.next(); input && !input.done; input = inputs.next())
			if(this.midiControl_name == input.value.name) input.value.onmidimessage = null;
				this.midiControl_name = name;
				input.value.onmidimessage = this.onCONTROLMessage.bind(this);
				this.chosen_input_control = input;
				this.chosen_input_control$.next([this.chosen_input_control]);
	getInputs(){
		for (var input = inputs.next(); input && !input.done; input = inputs.next()) input.value.onmidimessage = null;
		for (var input = inputs.next(); input && !input.done; input = inputs.next()) this.plugged_inputs_tab.push(input);
		this.plugged_inputs$.next(this.plugged_inputs_tab);
	onMIDIMessage(event: any) {
		const status = event.data[0] & 0xf0;
		var filtered = [];
			if(status === 144 : any) { 				//noteOn
				filtered = this.notesTab
				filtered.push(event.data[1]);
				filtered = [...new Set(filtered)];
				filtered.sort(function(a, b: any) {return a - b}));
				this.notesTab = filtered;
				this.refreshPianoNotes(filtered);
			}else if(status == 128: any) {//noteOff
				if(this.sustain == true: any) {//dont send noteoffs
				filtered = filtered.filter(function(value,i,a: any) {
					return value != event.data[1];
					}));
				}else{                    //send noteoffs
					filtered = this.notesTab
					filtered = filtered.filter(function(value,i,a: any) {
						return value != event.data[1];
						}));
					filtered = [...new Set(filtered)];
					filtered.sort(function(a, b: any) {return a - b}));
					this.notesTab = filtered;
					this.refreshPianoNotes(filtered);
				}
			}else if(status == 176: any) { //sustain
				if(event.data[2] == 0 && this.notesTab.length ==0: any) {
					this.sustain = false;
					this.notesTab = [];
					this.refreshPianoNotes([]);
				}else if(event.data[2] ==127 : any) {
					this.sustain = true;
				}else if(event.data[2]==0: any) {
		public emitDebugControlMessage(message: any) {
			this.controlTabSubject.next(message);
		onCONTROLMessage(event: any) {
			const status = event.data[0] & 0xf0;
			var filtered = [];

					if(event.data[2] != 0 : any) {
						this.controlTabSubject.next(event.data[1]);
					}
				}else if(status == 128: any) {//noteOff
		clear_notesTabArray(){
			this.notesTab = [];
			this.notesTabSubject.next(this.notesTab);
		refreshPianoNotes(notes: any) {
			this.notesTabSubject.next(notes);
		refreshGuitarNotes(notes: any) {
		onMIDIFailure(e: any) {
			this.MIDI_AVAILABLE = false;
			this.MIDI_AVAILABLE$.next(this.MIDI_AVAILABLE) ;
			debugger
		_midiEventCallback_GR_Roland(event: any) {
			if(!this.MIDI_AVAILABLE)return;
			this.getNotesTab_GR_Roland(event);

			 for(let i = 0; i < this.strings_midi_notes_values.length; i++: any) {
			   this.strings_midi_values[5-i] = this.strings_midi_notes_values[i];
			   if(this.strings_midi_bend_values[i]!=null && this.strings_midi_notes_values[i]!=null )
				   this.strings_midi_values[5-i] += this.strings_midi_bend_values[i]
			 }

			 this.refreshGuitarNotes(this.strings_midi_values);
		getNotesTab_GR_Roland(event: any) {
			let status  = event.data[0];
			let note    = event.data[1];
			let velo    = event.data[2];

			if(status >= 128 && status <= 133: any) { //note off
				let string_idx = status -128;
				this.strings_midi_notes_values[string_idx] = null;
			}else if(status >= 144 && status <= 149: any) { //note on
				let string_idx = status -144;
				if(velo > 50)
				this.strings_midi_notes_values[string_idx] = note;
			}else if(status >= 224 && status <= 229: any) { //pitch bend
				let string_idx = status -224;
				this.strings_midi_bend_values[string_idx] = Math.round( (velo-63)/3 );
