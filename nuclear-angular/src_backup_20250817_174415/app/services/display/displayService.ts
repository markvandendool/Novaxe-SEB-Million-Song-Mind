import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DisplayService {
    constructor() { }

    // Angular 20 Compatible Display Service Stub
    // TODO: Migrate full DisplayService from pristine source when needed

    public display(element: any, show: boolean = true): void {
        console.log('DisplayService stub - display:', element, show);
    }

    public hide(element: any): void {
        console.log('DisplayService stub - hide:', element);
    }

    public toggle(element: any): void {
        console.log('DisplayService stub - toggle:', element);
    }
}
