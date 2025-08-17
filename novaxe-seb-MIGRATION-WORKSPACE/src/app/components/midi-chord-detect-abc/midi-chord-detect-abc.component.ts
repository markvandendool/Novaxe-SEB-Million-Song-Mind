import { Component, OnInit, Input, OnDestroy, NgZone } from '@angular/core';
import { ConfigModel } from '@models/configmodel/configModel';
import { CurTonalityModel } from '@models/songmodel/cur-tonality-model';
import { Subscription } from 'rxjs/Subscription';

import { Chord } from "@tonaljs/tonal";
import { Note } from "@tonaljs/tonal";
import { AbcNotation } from "@tonaljs/tonal";


import abcjs from 'abcjs';
declare global {
  var abcjs:any;
}

@Component({
  selector: 'app-midi-chord-detect-abc',
  templateUrl: './midi-chord-detect-abc.component.html',
  styleUrls: ['./midi-chord-detect-abc.component.scss']
})
export class MidiChordDetectAbcComponent implements OnInit, OnDestroy{

  private curTonality$:Subscription;
  
  @Input() tonality:string="C";

  @Input() color:string='black';

  @Input() transpose:number=0;

  // @Input() set color( val ){
  //   this.color = val || "black";
  // }

  @Input() set abc_obj(valeur) {
    
    this.conditionalRender(valeur);
  }

	public chords:Array<string>;

  constructor(private zone:NgZone, public cm:ConfigModel, private curTonality:CurTonalityModel ) { }

  ngOnInit(): void {
    this.curTonality$ = this.curTonality.current_tonality$.subscribe((data)=>{ 

      this.change_tonality(data);

    });

    let valeur = {l:'',r:''};
    this.conditionalRender(valeur);

  }

  private change_tonality(data){
    console.log(data);
    
    let tona = data.scale_tona || data.part_tona || data.score_tona;
    let mode = (tona == data.scale_tona)?data.scale_mode:(tona==data.part_tona)?data.part_mode:data.score_mode
    
    // this.tonality = tona; // TODO : WE MIGHT WANT TO CHANGE TONALITY HERE !?
    this.conditionalRender({l:'',r:''})
  }

  private conditionalRender(valeur){
    if(this.cm.is_midi_guitar())
    this.renderStringsGuitar(valeur.l,valeur.r);
  else
    this.renderStrings(valeur.l,valeur.r);
  }

  ngOnDestroy(){ }

  renderStrings(l,r){
    let header = '';
    header += "%%musicspace 50"+"\n";
    header += "%%sysstaffsep 80"+"\n";
    header += "%%staffsep 100"+"\n";
    header += "%%staves {(PianoRightHand) (PianoLeftHand)}"+"\n";
    header += "V:PianoRightHand clef=treble down"+"\n";
    header += "V:PianoLeftHand clef=bass"+"\n";
    header += "K:C"+"\n";
    // header += "[V: PianoLeftHand] x"+"\n"; //COMENTED TO REMOVE LOWER STAFF (DOESNT SEEM TO AFFECT NOTHING)
    // header += "[V: PianoRightHand] x"+"\n";
    header += "K:"+this.tonality+"\n";

    l = "[V: PianoLeftHand] "+"||\n["+l+"]2 x"+"\n";
    r = "[V: PianoRightHand] "+"||\n["+r+"]2 x"+"\n";
  
    abcjs.renderAbc('midi-chord-detect-abc', header+l+r, {
      paddingtop:50,
      // paddingbottom:20,
      // paddingright:0,
      // paddingleft:0,
      // responsive: "resize",
      viewportVertical:true,
      staffwidth:100,
      scale:1.4,
      foregroundColor:this.color,
      visualTranspose:this.transpose,
      // paddingtop:100,
      // paddingbottom:30
    });
  }


  renderStringsGuitar(l,r){

    let header = '';
    header += "%%musicspace 50"+"\n";
    header += "%%sysstaffsep 50"+"\n";
    header += "%%staffsep 100"+"\n";
    // header += "%%staves {(PianoRightHand) (PianoLeftHand)}"+"\n";
    header += "V:PianoRightHand clef=treble down"+"\n";
    // header += "V:PianoLeftHand clef=bass"+"\n";
    header += "K:C"+"\n";
    // header += "[V: PianoLeftHand] x"+"\n"; //COMENTED TO REMOVE LOWER STAFF (DOESNT SEEM TO AFFECT NOTHING)
    // header += "[V: PianoRightHand] x"+"\n";
    header += "K:"+this.tonality+"\n";

    // l = "[V: PianoLeftHand] "+"["+l+"]2 x"+"\n";
    r = "[V: PianoRightHand] "+"||\n["+r+l+"]2 x"+"\n";
    
    abcjs.renderAbc('midi-chord-detect-abc', header+r, {
      paddingtop:50,
      // paddingbottom:20,
      // paddingright:0,
      // paddingleft:0,
      // responsive: "false",
      staffwidth:100,
      scale:1.4,
      foregroundColor:this.color,
      visualTranspose:this.transpose,
    });
  }

}
