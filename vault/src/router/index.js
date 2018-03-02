import Vue from 'vue';
import Router from 'vue-router';
import Modal from '../components/Modal';
import VaultContents from '../components/VaultContents';
import Deposit from '../components/Deposit';
// import Withdraw from '../components/Withdraw';
export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      components: {
        default: VaultContents,
        contents: VaultContents,
      },
    },
    {
      path: '/deposit',
      components: {
        default: Deposit,
        contents: Deposit,
      },
    },
  ],
});

Vue.use(Router);
