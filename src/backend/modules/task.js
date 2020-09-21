const { v4 } = require('uuid');
const { googleInit } = require('../googleClient')
const { TaskDispatcher } = require('../TaskDispatcher')
exports.default = async (req, res, application) => {
  let ctl = req.query.ctl || 'list'
  let page = req.query.page || 1
  let size = req.query.size || 20
  let body = req.body
  let wsclientid = req.headers.wsclientid
  let current_time = Math.round(new Date() / 1000)
  switch (ctl) {
    case "newTask": {
      let link = body.link
      let drive_id = body.drive_id
      let folder_id
      if (link) {
        folder_id = link.match(/([\w|\-|\d]{30,})/)[0]
      }
      console.log('link:' + link)
      console.log('folder_id:' + folder_id)
      const { google, credentials } = await googleInit(application, true)
      const drive = google.drive({ version: 'v3' });
      let result = await new Promise((resolve, reject) => {
        drive.files.get({
          supportsAllDrives: true,
          fileId: folder_id
        }, (err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve(res)
          };
        })
      })
      if (result.status !== 200) {
        res.send({
          'code': 10010,
          'message': '目录不存在'
        })
        return
      }
      result = result.data
      let list = await application.recorder.findItems({ 'item_type': 'file', file_id: result.id, is_complete: true }, 1, 50)
      if (list.length) {
        console.log('folder_id is exs', folder_id)
        res.send({
          code: 10010,
          message: '当前目录已处理过'
        })
      } else {
        let task_id = v4().replace(/-/g, '')
        application.recorder.insertItem({
          item_type: 'file',
          task_id: task_id,
          file_id: result.id,
          file_name: result.name,
          parent_id: undefined,
          dst_file_id: undefined,
          file_mimetype: result.mimeType,
          is_copyed: false,
          is_root: true,
          create_time: current_time,
          update_time: current_time
        })
        application.recorder.insertItem({
          item_type: 'task',
          task_id: task_id,
          folder_id: folder_id,
          drive_id: drive_id,
          is_folder: 'application/vnd.google-apps.folder' === result.mimeType,
          origin_params: JSON.stringify({
            from_link: link
          }),
          is_listed: false,
          is_complete: false,
          total_items: 0,
          dealed_items: 0,
          task_state: 0,
          create_time: current_time,
          update_time: current_time
        })
        res.send({
          code: 200,
          data: {
            task_id
          },
          message: '新建任务成功'
        })
      }
      break
    }
    case "startTask": {
      let task_id = body.task_id
      console.log('task_id:' + task_id)
      new TaskDispatcher(application, body, wsclientid).init().start()
      res.send({
        code: 200,
        message: '启动任务成功'
      })
      break
    }
    case "delete": {
      let task_id = body.task_id
      console.log('task_id:' + task_id)
      await application.recorder.deleteItems({
        'item_type': 'task',
        'task_id': task_id
      }, {
        multi: true
      })
      await application.recorder.deleteItems({
        'item_type': 'file',
        'task_id': task_id
      }, {
        multi: true
      })
      res.send({
        code: 200,
        message: '删除任务成功'
      })
      break
    }
    default:
      let list = await application.recorder.findItems({ 'item_type': 'task' }, page, size)
      let total = await application.recorder.count({ 'item_type': 'task' })
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