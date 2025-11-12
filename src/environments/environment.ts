// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  auth: {
    url: 'http://localhost:8010/v1/auth',
  },
  asset: {
    // url: 'http://localhost:8001/api/v1',
    url: 'https://snipe-it.bizdash.app/api/v1',
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiOTEyYmRjYjYyOWRhMTE5ZDRmMmExZDFlZmYxMjA1OGZlMzY4OWQ1ODRhN2Y4MTAxOGM4MTdlNTRjMGUwYjc5OWY4YzJlMDg0YjMxZDU1MDEiLCJpYXQiOjE2OTExNDgwMjQuMDQxMDA3LCJuYmYiOjE2OTExNDgwMjQuMDQxMDA4LCJleHAiOjIxNjQ1MzM2MjQuMDIyNTMsInN1YiI6IjkiLCJzY29wZXMiOltdfQ.kkvCK2yrKNaRVaoK7Np_R5_OHUB0sSLv_8_s7hj8JIp3t1XY_YulKbFoUUHg4yP6lzg450EAqSGFzzBTGCDVPYijW5yW3Zs79EwSE979XXHR0GJMP1kD2aXnnddlazDv5rGCYk7b-mhZMQ9eGWlqrw4NkIMr9aPaje7iTB0DyQFkxQgoA1BcWu58ROEGr0hXW6FXy3zdOy6zEV9ykTbLtUGi0GyoHjMRuQak_Zp9P6Y9mr4RUDlJPj7ldK0NnJpwsLyMcpx_mlVInsqpL6p5XIMLbqsy7hq5vPJ1-IMar2rHAda2uSuArqiMCYa1HG6z10f89khRz1ZETeKgf75WP3L2iNhBW57AxpIOQ1Tx1xyg3_UcWnpZZVgxi2EH5KUQVl-wVDdvMS07B0TRtw0ZFmmzLbeVCKtdyZ96ob5T_VevxQ-LTTqf1dvEQmc1004XMc5owqdDxa6nQcj0zFtOBc7sE67_DmrcoeejuThzmVU_WIrOLXHeR0nrfe6MzQfw1k39DC1OGZGW8nzD8EophZLByI1VVNwAiwz36trn3zbdlg90RoDqyxzYv4NGW-R0nqo2cbtSmNAAeh7LAlG6WpFdGUdDwdSez_c8RVUZKYLES0aQnYuIiOX_bOIz26Iib1PMx2jmTSLEdObsBxVCk0alsh-4TikSbIMIyGsCToc'
  },
  portal: {
    url: 'http://localhost:8010/v1',
    origin: 'http://localhost:8010'
  },
  hris: {
    url: 'http://localhost:8011/v1',
  },
  formhub: {
    url: 'http://localhost:8000/v1',
    origin: 'http://localhost:8000'
  },
  finance: {
    url: 'http://localhost:8013/v1',
  },
  seatmapping: {
    url: 'http://localhost:8013/v1',
  },
  payroll: {
    url: 'http://localhost:8014',
  },
  jobshris: {
    url: 'http://localhost:8015/v1',
  },
  slack: {
    client_id: '1010123177764.5906263799218',
    client_secret: '6f360bdcc5346283c0ec810a68991990',
    redirect_uri: 'http://localhost:4200/auth/callback',
    scope: 'users:read',
    authoriztion_endpoint: 'https://slack.com/oauth/v2/authorize',
    token_endpoint: 'https://slack.com/api/oauth.v2.access'
  },
  pusher: {
    app_id : "1666944",
    key : "e17d450872a4586ad5b3",
    secret : "acc139d7d26df8c16978",
    cluster : "ap1",
    channels: [
      'send-message'
    ]
  },
  portalUrl : 'localhost:4210',
  formUrl : 'localhost:4211',
  esigUrl : 'localhost:4212',
  appVersion: 'v8.1.7',
  appUrl: 'http://localhost:4200',
  GOOGLE_CLIENT_ID: '695138075022-smlepk5h8safb5h7ror218ac4lns252n.apps.googleusercontent.com',
  hrisAdminUrl : 'https://stage-hris.bizdash.app/auth/login',
  esignatureUrl : 'https://stage-esig.bizdash.app/e-signature/auth/login',
  aes_key: 'a5f1ec9af5f0524cd572c83ef05cbebcc90368f86a0cd9976d7c8a29410f6c63'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
