import { Component, OnInit, ElementRef } from '@angular/core';

// Temporary stub for ExerciseModel - will be replaced with proper service
class ExerciseModel {
    public _question: string[] = ['C', 'G', 'D', 'A'];
    public _cards: string[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    public verified: number = 0;
    public win: boolean = false;

    answer(card: string): boolean { return Math.random() > 0.5; }
    start(): void { this.verified = 0; this.win = false; }
    verifyNext(e: any): boolean { this.verified++; return true; }
}

@Component({
    selector: 'app-learn-fifths',
    templateUrl: './learn-fifths.component.html',
    styleUrls: ['./learn-fifths.component.scss'],
    standalone: false
})

export class LearnFifthsComponent implements OnInit {

    public lock: boolean = true;
    public win: boolean | undefined = undefined;
    public tonality: any;
    public exowin: any;
    public exo: ExerciseModel = new ExerciseModel();

    constructor(public el: ElementRef) { }

    ngOnInit() { }

    public verifyCard(c: any): void {

        this.win = this.exo.answer(c);

        if (this.win)
            for (let i = 0; i < this.exo._question.length; i++)
                this.el.nativeElement.querySelector('#question_' + i).style.color = 'green';
        else
            for (let i = 0; i < this.exo._question.length; i++)
                this.el.nativeElement.querySelector('#question_' + i).style.color = 'red';

        setTimeout(() => {
            this.win = undefined;
            this.exo.start();
        }, 500);


    }

    public verifyMidi(e: any): void {
        let chordElmts = [];
        for (let i = 0; i < this.exo._question.length; i++)
            chordElmts.push(this.el.nativeElement.querySelector('#question_' + i));

        if (e.rootName == 'Gb') e.rootName = 'F#';
        console.log("e.rootName+e.name => ", e.rootName + e.name);

        if (this.exo.verifyNext(e)) {
            this.exo._question[this.exo.verified - 1] = e.rootName;

            if (this.exo.win == true) {
                window.setTimeout(() => {
                    this.exo.start();
                }, 100);
            }
        }
    }

}
