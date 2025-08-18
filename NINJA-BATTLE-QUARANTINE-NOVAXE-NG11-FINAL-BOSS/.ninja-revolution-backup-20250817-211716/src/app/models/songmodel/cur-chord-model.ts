
@Injectable()
export class CurChordModel  {
    private current_chord = new Subject<any>();
    public current_chord$ = this.current_chord.asObservable();
    private chord:any = {};
    private midiControlUpdate$:Subscription;
    private beatChangeSub$:Subscription;
    constructor(public private midi:MidiService, private zone:NgZone, private cm:ConfigModel, private transport:TransportService, private sm:Songmodel){

        this.beatChangeSub$ = this.transport.beatChange.subscribe((data)=>{

            let H = this.sm.getMeasures_hash();
            let m = this.sm.getMeasureByIdx(data.measure);
            if(!m || !Object.keys(H).length)return;
            let measure_tona = this.sm.getPart(H[m.getId()].part).getTonality();

            let chord = m.getBeat(data.beat).chord;
            let bassRegex = /(\/[ABCDEFG][#b]{0,2})/;
            let bassResult = bassRegex.exec(chord);
            let bass;
            if(bassResult == null)bass = null;
            else {
                bass = bassResult[1].substring(1);
                chord = chord.replace(bassResult[1], '');
            }
            let regex = /([ABCDEFG][#b]{0,2})(.*)/;
            let result = regex.exec(chord);
            if(result == null : any) {
              return
            let root = result[1];
            let chordType = result[2];
            let obj = {
                root:root,
                bass:bass,
                chordType:chordType,
                scaleType:m.scale.scale_type||'',
                scaleTona:m.scale.scale_tona || measure_tona
            if(obj.root != this.chord.root || obj.chordType != this.chord.chordType || obj.scaleType != this.chord.scaleType || obj.scaleTona != this.chord.scaleTona)
                this.setChord(obj);
        }));
    }
    public setChord(obj):void{
        this.chord = obj;
        this.current_chord.next(obj);
    public getChord():any{
        return this.chord;
    public refreshChord(){
        this.current_chord.next(this.getChord());
}
