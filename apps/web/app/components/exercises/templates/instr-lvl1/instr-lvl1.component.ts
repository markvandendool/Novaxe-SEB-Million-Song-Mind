import { Component, OnInit, Output, EventEmitter, AfterViewInit, NgZone, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { MidiService } from "@services/midi/midi.service"

@Component({
  selector: 'app-instr-lvl1',
  templateUrl: './instr-lvl1.component.html',
  styleUrls: ['./instr-lvl1.component.scss']
})
export class InstrLvl1Component implements OnInit, AfterViewInit {

	@Output() askNext     = new EventEmitter<boolean>(); //output answer
	public receivedData:any;
  private midiNotesTab$:Subscription;

  constructor(private midi:MidiService, private zone:NgZone) { }


  ngOnInit(): void {
    this.midiNotesTab$ = this.midi.notesTabSubject.subscribe((data)=>{
      if(!data.length)return;
      this.zone.run(()=>{this.start();});
    });
  }

  ngAfterViewInit(): void {
    setTimeout(()=>{
      $("#start_button").focus();  
    },10);
    $('.preload').attr('src', function(i,a){
            $(this).attr('src','')
                .removeClass('preload')
                .attr('src',a);
        });
  }

  public start():void{
  	this.askNext.emit(true);
  }




}
