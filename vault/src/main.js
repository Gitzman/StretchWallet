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
    publicKey: 'GBFSKT4OBPRDIUIXKPFJ2QJQFZ645537ATO53GYC7PFO4FU7FOLXOBAG',
  },
  mutations: {
    updatePK(state, message) {
      state.publicKey = message;
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
