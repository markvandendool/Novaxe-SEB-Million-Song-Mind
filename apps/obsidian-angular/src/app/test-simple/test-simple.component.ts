import { Component } from '@angular/core';

@Component({
  selector: 'app-test-simple',
  standalone: false,
  template: `
    <div [ngClass]="{'test': true}">Test ngClass on div</div>
    <input [(ngModel)]="testValue" placeholder="Test ngModel">
    <p>Value: {{ testValue }}</p>
  `,
  styles: [`
    .test { color: red; }
  `]
})
export class TestSimpleComponent {
  testValue = 'Hello World';
}
