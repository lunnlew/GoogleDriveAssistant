'use strict'

class AppServer {
  constructor() {
    const self = this
    self.app = null
    self.task = null
    self.ws = []
    self.recorder = null
  }
  bindApp (app) {
    const self = this
    self.app = app
  }
  bindRecorder (recorder) {
    const self = this
    self.recorder = recorder
  }
  bindTask (task) {
    const self = this
    self.task = task
  }
  bindWs (clientid, ws) {
    const self = this
    self.ws[clientid] = ws
  }
  start () { }
}

exports.AppServer = AppServer;
