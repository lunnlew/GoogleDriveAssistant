const url = require('url');
const fs = require('fs-extra');
const { google } = require('googleapis');
const { keyPath, credentialsPath } = require('./config').default;
const { AppServer } = require('./AppServer')
let application = new AppServer()
const { Recorder } = require('./Recorder')
const expressWS = require('express-ws')

var bindRoute = (app, express) => {
  application.bindApp(app)
  let record = new Recorder()
  application.bindRecorder(record)

  expressWS(app)
  app.ws('/client/:clientid', function (ws, req) {
    console.log('client [' + req.params.clientid + '] connected')
    ws.send(JSON.stringify({
      'type': 'connect',
      'data': 'success'
    }))
    ws.on('message', function (msg) {
      // 业务代码
    })
    application.bindWs(req.params.clientid, ws)
  })

  app.all('/oauth2callback', async function (req, res) {
    const qs = new url.URL(req.url, 'http://localhost:3000')
      .searchParams;
    console.log('use keyPath', keyPath)
    let keys = { redirect_uris: [''] };
    if (fs.existsSync(keyPath)) {
      keys = fs.readJSONSync(keyPath).web;
    } else {
      res.send({
        'code': 10010,
        'message': '需要oauth2.keys'
      })
      return
    }
    const oauth2Client = new google.auth.OAuth2(
      keys.client_id,
      keys.client_secret,
      keys.redirect_uris[0]
    );
    const { tokens } = await oauth2Client.getToken(qs.get('code'));
    console.log('use credentialsPath', keyPath)
    fs.writeFileSync(credentialsPath, JSON.stringify(tokens))

    res.send({
      code: 200,
      message: 'success'
    })
  })
  app.all('/', async function (req, res) {
    res.header('Content-Type', 'application/json;charset=utf-8')
    var action = req.query.action;
    console.log('use action:', action)
    console.time('usedTime')
    try {
      let bind
      switch (action) {
        case 'authorize': {
          bind = require('./modules/authorize')
          break
        }
        case 'checkInit': {
          bind = require('./modules/checkInit')
          break
        }
        case 'drive': {
          bind = require('./modules/drive')
          break
        }
        case 'task': {
          bind = require('./modules/task')
          break
        }
        case 'serviceAccount': {
          bind = require('./modules/serviceAccount')
          break
        }
        case 'test': {
          bind = require('./modules/test')
          break
        }
        default: {
          res.send({
            code: 10010,
            message: '不支持的方法'
          })
          return
        }
      }
      await bind.default(req, res, application);
    } catch (err) {
      console.log(err.message)
      res.send({
        code: 10000,
        message: err.message
      })
    }
    console.timeEnd('usedTime')
  })
  return app
}
exports.bindRoute = bindRoute