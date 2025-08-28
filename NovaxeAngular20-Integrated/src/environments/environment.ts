// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  newScore:'/score/new_score',
  store:'/store',
  apiLoad2:'/loadSong2.php',
  apiLoad:'/loadSong.php',
  apiSave2:'/saveSong2.php',
  apiSave:'/saveSong.php',
  apiList:'/listSongs.php',
  apiDeleteSong:'/deleteSong.php',
  apiSearchAnalysis:'/searchAnalysis.php',
  apiGetChordsFromYoutube:'/api/getChords/getChordsFromYoutube.php',
  apiGetHarmtraceAnalysis:'/getHarmtraceAnalysis.php',
  apiCreateUser:'/createUser.php',
  apiSignIn:'/signIn.php',
  apiSendLink:'/api/passRecovery/sendLink',
  apiUserInfos:'/api/passRecovery/userInfos',
  apiUpdateUserPass:'/api/passRecovery/updateUserPass',
  apigetWavFromYoutube:'/getWavFromYoutube.php',
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
