// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueX from 'vuex';
import App from './App';
import router from './router';

Vue.use(VueX);
Vue.config.productionTip = false;


const store = new VueX.Store({
  state: {
    count: 0,
    publicKey: '',
    vaultExist: false,
  },
  mutations: {
    updatePK(state, message) {
      state.publicKey = message;
    },
    confirmVault(state, value) {
      state.vaultExist = value;
    },
  },
});


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: {
    App,
  },
  template: '<App/>',
});
