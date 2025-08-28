// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'https://millionsongmind.com/api/obsidian',
  newScore: '/score/new_score',
  store: '/store',
  apiLoad2: '/api/obsidian/loadSong2.php',
  apiLoad: '/api/obsidian/loadSong.php',
  apiSave2: '/api/obsidian/saveSong2.php',
  apiSave: '/api/obsidian/saveSong.php',
  apiList: '/api/obsidian/listSongs.php',
  apiDeleteSong: '/api/obsidian/deleteSong.php',
  apiSearchAnalysis: '/api/obsidian/searchAnalysis.php',
  apiGetChordsFromYoutube: '/api/getChords/getChordsFromYoutube.php',
  apiGetHarmtraceAnalysis: '/api/obsidian/getHarmtraceAnalysis.php',
  apiCreateUser: '/api/obsidian/createUser.php',
  apiSignIn: '/api/obsidian/signIn.php',
  apiSendLink: '/api/passRecovery/sendLink',
  apiUserInfos: '/api/passRecovery/userInfos',
  apiUpdateUserPass: '/api/passRecovery/updateUserPass',
  apigetWavFromYoutube: '/api/obsidian/getWavFromYoutube.php',
  wavfiles: '/shared/wavfiles/',
  serverAdress: 'https://millionsongmind.com/',
  apiGetPaymentToken: '/api/payment/getToken_paypal.php',
  clientId_sand: 'AZimGKLHyrnqLph1ieVp33nwhypiGIlkNGWXR-YpPaC4LqSZBOctlXFCCXyXcTA1P_Us1X8P4cOCPYZZ',
  clientId_prod: 'AU9k8oJd9Ju8udnzQoEr2LEjgBbGWMRlnzWuEe4SZ6oTdmkd5vt35XgoZ63MURiko17yUtOxkI3S_pA4',
  apiDiscogs: '/api/discogs/discogs',
  apiSpotify: '/api/spotify/songInfos',
  apiSpotifyAnalysis: '/api/spotify/songFeatures',
  apiSpotifyContents: '/api/spotify/songContents',
  apiSpotifyReco: '/api/spotify/songReco',
  apiSpotifyTop: '/api/spotify/songTop',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
