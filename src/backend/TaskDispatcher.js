const events = require('events')

const path = require('path')
const child_process = require('child_process')
const { googleInit } = require('./googleClient')
const { copyDirSeries, batchCopyFile } = require('./batchs/copy')

class TaskDispatcher extends events.EventEmitter {
  constructor(application, params, wsclientid, options) {
    super(options);
    this.application = application
    const { task_id } = params
    this.task_id = task_id
    this.wsclientid = wsclientid
    this.recorder = application.recorder
    this.credentials = undefined
    this.save_drive_id = undefined
  }
  init () {
    this.on('startFetchOriginList', () => {
      console.log('startFetchOriginList')
      this.startFetchOriginList()
      this.sendMsg({
        'type': "task_progress",
        'data': {
          event: 'startFetchOriginList',
          task_id: this.task_id
        }
      })
    })
    this.on('startMakeStruct', () => {
      console.log('startMakeStruct')
      this.startMakeStruct()
      this.sendMsg({
        'type': "task_progress",
        'data': {
          event: 'startMakeStruct',
          task_id: this.task_id
        }
      })
    })
    this.on('total_items', async (data) => {
      await this.recorder.updateItem({ 'item_type': 'task', 'task_id': this.task_id }, {
        $inc: {
          total_items: data.num
        }
      })
      this.sendMsg({
        'type': "task_progress",
        'data': {
          event: 'total_items',
          task_id: this.task_id,
          total_items: data.num
        }
      })
    })
    this.on('dealed_items', async (data) => {
      await this.recorder.updateItem({ 'item_type': 'task', 'task_id': this.task_id }, {
        $inc: {
          dealed_items: data.num
        }
      })
      this.sendMsg({
        'type': "task_progress",
        'data': {
          event: "dealed_items",
          task_id: this.task_id,
          dealed_items: data.num
        }
      })
    })
    this.on('completeTask', async () => {
      await this.recorder.updateItem({ 'item_type': 'task', 'task_id': this.task_id }, {
        $set: {
          is_complete: true
        }
      }, { multi: true })
      console.log('completeTask')
      this.sendMsg({
        'type': "task_progress",
        'data': {
          event: "completeTask",
          task_id: this.task_id
        }
      })
    })
    this.on('err', async (data) => {
      if (data.err.errors && data.err.errors.length) {
        // console.log(data.err.errors[0].reason, data.err.errors[0].message)
        if (['userRateLimitExceeded'].indexOf(data.err.errors[0].reason) !== -1) {
          if (this.credentials) {
            if (this.credentials.client_email) {
              await this.recorder.updateItem({ 'item_type': 'serviceAccount', 'email': this.credentials.client_email }, {
                $set: {
                  enable: false
                }
              }, { multi: true })
              if (data.data.progress) {
                // 重复尝试
                this.emit(data.data.progress)
              }
            } else {
              // 用户请求限制
            }
          }
        }
      } else {
        console.log(data.err)
      }

      this.sendMsg({
        'type': "task_progress",
        'data': {
          event: "error",
          task_id: this.task_id,
          errors: data.err.errors || [
            {
              domain: data.err.message,
              message: data.err.message
            }
          ]
        }
      })
    })
    return this
  }
  async sendMsg (data) {
    if (this.wsclientid in this.application.ws) {
      this.application.ws[this.wsclientid].send(JSON.stringify(data))
    }
  }
  async start () {
    let recorder = this.recorder
    let list = await recorder.findItems({ 'item_type': 'task', 'task_id': this.task_id })
    if (list.length) {
      this.save_drive_id = list[0].drive_id || ''
    }
    if (list.length && !list[0].is_listed) {
      this.emit('total_items', {
        num: 1
      })
      this.emit('startFetchOriginList');
    } else if (list.length && !list[0].is_complete) {
      this.emit('startMakeStruct');
    } else {
      this.emit('completeTask')
    }
  }
  async startFetchOriginList () {
    let recorder = this.recorder
    let application = this.application
    let task_id = this.task_id
    try {
      let list = await recorder.findItems({ 'item_type': 'task', 'task_id': task_id })
      if (list.length && list[0].is_listed) {
        this.emit('startMakeStruct')
        return
      }
      if (list && list[0].is_folder) {

        let folder = list[0]
        let current_time = Math.round(new Date() / 1000)
        let index = 1
        console.log('查询[folder_id:' + folder.folder_id + '] list items')
        const { google, credentials } = await googleInit(application, true)
        this.credentials = credentials
        const drive = google.drive({ version: 'v3' });
        let pageToken
        let queue_folder = [folder.folder_id]
        let fid
        do {
          fid = queue_folder.shift()
          console.log('use folder_id:', fid)
          do {
            let result = await new Promise((resolve, reject) => {
              drive.files.list({
                corpora: 'allDrives',
                supportsAllDrives: true,
                includeItemsFromAllDrives: true,
                q: `'${fid}' in parents and trashed=false`,
                spaces: 'drive',
                pageSize: 1000,
                pageToken,
                fields: 'nextPageToken, files(id, name, kind, mimeType, size, md5Checksum)',
              }, (err, res) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(res.data)
                };
              })
            })
            console.log('list result', result.files.length)
            pageToken = result.nextPageToken;
            let files = result.files;
            let records = files.map(file => {
              // console.log(file.id, file.name)
              index = index + 1
              return {
                item_type: 'file',
                task_id: task_id,
                file_id: file.id,
                file_name: file.name,
                parent_id: fid,
                dst_file_id: undefined,
                file_mimetype: file.mimeType,
                file_size: file.size,
                is_copyed: false,
                index: index,
                create_time: current_time,
                update_time: current_time
              }
            })
            let exs = await recorder.findItems({ 'item_type': 'file', /*'task_id': task_id,*/ 'file_id': { $in: records.map(f => f.file_id) } })
            let filtered = records.filter(f => exs.map(e => e.file_id).indexOf(f.file_id) === -1)
            if (filtered.length) {
              console.log('filtered length', filtered.length)
              this.emit('total_items', {
                num: filtered.length
              })
              await recorder.insertItem(filtered)
            }
            queue_folder.push(...files.filter(file => file.mimeType == 'application/vnd.google-apps.folder').map(file => file.id));
          } while (pageToken)
          pageToken = undefined
        } while (queue_folder.length)

      }

      await recorder.updateItem({
        'item_type': 'task',
        'task_id': task_id
      }, {
        $set: {
          'is_listed': true
        }
      })
      this.emit('startMakeStruct');
    } catch (err) {
      this.emit('err', {
        err,
        data: {
          progress: 'startMakeStruct'
        }
      })
    }
  }
  async startMakeStruct () {
    let recorder = this.recorder
    let application = this.application
    let task_id = this.task_id

    try {

      let list = await recorder.findItems({ 'item_type': 'task', 'task_id': task_id })
      if (list.length && list[0].is_complete) {
        this.emit('completeTask')
        return
      }

      const { google, credentials } = await googleInit(application, true)
      this.credentials = credentials
      const drive = google.drive({ version: 'v3' });
      let count = await recorder.count({ 'item_type': 'file', 'task_id': task_id, dst_file_id: { $exists: false } })
      console.log('not set new file id count', count)
      let size = 1000
      if (count) {
        do {
          console.log('use new file_id')

          let ids = []
          let result = await new Promise((resolve, reject) => {
            drive.files.generateIds({
              count: Math.min(size, count),
              space: 'drive'
            }, (err, res) => {
              if (err) {
                reject(err)
                return
              } else {
                resolve(res.data)
              };
            })
          })
          ids = result.ids

          let list = await recorder.findItems({ 'item_type': 'file', 'task_id': task_id, dst_file_id: { $exists: false } }, 1, Math.min(size, count))
          for (let item of list) {
            let new_file_id = ids.shift()
            await this.recorder.updateItem({ 'item_type': 'file', 'task_id': task_id, file_id: item.file_id },
              {
                $set: {
                  dst_file_id: new_file_id
                }
              })
          }

          count = count - size
        } while (count > 0)
      }
      let dst_list

      do {
        console.log('use new parent_id')
        dst_list = await recorder.findItems({ 'item_type': 'file', 'task_id': task_id, dst_parent_id: { $exists: false } }, 1, size)
        if (dst_list.length) {
          for (let item of dst_list) {
            if (item.parent_id) {
              let parent = await recorder.findItems({ 'item_type': 'file', 'task_id': task_id, file_id: item.parent_id }, 1, 1)
              parent = parent[0]
              await this.recorder.updateItem({ 'item_type': 'file', 'task_id': task_id, file_id: item.file_id },
                {
                  $set: {
                    dst_parent_id: parent.dst_file_id
                  }
                })
            } else {
              // for root-dir
              await this.recorder.updateItem({ 'item_type': 'file', 'task_id': task_id, file_id: item.file_id },
                {
                  $set: {
                    dst_parent_id: this.save_drive_id
                  }
                })
            }
          }
        }

        await new Promise(resolve => {
          setTimeout(() => resolve(), 50)
        })
      } while (dst_list.length)

      let page = 1
      do {
        list = await recorder.findItems({ 'item_type': 'file', 'task_id': task_id, 'file_mimetype': 'application/vnd.google-apps.folder', 'is_copyed': false }, page, size, {
          index: 1
        })
        if (list.length) {
          console.log('batch list', list.length)
          let complete_files = await copyDirSeries(list, { application, save_drive_id: this.save_drive_id })
          this.emit('dealed_items', {
            num: complete_files.length
          })
          await this.recorder.updateItem({ 'item_type': 'file', 'task_id': task_id, 'file_id': { $in: complete_files } },
            {
              $set: {
                is_copyed: true
              }
            }, { multi: true })
          page = page + 1
        }

        await new Promise(resolve => {
          setTimeout(() => resolve(), 50)
        })
      } while (list.length)

      page = 1
      size = 50
      do {
        list = await recorder.findItems({ 'item_type': 'file', 'task_id': task_id, file_mimetype: { $ne: 'application/vnd.google-apps.folder' }, 'is_copyed': false }, page, size, {
          index: 1
        })
        if (list.length) {
          console.log('batch list', list.length)
          let complete_files = await batchCopyFile(list, { application, save_drive_id: this.save_drive_id })
          this.emit('dealed_items', {
            num: complete_files.length
          })
          await recorder.updateItem({ 'item_type': 'file', 'task_id': task_id, 'file_id': { $in: complete_files } },
            {
              $set: {
                is_copyed: true
              }
            }, { multi: true })
          page = page + 1
        }

        await new Promise(resolve => {
          setTimeout(() => resolve(), 50)
        })
      } while (list.length)
      this.emit('completeTask')
    } catch (err) {
      this.emit('err', {
        err,
        data: {
          progress: 'startMakeStruct'
        }
      })
    }
  }
}

exports.TaskDispatcher = TaskDispatcher