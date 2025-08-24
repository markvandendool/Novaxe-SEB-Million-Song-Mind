import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CookieModule } from 'ngx-cookie';

import abcjs from 'abcjs';
declare global {
  var ABC: any;
}
export const ABC: any = abcjs;



import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HomeComponent } from '@components/home/home.component';
import { BrowseComponent } from '@components/browse/browse.component';

import { SongComponent } from '@components/song/song.component';

import { Songmodel } from '@models/songmodel/songmodel';
import { SongInfo } from '@models/songmodel/song-info';

import { DisplayService } from '@services/display/displayService';
import { SelectionModel } from '@models/selectionmodel/selectionmodel';
import { UserModel } from '@models/usermodel/usermodel';
import { ConfigModel } from '@models/configmodel/configModel';
import { ExerciseModel } from '@models/exercisemodel/exercisemodel';
import { CurTonalityModel } from '@models/songmodel/cur-tonality-model';
import { Statsmodel } from '@models/statsmodel/statsmodel';

import { StorageService } from '@services/storage/storage.service';
import { ExoGenService } from '@services/exercises/exercise_generator/exo-gen.service';
import { SynthService } from '@services/synth/synth.service';
import { ExerciseResultsService } from '@services/exercises/exercise_results/exercise-results.service';

import { TransportComponent } from '@components/transport/transport.component';
import { MetroComponent } from '@components/metro/metro.component';

import { TransportService } from '@services/transport/transport.service';
// import { MidiService } from '@components/guitar/midi.service';
// import { GuitarService } from '@components/guitar/guitar.service';
import { ParsingService } from '@services/parsing.service';
import { MidiService } from '@services/midi/midi.service';
import { MusicUtilsService } from '@services/music-utils-service/music-utils.service';
import { YoutubeService } from '@services/youtube-service/youtube.service';
import { AudioPlayer } from '@services/audioplayer/audioplayer.service';
import { ChordDetectService } from '@services/chord-detect/chord-detect.service';
import { SoundfontService } from '@services/soundfont/soundfont.service';
import { DiscogsService } from '@services/discogs/discogs.service';
import { SpotifyService } from '@services/spotify/spotify.service';

import { GuitarComponent } from '@components/guitar/guitar.component';
import { TestpageComponent } from '@components/testpage/testpage.component';
import { TabParserComponent } from '@components/tab-parser/tab-parser.component';
import { ChordsFromYoutubeComponent } from '@components/chords-from-youtube/chords-from-youtube.component';
import { FifthCircleComponent } from '@components/fifth-circle/fifth-circle.component';

import { MidiChordDetectSimpleComponent } from '@components/midi-chord-detect-simple/midi-chord-detect-simple.component';
import { MidiChordDetectAbcComponent } from './components/midi-chord-detect-abc/midi-chord-detect-abc.component';

import { LearnFifthsComponent } from '@components/learn-fifths/learn-fifths.component';
import { PianoComponent } from '@components/piano/piano.component';
import { CreateFifthsExerciseComponent } from '@components/create-fifths-exercise/create-fifths-exercise.component';
import { ExerciceRythmComponent } from '@components/exercises/templates/rhythm/exercice-rythm.component';
import { MetroPageComponent } from '@components/metro/metro-page/metro-page.component';
import { NavbarComponent } from '@components/navbar/navbar.component';

import * as $ from 'jquery';
import { YoutubeAudioComponent } from '@components/youtube-audio/youtube-audio.component';
import { EditorComponent } from '@components/editor/editor.component';
import { DraftComponent } from '@components/draft/draft.component';
import { PageFifthCircleComponent } from '@components/page-fifth-circle/page-fifth-circle.component';
import { TemplateViewerComponent } from '@components/exercises/template-viewer/template-viewer.component';
import { ChordComponent } from '@components/exercises/templates/chord/chord.component';
import { ResultsComponent } from '@components/exercises/results/results.component';
import { CountdownComponent } from '@components/exercises/templates/countdown/countdown.component';
import { NotesComponent } from '@components/exercises/templates/notes/notes.component';
import { MixedTemplateComponent } from './components/exercises/templates/mixed-template/mixed-template.component';
import { MidiSelectorComponent } from './components/midi-selector/midi-selector.component';
import { InstrLvl1Component } from './components/exercises/templates/instr-lvl1/instr-lvl1.component';

import { PageGeneratorComponent } from '@components/exercises/page-generator/page-generator.component';
import { PageExerciseSelectionComponent } from './components/exercises/page-exercise-selection/page-exercise-selection.component';
import { AbcCheckerComponent } from './components/exercises/templates/abc-checker/abc-checker.component';
import { AbcCheckerFullScoreComponent } from './components/exercises/templates/abc-checker-full-score/abc-checker-full-score.component';
import { AbcHearingComponent } from './components/exercises/templates/abc-hearing/abc-hearing.component';
import { DicoComponent } from './components/dico/dico.component';
import { PianoMiniComponent } from '@components/piano-mini/piano-mini.component';
import { ChordsBrowseComponent } from './components/chords-browse/chords-browse.component';
import { PageArtistComponent } from './pages/page-artist/page-artist.component';
import { PageAlbumComponent } from './pages/page-album/page-album.component';
import { PageStyleComponent } from './pages/page-style/page-style.component';
import { PageAuthorComponent } from './pages/page-author/page-author.component';
// import { PageKeyComponent } from './pages/page-key/page-key.component';
import { FretboardComponent } from './components/fretboard/fretboard.component';
import { FretboardDiamondComponent } from './components/fretboard/fretboard.component';
import { PianoDiamondComponent } from './components/piano/piano.component';
import { ScaleSelectorComponent } from './components/scale-selector/scale-selector.component';
import { TonalityButtonComponent } from './components/tonality-button/tonality-button.component';
import { BraidComponent } from './components/braid/braid.component';
import { MidiControlSelectorComponent } from './components/midi-control-selector/midi-control-selector.component';
// import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { StatsComponent } from './pages/stats/stats.component';
import { DonateComponent } from './components/donate/donate.component';
import { ChordstripComponent } from './components/chordstrip/chordstrip.component';
import { CubesComponent } from './components/cubes/cubes.component';
import { CubesDemoComponent } from './components/cubes-demo/cubes-demo.component';
import { StoreComponent } from './pages/store/store.component';
import { MidiChordDisplayComponent } from './components/midi-chord-display/midi-chord-display.component';
import { PremiumAuthComponent } from './components/premium-auth/premium-auth.component';
import { CurChordModel } from '@models/songmodel/cur-chord-model';
import { TestSimpleComponent } from './test-simple/test-simple.component';



@NgModule({
  declarations: [
    AppComponent,
    SongComponent,
    HomeComponent,
    BrowseComponent,
    TransportComponent,
    MetroComponent,
    TestpageComponent,
    GuitarComponent,
    TabParserComponent,
    ChordsFromYoutubeComponent,
    FifthCircleComponent,
    MidiChordDetectSimpleComponent,
    LearnFifthsComponent,
    PianoComponent,
    CreateFifthsExerciseComponent,
    MetroPageComponent,
    NavbarComponent,
    YoutubeAudioComponent,
    EditorComponent,
    MidiChordDetectAbcComponent,
    ExerciceRythmComponent,
    DraftComponent,
    PageFifthCircleComponent,
    PageGeneratorComponent,
    TemplateViewerComponent,
    ResultsComponent,
    ChordComponent,
    CountdownComponent,
    NotesComponent,
    MixedTemplateComponent,
    MidiSelectorComponent,
    InstrLvl1Component,
    PageExerciseSelectionComponent,
    AbcCheckerComponent,
    AbcCheckerFullScoreComponent,
    AbcHearingComponent,
    DicoComponent,
    PianoMiniComponent,
    ChordsBrowseComponent,
    PageArtistComponent,
    PageAlbumComponent,
    PageStyleComponent,
    PageAuthorComponent,
    // PageKeyComponent,
    FretboardComponent,
    FretboardDiamondComponent,
    PianoDiamondComponent,
    ScaleSelectorComponent,
    TonalityButtonComponent,
    BraidComponent,
    MidiControlSelectorComponent,
    // ResetPasswordComponent,
    StatsComponent,
    DonateComponent,
    ChordstripComponent,
    CubesComponent,
    CubesDemoComponent,
    StoreComponent,
    MidiChordDisplayComponent,
    PremiumAuthComponent,
    TestSimpleComponent,
  ],
  bootstrap: [AppComponent], imports: [BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    CookieModule.forRoot()], providers: [
      Songmodel,
      SongInfo,
      Statsmodel,
      StorageService,
      ExoGenService,
      SynthService,
      ExerciseResultsService,
      DisplayService,
      SelectionModel,
      ConfigModel,
      TransportService,
      ParsingService,
      MidiService,
      MusicUtilsService,
      UserModel,
      YoutubeService,
      AudioPlayer,
      ChordDetectService,
      SoundfontService,
      ExerciseModel,
      DiscogsService,
      SpotifyService,
      CurTonalityModel,
      CurChordModel,
      provideHttpClient(withInterceptorsFromDi())
    ]
})
export class AppModule { }
