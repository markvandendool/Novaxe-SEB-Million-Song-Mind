import { Component, OnInit, OnDestroy, Output, Input, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TransportService implements OnInit, OnDestroy {

    private subBeat_div: number = 240;

    private beatDiv: number = 0; //follows the time ticker but in div

    private subBeat: number = 0; // A number between 0 and 960. Represents position inside a single beat.
    private beat: number = 0; // A number between 0 and 960. Represents position inside a single beat.
    private measure: number = 0; //measure number

    private nb_subbeat_per_beat: number = 4;
    private nb_beat_per_measure: number = 4;
    private bpms: number = 60000 / 40;
    private bpm: number = 40;

    //subjects
    public subBeatChange: any;
    public beatChange: any;
    public measureChange: any;
    public nb_beat_per_measureChange: any;
    public nb_subbeat_per_beatChange: any;
    public bpmChange: any;


    private clock_ms: number = 0; //the clock in ms 0 to infinite...

    public state: "playing" | "stopped" | "paused" = 'stopped';

    public chrono: Worker;

    public clockO: any;


    constructor() {


        this.subBeatChange = new Subject();
        this.subBeatChange.next(this.subBeat);
        this.beatChange = new Subject();
        this.beatChange.next({ beat: this.beat, silent: true, measure: this.measure });
        this.measureChange = new Subject();
        this.measureChange.next(this.measure);
        this.nb_beat_per_measureChange = new Subject();
        this.nb_beat_per_measureChange.next(this.nb_beat_per_measure);
        this.nb_subbeat_per_beatChange = new Subject();
        this.nb_subbeat_per_beatChange.next(this.nb_subbeat_per_beat);
        this.bpmChange = new Subject();
        this.bpmChange.next(this.bpm);

        this.chrono = new Worker('./chrono.worker', { type: 'module' });
        this.chrono.postMessage({ 'interval': 6 });

        this.clockO = new Observable((observer) => {
            this.chrono.onmessage = ({ data }) => {
                this.clock_ms += data;
                observer.next(data);
            };

        });

        this.clockO.subscribe(
            data => {

                if (data == 0) {
                    this.beatDiv = 0;

                    if (this.beat == 0 && this.subBeat == 0) this.measureChange.next(this.measure);
                    else if (this.subBeat == 0) this.beatChange.next({ beat: this.beat, silent: true, measure: this.measure });
                    else this.subBeatChange.next(this.subBeat);
                } else
                    this.incMs(data);
            },
            error => { console.log('Error : ', error); }
        );

    }//constructor


    ngOnInit() {
        // this.chrono.start();
    }

    ngOnDestroy() {
        this.stop();
        this.clockO.unsubscribe();
    }

    play_pause() {
        if (this.state == "stopped" || this.state == "paused") {
            this.state = "playing";
            var audioContext = new AudioContext();
            this.chrono.postMessage('start');
        } else if (this.state == "playing") {
            this.chrono.postMessage('stop');
            this.state = 'paused';
        }
    }

    stop(n: number = 1, silent = false) {
        this.chrono.postMessage('stop');
        this.clock_ms = 0;
        if (!silent) this.reset(n);
        else this.reset_silent(n);
        this.state = 'stopped';
    }

    public setBeat(b: number, silent?: boolean) {
        if (!silent) silent = false;
        if (b < 960 && b >= -1) this.beat = b;
        this.beatChange.next({ beat: this.beat, silent: silent, measure: this.measure });

    }

    public getSubBeat() {
        return this.subBeat;
    }

    public getBeat() {
        return this.beat;
    }

    public incMs(ms: number) {
        this.incBeatDiv(this.ms_to_beat_div(ms));
    }

    public incBeatDiv(inc: number = 1) {
        this.beatDiv += inc;

        if (this.beatDiv >= 960 / this.nb_subbeat_per_beat) {
            this.beatDiv = 0;
            this.incSubBeat(1);
        }
    }

    public incSubBeat(inc: number = 1) {
        this.subBeat += inc;

        if (this.subBeat >= this.nb_subbeat_per_beat) {
            this.subBeat = 0;
            this.incBeat(1);
        }
        this.subBeatChange.next(this.subBeat);
    }

    public incBeat(inc: number) {
        this.beat += inc;
        if (this.beat >= this.nb_beat_per_measure) {
            this.beat = 0;
            this.incMeasure(1);
        }
        // this.beat_obs.next(this.beat);
        this.beatChange.next({ beat: this.beat, silent: false, measure: this.measure });
    }

    public refreshBeat() {
        this.beatChange.next({ beat: this.beat, silent: false, measure: this.measure });
    }

    public incMeasure(inc: number) {
        this.measure += inc;
        // this.measure_obs.next(this.measure);
        this.measureChange.next(this.measure);
    }

    public getMeasure() {
        return this.measure;
    }

    public setMeasure(m: number, silent?: boolean, prevent_transmit?: boolean) {
        this.measure = m;
        if (!prevent_transmit) this.measureChange.next(this.measure);
    }

    public setNb_beat_per_measure(n: number) {
        this.nb_beat_per_measure = n;
        this.nb_beat_per_measureChange.next(this.nb_beat_per_measure);
    }

    public setNb_subbeat_per_beat(n: number) {
        this.nb_subbeat_per_beat = n;
        this.nb_subbeat_per_beatChange.next(this.nb_subbeat_per_beat);
    }
    public getNb_subbeat_per_beat(): number {
        return this.nb_subbeat_per_beat;
    }

    public reset(n: number = 1) {
        this.subBeat = 0;
        if (n == 0) { //reset on 0:-1:0
            this.beat = -1;
            this.measure = -1;
            this.subBeat = 0;
        } else if (n == 1) { //reset on 1:1:1
            this.beat = 0;
            this.measure = 0;
            this.subBeat = 0;
        }
        this.subBeatChange.next(this.subBeat);
        this.beatChange.next({ beat: this.beat, silent: true, measure: this.measure });
        this.measureChange.next(this.measure);
        this.clock_ms = 0;
    }

    public reset_silent(n: number = 1) {
        this.subBeat = 0;
        if (n == 0) { //reset on 0:-1:0
            this.beat = -1;
            this.measure = -1;
            this.subBeat = 0;
        } else if (n == 1) { //reset on 1:1:1
            this.beat = 0;
            this.measure = 0;
            this.subBeat = 0;
        }
        // this.subBeatChange.next(this.subBeat);
        // this.beatChange.next(this.beat);
        // this.measureChange.next(this.measure);
        this.clock_ms = 0;
    }


    ms_to_beat_div(ms: number) {
        let beat_inc = ms * 960 / this.bpms;
        return beat_inc;
    }

    set_bpms() {
        this.bpms = 60000 / this.bpm;
    }

    set_bpm(n: number) {
        this.bpm = n;
        this.set_bpms();
        this.bpmChange.next(this.bpm);
    }

    getStatus() {
        return this.state;
    }

    isPlaying() {
        if (this.state == 'playing') return true;
        else return false;
    }

    setState(state: "playing" | "stopped" | "paused" = 'stopped') {
        this.state = state;
    }

}
