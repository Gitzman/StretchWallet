import Vue from 'vue';
import Router from 'vue-router';
import FormInfoWallet from '@/components/FormInfoWallet';

Vue.use(Router);

export default new Router({
  routes: [{
    path: '/',
    name: 'forminfowallet',
    component: FormInfoWallet,
  }],
});
