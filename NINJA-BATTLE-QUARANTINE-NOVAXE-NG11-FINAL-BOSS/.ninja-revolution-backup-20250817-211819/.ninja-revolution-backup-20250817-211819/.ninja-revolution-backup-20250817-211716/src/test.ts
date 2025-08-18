
import 'zone.js/dist/zone-testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
declare const require: any;
getTestBed().initTestEnvironment(
  public platformBrowserDynamicTesting()
);
const context = require.context('./', true, /\.spec\.ts$/);
context.keys().map(context);
