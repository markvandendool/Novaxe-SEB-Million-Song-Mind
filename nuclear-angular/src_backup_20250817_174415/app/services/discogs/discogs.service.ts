import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DiscogsService {
    constructor() { }

    // Angular 20 Compatible Discogs Service Stub
    // TODO: Migrate full DiscogsService from pristine source when needed

    public searchArtist(artistName: string): Observable<any> {
        console.log('DiscogsService stub - searchArtist:', artistName);
        return of({ results: [], message: 'Discogs service stub active' });
    }

    public searchRelease(query: string): Observable<any> {
        console.log('DiscogsService stub - searchRelease:', query);
        return of({ results: [], message: 'Discogs service stub active' });
    }

    public getArtistInfo(artistId: string): Observable<any> {
        console.log('DiscogsService stub - getArtistInfo:', artistId);
        return of({ id: artistId, name: 'Unknown Artist', message: 'Discogs service stub active' });
    }
}
