import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-transport',
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.scss'],
  standalone: false, // EXPLICITLY declare as non-standalone
})

export class TransportComponent implements OnInit, OnDestroy {

  constructor() {
    console.log('🎵 TransportComponent simplified for migration');
  }

  ngOnInit() {
    console.log('🎯 TransportComponent initialized');
  }

  ngOnDestroy() {
    console.log('🛑 TransportComponent destroyed');
  }

  play_pause() { }

  stop() { }

  onKeydown(event: any) {
    // console.log(event.key);
    // if(event.code === 'Space' && event.target.nodeName != "TEXTAREA" && event.target.nodeName != "INPUT" && event.target.nodeName != "SELECT"){
    //   this.transport.stop(0);
    // }
  }
}
