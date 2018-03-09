// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueX from 'vuex';
import axios from 'axios';
import App from './App';
import router from './router';
import StellarSdk from 'stellar-sdk';
StellarSdk.Network.useTestNetwork();

const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const operation = StellarSdk.Operation;
const kp = StellarSdk.Keypair;

const accountId = ''; //include public key here for dev
// const personalkeypair = kp.fromSecret(''); // include private key here for dev

// vaultAccount is by default started at null, after creating a random KP
// account with createVaultAccount() this var is set to an actual value
// let vaultAccount = null;
let personalAccount = null;


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
      final_object[key].safes.push( addSafe );
    }
    else {
      final_object[key] = {
        'safes': [
          {
          'issuer': balances[i].asset_issuer,
          'amount': parseFloat(balances[i].balance)
        }
        ],
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
    publicKey: '',
    vaultExist: null,
    balances: [],
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
    setPersonalLumens(state, value){
      state.balances['undefined'].safes[0].amount = value;
    },
    setVaultPublicKey(state, value) {
      state.newVault.publicKey = value;
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
