function setTheme(themes, theme) {
  const el = document.body;
  themes.forEach(item => {
    el.classList.remove('theme-' + item);
  });
  el.classList.add('theme-' + theme);
}

// initial state
const state = {
  themes: ['dark', 'light'],
  theme: 'light'
};

// getters
const getters = {};

// actions
const actions = {
  init({ state, commit }) {
    const theme = localStorage.getItem('theme') || state.theme;
    commit('setTheme', theme);
    setTheme(state.themes, theme);
  },
  setTheme({ state, commit }, theme) {
    commit('setTheme', theme);
    localStorage.setItem('theme', theme);
    setTheme(state.themes, theme);
  }
};

// mutations
const mutations = {
  setTheme(state, theme) {
    state.theme = theme;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
