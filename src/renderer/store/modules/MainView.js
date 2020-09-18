const state = {
  mainViewName: 'TaskListView',
  mainViewData: null
}

const mutations = {
  changeMainView (state, opt) {
    state.mainViewName = opt.view
    state.mainViewData = opt.data
  }
}

const actions = {
  changeMainView ({ commit, dispatch }, opt) {
    commit('changeMainView', opt)
  }
}

export default {
  state,
  mutations,
  actions
}
