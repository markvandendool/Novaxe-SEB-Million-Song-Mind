import { NgModule } from '@angular/core';
import { Routes, RouterModule, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { SongComponent } from '@components/song/song.component';
import { HomeComponent } from '@components/home/home.component';
import { MetroPageComponent } from '@components/metro/metro-page/metro-page.component';
import { FifthCircleComponent } from '@components/fifth-circle/fifth-circle.component';
import { TransportComponent } from '@components/transport/transport.component';
import { TestpageComponent } from '@components/testpage/testpage.component';
import { LearnFifthsComponent } from '@components/learn-fifths/learn-fifths.component';
import { AbcCheckerComponent } from '@components/exercises/templates/abc-checker/abc-checker.component';
import { AbcCheckerFullScoreComponent } from '@components/exercises/templates/abc-checker-full-score/abc-checker-full-score.component';
import { AbcHearingComponent } from '@components/exercises/templates/abc-hearing/abc-hearing.component';
import { ExerciceRythmComponent } from '@components/exercises/templates/rhythm/exercice-rythm.component';
import { CreateFifthsExerciseComponent } from '@components/create-fifths-exercise/create-fifths-exercise.component';
import { MidiChordDetectSimpleComponent } from '@components/midi-chord-detect-simple/midi-chord-detect-simple.component';
import { DraftComponent } from '@components/draft/draft.component';

import { PageFifthCircleComponent } from '@components/page-fifth-circle/page-fifth-circle.component';
import { TemplateViewerComponent } from '@components/exercises/template-viewer/template-viewer.component';
import { ResultsComponent } from '@components/exercises/results/results.component';

import { Observable } from 'rxjs';
import { Songmodel } from '@models/songmodel/songmodel';
import { Injectable } from '@angular/core';
import { Statsmodel } from '@models/statsmodel/statsmodel';

import { PageGeneratorComponent } from '@components/exercises/page-generator/page-generator.component';
import { PageExerciseSelectionComponent } from '@components/exercises/page-exercise-selection/page-exercise-selection.component';

import { PageArtistComponent } from '@pages/page-artist/page-artist.component';
import { PageAlbumComponent } from '@pages/page-album/page-album.component';
import { PageStyleComponent } from '@pages/page-style/page-style.component';
import { PageAuthorComponent } from '@pages/page-author/page-author.component';
import { PageKeyComponent } from '@pages/page-key/page-key.component';
import { ResetPasswordComponent } from '@pages/reset-password/reset-password.component';
import { StatsComponent } from '@pages/stats/stats.component';
import { StoreComponent } from '@pages/store/store.component';
import { PremiumAuthComponent } from '@components/premium-auth/premium-auth.component';

@Injectable()
export class SongResolver {

  constructor(private sm2: Songmodel) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    console.log("route.params.score_id => ", route.params.score_id);
    //FOR NEW SCORE
    if (!route.params.score_id || route.params.score_id == undefined) {
      this.sm2.reset();

      return this.sm2;
    } else {
      return this.sm2.fetch(route.params.score_id);

    }

  }
}

@Injectable()
export class StatsResolver {

  constructor(private stm: Statsmodel, private sm2: Songmodel) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {

    return this.sm2.fetch(route.params.score_id).toPromise().then(() => {
      this.stm.reset();
      this.stm.compute(this.sm2);

    })

  }
}

const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'auth', component: PremiumAuthComponent },
  { path: 'home', component: HomeComponent },
  { path: 'metronome', component: MetroPageComponent, pathMatch: 'prefix' },
  { path: 'fifths', component: PageFifthCircleComponent, pathMatch: 'prefix' },
  { path: 'chord-detect', component: MidiChordDetectSimpleComponent, pathMatch: 'prefix' },
  { path: 'learn-fifths', component: LearnFifthsComponent, pathMatch: 'prefix' },
  { path: 'learn-rythm', component: AbcCheckerComponent, pathMatch: 'prefix' },
  { path: 'full-score', component: AbcCheckerFullScoreComponent, pathMatch: 'prefix' },
  { path: 'hearing', component: AbcHearingComponent, pathMatch: 'prefix' },
  { path: 'select-exercise', component: PageExerciseSelectionComponent, pathMatch: 'prefix' },
  { path: 'create-exercise', component: PageGeneratorComponent },
  { path: 'score/new_score', component: SongComponent, pathMatch: 'prefix', resolve: { sm2: SongResolver } },
  { path: 'score/:score_id', component: SongComponent, pathMatch: 'prefix', resolve: { sm2: SongResolver } },
  { path: 'stats/:score_id', component: StatsComponent, pathMatch: 'prefix', resolve: { stm: StatsResolver } },
  { path: 'store', component: StoreComponent },
  { path: 'search', component: SongComponent },
  { path: 'draft', component: DraftComponent },
  { path: 'browse', component: SongComponent },
  { path: 'exo', component: TemplateViewerComponent },
  { path: 'results', component: ResultsComponent },
  { path: 'artist/:artist', component: PageArtistComponent, pathMatch: 'prefix' },
  { path: 'album/:album', component: PageAlbumComponent, pathMatch: 'prefix' },
  { path: 'style/:style', component: PageStyleComponent, pathMatch: 'prefix' },
  { path: 'author/:author', component: PageAuthorComponent, pathMatch: 'prefix' },
  { path: 'key/:key', component: PageKeyComponent, pathMatch: 'prefix' },
  { path: 'reset-password', component: ResetPasswordComponent, pathMatch: 'prefix' },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home', pathMatch: 'full' },
  // { path: '**', component: TestpageComponent } , // always at the bottom !
];

@NgModule({
  imports: [RouterModule.forRoot(routes,
    // { enableTracing: true } // <== debug only !
  )],
  providers: [SongResolver, StatsResolver],
  exports: [RouterModule]
})
export class AppRoutingModule { }


