import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
const { v4 } = require('uuid')

// if (process.env.IS_ELECTRON) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.prototype.wsClientId = 'drive_assistant_' + v4().replace(/-/g, '').substr(0, 16)

var socket = new WebSocket('ws://localhost:3000/client/' + Vue.prototype.wsClientId);
socket.addEventListener('open', function (event) {
  console.log('socket is open')
});
socket.addEventListener('message', function (event) {
  console.log('Message from server', event.data);
  var eventData = JSON.parse(event.data)
  var payload = eventData.data
  if (eventData.type === 'task_progress') {
    store.dispatch('updateTaskStatus', {
      'task_id': payload.task_id,
      'result': payload
    })
    if (['completeTask', 'error'].indexOf(payload.event) !== -1) {
      setTimeout(() => {
        store.dispatch('updateTaskLoading', {
          'task_id': payload.task_id,
          'loading': false
        })
      }, 500)
      if (payload.event === 'completeTask') {
        store.dispatch('resetTaskStatus', {
          'task_id': payload.task_id,
          'type': 'complete'
        })
      }
    }
    if (payload.errors && payload.errors[0].domain === 'AuthExpired') {
      router.push({
        path: '/'
      })
    }
  }
});


import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';

Vue.use(ViewUI)


// global filters
import * as filters from './filters'
// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
