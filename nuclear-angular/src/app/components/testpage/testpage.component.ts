import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { MusicTheoryStubService } from '../../services/music-theory-stub.service';

@Component({
    selector: 'app-testpage',
    templateUrl: './testpage.component.html',
    styleUrls: ['./testpage.component.scss'],
    standalone: false, // SENSEI FIX: Prevent CLI phantom standalone bug
})
export class TestpageComponent implements OnInit {

    private part: any;
    private measure: any;

    public abcChordString: string = "ceg";
    public chordString: string = "c,e,g";

    constructor(private musicTheory: MusicTheoryStubService) {
        this.measure = new Subject();
        this.measure.next(1);
    }

    measureChanged(m: any) {
        console.log("measureChanged in testpage");
        this.measure.next(m);
    }

    renderChord() {
        // Test the music theory service
        const note = this.musicTheory.getNote(this.abcChordString);
        console.log("Music Theory Service Test:", note);
    }

    ngOnInit() {
    }

}
