import Vue from 'vue';
import Router from 'vue-router';
import FormInfoWallet from '../components/FormInfoWallet';

export default new Router({
  mode: 'history',
  routes: [{
    path: '/',
    components: {
      default: FormInfoWallet,
      contents: FormInfoWallet,
    },
  }],
});

Vue.use(Router);
