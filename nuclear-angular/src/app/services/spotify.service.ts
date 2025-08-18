import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SpotifyService {

    constructor() { }

    // Angular 20 Compatible Stub Methods
    public getItems(query:) { title: string, artist: string, album: string, comp: any }): Observable<any> {
        console.log('SpotifyService.getItems called with:', query);
        return of([]);
    }
}
