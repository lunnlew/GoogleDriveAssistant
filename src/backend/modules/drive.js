const { googleInit } = require('../googleClient')
const opn = require('open');

exports.default = async (req, res, application) => {
  let ctl = req.query.ctl || 'list'
  let page = req.query.page || 1
  let size = req.query.size || 20
  let body = req.body
  let current_time = Math.round(new Date() / 1000)
  switch (ctl) {
    case 'sync': {
      const { google, credentials } = await googleInit()
      const drive = google.drive({ version: 'v3' });
      let result = await new Promise((resolve, reject) => {
        drive.drives.list({}, (err, res) => {
          if (err) {
            reject(err)
            return
          } else {
            resolve(res.data)
          };
        })
      })
      await application.recorder.deleteItems({ 'item_type': 'drive' }, { multi: true })
      let data = result.drives.map(d => {
        return {
          'item_type': 'drive',
          'drive_id': d.id,
          'drive_name': d.name,
          'current_time': current_time,
          'update_time': current_time
        }
      })
      await application.recorder.insertItem(data)
      res.send({
        code: 200,
        msg: 'success',
        data: {
          'total': data.length,
          'list': data
        }
      })
      break
    }
    case 'open': {
      let drive_id = body.drive_id
      let cp = await opn(`https://drive.google.com/drive/u/1/folders/${drive_id}`, { wait: false });
      cp.unref()
      res.send({
        code: 200,
        msg: 'success'
      })
      break
    }
    default:
      let list = await application.recorder.findItems({ 'item_type': 'drive' }, page, size)
      let total = await application.recorder.count({ 'item_type': 'drive' })
      res.send({
        code: 200,
        msg: 'success',
        data: {
          'total': total,
          'list': list
        }
      })
      break
  }
}