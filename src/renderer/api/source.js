import request from '@/utils/request'

export function checkInit (data) {
  return request({
    url: '/',
    method: 'post',
    params: {
      action: 'checkInit'
    },
    data
  })
}

export function requestAuthorize (data) {
  return request({
    url: '/',
    method: 'post',
    params: {
      action: 'authorize'
    },
    data
  })
}

export function fetchTaskList (params, data) {
  return request({
    url: '/',
    method: 'post',
    params: Object.assign({
      action: 'task',
      ctl: 'list'
    }, params),
    data
  })
}

export function newTask (data) {
  return request({
    url: '/',
    method: 'post',
    params: {
      action: 'task',
      ctl: 'newTask'
    },
    data
  })
}

export function startTask (data) {
  return request({
    url: '/',
    method: 'post',
    params: {
      action: 'task',
      ctl: 'startTask'
    },
    data
  })
}
export function deleteTask (data) {
  return request({
    url: '/',
    method: 'post',
    params: {
      action: 'task',
      ctl: 'delete'
    },
    data
  })
}

export function createServiceAccounts (data) {
  return request({
    url: '/',
    method: 'post',
    params: {
      action: 'serviceAccount',
      ctl: 'create'
    },
    data
  })
}
export function listServiceAccounts (data) {
  return request({
    url: '/',
    method: 'post',
    params: {
      action: 'serviceAccount',
      ctl: 'list'
    },
    data
  })
}
export function deleteServiceAccount (data) {
  return request({
    url: '/',
    method: 'post',
    params: {
      action: 'serviceAccount',
      ctl: 'delete'
    },
    data
  })
}