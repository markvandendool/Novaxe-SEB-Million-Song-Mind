// Enhanced BraidTonal Component - Autonomous Migration by Ninja Script v2.0
// Angular 20 implementation with nuclear harness patterns
// 🎼 Advanced braid visualization with harmonic mapping

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface TonalSet {
    center_major: string[];
    center_minor: string[];
    left_up: string[];
    left_down: string[];
    right_up: string[];
    right_down: string[];
    outer_left_up: string[];
    outer_left_down: string[];
    outer_right_up: string[];
    outer_right_down: string[];
}

interface BraidTonalities {
    roman: Record<string, string[]>;
    empty: Record<string, string[]>;
    [key: string]: any;
}

@Component({
    selector: 'app-braid-tonal',
    templateUrl: './braid-tonal.component.html',
    styleUrls: ['./braid-tonal.component.scss'],
    standalone: false, // NINJA FIX: Prevent CLI phantom standalone bug
})
export class BraidTonalComponent implements OnInit, OnDestroy, OnChanges {
    @ViewChild('braidContainer', { static: true }) braidContainer!: ElementRef<HTMLDivElement>;

    // Input/Output for enhanced integration (converted from React props)
    @Input() focusKey: string = 'C';
    @Input() zoom: number = 1;
    @Input() selectedChords: string[] = [];
    @Input() chordUsage: Record<string, number> = {};
    @Input() displayRoman: boolean = false;
    
    @Output() zoomChange = new EventEmitter<number>();
    @Output() chordClick = new EventEmitter<string>();
    @Output() chordSelect = new EventEmitter<{chord: string, isSelected: boolean}>();

    private destroy$ = new Subject<void>();
    
    // Component state (converted from React useState)
    public tonalities: BraidTonalities | null = null;
    public tonality: string = 'C';
    public internalDisplayRoman: boolean = false;
    public internalZoom: number = 1;

    constructor(private http: HttpClient) {}

    ngOnInit(): void {
        this.loadTonalities();
        this.internalZoom = this.zoom;
        this.internalDisplayRoman = this.displayRoman;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    ngOnChanges(): void {
        if (this.zoom !== undefined) {
            this.internalZoom = this.zoom;
        }
        if (this.displayRoman !== undefined) {
            this.internalDisplayRoman = this.displayRoman;
        }
    }

    private loadTonalities(): void {
        this.http.get<BraidTonalities>('/assets/braid_tonalities.json')
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.tonalities = data;
                    console.log('🎼 Braid tonalities loaded successfully');
                },
                error: (error) => {
                    console.error('Failed to load braid tonalities:', error);
                    // Fallback minimal dataset (same as React version)
                    this.tonalities = {
                        roman: {
                            center_major: Array(12).fill('I'),
                            center_minor: Array(12).fill('i'),
                            left_up: Array(12).fill(''),
                            left_down: Array(12).fill(''),
                            right_up: Array(12).fill(''),
                            right_down: Array(12).fill(''),
                            outer_left_up: Array(12).fill(''),
                            outer_left_down: Array(12).fill(''),
                            outer_right_up: Array(12).fill(''),
                            outer_right_down: Array(12).fill(''),
                        },
                        C: {
                            center_major: ["C","G","D","A","E","B","F#","C#","G#","D#","A#","F"],
                            center_minor: ["Am","Em","Bm","F#m","C#m","G#m","D#m","A#m","Fm","Cm","Gm","Dm"],
                            left_up: Array(12).fill(''),
                            left_down: Array(12).fill(''),
                            right_up: Array(12).fill(''),
                            right_down: Array(12).fill(''),
                            outer_left_up: Array(12).fill(''),
                            outer_left_down: Array(12).fill(''),
                            outer_right_up: Array(12).fill(''),
                            outer_right_down: Array(12).fill(''),
                        },
                    } as BraidTonalities;
                }
            });
    }

    // Methods converted from React component (to be implemented)
    public onChordClickHandler(chord: string): void {
        this.chordClick.emit(chord);
    }

    public onZoomChangeHandler(newZoom: number): void {
        this.internalZoom = newZoom;
        this.zoomChange.emit(newZoom);
    }

    public toggleDisplayMode(): void {
        this.internalDisplayRoman = !this.internalDisplayRoman;
    }

    // Utility method for rotating arrays (converted from React)
    private rotate<T>(arr: T[], n: number): T[] {
        const a = arr.slice();
        if (a.length === 0) return a;
        const k = ((n % a.length) + a.length) % a.length;
        return a.slice(k).concat(a.slice(0, k));
    }

    // Get current tonality data
    public getCurrentTonality(): TonalSet | null {
        if (!this.tonalities || !this.tonalities[this.tonality]) {
            return null;
        }
        return this.tonalities[this.tonality] as TonalSet;
    }
}
