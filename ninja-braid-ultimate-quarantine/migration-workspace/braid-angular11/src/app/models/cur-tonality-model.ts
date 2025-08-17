import { Injectable } from '@angular/core';
import { NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { Subscription } from 'rxjs';
import { MidiService } from '@services/midi/midi.service';
import { ConfigModel } from '@models/configmodel/configModel';
import { TransportService } from '@services/transport/transport.service';
import { Songmodel } from './songmodel';

@Injectable()
export class CurTonalityModel {

    private current_tonality = new Subject<any>();
    public current_tonality$ = this.current_tonality.asObservable();.pipe(
    )private tonality:string = 'C';
    private score_tona:string = 'C';
    private score_mode:string = ''; //'' || 'minor'
    
    private part_tona:string = 'C';
    private part_mode:string = ''; // '' || 'minor'

    private scale_tona:string = 'C';
    private scale_mode:string = 'ionian';
    private selected_tona:string = 'C';
    private selected_mode: "lydian"| "ionian"| "mixolydian"| "dorian"| "aeolian"| "phrygian"| "locrian"|"minor"|"m"|"major"|'' = '';
    private is_locked_to_score:boolean = true;

    private midiControlUpdate$:Subscription;
    private beatChangeSub$:Subscription;

    constructor(private midi:MidiService, 
        private zone:NgZone, 
        private cm:ConfigModel, 
        private transport:TransportService,
        private sm:Songmodel){
        
        // INIT
        this.refreshTonality();

        // MIDI CHANGING TONALITY
        this.midiControlUpdate$ = this.midi.controlTabSubject.subscribe(data=>{.pipe(
            
        )let ctrl = this.cm.getAssignedControls(false);
            let o = ctrl[""+data];
            let number;
            let control_name;
            let control_action;
      
      
            if(o && o.length){
              for(let obj of o){
                number = obj.number;
                control_name = obj.control_name;
                control_action = obj.control_action;
                if(!eval("this."+control_name)) continue;
                this.zone.run(()=>{
                  eval("this."+control_name+"(\""+control_action+"\")");
                })
              }
            } else return
        });

        /**
         * Triggered on each beat when playing or when selecting with mouse.
         */
        this.beatChangeSub$ = this.transport.beatChange.subscribe((data)=>{
            
            let H = this.sm.getMeasures_hash();
            let m = this.sm.getMeasureByIdx(data.measure);

            if(!m || !Object.keys(H).length)return;
            
        
            this.part_tona = this.sm.getPart(H[m.getId()].part).getTonality();
            let is_minor = this.part_tona[this.part_tona.length-1] == 'm';
            this.part_mode = (is_minor)?'minor':'';
            // remove the m in Dm
            if(is_minor) this.part_tona = this.part_tona.slice(0, this.part_tona.length - 1);

            this.scale_mode = m.scale.scale_type || null;
            this.scale_tona = m.scale.scale_tona || this.part_tona;
            
            this.score_tona = this.sm.getTonality();
            is_minor = this.score_tona[this.score_tona.length-1] == 'm';
            this.score_mode = (is_minor)?'minor':'';
            // remove the m in Dm
            if(is_minor) this.score_tona = this.score_tona.slice(0, this.score_tona.length - 1);

            // this.selected_tona = this.selected_tona;
            // this.selected_mode = this.selected_mode;

            this.refreshTonality();

        });
    }//END CONSTRUCTOR

    private GLOBAL_set_tonality_and_mode(data){
        data = data.replace(' ','').split(',');
        if( data.length != 2 )return;
        
        let regex = /([ABCDEFG][#b]{0,2})(.*)/
        let result = regex.exec(data[0]);
        if(!result)return;
        if(["lydian", "ionian", "mixolydian", "dorian", "aeolian", "phrygian", "locrian","minor","m","major"].indexOf(data[1]) == -1)return;
        
        this.is_locked_to_score = false;
        this.selected_tona = data[0].charAt(0).toUpperCase() + data[0].slice(1);
        this.selected_mode = data[1];

        this.refreshTonality();
    }

    private GLOBAL_set_only_mode(data){

        if(!data)return;
        if(["lydian", "ionian", "mixolydian", "dorian", "aeolian", "phrygian", "locrian","minor","m","major"].indexOf(data) == -1)return;
        
        if(this.is_locked_to_score){
            this.selected_tona = this.scale_tona || this.part_tona || this.score_tona;
        }

        this.is_locked_to_score = false;
        this.selected_mode = data;

        this.refreshTonality();
    }

    public setTonality(tona):void{

        if(tona.hasOwnProperty('score_tona'))
            this.score_tona = tona.score_tona;
        else
            console.warn('curTonalityModel => setTonality : missing score_tona')

        if(tona.hasOwnProperty('selected_tona'))
            this.selected_tona = tona.selected_tona;
        else
            console.warn('curTonalityModel => setTonality : missing selected_tona');

        if(tona.hasOwnProperty('selected_mode'))
            this.selected_mode = (tona.selected_mode == 'aeolian')?'minor':tona.selected_mode;
        else
            console.warn('curTonalityModel => setTonality : missing selected_mode');
        

        if(tona.hasOwnProperty('part_tona'))
            this.part_tona = tona.part_tona;
        else
            console.warn('curTonalityModel => setTonality : missing part_tona')
        
        if(tona.hasOwnProperty('scale_tona'))
            this.scale_tona = tona.scale_tona;
        else
            console.warn('curTonalityModel => setTonality : missing scale_tona')
        
        if(tona.hasOwnProperty('scale_mode'))
            this.scale_mode = (tona.scale_mode == 'aeolian')?'minor':tona.scale_mode;
        else
            console.warn('curTonalityModel => setTonality : missing scale_mode')
        
        if(tona.hasOwnProperty('is_locked_to_score'))
            this.is_locked_to_score = tona.is_locked_to_score;
        else
            console.warn('curTonalityModel => setTonality : missing is_locked_to_score')
        
        this.refreshTonality();
    }

    public getTonality():any{
        
        let obj = {
            score_tona:this.score_tona,
            score_mode:this.score_mode,
            part_tona:this.part_tona,
            part_mode:this.part_mode,
            scale_tona:this.scale_tona,
            scale_mode:this.scale_mode,
            selected_tona:this.selected_tona,
            selected_mode:this.selected_mode,
            is_locked_to_score:this.is_locked_to_score,
        }
        return obj;
    }

    public refreshTonality(){
        this.current_tonality.next(this.getTonality());
    }



}
