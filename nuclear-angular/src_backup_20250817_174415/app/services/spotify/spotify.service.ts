import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SpotifyService {
    constructor() { }

    // Angular 20 Compatible Spotify Service Stub
    // TODO: Migrate full SpotifyService from pristine source when needed

    public searchTrack(query: string): Observable<any> {
        console.log('SpotifyService stub - searchTrack:', query);
        return of({ tracks: { items: [] }, message: 'Spotify service stub active' });
    }

    public searchArtist(artistName: string): Observable<any> {
        console.log('SpotifyService stub - searchArtist:', artistName);
        return of({ artists: { items: [] }, message: 'Spotify service stub active' });
    }

    public getTrackFeatures(trackId: string): Observable<any> {
        console.log('SpotifyService stub - getTrackFeatures:', trackId);
        return of({
            id: trackId,
            energy: 0.5,
            valence: 0.5,
            tempo: 120,
            message: 'Spotify service stub active'
        });
    }

    public authenticate(): Observable<any> {
        console.log('SpotifyService stub - authenticate');
        return of({ access_token: 'stub_token', message: 'Spotify service stub active' });
    }
}
