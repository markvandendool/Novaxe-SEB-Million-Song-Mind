import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PianoComponent } from './components/piano/piano.component';
import { FretboardComponent } from './components/fretboard/fretboard.component';
import { LearnFifthsComponent } from './components/learn-fifths/learn-fifths.component';
import { PageFifthCircleComponent } from './components/page-fifth-circle/page-fifth-circle.component';
import { TestpageComponent } from './components/testpage/testpage.component';
import { PageAlbumComponent } from './pages/page-album/page-album.component';
import { PageAuthorComponent } from './pages/page-author/page-author.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },
  { path: 'piano', component: PianoComponent },
  { path: 'fretboard', component: FretboardComponent },
  { path: 'learn-fifths', component: LearnFifthsComponent },
  { path: 'fifths', component: PageFifthCircleComponent },
  { path: 'test', component: TestpageComponent },
  { path: 'album/:album', component: PageAlbumComponent },
  { path: 'author/:author', component: PageAuthorComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
