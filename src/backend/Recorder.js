const os = require('os')
const events = require('events')
const { DB: { InfoDb } } = require('./db')
class Recorder extends events.EventEmitter {
  constructor(options) {
    super(options);
    console.log('use db:', os.homedir() + '/.google-store-transfer/data.db')
    this.db = new InfoDb(os.homedir() + '/.google-store-transfer/data.db');
  }
  async findItems (conditions, page, size, sorts) {
    const self = this;
    return new Promise(function (resolve, reject) {
      self.db.find(conditions, page, size, sorts).then((res) => {
        resolve(res)
      }).catch((err) => {
        reject(err)
      })
    })
  }

  async updateItem (conditions, item, options) {
    const self = this;
    return new Promise(function (resolve, reject) {
      self.db.update(conditions, item, options).then((res) => {
        resolve(res)
      }).catch((err) => {
        reject(err)
      })
    })
  }

  async insertItem (item) {
    const self = this;
    return new Promise(function (resolve, reject) {
      self.db.insert(item).then((res) => {
        resolve(res)
      }).catch((err) => {
        reject(err)
      })
    })
  }

  async deleteItems (conditions, options) {
    const self = this;
    return new Promise(function (resolve, reject) {
      self.db.remove(conditions, options).then((res) => {
        resolve(res)
      }).catch((err) => {
        reject(err)
      })
    })
  }

  async count (conditions) {
    const self = this;
    return new Promise(function (resolve, reject) {
      self.db.count(conditions).then((res) => {
        resolve(res)
      }).catch((err) => {
        reject(err)
      })
    })
  }
}

exports.Recorder = Recorder