import { Component, OnInit, OnDestroy } from '@angular/core';
import { TransportService } from '../services/transport.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-transport',
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.scss'],
  standalone: false
})

export class TransportComponent implements OnInit, OnDestroy {

  constructor(public transport: TransportService) {
    // console.log('transport => ',transport);
    // this.transp = transport;
  }

  ngOnInit() {
    this.transport.stop(1, true);
  }

  ngOnDestroy() {
    this.transport.stop(1, true);
  }

  play_pause() { }

  stop() { }

  onKeydown(event: KeyboardEvent) {
    // console.log(event.key);
    // if(event.code === 'Space' && event.target.nodeName != "TEXTAREA" && event.target.nodeName != "INPUT" && event.target.nodeName != "SELECT"){
    //   this.transport.stop(0);
    // }
  }
}
