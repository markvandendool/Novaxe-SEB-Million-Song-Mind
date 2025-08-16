// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  newScore:'/score/new_score',
  store:'/store',
  apiLoad2:'/api/loadSong2',
  apiLoad:'/api/loadSong',
  apiSave2:'/api/saveSong2',
  apiSave:'/api/saveSong',
  apiList:'/api/listSongs',
  apiDeleteSong:'/api/deleteSong',
  apiSearchAnalysis:'/api/searchAnalysis',
  apiGetChordsFromYoutube:'/api/getChords/getChordsFromYoutube.php',
  apiGetHarmtraceAnalysis:'/api/getHarmtraceAnalysis.php',
  apiCreateUser:'/api/createUser',
  apiSignIn:'/api/signIn',
  apiSendLink:'/api/passRecovery/sendLink',
  apiUserInfos:'/api/passRecovery/userInfos',
  apiUpdateUserPass:'/api/passRecovery/updateUserPass',
  apigetWavFromYoutube:'/api/getWavFromYoutube.php',
  wavfiles:'/shared/wavfiles/',
  serverAdress:'http://localhost:4200/',
  apiGetPaymentToken:'/api/payment/getToken_paypal.php',
  clientId_sand:'AZimGKLHyrnqLph1ieVp33nwhypiGIlkNGWXR-YpPaC4LqSZBOctlXFCCXyXcTA1P_Us1X8P4cOCPYZZ',
  clientId_prod:'AU9k8oJd9Ju8udnzQoEr2LEjgBbGWMRlnzWuEe4SZ6oTdmkd5vt35XgoZ63MURiko17yUtOxkI3S_pA4',
  apiDiscogs:'/api/discogs/discogs',
  apiSpotify:'/api/spotify/songInfos',
  apiSpotifyAnalysis:'/api/spotify/songFeatures',
  apiSpotifyContents:'/api/spotify/songContents',
  apiSpotifyReco:'/api/spotify/songReco',
  apiSpotifyTop:'/api/spotify/songTop',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
