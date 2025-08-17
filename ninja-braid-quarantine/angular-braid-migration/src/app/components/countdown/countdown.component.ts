import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-countdown',
    templateUrl: './countdown.component.html',
    styleUrls: ['./countdown.component.scss'],
    standalone: false, // SENSEI FIX: Prevent CLI phantom standalone bug
})
export class CountdownComponent implements OnInit {

    public countdown: number = 10;
    public isActive: boolean = false;

    constructor() { }

    ngOnInit(): void {
        console.log('🎯 CountdownComponent initialized (migrated from 29 lines)');
    }

    start(): void {
        this.isActive = true;
        const interval = setInterval(() => {
            this.countdown--;
            if (this.countdown <= 0) {
                clearInterval(interval);
                this.isActive = false;
                this.countdown = 10; // Reset
                console.log('⏰ Countdown finished!');
            }
        }, 1000);
    }

}
