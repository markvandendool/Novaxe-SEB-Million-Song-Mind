import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { MsmBridgeService } from '../../services/bridge/bridge.service';

@Component({
  selector: 'app-msm-landing',
  templateUrl: './msm-landing.component.html',
  styleUrls: ['./msm-landing.component.scss']
})
export class MsmLandingComponent {
  msmUrl: SafeResourceUrl;
  constructor(private sanitizer: DomSanitizer, private msmBridge: MsmBridgeService) {
    this.msmUrl = this.sanitizer.bypassSecurityTrustResourceUrl('http://localhost:8080/');
  }

	  onMsmLoaded(ev: Event) {
    try {
      const frame = ev.target as HTMLIFrameElement;
      if (frame && frame.contentWindow) {
        const origin = 'http://localhost:8080';
        this.msmBridge.attachMsmWindow(frame.contentWindow, origin);
      }
    } catch {}
  }
}

