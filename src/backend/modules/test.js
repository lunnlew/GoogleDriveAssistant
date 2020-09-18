const { v4 } = require('uuid');
const { googleInit } = require('../googleClient')
exports.default = async (req, res, app) => {
  let ctl = req.query.ctl || 'list'
  const { google, credentials } = await googleInit(app, true)
  const drive = google.drive({ version: 'v3' });
  switch (ctl) {
    case "t1": {
      let data = await new Promise((resolve, reject) => {
        drive.files.list({
          q: `trashed=false`,
          spaces: 'drive',
          pageSize: 1000,
          fields: 'nextPageToken, files(id, name, kind, capabilities,permissions, mimeType, size, md5Checksum, driveId)',
        }, (err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve(res.data)
          }
        })
      })
      res.send({
        'code': 200,
        'data': data,
        'message': 'test done'
      })
      break
    }
    case 't2': {
      let data = await new Promise((resolve, reject) => {
        drive.permissions.create({
          'fileId': '1XYxQYJDd6PozXlpk969jq-ZrcWqwXvN0',
          'supportsAllDrives': true,
          transferOwnership: true,
          requestBody: {
            'role': 'owner',
            'type': 'user',
            'emailAddress': 'lunnlew@gmail.com'
          }
        }, (err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve(res.data)
          }
        })
      })
      res.send({
        'code': 200,
        'data': data,
        'message': 'test done'
      })
      break
    }
    case 't3': {
      let data = await new Promise((resolve, reject) => {
        drive.files.create({
          supportsAllDrives: true,
          requestBody: {
            mimeType: 'application/vnd.google-apps.folder',
            name: '服务账号文件13',
            parents: ['1XYxQYJDd6PozXlpk969jq-ZrcWqwXvN0']
          }
        }, (err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve(res.data)
          }
        })
      })
      res.send({
        'code': 200,
        'data': data,
        'message': 'test done'
      })
      break
    }
    default:
      res.send({
        code: 200,
        msg: 'success'
      })
      break
  }
}