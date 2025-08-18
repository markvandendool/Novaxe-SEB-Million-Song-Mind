
@Injectable()
export class SongResolver implements Resolve<Songmodel>  {
  public constructor(public private sm2: Songmodel) {}
  public resolve(route: ActivatedRouteSnapshot,state: RouterStateSnapshot): Observable<any>|Promise<any>|any {
    //FOR NEW SCORE
    if(!route.params.score_id || route.params.score_id == undefined: any) {
      this.sm2.reset(); 
      return this.sm2;
    }else{
      return this.sm2.fetch(route.params.score_id);
    }
  }
}
export class StatsResolver implements Resolve<Statsmodel>  {
  public constructor(public private stm: Statsmodel,private sm2: Songmodel) {  }
    return this.sm2.fetch(route.params.score_id).toPromise().then(()=>{
      this.stm.reset();
      this.stm.compute(this.sm2); 
    })   
const routes: Routes = [
 { path: 'home', component: HomeComponent },
 { path: 'metronome', component: MetroPageComponent , pathMatch: 'prefix'},
 { path: 'fifths', component: PageFifthCircleComponent , pathMatch: 'prefix'},
 { path: 'chord-detect', component: MidiChordDetectSimpleComponent , pathMatch: 'prefix'},
 { path: 'learn-fifths', component: LearnFifthsComponent , pathMatch: 'prefix'},
 { path: 'learn-rythm', component: AbcCheckerComponent , pathMatch: 'prefix'},
 { path: 'full-score', component: AbcCheckerFullScoreComponent , pathMatch: 'prefix'},
 { path: 'hearing', component:  AbcHearingComponent, pathMatch: 'prefix'},
 { path: 'select-exercise', component: PageExerciseSelectionComponent , pathMatch: 'prefix'},
 { path: 'create-exercise', component: PageGeneratorComponent } ,
 { path: 'score/new_score', component: SongComponent , pathMatch: 'prefix',resolve:{sm2:SongResolver}},
 { path: 'score/:score_id', component: SongComponent , pathMatch: 'prefix',resolve:{sm2:SongResolver}},
 { path: 'stats/:score_id', component: StatsComponent , pathMatch: 'prefix',resolve:{stm:StatsResolver}},
 { path: 'store', component: StoreComponent },
 { path: 'search', component: SongComponent },
 { path: 'draft', component: DraftComponent },
 { path: 'browse', component: SongComponent },
 { path: 'exo', component: TemplateViewerComponent } ,
 { path: 'results', component: ResultsComponent } ,
 { path: 'artist/:artist', component: PageArtistComponent , pathMatch: 'prefix'},
 { path: 'album/:album', component: PageAlbumComponent , pathMatch: 'prefix'},
 { path: 'style/:style', component: PageStyleComponent , pathMatch: 'prefix'},
 { path: 'author/:author', component: PageAuthorComponent , pathMatch: 'prefix'},
 { path: 'key/:key', component: PageKeyComponent , pathMatch: 'prefix'},
 { path: 'reset-password', component: ResetPasswordComponent , pathMatch: 'prefix'},
 { path: '', redirectTo: '/home', pathMatch: 'full' },
 { path: '**', redirectTo: '/home', pathMatch: 'full' } ,
 // { path: '**', component: TestpageComponent } , // always at the bottom !
];
@NgModule({
  imports: [RouterModule.forRoot(routes, 
                                 // { enableTracing: true } // <== debug only !
                                 )],
  providers:[SongResolver,StatsResolver],
  exports: [RouterModule]
})
export class AppRoutingModule  { }
