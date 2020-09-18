import axios from 'axios'
import Vue from 'vue'

const service = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 1000 * 60 * 5,
  withCredentials: true
})
service.interceptors.request.use(config => {
  config.headers['wsClientId'] = Vue.prototype.wsClientId
  return config
}, error => {
  Promise.reject(error)
})

service.interceptors.response.use(
  response => {
    return Promise.resolve(response.data)
  },
  error => {
    return Promise.reject(error)
  })

export default service
