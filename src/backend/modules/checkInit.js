const fs = require('fs-extra');
const { credentialsPath } = require('../config').default;
exports.default = async (req, res) => {
  if (!fs.existsSync(credentialsPath)) {
    res.send({
      'code': 10010,
      'message': 'error'
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