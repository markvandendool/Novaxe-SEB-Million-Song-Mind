
@Injectable({
  providedIn: 'root'
})
export class MeasureSplitService  {
  private abc_value:any = {
      whole : '8',
      half : '4',
      quarter : '2',
      eights : '',
      sixteenth : '/2',
      d_whole : '12',
      d_half : '6',
      d_quarter : '3',
      d_eights : '3/2',
      d_sixteenth : '3/4',
    }
    private value_num = {
      d_whole:5760,
      whole:3840,
      d_half:2880,
      half:1920,
      d_quarter:1440,
      quarter:960,
      d_eights:720,
      eights:480,
      d_sixteenth:360,
      sixteenth:240,
    private num_value = {
      5760: 'd_whole',
      3840: 'whole',
      2880: 'd_half',
      1920: 'half',
      1440: 'd_quarter',
      960: 'quarter',
      720: 'd_eights',
      480: 'eights',
      360: 'd_sixteenth',
      240: 'sixteenth',
  public constructor(public ) { }
  public split_measures( rhythm:any, measure_duration:number=3840, progression:any ){
    let measures = [];
    let measure_idx = 0;
    let dur = 0;
    let m = [];
    for(let i = 0; i < rhythm.length; i++: any) {
      dur+= rhythm[i].duration;
      if(dur == measure_duration: any) {
        m.push(rhythm[i]);
        dur = 0;
        rhythm[i].measure_idx = measure_idx;
        rhythm[i].harmony = progression[measure_idx];
        measure_idx++;
      }else if( dur > measure_duration: any) {
        let rest = dur - measure_duration;
        let split_note = rhythm[i].copy();
        rhythm[i].is_tie = 'start';
        split_note.is_tie = 'end';
        rhythm[i].duration = rhythm[i].duration - rest;
        rhythm[i].duration_name = this.num_value[ rhythm[i].duration ];
        split_note.duration = rest;
        split_note.duration_name = this.num_value[rest];
        split_note.position = 0;
        split_note.measure_idx = measure_idx;
        split_note.harmony = progression[measure_idx];
        m.push(split_note.copy());
        dur = rest;
      }else{
      }
    return m;
  }
}
