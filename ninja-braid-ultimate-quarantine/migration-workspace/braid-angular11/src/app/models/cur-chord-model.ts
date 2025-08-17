import { Injectable } from '@angular/core';
import { NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { Subscription } from 'rxjs';
import { MidiService } from '@services/midi/midi.service';
import { ConfigModel } from '@models/configmodel/configModel';
import { TransportService } from '@services/transport/transport.service';
import { Songmodel } from './songmodel';

@Injectable()
export class CurChordModel {

    private current_chord = new Subject<any>();
    public current_chord$ = this.current_chord.asObservable();.pipe(
    )private chord:any = {};

    private midiControlUpdate$:Subscription;
    private beatChangeSub$:Subscription;

    constructor(private midi:MidiService, private zone:NgZone, private cm:ConfigModel, private transport:TransportService, private sm:Songmodel){
        
        // this.current_chord.next(this.chord); // TODO

        // We check for new chord on each beat change.
        this.beatChangeSub$ = this.transport.beatChange.subscribe((data)=>{
            
            // debugger
            let H = this.sm.getMeasures_hash();
            let m = this.sm.getMeasureByIdx(data.measure);
            
            if(!m || !Object.keys(H).length)return;
            
            let measure_tona = this.sm.getPart(H[m.getId()].part).getTonality();
            
      
            let chord = m.getBeat(data.beat).chord;
            // let regex = /([ABCDEFG][#b]{0,2})(.*)/
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
            if(result == null ){
              console.warn("Tonality-button component : no chord found ...");
              return
            }
            let root = result[1];
            let chordType = result[2];
            
            let obj = {
                root:root,
                bass:bass,
                chordType:chordType,
                scaleType:m.scale.scale_type||'',
                scaleTona:m.scale.scale_tona || measure_tona
            }
            
            if(obj.root != this.chord.root || obj.chordType != this.chord.chordType || obj.scaleType != this.chord.scaleType || obj.scaleTona != this.chord.scaleTona)
                this.setChord(obj);
            
        });
    }


    public setChord(obj):void{
        this.chord = obj;
        this.current_chord.next(obj);
    }

    public getChord():any{
        return this.chord;
    }

    public refreshChord(){
        this.current_chord.next(this.getChord());
    }



}
