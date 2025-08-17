import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Existing working components
import { BraidComponent } from './components/braid/braid.component';
import { TransportComponent } from './components/transport/transport.component';
import { GuitarComponent } from './components/guitar/guitar.component';

// BATCH 1: Simple components (migrated with Sensei wisdom) - ALL 4 COMPONENTS!
import { CountdownComponent } from './components/countdown/countdown.component';
import { HomeComponent } from './components/home/home.component';
import { MetroPageComponent } from './components/metro-page/metro-page.component';
import { MidiChordDetectSimpleComponent } from './components/midi-chord-detect-simple/midi-chord-detect-simple.component';

// BATCH 2: Medium complexity components - MUSIC THEORY & ADVANCED INTERFACES
import { PianoMiniComponent } from './components/piano-mini/piano-mini.component';
import { ScaleSelectorComponent } from './components/scale-selector/scale-selector.component';
import { LearnFifthsComponent } from './components/learn-fifths/learn-fifths.component';

// BATCH 3: Complex components - ADVANCED CANVAS & INTERACTIVE SYSTEMS (790+ lines total!)
import { EditorComponent } from './components/editor/editor.component';
import { PianoComponent } from './components/piano/piano.component';
import { FretboardComponent } from './components/fretboard/fretboard.component';

// MIGRATION STEP 1: Small components with minimal dependencies
import { TestpageComponent } from './components/testpage/testpage.component';

// STEP 3A: Real Novaxe component migration
import { PageFifthCircleComponent } from './components/page-fifth-circle/page-fifth-circle.component';

// MIGRATION STEP 4: Simple page components
import { PageAlbumComponent } from './pages/page-album/page-album.component';

@NgModule({
  declarations: [
    // Core
    AppComponent,

    // Working components (proven infrastructure)
    BraidComponent,
    TransportComponent,
    GuitarComponent,

    // BATCH 1: Simple components - ALL 4 MIGRATED! 
    CountdownComponent,
    HomeComponent,
    MetroPageComponent,
    MidiChordDetectSimpleComponent,

    // BATCH 2: Medium complexity components - MUSIC THEORY & ADVANCED INTERFACES
    PianoMiniComponent,
    ScaleSelectorComponent,
    LearnFifthsComponent,

    // BATCH 3: Complex components - ADVANCED CANVAS & INTERACTIVE SYSTEMS (790+ lines total!)
    EditorComponent,
    PianoComponent,
    FretboardComponent,

    // MIGRATION STEP 1: Small components with minimal dependencies
    TestpageComponent,

    // STEP 3A: Real Novaxe component migration
    PageFifthCircleComponent,

    // MIGRATION STEP 4: Simple page components
    PageAlbumComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
    console.log('🚀 AppModule loaded with 7 components (4 new migrations!)');
  }
}
