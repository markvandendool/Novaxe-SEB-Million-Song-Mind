import { Component, OnInit, ElementRef } from '@angular/core';
import { ExerciseModel } from '@models/exercise.model';

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
