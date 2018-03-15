import Vue from 'vue';
import Router from 'vue-router';
import Modal from '../components/Modal';
import VaultContents from '../components/VaultContents';
import Deposit from '../components/Deposit';
import Withdraw from '../components/Withdraw';
import SendXLM from '../components/SendXLM.vue';
import Extra from '../components/Extra.vue';

// import AboutUs from '../components/AboutUS';

export default new Router({
  mode: 'history',
  routes: [{
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
    {
      path: '/withdraw',
      components: {
        default: Withdraw,
        contents: Withdraw,
      },
    },
    {
      path: '/send',
      components: {
        default: SendXLM,
        contents: SendXLM,
      },
    },
    {
      path: '/FAQ',
      components: {
        default: Extra,
        contents: Extra,
      },
    },
    {
      path: '/Instructions',
      components: {
        default: Extra,
        contents: Extra,
      },
    },
    {
      path: '/AboutUs',
      components: {
        default: Extra,
        contents: Extra,
      },
    },
  ],
});

Vue.use(Router);
