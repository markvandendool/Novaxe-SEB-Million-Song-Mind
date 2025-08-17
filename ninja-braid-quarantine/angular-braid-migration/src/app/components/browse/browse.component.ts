import { Component, OnInit, Input, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Stub interfaces for migration
interface Song {
    id: string;
    title: string;
    artist: string;
    album: string;
    author: string;
    style: string;
    key: string;
    chords: string;
    analysis?: string;
}

interface SearchPattern {
    title: string;
    artist: string;
    author: string;
    album: string;
    style: string;
    chords: string;
    analysis: string;
    tonality: string;
}

@Component({
    selector: 'app-browse',
    templateUrl: './browse.component.html',
    styleUrls: ['./browse.component.scss'],
    standalone: false
})
export class BrowseComponent implements OnInit {
    // Service injection using Angular 20 pattern
    private http = inject(HttpClient);

    @Input() page: string = 'home';
    @Input() param: string = '';

    // Core data properties
    public list: Song[] = [];
    public filteredList: Song[] = [];
    public analysisPattern: string = '';

    // Modal management
    public modalInfos: any = { hide: true };

    // Search functionality
    public searchPattern: SearchPattern = {
        title: '',
        artist: '',
        author: '',
        album: '',
        style: '',
        chords: '',
        analysis: '',
        tonality: ''
    };

    // Display options
    public isList: boolean = true;
    public isLoading: boolean = false;
    public styles: string[] = [];

    // Reactive streams
    private searchResults$ = new BehaviorSubject<Song[]>([]);

    constructor() {
        console.log('🔍 BrowseComponent initialized - Angular 20 migration');
    }

    ngOnInit(): void {
        console.log('🎯 BrowseComponent OnInit - setting up browse functionality');
        this.cleanSearch();
        this.setPageInputs();
        this.modalInfos.hide = true;
        this.loadSampleData(); // Load sample data for development
    }

    // Load sample data for development/testing
    private loadSampleData(): void {
        this.list = [
            {
                id: '1',
                title: 'Autumn Leaves',
                artist: 'Various Artists',
                album: 'Jazz Standards',
                author: 'Joseph Kosma',
                style: 'Jazz / Ballad',
                key: 'Bb major',
                chords: 'Cm7-F7-BbMaj7-EbMaj7'
            },
            {
                id: '2',
                title: 'Giant Steps',
                artist: 'John Coltrane',
                album: 'Giant Steps',
                author: 'John Coltrane',
                style: 'Jazz / Bebop',
                key: 'B major',
                chords: 'BMaj7-D7-GMaj7-Bb7-EbMaj7'
            },
            {
                id: '3',
                title: 'All of Me',
                artist: 'Billie Holiday',
                album: 'Classic Vocals',
                author: 'Gerald Marks',
                style: 'Jazz / Vocal',
                key: 'C major',
                chords: 'C-E7-Am-C7-F-Fm-C-G7'
            },
            {
                id: '4',
                title: 'Blue Moon',
                artist: 'Ella Fitzgerald',
                album: 'Standards Collection',
                author: 'Richard Rodgers',
                style: 'Jazz / Standard',
                key: 'G major',
                chords: 'G-Em-Am-D7-G'
            },
            {
                id: '5',
                title: 'Summertime',
                artist: 'George Gershwin',
                album: 'Porgy and Bess',
                author: 'George Gershwin',
                style: 'Jazz / Opera',
                key: 'Am',
                chords: 'Am-F-E-Am'
            }
        ];

        this.filteredList = [...this.list];
        this.extractStyles();
        console.log('📊 Sample data loaded:', this.list.length, 'songs');
    }

    // Enhanced search functionality
    public search(): void {
        console.log('🔍 BrowseComponent search() called');

        if (this.isEmptySearch()) {
            this.filteredList = [...this.list];
            return;
        }

        this.isLoading = true;

        // Filter based on search pattern
        this.filteredList = this.list.filter(song => {
            return this.matchesSearchPattern(song);
        });

        console.log('🔍 Search results:', this.filteredList.length, 'songs found');
        this.isLoading = false;
    }

    private isEmptySearch(): boolean {
        const pattern = this.searchPattern;
        return !pattern.title && !pattern.artist && !pattern.author &&
            !pattern.album && !pattern.style && !pattern.chords &&
            !pattern.analysis && !pattern.tonality;
    }

    private matchesSearchPattern(song: Song): boolean {
        const pattern = this.searchPattern;

        return (
            (!pattern.title || song.title.toLowerCase().includes(pattern.title.toLowerCase())) &&
            (!pattern.artist || song.artist.toLowerCase().includes(pattern.artist.toLowerCase())) &&
            (!pattern.author || song.author.toLowerCase().includes(pattern.author.toLowerCase())) &&
            (!pattern.album || song.album.toLowerCase().includes(pattern.album.toLowerCase())) &&
            (!pattern.style || song.style.toLowerCase().includes(pattern.style.toLowerCase())) &&
            (!pattern.chords || song.chords.toLowerCase().includes(pattern.chords.toLowerCase())) &&
            (!pattern.tonality || song.key.toLowerCase().includes(pattern.tonality.toLowerCase()))
        );
    }

    // Modal management
    public openDeleteModal(index: number): void {
        if (event) event.stopPropagation();

        const song = this.filteredList[index];
        this.modalInfos = {
            id: song.id,
            title: song.title,
            hide: false
        };
        console.log('🗑️ Delete modal opened for:', song.title);
    }

    public deleteScore(): void {
        console.log('🗑️ BrowseComponent deleteScore() called');

        // Simulate deletion
        const songId = this.modalInfos.id;
        this.list = this.list.filter(song => song.id !== songId);
        this.filteredList = this.filteredList.filter(song => song.id !== songId);

        this.modalInfos.hide = true;
        console.log('✅ Song deleted successfully');
    }

    public closeModal(): void {
        this.modalInfos.hide = true;
    }

    // Search management
    public cleanSearch(): void {
        console.log('🧹 BrowseComponent cleanSearch() called');

        this.searchPattern = {
            title: '',
            artist: '',
            author: '',
            album: '',
            style: '',
            chords: '',
            analysis: '',
            tonality: ''
        };

        this.filteredList = [...this.list];
    }

    private setPageInputs(): void {
        if (this.page !== 'home' && this.param) {
            switch (this.page) {
                case 'title':
                    this.searchPattern.title = this.param;
                    break;
                case 'artist':
                    this.searchPattern.artist = this.param;
                    break;
                case 'author':
                    this.searchPattern.author = this.param;
                    break;
                case 'album':
                    this.searchPattern.album = this.param;
                    break;
                case 'style':
                    this.searchPattern.style = this.param;
                    break;
                case 'key':
                    this.searchPattern.tonality = this.param;
                    break;
            }
            this.search();
        }
    }

    // Style extraction for filtering
    private extractStyles(): void {
        const allStyles = new Set<string>();

        this.list.forEach(song => {
            const styleStr = song.style.replace(/\/| - /g, ' ');
            const styles = styleStr.trim().split(' ');

            styles.forEach(style => {
                if (style && style !== 'unknown' && style !== '') {
                    allStyles.add(style);
                }
            });
        });

        this.styles = Array.from(allStyles).sort();
        console.log('🎨 Extracted styles:', this.styles);
    }

    // Display options
    public toggleDisplayMode(): void {
        this.isList = !this.isList;
        console.log('📋 Display mode toggled to:', this.isList ? 'list' : 'grid');
    }

    // Song selection
    public selectSong(song: Song): void {
        console.log('🎵 Song selected:', song.title, 'by', song.artist);
        // In full implementation, this would load the song into the player
    }

    // Utility methods
    public getSongCount(): number {
        return this.filteredList.length;
    }

    public getTotalSongCount(): number {
        return this.list.length;
    }

    public getUniqueStyles(): string[] {
        return this.styles;
    }

    // Search field handlers
    public onSearchInput(field: keyof SearchPattern, value: string): void {
        this.searchPattern[field] = value;
        // Debounced search could be implemented here
        this.search();
    }

    public onQuickStyleFilter(style: string): void {
        this.searchPattern.style = style;
        this.search();
    }

    public onQuickKeyFilter(key: string): void {
        this.searchPattern.tonality = key;
        this.search();
    }

    // Export functionality (stub)
    public exportResults(): void {
        console.log('📤 Export functionality - stub implementation');
        // In full implementation, this would export search results
    }
}
