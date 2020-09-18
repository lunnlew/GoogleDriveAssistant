const os = require('os')
exports.default = {
  keyPath: os.homedir() + '/.google-store-transfer/oauth2.keys.json',
  credentialsPath: os.homedir() + '/.google-store-transfer/oauth2.credentials.json',
  serviceAccountsPath: os.homedir() + '/.google-store-transfer/service.accounts.json',
  dbPath: os.homedir() + '/.google-store-transfer/data.db'
}