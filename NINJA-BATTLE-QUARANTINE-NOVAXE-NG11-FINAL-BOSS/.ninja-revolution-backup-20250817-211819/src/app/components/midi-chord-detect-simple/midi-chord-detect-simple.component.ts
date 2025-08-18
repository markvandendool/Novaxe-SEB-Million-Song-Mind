
@Component({
	selector: '[app-midi-chord-detect-simple]',
	templateUrl: './midi-chord-detect-simple.component.html',
	styleUrls: ['./midi-chord-detect-simple.component.scss']
})
export class MidiChordDetectSimpleComponent  {
	public divHidden = false;
	public chord_name:string="";
	@Input() color:string="black"
	@Input() set midi_chord(valeur: any) {

		if(valeur.chords.length == 0) this.chord_name = '';
		else this.chord_name = valeur.chords[0]; // avant j'utilisais mu.getChord(notes,this.tonality) qui renvoyait un oject plus complet.
	  }
	constructor(public private zone:NgZone) { }
ngOnDestroy(){ }
}
