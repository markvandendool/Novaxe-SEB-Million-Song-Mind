/**
 * ChordCubes MusicXML Integration - Phase 1 Foundation
 * Core MusicXML data structures and conversion utilities
 */

// MusicXML-Compatible Chord Data Structure
class MusicXMLChord {
    constructor(legacyChord) {
        // Standard MusicXML harmony element
        this.harmony = {
            root: this.extractRoot(legacyChord.userData.roman),
            kind: this.determineChordKind(legacyChord.userData.roman),
            bass: null, // For slash chords
            degree: this.mapExtensions(legacyChord.userData.extensions || []),
            inversion: legacyChord.userData.rotationIndex || 0
        };

        // Precise timing information (480 ticks per quarter note)
        this.timing = {
            measure: 1,
            beat: 1,
            subdivision: 0,
            duration: 1920, // Full measure in ticks (4 * 480)
            absoluteTicks: 0
        };

        // ChordCubes-specific visual enhancements
        this.visual = {
            position: legacyChord.position ? {
                x: legacyChord.position.x,
                y: legacyChord.position.y,
                z: legacyChord.position.z
            } : { x: 0, y: 0, z: 0 },
            colorScheme: 'chordTones',
            notationStyle: '3d',
            showExtensions: true
        };

        // Backward compatibility
        this.legacy = legacyChord;
    }

    extractRoot(romanNumeral) {
        const rootMap = {
            'I': 'C', 'i': 'C',
            'II': 'D', 'ii': 'D', 'bII': 'Db',
            'III': 'E', 'iii': 'E', 'bIII': 'Eb',
            'IV': 'F', 'iv': 'F', '#IV': 'F#',
            'V': 'G', 'v': 'G', 'bV': 'Gb',
            'VI': 'A', 'vi': 'A', 'bVI': 'Ab',
            'VII': 'B', 'vii': 'B', 'bVII': 'Bb'
        };

        const baseRoman = romanNumeral.replace(/[^IViv]/g, '');
        return { step: rootMap[baseRoman] || 'C', alter: 0 };
    }

    determineChordKind(romanNumeral) {
        if (romanNumeral.includes('º')) return 'diminished';
        if (romanNumeral.includes('ø')) return 'half-diminished';
        if (romanNumeral.includes('7')) return 'dominant-seventh';
        if (romanNumeral.match(/^[IVX]+$/)) return 'major'; // Uppercase = major
        if (romanNumeral.match(/^[ivx]+$/)) return 'minor'; // Lowercase = minor
        return 'major';
    }

    mapExtensions(extensions) {
        const extensionMap = {
            'b9': { value: 9, alter: -1, type: 'add' },
            'sus2': { value: 2, alter: 0, type: 'subtract-third-add' },
            'sus4': { value: 4, alter: 0, type: 'subtract-third-add' },
            '#11': { value: 11, alter: 1, type: 'add' },
            'b13': { value: 13, alter: -1, type: 'add' },
            'b7': { value: 7, alter: -1, type: 'add' },
            'maj7': { value: 7, alter: 0, type: 'add' }
        };

        return extensions.map(ext => ({
            'degree-value': extensionMap[ext.name]?.value || 9,
            'degree-alter': extensionMap[ext.name]?.alter || 0,
            'degree-type': extensionMap[ext.name]?.type || 'add'
        }));
    }

    // Generate MusicXML harmony element
    toMusicXML() {
        return `
        <harmony default-y="40">
            <root>
                <root-step>${this.harmony.root.step}</root-step>
                ${this.harmony.root.alter !== 0 ? `<root-alter>${this.harmony.root.alter}</root-alter>` : ''}
            </root>
            <kind>${this.harmony.kind}</kind>
            ${this.harmony.degree.map(deg => `
                <degree>
                    <degree-value>${deg['degree-value']}</degree-value>
                    <degree-alter>${deg['degree-alter']}</degree-alter>
                    <degree-type>${deg['degree-type']}</degree-type>
                </degree>
            `).join('')}
            <!-- ChordCubes metadata -->
            <other-harmony>
                <chordcubes-data>
                    <position x="${this.visual.position.x}" y="${this.visual.position.y}" z="${this.visual.position.z}"/>
                    <color-scheme>${this.visual.colorScheme}</color-scheme>
                    <rotation-index>${this.harmony.inversion}</rotation-index>
                </chordcubes-data>
            </other-harmony>
        </harmony>`;
    }
}

// Precision Timeline Engine
class PrecisionTimeline {
    constructor() {
        this.ticksPerQuarter = 480; // Standard MIDI resolution
        this.timeSignature = { beats: 4, noteValue: 4 };
        this.measures = new Map();
        this.events = [];
        this.tempo = 120; // BPM
    }

    // Convert beat position to absolute ticks
    beatToTicks(measure, beat, subdivision = 0) {
        const ticksPerMeasure = this.ticksPerQuarter * this.timeSignature.beats;
        const measureStart = (measure - 1) * ticksPerMeasure;
        const beatTicks = (beat - 1) * this.ticksPerQuarter;
        const subdivisionTicks = subdivision * (this.ticksPerQuarter / 4); // 16th note subdivisions

        return measureStart + beatTicks + subdivisionTicks;
    }

    // Schedule chord change at precise timing
    scheduleChordChange(chord, measure, beat, subdivision = 0) {
        const absoluteTicks = this.beatToTicks(measure, beat, subdivision);
        chord.timing.measure = measure;
        chord.timing.beat = beat;
        chord.timing.subdivision = subdivision;
        chord.timing.absoluteTicks = absoluteTicks;

        const event = {
            type: 'chordChange',
            chord: chord,
            timing: absoluteTicks
        };

        this.events.push(event);
        this.events.sort((a, b) => a.timing - b.timing);

        console.log(`[PRECISION TIMELINE] Scheduled ${chord.harmony.root.step} chord at measure ${measure}, beat ${beat}, ticks: ${absoluteTicks}`);
    }

    // Support for syncopated chord changes
    addSyncopatedChord(chord, measure, beat, offsetSixteenths) {
        const subdivision = offsetSixteenths;
        this.scheduleChordChange(chord, measure, beat, subdivision);
    }

    // Get current tempo in seconds per tick
    getSecondsPerTick() {
        const beatsPerSecond = this.tempo / 60;
        const ticksPerSecond = beatsPerSecond * this.ticksPerQuarter;
        return 1 / ticksPerSecond;
    }
}

// Legacy Data Migrator - Backward Compatibility
class LegacyDataMigrator {
    constructor() {
        this.timeline = new PrecisionTimeline();
    }

    // Convert current lineup array to MusicXML structure
    convertLineupToMusicXML(lineup) {
        const musicXMLChords = [];

        lineup.forEach((legacyChord, index) => {
            const musicXMLChord = new MusicXMLChord(legacyChord);

            // For now, place each chord on downbeat of consecutive measures
            // Phase 2 will add sub-measure timing
            this.timeline.scheduleChordChange(musicXMLChord, index + 1, 1, 0);

            musicXMLChords.push(musicXMLChord);
        });

        console.log(`[MIGRATION] Converted ${lineup.length} chords to MusicXML format`);
        return musicXMLChords;
    }

    // Preserve existing extensions in MusicXML format
    preserveExtensions(legacyChord) {
        if (!legacyChord.userData || !legacyChord.userData.extensions) {
            return [];
        }

        return legacyChord.userData.extensions.map(ext => ({
            name: ext.name,
            interval: ext.interval,
            description: ext.description,
            musicXML: {
                'degree-value': this.getExtensionValue(ext.name),
                'degree-alter': this.getExtensionAlter(ext.name),
                'degree-type': this.getExtensionType(ext.name)
            }
        }));
    }

    getExtensionValue(extName) {
        const valueMap = { 'b9': 9, 'sus2': 2, 'sus4': 4, '#11': 11, 'b13': 13, 'b7': 7, 'maj7': 7 };
        return valueMap[extName] || 9;
    }

    getExtensionAlter(extName) {
        const alterMap = { 'b9': -1, 'sus2': 0, 'sus4': 0, '#11': 1, 'b13': -1, 'b7': -1, 'maj7': 0 };
        return alterMap[extName] || 0;
    }

    getExtensionType(extName) {
        if (extName === 'sus2' || extName === 'sus4') return 'subtract-third-add';
        return 'add';
    }
}

// MusicXML Document Generator
class MusicXMLGenerator {
    constructor() {
        this.score = {
            title: 'ChordCubes Composition',
            composer: 'ChordCubes User',
            software: 'ChordCubes v2.0',
            parts: []
        };
    }

    generateScore(musicXMLChords) {
        const harmonyPart = this.createHarmonyPart(musicXMLChords);

        const xmlDocument = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
    <work>
        <work-title>${this.score.title}</work-title>
    </work>
    
    <identification>
        <creator type="composer">${this.score.composer}</creator>
        <creator type="software">${this.score.software}</creator>
        <encoding>
            <encoding-date>${new Date().toISOString().split('T')[0]}</encoding-date>
            <software>ChordCubes MusicXML Integration v2.0</software>
        </encoding>
    </identification>
    
    <part-list>
        <score-part id="P1">
            <part-name>Harmony</part-name>
            <part-abbreviation>Harm</part-abbreviation>
        </score-part>
    </part-list>
    
    ${harmonyPart}
</score-partwise>`;

        return xmlDocument;
    }

    createHarmonyPart(musicXMLChords) {
        let measures = '';
        let currentMeasure = 1;

        musicXMLChords.forEach((chord, index) => {
            if (chord.timing.measure !== currentMeasure) {
                currentMeasure = chord.timing.measure;
            }

            measures += `
        <measure number="${currentMeasure}">
            ${index === 0 ? `
            <attributes>
                <time>
                    <beats>4</beats>
                    <beat-type>4</beat-type>
                </time>
                <key>
                    <fifths>0</fifths>
                </key>
            </attributes>` : ''}
            
            ${chord.toMusicXML()}
            
            <note>
                <rest/>
                <duration>960</duration>
                <voice>1</voice>
            </note>
        </measure>`;
        });

        return `
    <part id="P1">
        ${measures}
    </part>`;
    }
}

// Export Phase 1 classes for use in main application
window.MusicXMLChord = MusicXMLChord;
window.PrecisionTimeline = PrecisionTimeline;
window.LegacyDataMigrator = LegacyDataMigrator;
window.MusicXMLGenerator = MusicXMLGenerator;

console.log('[PHASE 1] MusicXML Core Foundation loaded successfully');
