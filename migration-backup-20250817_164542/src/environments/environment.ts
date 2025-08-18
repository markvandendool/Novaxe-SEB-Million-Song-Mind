// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // Angular 20 Compatible API Endpoints (Stubs)
  apiSave2: 'http://localhost:3000/api/save',
  apiLoad2: 'http://localhost:3000/api/load',
  apiCreateUser: 'http://localhost:3000/api/user/create',
  apiSignIn: 'http://localhost:3000/api/user/signin',
  apiSendLink: 'http://localhost:3000/api/user/reset-link',
  apiUserInfos: 'http://localhost:3000/api/user/info',
  apiUpdateUserPass: 'http://localhost:3000/api/user/update-password',
  serverAdress: 'http://localhost:3000/'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
