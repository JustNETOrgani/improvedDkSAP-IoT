import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    IPNShash: ''
  },
  getters: {
    userIPNShash: state => {
      return state.IPNShash
    }
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
