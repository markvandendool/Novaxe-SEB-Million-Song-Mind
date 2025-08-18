import { Component, OnInit, NgZone, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';


import { ConfigModel } from '@models/configmodel/configModel';
import { MidiService } from '@services/midi/midi.service';

@Component({
  selector: 'app-midi-selector',
  templateUrl: './midi-selector.component.html',
  styleUrls: ['./midi-selector.component.scss']
})
export class MidiSelectorComponent implements OnDestroy{

	private plugged_inputs$:Subscription;
  private chosen_input$:Subscription;
	private midi_available$:Subscription;

  private midi_is_ready:boolean = false;
  public midi_ports:any=[];
  public selected_midi:string='';

  @Output() hasChanged = new EventEmitter<string>();
  @Input() set is_guitar(valeur){

    if(!this.midi_is_ready)return;
    
    this.rebind_midi();
    this.hasChanged.emit('changed');
  }

  constructor( private midi: MidiService, private zone:NgZone, private cm:ConfigModel ) { 

    // Executed when midi services shows what midi devices are available.
  	this.plugged_inputs$ = this.midi.plugged_inputs$.subscribe((data)=>{
      this.midi_ports = data;
      // console.log("AVAILABLE MIDI PORTS : =>", data)
  	});
    
    // Executing when midi goes AVAILABLE.
    this.midi_available$ = this.midi.MIDI_AVAILABLE$.subscribe((data)=>{

      if(data == false)return;
      this.midi_is_ready  = true;
      
      this.rebind_midi();

    });

    // Executing when midi is changed in service.
    this.chosen_input$ = this.midi.chosen_input$.subscribe((data)=>{
      if(!data.length) return;
      this.zone.run(()=>{
        this.cm.setMidiInputSelected(data[0].value.name);
        this.selected_midi = data[0].value.name;
      })

    });

  }

  ngOnDestroy(){
    this.chosen_input$.unsubscribe();
    this.midi_available$.unsubscribe();
    this.plugged_inputs$.unsubscribe();
  }

  rebind_midi(){
    if(this.cm.getMidiInputSelected() != '') {
      let is_guitar = this.cm.is_midi_guitar();
      this.midi.bindMidiInput(this.cm.getMidiInputSelected(), is_guitar);
    }
  }

  change_midi_port(event): void {
    let is_guitar = this.cm.is_midi_guitar();
    this.midi.bindMidiInput(event.target.value, is_guitar);
    this.hasChanged.emit('changed');
  }
}
