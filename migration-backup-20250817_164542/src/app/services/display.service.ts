import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DisplayService {

    constructor() { }

    // Angular 20 Compatible Stub Methods
    renderMarker(options: any): void {
        // Stub implementation for marker rendering
        console.log('DisplayService.renderMarker called with:', options);
    }

    renderFromModel(): void {
        // Stub implementation for model rendering
        console.log('DisplayService.renderFromModel called');
    }
}
