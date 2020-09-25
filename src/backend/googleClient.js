
const fs = require('fs-extra')
const { keyPath, credentialsPath } = require('./config').default;
const { google } = require('googleapis');

async function refreshTotken (oAuth2Client, credentials) {
  let current_time = Math.round(new Date())
  if (current_time < credentials.expiry_date - 300 * 1000) {
    return oAuth2Client
  }
  if (current_time < credentials.expiry_date && current_time > credentials.expiry_date - 300 * 1000) {
    const { credentials } = await oAuth2Client.refreshAccessToken()
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials))
    oAuth2Client.setCredentials(credentials)
    return oAuth2Client
  }
  if (current_time >= credentials.expiry_date) {
    throw new Error('AuthExpired')
  }
  return oAuth2Client
}


async function googleInit (application, use_service_account) {
  let oAuth2Client
  let is_use_service_account = false
  let credentials

  // if (application && use_service_account) {
  //   let list = await application.recorder.findItems({ 'item_type': 'serviceAccount', 'enable': true, 'privateKeyData':{
  // $ne: '' 
  // } }, 1, 1)
  //   if (list && list.length) {
  //     oAuth2Client = google.auth.fromJSON(JSON.parse(new Buffer(list[0].privateKeyData, 'base64').toString()))
  //     credentials = await oAuth2Client.getCredentials()
  //     //roles/iam.serviceAccountUser
  //     // 仅 G Suite 支持服务账号模拟
  //     // oAuth2Client = new google.auth.JWT(
  //     //   credentials.client_email,
  //     //   null,
  //     //   credentials.private_key,
  //     //   [
  //     //     'https://www.googleapis.com/auth/userinfo.email',
  //     //     'https://www.googleapis.com/auth/cloud-platform',
  //     //     'https://www.googleapis.com/auth/cloudplatformprojects',
  //     //     'https://www.googleapis.com/auth/iam',
  //     //     'https://www.googleapis.com/auth/drive'
  //     //   ],
  //     //   'xxxxx@gmail.com')
  //     const auth = new google.auth.GoogleAuth({
  //       credentials: {
  //         client_email: credentials.client_email,
  //         private_key: credentials.private_key,
  //       },
  //       scopes: [
  //         'https://www.googleapis.com/auth/cloud-platform',
  //         'https://www.googleapis.com/auth/cloudplatformprojects',
  //         'https://www.googleapis.com/auth/iam',
  //         'https://www.googleapis.com/auth/drive'
  //       ]
  //     });
  //     oAuth2Client = await auth.getClient();
  //     is_use_service_account = true
  //   } else {
  //     // throw new Error('notServiceAccount')
  //   }
  // }

  if (!is_use_service_account) {
    let keys = { redirect_uris: [''] };
    if (fs.existsSync(keyPath)) {
      keys = fs.readJSONSync(keyPath).web;
    }
    const { client_secret, client_id, redirect_uris } = keys;
    oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    if (fs.existsSync(credentialsPath)) {
      credentials = fs.readJSONSync(credentialsPath);
    }
    oAuth2Client.setCredentials(credentials)
    oAuth2Client = await refreshTotken(oAuth2Client, credentials)
  }

  google.options({ auth: oAuth2Client });
  return { google, credentials }
}

exports.googleInit = googleInit