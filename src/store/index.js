import Vue from "vue";
import Vuex from "vuex";
import auth from "./modules/auth";
import templates from "./modules/templates";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    auth,
    templates,
  },
  state: {
    appName: "Template Manager",
    version: "1.0.0",
  },
  getters: {
    appInfo: (state) => ({
      name: state.appName,
      version: state.version,
    }),
  },
  mutations: {
    // Пока не используются
  },
  actions: {
    // Пока не используются
  },
  strict: process.env.NODE_ENV !== "production",
});
