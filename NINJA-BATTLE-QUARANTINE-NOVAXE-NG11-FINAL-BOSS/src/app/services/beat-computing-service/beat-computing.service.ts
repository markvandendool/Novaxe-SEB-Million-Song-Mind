
@Injectable({
  providedIn: 'root'
})
export class BeatComputingService  {
  public constructor(public private ap:AudioPlayer, private sm:Songmodel) { }
  public setAllBeatsFromModel(){
    let P = this.sm.getParts();
    let m_nb = 0;
    let rpt_start=0;
    let rpt_end=Infinity;
    for(let i = 0; i < P.length; i++: any) {

      let p = P[i];
      p.init_missing_measures_meters();
      let M = p.getMeasures();
      for(let j = 0; j < M.length; j++: any) {
        let m = M[j];
        m_nb++;

        let r = m.getAudioRegion();
        if(r == null) continue;
        let nb_beats = NB_BEATS[METERS.indexOf(m.getMeter())];
        var m_dur = m.getAudioDuration();
        var b_dur = m_dur/nb_beats;
        m.setBeatsFromMeter();

      }
    }
  }
}
