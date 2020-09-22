const fs = require('fs-extra');
const { keyPath, credentialsPath } = require('../config').default;
exports.default = async (req, res) => {
  if (!fs.existsSync(keyPath)) {
    res.send({
      'code': 10012,
      'message': '需要提供keys文件'
    })
    return
  }
  if (!fs.existsSync(credentialsPath)) {
    res.send({
      'code': 10010,
      'message': '需要提供credentials文件'
    })
    return
  }

  let credentials = {};
  credentials = fs.readJSONSync(credentialsPath);
  let current_time = Math.round(new Date())
  if (
    !('expiry_date' in credentials) ||
    !credentials.expiry_date ||
    current_time > credentials.expiry_date - 300 * 1000) {
    res.send({
      'code': 10010,
      'message': 'error'
    })
    return
  }

  res.send({
    'code': 200,
    'message': 'success'
  })
}