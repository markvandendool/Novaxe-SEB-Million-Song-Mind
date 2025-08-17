import { Injectable } from '@angular/core';
import { AudioPlayer } from '@services/audioplayer/audioplayer.service';
import { Songmodel } from '@models/songmodel/songmodel';
import { METERS, NB_BEATS } from '@models/songmodel/Meters';
// import { SelectionModel } from '@models/selectionmodel/selectionmodel';

@Injectable({
  providedIn: 'root'
})
export class BeatComputingService {

  constructor(private ap:AudioPlayer, private sm:Songmodel) { }


  setAllBeatsFromModel(){
    let P = this.sm.getParts();
    let m_nb = 0;
    let rpt_start=0;
    let rpt_end=Infinity;

    //add REPEAT region first
    // this.ap.addRegion({"measure_nb":'repeat',"start":rpt_start,"end":rpt_end});

    // For each part p of P ...
    for(let i = 0; i < P.length; i++){
      
      let p = P[i];

      p.init_missing_measures_meters();

      // console.log('%cPART : ','font-size:3em;color:red',i)
      // For each measure m of M ...
      let M = p.getMeasures();
      for(let j = 0; j < M.length; j++){
        let m = M[j];


        m_nb++;
        
        // get the audio region r of this measure.
        let r = m.getAudioRegion();
        if(r == null) continue;

        // get the meter of this measure
        let nb_beats = NB_BEATS[METERS.indexOf(m.getMeter())];


        // Get b_dur the duration of one beat.
        var m_dur = m.getAudioDuration();
        var b_dur = m_dur/nb_beats;

        m.setBeatsFromMeter();
        
        // should update beat position in model
        // for(let b=0; b < nb_beats; b++){
        //   let beat_name = "B_"+m_nb+"_"+(b+1);
        //   let b_pos = r.start + (b_dur*b);
        //   // console.log('beat_name => ',beat_name);
        //   // console.log('b_pos => ',b_pos);
        //   // console.log('b_dur => ',b_dur);

          
        //   let beat = m.getBeat(b)
          
        //   if(beat == null)debugger
        //   beat.setAudioRegion({"measure_nb":beat_name,"start":b_pos,"end":b_pos+b_dur});
          
        //   // this.ap.addRegion({"measure_nb":beat_name,"start":b_pos,"end":b_pos+b_dur});
        // }
      }
    }
  }
}
