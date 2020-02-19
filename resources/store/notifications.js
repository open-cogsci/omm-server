import Vue from 'vue'

const restingState = {
  message: '',
  color: 'primary',
  value: false,
  timeout: 5000,
  closeText: 'Close'
}

export const state = () => ({
  pending: [],
  current: { ...restingState }
})

export const mutations = {
  RESET (state) {
    state.current = { ...restingState }
  },
  SHIFT_FROM_PENDING (state) {
    state.pending.splice(0, 1)
  },
  PUSH_TO_PENDING (state, message) {
    state.pending.push(message)
  },
  SET_CURRENT (state, message) {
    state.current = message
  }
}

export const actions = {
  notify ({ state, commit, dispatch }, message) {
    commit('PUSH_TO_PENDING', {
      ...restingState,
      value: true,
      ...message
    })
    if (!state.current.value) {
      return dispatch('pop')
    }
    return true
  },
  async pop ({ state, commit }) {
    commit('RESET')
    if (state.pending.length === 0) {
      return true
    }
    await Vue.nextTick()
    const message = state.pending[0]
    commit('SET_CURRENT', message)
    commit('SHIFT_FROM_PENDING')
    return true
  }
}
