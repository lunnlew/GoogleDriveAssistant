const async = require('async')
const { googleInit } = require('../googleClient')

async function copyDirSeries (files, options) {
  const { application, save_drive_id } = options
  const { google, credentials } = await googleInit(application, true)
  const drive = google.drive({ version: 'v3' });
  var complete_files = []
  console.log('copyDirSeries to drive_id', save_drive_id)
  return new Promise((resolve, reject) => {
    async.eachSeries(files, function (file, copyCallback) {
      drive.files.create({
        supportsAllDrives: true,
        requestBody: {
          mimeType: file.file_mimetype,
          name: file.file_name,
          id: file.dst_file_id,
          parents: file.dst_parent_id ? [file.dst_parent_id] : []
        }
      }, (err, res) => {
        if (err) {
          if (err.response) {
            console.log('copyDirSeries status', err.response.status, err.errors[0].message)
            // 409已存在
            if ([409].indexOf(err.response.status) !== -1) {
              complete_files.push(file.file_id)
              copyCallback();
            } else {
              copyCallback(err);
            }
          } else {
            copyCallback(err);
          }
        } else {
          complete_files.push(file.file_id)
          copyCallback();
        };
      })
    }, function (err) {
      if (err) {
        // console.log(err.response)
        reject(err)
      } else {
        console.log('copyDirSeries complete')
        resolve(complete_files)
      }
    });
  })
}

async function batchCopyFile (files, options) {
  const { application, save_drive_id } = options
  const { google, credentials } = await googleInit(application, true)
  const drive = google.drive({ version: 'v3' });
  var complete_files = []
  console.log('batchCopyFile to drive_id', save_drive_id)
  return new Promise((resolve, reject) => {
    async.eachLimit(files, 5, function (file, copyCallback) {
      drive.files.copy({
        supportsAllDrives: true,
        fileId: file.file_id,
        requestBody: {
          mimeType: file.file_mimetype,
          name: file.file_name,
          id: file.dst_file_id,
          parents: file.dst_parent_id ? [file.dst_parent_id] : []
        }
      }, (err, res) => {
        if (err) {
          if (err.response) {
            console.log('batchCopyFile status', err.response.status, err.errors[0].message)
            // 409已存在
            if ([409].indexOf(err.response.status) !== -1) {
              complete_files.push(file)
              copyCallback();
            } else {
              copyCallback(err);
            }
          } else {
            copyCallback(err);
          }
        } else {
          complete_files.push(file)
          copyCallback();
        };
      })

    }, function (err) {
      if (err) {
        // console.log(err.response)
        reject(err)
      } else {
        console.log('batchCopyFile complete')
        resolve(complete_files)
      }
    });
  })
}
exports.copyDirSeries = copyDirSeries
exports.batchCopyFile = batchCopyFile