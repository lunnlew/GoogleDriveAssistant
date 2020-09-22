const fs = require('fs-extra');
const { google } = require('googleapis');
const { keyPath, credentialsPath } = require('../config').default;
const opn = require('open');
exports.default = async (req, res) => {
  let ctl = req.query.ctl
  let body = req.body
  switch (ctl) {
    case "saveKeys": {
      let keys = body.keys
      console.log('use keyPath', keyPath)
      fs.writeFileSync(keyPath, keys)
      res.send({
        'code': 200,
        'message': '保存成功'
      })
      break
    }
    default: {
      console.log('use keyPath', keyPath)
      let keys = { redirect_uris: [''] };
      if (fs.existsSync(keyPath)) {
        keys = fs.readJSONSync(keyPath).web;
      } else {
        res.send({
          'code': 10012,
          'message': '需要输入oauth2.keys'
        })
        return
      }

      const oauth2Client = new google.auth.OAuth2(
        keys.client_id,
        keys.client_secret,
        keys.redirect_uris[0]
      );

      google.options({ auth: oauth2Client });

      const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/cloudplatformprojects',
        'https://www.googleapis.com/auth/iam',
        'https://www.googleapis.com/auth/drive'
      ];
      const authorizeUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes.join(' '),
      });

      let cp = await opn(authorizeUrl, { wait: false });
      cp.unref()

      console.log('use credentialsPath', keyPath)
      let time
      let credentials = await new Promise((resolve, reject) => {
        time = setInterval(() => {
          if (fs.existsSync(credentialsPath)) {
            time = undefined
            resolve(fs.readJSONSync(credentialsPath))
          }
        }, 100)
      })
      res.send({
        'code': 200,
        'data': credentials,
        'message': 'success'
      })
    }
  }
}