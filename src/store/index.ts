import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    pilotsCount: {
      DJI: 0,
      sharkbyte: 0,
      analog: 0,
    },
  },
  getters: {
    getPilotsCount: state => {
      return state.pilotsCount;
    }
  },
  mutations: {
    setPilotsCount: (state, payload: { key: string, count: number }) => {
      if (payload.key === 'DJI') {
        state.pilotsCount.DJI = payload.count;
      } else if (payload.key === 'sharkbyte') {
        state.pilotsCount.sharkbyte = payload.count;
      } else if (payload.key === 'analog') {
        state.pilotsCount.analog = payload.count;
      }
    },
  },
})
