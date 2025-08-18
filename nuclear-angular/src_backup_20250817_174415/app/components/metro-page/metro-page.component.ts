import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-metro-page',
    templateUrl: './metro-page.component.html',
    styleUrls: ['./metro-page.component.scss'],
    standalone: false, // SENSEI FIX: Prevent CLI phantom standalone bug
})
export class MetroPageComponent implements OnInit {

    public bpm: number = 120;
    public isPlaying: boolean = false;

    constructor() { }

    ngOnInit(): void {
        console.log('🎯 MetroPageComponent initialized (migrated from 15 lines)');
    }

    toggleMetronome(): void {
        this.isPlaying = !this.isPlaying;
        console.log(`🎼 Metronome ${this.isPlaying ? 'started' : 'stopped'} at ${this.bpm} BPM`);
    }

}
