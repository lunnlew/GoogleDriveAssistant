import { articleDelete, uniaccDelete, proxyAct, wechatAct, jobAct } from '@/api/source'

const state = {
  taskLoading: {},
  taskStatus: {}
}

const mutations = {
  updateTaskLoading (state, data) {
    if (data.task_id in state.taskLoading) {
      state.taskLoading[data.task_id] = data.loading
    } else {
      state.taskLoading = Object.assign({}, state.taskLoading, {
        [data.task_id]: data.loading
      })
    }
  },
  updateTaskStatus (state, data) {
    if (!data.task_id in state.taskStatus) {
      state.taskStatus[data.task_id] = data.result
    } else {
      let status = data.result
      if ('total_items' in data.result) {
        status.total_items = (state.taskStatus[data.task_id].total_items || 0) + data.result.total_items
      }
      if ('dealed_items' in data.result) {
        status.dealed_items = (state.taskStatus[data.task_id].dealed_items || 0) + data.result.dealed_items
      }
      state.taskStatus = Object.assign({}, state.taskStatus, {
        [data.task_id]: {
          ...state.taskStatus[data.task_id],
          ...status
        }
      })
    }
  }
}

const actions = {
  updateTaskLoading ({ commit }, data) {
    commit('updateTaskLoading', data)
  },
  updateTaskStatus ({ commit }, data) {
    commit('updateTaskStatus', data)
  }
}

export default {
  state,
  mutations,
  actions
}
