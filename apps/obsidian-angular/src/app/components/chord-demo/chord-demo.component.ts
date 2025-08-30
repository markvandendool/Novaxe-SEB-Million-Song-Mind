import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-chord-demo',
    templateUrl: './chord-demo.component.html',
    styleUrls: ['./chord-demo.component.scss'],
    standalone: false
})
export class ChordDemoComponent implements OnInit {

    public showMagic18Chart: boolean = true;
    public selectedKey: string = 'C';

    constructor() { }

    ngOnInit(): void {
    }

    toggleChart(): void {
        this.showMagic18Chart = !this.showMagic18Chart;
    }
}
