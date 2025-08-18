import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { BindingsService } from '../../services/bindings/bindings.service';

// Minimal music theory interface for testpage functionality
interface MusicNote {
    name: string;
    midi: number;
}

@Component({
    selector: 'app-testpage',
    templateUrl: './testpage.component.html',
    styleUrls: ['./testpage.component.scss'],
    standalone: false, // SENSEI FIX: Prevent CLI phantom standalone bug
})
export class TestpageComponent implements OnInit, OnDestroy {

    private part: any;
    private measure: any;
    private keyBindingSubscription?: Subscription;

    public abcChordString: string = "ceg";
    public chordString: string = "c,e,g";
    public lastKeyPressed: string = '';

    constructor(private bindingsService: BindingsService) {
        this.measure = new Subject();
        this.measure.next(1);
    }

    measureChanged(m: any) {
        console.log("measureChanged in testpage");
        this.measure.next(m);
    }

    renderChord() {
        // Simple note parsing for basic functionality
        const note: MusicNote = {
            name: this.abcChordString,
            midi: 60 // Default C4
        };
        console.log("Music Theory Test:", note);
    }

    ngOnInit() {
        // Test BindingsService - listen for 'T' key press
        this.keyBindingSubscription = this.bindingsService.bindKey('T').subscribe((event: KeyboardEvent) => {
            this.lastKeyPressed = `T key pressed at ${new Date().toLocaleTimeString()}`;
            console.log('BindingsService test: T key pressed', event);
        });
    }

    ngOnDestroy() {
        if (this.keyBindingSubscription) {
            this.keyBindingSubscription.unsubscribe();
        }
    }

}
