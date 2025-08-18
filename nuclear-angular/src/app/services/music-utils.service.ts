import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Subscription } from 'rxjs';

import './number.extensions';
import Scales from '../../../assets/scales.json';
import Chords from '../../../assets/chords.json';
import ChordsForms from '../../../assets/chordsForms.json';
import Tonalites from '../../../assets/tonalities.json';
import FifthCycle from '../../../assets/fifthCycle.json';
import MidiNotes from '../../../assets/midiNotes.json';

import { Note } from "@tonaljs/tonal";
import { ScaleType } from "@tonaljs/tonal";


@Injectable({
    providedIn: 'root'
})
export class MusicUtilsService {


    public chordSubject: any;
    public scale = Scales["major"][0];
    public scaleNotes = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
    private fifthsCycle = {
        '#': ['c', 'g', 'd', 'a', 'e', 'b', 'f#', 'c#', 'g#', 'd#', 'a#', 'f'],
        'b': ['c', 'f', 'bb', 'eb', 'ab', 'db', 'gb', 'b', 'e', 'a', 'd', 'g']
    }
    private midiNotesSubscription: Subscription;

    constructor(zone: NgZone) {

        this.chordSubject = new BehaviorSubject<Object>({});

    }

    getDegreeFromRoot(r: string) {

        debugger
        // this.tonalites
    }

    /*
    /* Get notes names from int between 0 and 11
     */
    getNotesName(notes, tonaNotes) {
        notes = notes.map((val, i, arr) => {
            return tonaNotes[val];
        })
        return notes;
    }


    getChordName2(n, tonality = 'c') {
        let s = '';


        let r = n[0] % 12 || 0;

        //convert midi notes into int between 0 and 12 relative to tonality
        // let scaleDegrees = this.getModNotes(midiNotes);
        let ns = this.getModNotes(n).removeDoubles();
        // let root = this.getRoot(n);
        let root = ns[0];
        // console.log('root => ',root);
        let tn: any = Tonalites.isSharpTonality['#'].indexOf(tonality);
        if (tn == -1)
            tn = Tonalites['b']
        else
            tn = Tonalites['#']

        let resolve = tn[(root - 7).mod(12)] || '';

        let chordFunction = 'normal';

        let intervals = n.getIntervals();

        let isRealNinth = intervals[intervals.indexOf(2) - 1] == 0
        let isSuspendedSecond = !intervals.contains(4) && intervals.contains(2) && isRealNinth;
        let isSuspendedFourth = !intervals.contains(4) && intervals.contains(5)

        let isMaj = intervals.contains(4) && !intervals.contains(10)
        let isDom = intervals.contains(10);
        let isMin = intervals.contains(3);
        // let isOther =  intervals.contains(8) && !isDom && !intervals.contains(2)


        // console.log('isMajor => ',isMaj);
        // console.log('isDom => ',isDom);
        // console.log('isMin => ',isMin);

        // console.log('intervals => ',intervals);

        if (isMin && isDom) {
            let posMin = intervals.indexOf(3);
            let posMaj = intervals.indexOf(4);

            if (posMaj != -1 && posMaj < posMin) isMin = false;
        }


        if (isMaj) {
            chordFunction = ''
            let isSeventh = intervals.contains(11);
            let isNinth = isSeventh && intervals.contains(2);
            let isAddNinth = !isSeventh && intervals.contains(2);
            let isThirteen = isSeventh && intervals.contains(9);

            let isSixth = !isSeventh && intervals.contains(9);
            let isSixthNinth = isSixth && intervals.contains(2);
            let isLydian = intervals.contains(6);
            let isSeventhFlatSix = isSeventh && intervals.contains(8); //TODO b13 shadowed by aug...
            let isAug = intervals.contains(8) && intervals.contains(4) && !intervals.contains(7)


            if (isLydian)
                s += 'Maj11#'
            else if (isSixthNinth)
                s += '6/9'
            else if (isSixth)
                s += '6'
            else if (isSeventhFlatSix)
                s += 'Maj13b'
            else if (isThirteen)
                s += 'Maj13'
            else if (isNinth)
                s += 'Maj9'
            else if (isAug) {
                s += '+'
                chordFunction = '7';
            } else {
    i
}f (isSeventh)
                s += 'Maj'
            else if (isAddNinth && !isSuspendedSecond)
                s += 'add 9'

            if (isSuspendedSecond && !isSixthNinth) {
                s += ' (sus2)'
                chordFunction = '7';
            } else {
    i
}f (isSuspendedFourth) {
                s += ' (sus4)'
                chordFunction = '7';
            }

        } else {
    i
}f (isDom && !isMin) {
            chordFunction = '7';
            let isSeventh = true;

            let isAltered = intervals.contains(1) || intervals.contains(3)

            if ((isSuspendedFourth || isSuspendedSecond)) {
                let isFlatNine = intervals.contains(1);
                let isThirteen = intervals.contains(9);

                if (isFlatNine)
                    s += 'b9sus'
                else if (isThirteen)
                    s += '13'
                else if (isSuspendedFourth)
                    s += '11'
                else if (isSuspendedSecond)
                    s += 'sus2'

            } else {
    i
}f (isAltered) {
                chordFunction = '7';
                let isFlatNine = intervals.contains(1);
                let isSharpNine = intervals.contains(3);

                let mustBeDomFlatNine = intervals.contains(9)
                let mustBeAlt = intervals.contains(8)

                let isAlt = false;
                let isDomFlatNine = false;
                let isDomSharpNine = false;

                if (isFlatNine && mustBeAlt)
                    isAlt = true
                else if (isFlatNine && mustBeDomFlatNine)
                    isDomFlatNine = true;
                else if (!mustBeDomFlatNine && !mustBeAlt && isFlatNine)
                    isDomFlatNine = true;
                else if (!mustBeDomFlatNine && !mustBeAlt && isSharpNine)
                    isDomSharpNine = true;

                if (isDomFlatNine)
                    s += '79b';
                else if (isAlt)
                    s += 'alt7';
                else if (isDomSharpNine)
                    s += '79#'
                else
                    s += 'alt?'


            } else {
                chordFunction = '7';

                let isNinth = intervals.contains(2);
                let isThirteen = intervals.contains(9);
                let isLydian = intervals.contains(6);
                let isAugSeventh = intervals.contains(8) && intervals.contains(10)
                let isEleventh = isSeventh && intervals.contains(5);

                if (isLydian)
                    s += '711#'
                else if (isThirteen)
                    s += '13'
                else if (isEleventh)
                    s += '11'
                else if (isNinth)
                    s += '9'
                else if (isAugSeventh)
                    s += '+7'
                else
                    s += '7'
            }



        } else {
    i
}f (isMin) {

            chordFunction = 'min'
            let isDim = intervals.contains(6);
            if (!isDim) {

                let isSeventh = intervals.contains(10);
                let isMajSeventh = intervals.contains(11);
                let isSixth = !isSeventh && intervals.contains(9);
                let isNinth = isSeventh && intervals.contains(2);
                let isEleventh = isSeventh && intervals.contains(5);
                let isThirteen = isSeventh && intervals.contains(9);

                if (isMajSeventh)
                    s += 'mMaj'
                else if (isSixth)
                    s += 'm6'
                else if (isThirteen)
                    s += 'm13'
                else if (isEleventh)
                    s += 'm11'
                else if (isNinth)
                    s += 'm9'
                else if (isSeventh)
                    s += 'm7'
                else
                    s += 'm'
            } else {
    i
}f (isDim) {
                chordFunction = 'dim'
                let isSeventh = intervals.contains(9);
                let isHalfDim = intervals.contains(10);
                if (isHalfDim)
                    s += 'ø'
                else if (isSeventh)
                    s += '°7'
                else
                    s += '°'
            }


        } else {
            chordFunction = '';
            let isSeventh = intervals.contains(11);
            let isNinth = isSeventh && intervals.contains(2);
            let isAddNinth = !isSeventh && intervals.contains(2);
            let isThirteen = isSeventh && intervals.contains(9);

            let isSixth = !isSeventh && intervals.contains(9);
            let isSixthNinth = isSixth && intervals.contains(2);
            let isLydian = intervals.contains(6);
            let isSeventhFlatSix = isSeventh && intervals.contains(8) && intervals.contains(2); //TODO b13 shadowed by aug...
            let isAug = intervals.contains(8) && intervals.contains(4)

            if (isLydian)
                s += 'Maj11#'
            else if (isSixthNinth)
                s += '6/9'
            else if (isSixth)
                s += '6'
            else if (isSeventhFlatSix)
                s += 'Maj13b'
            else if (isThirteen)
                s += 'Maj13'
            else if (isNinth)
                s += 'Maj9'
            else if (isAug) {
                s += '+'
                chordFunction = '7';
            } else {
    i
}f (isSeventh)
                s += 'Maj'
            else if (isAddNinth && !isSuspendedSecond)
                s += 'add 9'

            if (isSuspendedSecond && !isSixthNinth) {
                s += ' (sus2)'
                chordFunction = '7';
            } else {
    i
}f (isSuspendedFourth) {
                s += ' (sus4)'
                chordFunction = '7';
            }
        }

        console.log('s => ', s);
        return { root: r, name: s, cfunction: chordFunction, resolve: resolve, notes: ns, intervals: intervals, rName: '', notesNames: [] };
    }

    getChordName3(n, tonality = 'c') {
        let s = '';

        let r = n[0] % 12 || 0;

        //convert midi notes into int between 0 and 12 relative to tonality
        // let scaleDegrees = this.getModNotes(midiNotes);
        let ns = this.getModNotes(n).removeDoubles();
        // let root = this.getRoot(n);
        let root = ns[0];
        // console.log('root => ',root);
        let tn: any = Tonalites.isSharpTonality['#'].indexOf(tonality);
        if (tn == -1)
            tn = Tonalites['b']
        else
            tn = Tonalites['#']

        let resolve = tn[(root - 7).mod(12)] || '';

        let chordFunction = 'normal';

        let intervals = n.getIntervals();
        // console.log('intervals => ',intervals);

        let hasMinSecond = intervals.contains(1);
        let hasMajSecond = intervals.contains(2);
        // let hasAugmentedSecond = intervals.contains(3);

        let hasMinThird = intervals.contains(3);
        let hasMajThird = intervals.contains(4);

        let hasPerfFourth = intervals.contains(5);
        let hasAugFourth = intervals.contains(6);

        let hasDimFifth = intervals.contains(6);
        let hasPerfFifth = intervals.contains(7);
        let hasAugFifth = intervals.contains(8);

        let hasMinSixth = intervals.contains(8);
        let hasMajSixth = intervals.contains(9);

        let hasMinSeventh = intervals.contains(10);
        let hasMajSeventh = intervals.contains(11);

        let hasPerfEight = intervals.contains(12);

        let hasMinNinth = intervals.contains(13);
        let hasMajNinth = intervals.contains(14);
        let hasAugNinth = intervals.contains(15);

        let hasMinTenth = intervals.contains(15);
        let hasMajTenth = intervals.contains(16);

        let hasPerfEleventh = intervals.contains(17);
        let hasAugEleventh = intervals.contains(18);

        let hasPerfTwelfth = intervals.contains(19);

        let hasMinThirteen = intervals.contains(20);
        let hasMajThirteen = intervals.contains(21);

        let hasMinFourteenth = intervals.contains(22);
        let hasMajFourteenth = intervals.contains(23);

        let hasSeventh = hasMinSeventh || hasMajSeventh || hasMinFourteenth || hasMajFourteenth;
        let hasThird = hasMinThird || hasMajThird;
        let isDim = hasDimFifth && hasMinThird;
        let isAug = hasAugFifth && hasMajThird;
        let isMinor = false;
        // console.log("hasMajSecond => ",hasMajSecond);
        // console.log("hasAugmentedSecond => ",hasAugmentedSecond);
        if (hasMajNinth && hasAugNinth) {
            hasAugNinth = false;
            hasMinThird = true;
        }

        if (hasMinSecond) s += '2b'
        // if(hasMajSecond)s+='2'
        if (hasMajSecond && !hasThird && hasPerfFifth) s += 'sus2';
        else if (hasMajSecond) s += '2';

        if (hasMinThird) { s += 'm'; isMinor = true; }
        if (hasMajThird) s += '';

        if (hasPerfFourth && !hasThird && hasPerfFifth) s += 'sus4';
        else if (hasPerfFourth) s += '4';
        // if(hasAugFourth)s+='4#';	

        if (isDim) s += 'o';
        if (!isDim && !hasMinSeventh && hasDimFifth) s += 'b5'
        // if(hasPerfFifth)s+='5';	
        if (isAug) s += '+';

        // if(hasMinSixth)s+='6b';	
        if (hasMajSixth) s += '6';

        if (hasMinSeventh || hasMinFourteenth) s += 'b7';
        if (hasMajSeventh || hasMajFourteenth) s += 'n7';

        // if(hasPerfEight)s+='8';	

        if (hasSeventh && hasMinNinth) s += 'b9';
        if (hasSeventh && hasMajNinth) s += '9';
        if (hasSeventh && hasAugNinth && !hasMinThird) s += '#9';
        if (!hasSeventh && hasMinNinth) s += 'addm2';
        if (!hasSeventh && hasMajNinth) s += 'add2';
        if (!hasSeventh && hasAugNinth && hasMajThird) s += 'addb3';
        if (!hasSeventh && hasAugNinth && !hasMinThird) {
            s = 'm' + s;
            isMinor = true;
        }

        if (hasSeventh && hasPerfEleventh) s += '11';
        if (hasSeventh && hasAugEleventh) s += '#11';
        if (!hasSeventh && hasPerfEleventh) s += 'add4';
        if (!hasSeventh && hasAugEleventh) s += 'addb5';


        if (hasSeventh && hasMinThirteen) s += 'b13';
        if (hasSeventh && hasMajThirteen) s += '13';
        if (!isDim && hasMinSeventh && hasDimFifth) s += 'b13'
        if (!hasSeventh && hasMinThirteen) s += 'add#5';
        if (!hasSeventh && hasMajThirteen && !hasMajSixth) s = '6' + s;

        s = s.replace('mo', 'o');
        s = s.replace('o7b', 'O');
        s = s.replace('o6', 'o7bb');

        if (s == '' && (hasMajThird || hasMajTenth) && (hasPerfFifth || hasPerfTwelfth)) s += 'maj'

        var quality = 'major';
        if (isMinor || isDim) quality = 'minor';
        // console.log('s => ',s);
        return { root: r, name: s, cfunction: chordFunction, resolve: resolve, notes: ns, intervals: intervals, rName: '', notesNames: [], quality: quality };
    }

    getRoot(n) {
        return n[0];
    }

    /**
     * Convert midi notes into int's between 0 and 12 relative to tonality
     * @param {[type]} notes [description]
     */
    getModNotes(notes) {
        return notes.map((val, i, arr) => {
            return val % 12;
        });
    }

    getChord(midiNotes, tonality = 'c') {
        // console.log('getChord');


        let chord = this.getChordName3(midiNotes, tonality);

        let tn: any = Tonalites.isSharpTonality['#'].indexOf(tonality);
        if (tn == -1)
            tn = Tonalites['b']
        else
            tn = Tonalites['#']

        chord.rName = tn[chord.root].charAt(0).toUpperCase() + tn[chord.root].slice(1) || '';


        //get notes names from notes between 0 and 11
        chord.notesNames = this.getNotesName(chord.notes, tn);
        chord.intervals = chord.intervals.removeDoubles();

        // debugger
        // let dNumber = this.scaleNotes.indexOf(chord.notesNames[0])+1; 
        // let dName = this.scale.degreeFct[dNumber-1];

        // chord = this.getChordDegree(chord,this.scaleNotes);


        return {
            root: chord.root,
            rootName: chord.rName,
            notes: chord.notes,
            name: chord.name,
            notesNames: chord.notesNames,
            cfunction: chord.cfunction,
            resolve: chord.resolve,
            intervals: chord.intervals,
            quality: chord.quality
            // degreeNumber:dNumber,
            // degreeName:dName,
            // dfunction:chord.dfunction
        };
    }

    getChordDegree(c, scale) {
        // console.log('c => ',c);
        let s = Scales["major"][1];
        let degree = scale.sum().indexOf(c.root);
        let dFct = s['degreeFct'][degree];
        let tmp: any;
        let tmp2: any = [0];

        c.dfunction = dFct;
        // console.log('dFct => ',dFct);


        return c;
    }

    harmonizeScale(scale, tonality = 'c') {

        let tn: any = Tonalites.isSharpTonality['#'].indexOf(tonality);
        if (tn == -1)
            tn = Tonalites['b']
        else
            tn = Tonalites['#']
        let t: any = tn.indexOf(tonality);

        let s = scale.scale.slice(1, scale.scale.length);
        let chord: any = {};
        let c: any = [];
        let n: any = 0;
        let r: any = 0;
        let out: Array<object> = [];
        let tmp;

        for (var i = 0; i < s.length; i++) {

            for (var j = 0; j < 12; j += 2) {
                for (var k = 0; k < 2; k++) {
                    n += s[(k + i + j) % s.length];
                }
                c.push(n);
                n = 0;
            }
            c.unshift(0);
            c = c.sum();
            c = c.add(scale.scale.sum()[i] + t);
            chord = this.getChordName2(c, tonality);
            chord.rName = tn[chord.root].toUpperCase() || '';
            chord.degree = i;

            out.push(chord);
            chord = new Object();
            c = [];
        }//for
        return out;
    }


    getScales(input: string) {

        let r: string = input[0];
        let ext: string = input.slice(1);

        console.log(r);

        var ans = { root: "", ext: "", scales: [] };
        ans.scales = [];

        //the input Chord Notes
        let chord = this.parseChordNameToNotes(r, ext);


        //Lets search every scale that has those notes with a C root.
        // for every mode known
        let everyScalesMode = Object.getOwnPropertyNames(Scales);
        for (let scaleMode of everyScalesMode) {

            //appart of the chromatic scale
            if (scaleMode == 'chromatic')
                continue;

            // for every scale in the current mode
            let curScaleMode = Scales[scaleMode];
            for (let scaleForm of curScaleMode) {
                let curScale = this.getScaleFromRoot(r, scaleForm);
                let chordInScale = this.isChordInScale(chord, curScale);

                if (chordInScale == true)
                    ans.scales.push(curScale);
            }
        }

        ans.root = r;
        ans.ext = ext;

        return ans;
    }

    /**
     * Parse the name of a chord and return notes contained
     * @param  {string}   r   [description]
     * @param  {string}   ext [description]
     * @return {"notes":[string],"scale":[string]}     [description]
     */
    parseChordNameToNotes(r: string, ext: string) {
        let curChord: {};

        let form = ChordsForms[ext]

        // var curForm = ChordsForms[form];

        curChord = this.getScaleFromRoot(r, form);
        // console.log('curChord => ',curChord);
        return curChord;
    }

    /**
     * Checks if that scale contains that chord
     * @param {[type]} chordNotes [description]
     * @param {[type]} scale      [description]
     */
    isChordInScale(chord, scale) {

        for (let note of chord.notes) {
            if (scale.notes.indexOf(note) == -1)
                return false;
        }
        return true;
    }

    /**
     * get scaleNotes from root and a scale form
     * @param {[type]} r         [description]
     * @param {[type]} scaleForm [description]
     */
    getScaleFromRoot(r, scaleForm) {

        let chromaticScale = Scales["chromatic"][0]["sharp"];
        let rIdx = Scales["chromatic"][0]["sharp"].indexOf(r);

        var tab = [];
        var rIncr = rIdx;

        for (let incr of scaleForm.scale) {
            rIncr += incr;
            tab.push(chromaticScale[(rIncr) % 12]);
        }


        let ans = {};
        if (scaleForm.hasOwnProperty('name'))
            ans = { "name": scaleForm.name, "scale": scaleForm.scale, "notes": tab };
        else
            ans = { "scale": scaleForm.scale, "notes": tab };

        return ans;
    }

    keyToString(key) {

        if (key == undefined) {
            console.warn("musicUtil => keyToString(key) : didnt received key, taking default {fifths:0,mode:'major'}")
            key = { fifths: 0, mode: 'major' };
        }

        var t;

        if (key.fifths >= 0) {
            t = this.fifthsCycle['#'][key.fifths];

        } else {
            t = this.fifthsCycle['b'][Math.abs(key.fifths)];
        }


        if (t.length)
            t = t[0].toUpperCase() + t.slice(1, t.length).toLowerCase();

        return t;
    }


    getCagedPosition = function (caged_selected: string, tona: string, mode: string) {

        let defaultPos = [2, 3, 4, 5, 6, 14, 15, 16, 17, 18];

        switch (caged_selected) {
            case 'C':
                if (mode == 'major')
                    defaultPos = [1, 2, 3, 12, 13, 14, 15, 24];
                else
                    defaultPos = [1, 2, 3, 4, 12, 13, 14, 15, 16, 24];
                break;
            case 'A':
                defaultPos = [2, 3, 4, 5, 6, 14, 15, 16, 17, 18];
                break;
            case 'G':
                if (mode == 'major')
                    defaultPos = [4, 5, 6, 7, 8, 16, 17, 18, 19, 20];
                else
                    defaultPos = [5, 6, 7, 8, 9, 17, 18, 19, 20, 21];
                break;
            case 'E':
                if (mode == 'major')
                    defaultPos = [7, 8, 9, 10, 19, 20, 21, 22];
                else
                    defaultPos = [7, 8, 9, 10, 11, 19, 20, 21, 22, 23];
                break;
            case 'D':
                if (mode == 'major')
                    defaultPos = [9, 10, 11, 12, 13, 1, 21, 22, 23, 24,];
                else
                    defaultPos = [10, 11, 12, 13, 1, 22, 23, 24,];
                break;

        }

        let t = tona[0].toLowerCase() + tona.slice(1, tona.length);


        let idx = Tonalites['#'].indexOf(t);
        if (idx == -1) idx = Tonalites['b'].indexOf(t);
        if (idx == -1) return defaultPos;

        for (let i = 0; i < defaultPos.length; i++) {
            defaultPos[i] = (defaultPos[i] + idx) % 24;
        }

        if (defaultPos.indexOf(0) != -1) defaultPos.push(24);

        return defaultPos;
    }

    replace_double_alterations(double_alt_note, notes_array: Array<Array<string>>) {

        let simplification = Note.simplify(double_alt_note);
        let tab = [...notes_array];

        for (let i = 0; i < notes_array.length; i++)
            for (let j = 0; j < notes_array[i].length; j++) {
                if (tab[i][j] == simplification) tab[i][j] = double_alt_note;
            }

        return tab;
    }

    replace_double_alterations_piano(double_alt_note, notes_array: Array<string>) {

        let simplification = Note.simplify(double_alt_note);
        let tab = [...notes_array];

        for (let i = 0; i < notes_array.length; i++)
            if (tab[i] == simplification) tab[i] = double_alt_note;

        return tab;
    }

    get_scale_quality(scale_name: string) {
        let quality = 'major';
        try {
            quality = Scales.infos[scale_name].quality;
        } catch (e) {
            console.log(e);
            let s = Scales;
            let S = ScaleType;
            console.log(scale_name);
            console.log(S);
            console.log(s);
            debugger
        };

        return quality;
    }

}
