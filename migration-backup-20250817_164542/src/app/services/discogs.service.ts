import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DiscogsService {

    constructor() { }

    // Angular 20 Compatible Stub Methods
    public getItemsEditor(query: { title: string, artist: string, album: string }): Observable<any> {
        console.log('DiscogsService.getItemsEditor called with:', query);
        return of([]);
    }
}
