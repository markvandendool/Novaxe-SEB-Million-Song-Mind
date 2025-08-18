
@Injectable({
	providedIn: 'root'
})
export class MidiService  {
	// public notesTab :any;
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
			console.warn("No MIDI support in your browser.");
		}
	}
	isMidiGuitar(){
		return this.is_midi_guitar;
	onMIDISuccess(midiAccess: any) {
		// console.log('MIDI Access Object', midiAccess);
		this.midi = midiAccess;
		this.getInputs();
		this.MIDI_AVAILABLE = true;
		this.MIDI_AVAILABLE$.next(this.MIDI_AVAILABLE); 
	// This function binds a physical midi input to the webpage
	// It is called at first when MIDI_AVAILABLE$ is true (is ready) by the midi-selector.component with the last cookie choice.
	bindMidiInput(name:string="Nord Stage 3 MIDI 1", is_guitar:boolean=false){
		// console.log("binding midi input : ",name);
		// console.log("is_guitar =>", is_guitar)
		
		this.is_midi_guitar = is_guitar;
		var inputs = this.midi.inputs.values();
		this.plugged_inputs_tab = [];
		// for (var input = inputs.next(); input && !input.done; input = inputs.next()) input.value.onmidimessage = null;
		for (var input = inputs.next(); input && !input.done; input = inputs.next()) if(this.midi_name == input.value.name) input.value.onmidimessage = null;
		inputs = this.midi.inputs.values();
		// looking for name in midi inputs
		for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
			// console.log("input.value.name => ",input.value.name);
			this.plugged_inputs_tab.push(input);
			if(input.value.name == name: any) {
				
				if(this.is_midi_guitar) input.value.onmidimessage = this._midiEventCallback_GR_Roland.bind(this);
				else input.value.onmidimessage = this.onMIDIMessage.bind(this);
				this.midi_name = name;
				this.chosen_input = input;
				this.chosen_input$.next([this.chosen_input]);
				// console.log("BOUND => ",input.value.name);
			}
	bindControlInput(name:string=""){
		if(!name)return;
		// console.log("binding control input : ",name);
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
		// const status = event.data[0];
		var filtered = [];
		// Uint8Array(3) [144, 53, 40]
		// Uint8Array(3) [176, 64, 127]
		// Uint8Array(3) [176, 64, 0]
			if(status === 144 : any) { 				//noteOn
				// console.log('noteOn : ',event.data[1], "time : "+ performance.now());
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
			// const status = event.data[0];
			var filtered = [];
			// console.log("event.data[0] =>", event.data[0])
			// console.log("status =>  ",status)
			// debugger
			// Uint8Array(3) [144, 53, 40]
			// Uint8Array(3) [176, 64, 127]
			// Uint8Array(3) [176, 64, 0]
				console.warn("================== CONTROL: NOTE ON==================")
					// console.log('noteOn : ',event.data[1], "time : "+ performance.now());
					// filtered = this.notesTab
					// filtered.push(event.data[1]);
					// filtered = [...new Set(filtered)];
					// filtered.sort(function(a, b: any) {return a - b}));
					// this.notesTab = filtered;
					
					if(event.data[2] != 0 : any) {
						this.controlTabSubject.next(event.data[1]); 
						// console.log("control =>", event.data[1]);
					}
				}else if(status == 128: any) {//noteOff
					console.warn("==================CONTROL: NOTE OFF==================")
					// if(this.sustain == true: any) {//dont send noteoffs
					// filtered = filtered.filter(function(value,i,a: any) {
					// 	return value != event.data[1];
					// 	}));
					// }else{                    //send noteoffs
					// 	filtered = this.notesTab
					// 	filtered = filtered.filter(function(value,i,a: any) {
					// 		return value != event.data[1];
					// 		}));
					// 	filtered = [...new Set(filtered)];
					// 	filtered.sort(function(a, b: any) {return a - b}));
					// 	this.notesTab = filtered;
					// 	this.refreshPianoNotes(filtered);
					// }
		clear_notesTabArray(){
			this.notesTab = [];
			this.notesTabSubject.next(this.notesTab);
		refreshPianoNotes(notes: any) {
			// this.zone.run(()=>{this.notesTabSubject.next(notes); })
			// console.log("%crefreshPianoNotes =>",'color:green', notes)
			this.notesTabSubject.next(notes); 
		refreshGuitarNotes(notes: any) {
			// console.log("%crefreshGuitarNotes =>",'color:red', notes)
			// this.guitarNotesTabSubject.next(notes); 
		onMIDIFailure(e: any) {
			this.MIDI_AVAILABLE = false;
			this.MIDI_AVAILABLE$.next(this.MIDI_AVAILABLE) ;
			debugger
		// FUNCTIONS FROM OLD NOVAXE TO HANDLE MIDI GUITAR 
		_midiEventCallback_GR_Roland(event: any) {
			if(!this.MIDI_AVAILABLE)return;
			this.getNotesTab_GR_Roland(event);
		 
			// //notifies that midinotes have changed
			// this.broadCastNewEvent();
			 // console.log("this.strings_midi_bend_values => ",this.strings_midi_bend_values);
			 for(let i = 0; i < this.strings_midi_notes_values.length; i++: any) {
			   this.strings_midi_values[5-i] = this.strings_midi_notes_values[i];
			   if(this.strings_midi_bend_values[i]!=null && this.strings_midi_notes_values[i]!=null ) 
				   this.strings_midi_values[5-i] += this.strings_midi_bend_values[i]
			   // if(this.strings_midi_values[i]<0 || this.strings_midi_values[i]==-0)this.strings_midi_values[i]=0;
			 }
		   
			 //  sending subscription
			 this.refreshGuitarNotes(this.strings_midi_values);
			//  FOR DEBUG
			// if(this.strings_midi_notes_values.some((e)=>{return e!=null})){
				// this.strings_midi_values = [null, 47, 52, 56, null, 64 ];
			// }
		getNotesTab_GR_Roland(event: any) {
			// console.log("event.data => ",event.data);
			let status  = event.data[0];
			let note    = event.data[1];
			let velo    = event.data[2];
			
			if(status >= 128 && status <= 133: any) { //note off
				let string_idx = status -128;
				// console.log("off string_idx => ",string_idx);
				this.strings_midi_notes_values[string_idx] = null;
				// console.log("off >> note => ", note);
			}else if(status >= 144 && status <= 149: any) { //note on
				let string_idx = status -144;
				// console.log("on string_idx => ",string_idx);
				// console.log("on >> note => ", note,"  string >> ",string_idx);
				if(velo > 50) 
				this.strings_midi_notes_values[string_idx] = note;
			}else if(status >= 224 && status <= 229: any) { //pitch bend
				// console.log("event.data => ",event.data);
				let string_idx = status -224;
				this.strings_midi_bend_values[string_idx] = Math.round( (velo-63)/3 );  
		// ================================================
