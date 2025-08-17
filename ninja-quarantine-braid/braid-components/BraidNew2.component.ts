import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-braidnew2',
  template: '<div class="braidnew2">{{componentName}} - Migrated from React</div>',
  styleUrls: ['./braidnew2.component.scss'],
  standalone: false
})
export class BraidNew2Component implements OnInit {
  componentName = 'BraidNew2';
  
  constructor() { }
  
  ngOnInit(): void {
    console.log('BraidNew2 component initialized');
  }
}
