// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueX from 'vuex';
import axios from 'axios';
import App from './App';
import router from './router';
import StellarSdk from 'stellar-sdk';

Vue.use(VueX);
Vue.config.productionTip = false;

function quicksort(arr) {
  if (arr.length == 0 || arr.length == 1) {
    return arr;
  }

  const middle = arr[0];
  const bigger = [];
  const smaller = [];

  for (var i = 1; i < arr.length; i++) {
    if (arr[i].amount < middle.amount) {
      smaller.push(arr[i]);
    } else {
      bigger.push(arr[i]);
    }
  }

  var a = quicksort(smaller);
  var b = quicksort(bigger);
  a.push.apply(a, [middle])
  a.push.apply(a, b)
  return a
};


function processContents(balances) {
  var final_object = {};

  for (var i = 0; i < balances.length; i++) {
    const key = balances[i].asset_code;
    if (key in final_object) {
      const addSafe = {
        'issuer': balances[i].asset_issuer,
        'amount': parseFloat(balances[i].balance)
      };
      final_object[key].safes.push(addSafe);
    } else {
      final_object[key] = {
        'safes': [{
          'issuer': balances[i].asset_issuer,
          'amount': parseFloat(balances[i].balance)
        }],
        'limit': balances[i].limit,
        'asset_type': balances[i].asset_type
      };
    }
  }
  // could be optimized by inserting every new register in a sorted list , TODO
  for (var key in final_object) {
    final_object[key].safes = quicksort(final_object[key].safes);
  }
  return final_object;
}



const store = new VueX.Store({
  state: {
    count: 0,
    networkURL: 'https://horizon-testnet.stellar.org/',
    networkPassphrase: 'TESTNET',
    publicKey: '',
    vaultExist: null,
    balances: [],
    personalBalances: [],
    validPublicKey: false,
    newVault: {
      publicKey: '',
      secret: '',
      xdrEnvelope: '',
    },
    deposit: {
      asset_code: null,
      amount: null,
      rate: null,
    },
  },
  mutations: {
    updatePK(state, message) {
      state.publicKey = message;
      if (message.length === 56 && message[0] === 'G') {
        state.validPublicKey = true;
      } else {
        state.validPublicKey = false;
        state.vaultExist = null;

      }
    },
    confirmVault(state, value) {
      state.vaultExist = value;
    },
    startBalances(state, value) {
      state.balances = value;
    },
    setBalances(state, value) {
      state.balances = processContents(value);
    },
    setPersonalBalances(state, value) {
      state.personalBalances = value;
      state.balances['undefined'] = value;
    },
    setVaultPublicKey(state, value) {
      state.newVault.publicKey = value;
    },
    switchNetwork(state, value) {
      if (value === true) {
        state.networkURL = 'https://horizon.stellar.org/';
        state.networkPassphrase = 'PUBLIC';

      } else {
        state.networkURL = 'https://horizon-testnet.stellar.org/';
        state.networkPassphrase = 'TESTNET';
      }
    },
    reset(state) {
      var newState = {
        count: 0,
        networkURL: 'https://horizon-testnet.stellar.org/',
        networkPassphrase: 'TESTNET',
        publicKey: '',
        vaultExist: null,
        balances: [],
        personalBalances: [],
        validPublicKey: false,
        newVault: {
          publicKey: '',
          secret: '',
          xdrEnvelope: '',
        },
        deposit: {
          asset_code: null,
          amount: null,
          rate: null,
        },
      };
      Object.assign(state, newState);
    }
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
