import { Component, OnInit } from '@angular/core';
import { RuntimeSmokeTest } from './tests/runtime-smoke-test';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {
  title = 'nuclear-angular';

  async ngOnInit() {
    // Load smoke test for browser console access
    console.log('🧪 Nuclear Angular loaded. Type "runSmokeTest()" in console to run smoke tests.');
  }
}
