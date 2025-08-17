import { Component, OnInit } from '@angular/core';
import { RuntimeSmokeTest } from './tests/runtime-smoke-test';

// Make smoke test globally available for browser console
declare global {
  interface Window {
    runSmokeTest: () => void;
  }
}

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
    const smokeTest = new RuntimeSmokeTest();
    window.runSmokeTest = () => smokeTest.runAllTests();

    console.log('🧪 Nuclear Angular loaded. Type "runSmokeTest()" in console to run smoke tests.');
  }
}
