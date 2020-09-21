const async = require('async')
const { googleInit } = require('../googleClient')

async function batchListFile (params, options) {
  const { application } = options
  const { files, task_id, index } = params
  const { google, credentials } = await googleInit(application, true)
  const drive = google.drive({ version: 'v3' });
  var complete_files = []
  console.log('batchListFile')
  return new Promise((resolve, reject) => {
    async.eachLimit(files, 5, async function (file) {
      let pageToken
      let current_time = Math.round(new Date() / 1000)
      let fid = file.file_id
      console.log('use file_id', fid)
      do {
        let result = await new Promise((reso, reje) => {
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
              reje(err)
            } else {
              reso(res.data)
            };
          })
        })
        console.log('list result', result.files.length)
        pageToken = result.nextPageToken;
        let files = result.files;

        let records = files.map(file => {
          return {
            item_type: 'file',
            task_id: task_id,
            file_id: file.id,
            file_name: file.name,
            parent_id: fid,
            dst_file_id: undefined,
            file_mimetype: file.mimeType,
            file_size: parseInt(file.size),
            is_copyed: false,
            index: index,
            create_time: current_time,
            update_time: current_time
          }
        })
        complete_files.push(...records)
      } while (pageToken)
      pageToken = undefined
    }, function (err) {
      if (err) {
        // console.log(err.response)
        reject(err)
      } else {
        console.log('batchListFile complete')
        resolve(complete_files)
      }
    });
  })
}
exports.batchListFile = batchListFile