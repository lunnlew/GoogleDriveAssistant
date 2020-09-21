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
  resetTaskStatus (state, data) {
    if (data.task_id in state.taskStatus) {
      state.taskStatus[data.task_id] = {}
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
      if ('total_size' in data.result) {
        status.total_size = (state.taskStatus[data.task_id].total_size || 0) + data.result.total_size
      }
      if ('dealed_items' in data.result) {
        status.dealed_items = (state.taskStatus[data.task_id].dealed_items || 0) + data.result.dealed_items
      }
      if ('dealed_size' in data.result) {
        status.dealed_size = (state.taskStatus[data.task_id].dealed_size || 0) + data.result.dealed_size
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
  },
  resetTaskStatus ({ commit }, data) {
    commit('resetTaskStatus', data)
  }
}

export default {
  state,
  mutations,
  actions
}
