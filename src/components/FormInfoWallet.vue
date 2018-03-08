<template>
<div class='forminfo'>
  <div id='FormInfoWallet'>
    <div class="row">
      <div class='container'></div>
      <form class="formRow" autocomplete="off">
        <div class="input-field">
          <i class="material-icons prefix">vpn_key</i>
          <input id="icon_prefix" v-model="updatedKey" name="textfield" value="" type="text" class="validate">
          <label for="icon_prefix">Public Key, Starts with G</label>
        </div>
        <a @click='getWalletInfo()'  class="btn-large waves-effect light-blue darken-3">
          <i class="material-icons right">send</i> Send
        </a>
      </form>
      <div class='container'></div>
    </div>
  </div>
  <!-- <Error :message="'PublicStartsWithG'" :valid='startsWithG'></Error> -->
  <div v-if='$store.state.vaultExist === true' class="row tabscomp blue-text">
    <div class="col tabscomp1 s12">
      <ul v-tabs class="tabs tabs-fixed-width">
        <li class="tab col s3">
          <router-link to='/' class='statustab active'>Contents</router-link>
        </li>
        <li class="tab col s3">
          <router-link to='/deposit' class='statustab'>Deposit</router-link>
        </li>
        <li class="tab col s3">
          <router-link to='/withdraw' class='statustab'>Withdraw</router-link>
        </li>
      </ul>
    </div>
  </div>
</div>
</template>

<script>
import jquery from 'jquery';
import axios from 'axios';
import StellarSdk from 'stellar-sdk';
import VaultCreation from './VaultCreation';
import VaultContents from './VaultContents';
import Deposit from './Deposit.vue';
import Error from './Error';

StellarSdk.Network.useTestNetwork();
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

function processContents(arrAssets) {
  console.log('processing data');
  let finalArray = [];
  let i = 0;
  let j = 0;
  for (i; i < arrAssets.length; i += 1) {
    const current = arrAssets[i];
    let exists = false;
    for (j = 0; j < finalArray.length; j += 1) {
      if (current.asset_code === finalArray[j].asset_code) {
        finalArray[j].balance = parseFloat(finalArray[j].balance) + parseFloat(current.balance);
        exists = true;
        break;
      }
    }
    if (!exists) {
      current.balance = parseFloat(current.balance);
      current.limit = parseFloat(current.limit);
      finalArray.push(current);
    }
  }
  console.log('returning', finalArray);
  return finalArray;
}

export default {
  name: 'FormInfoWallet',
  data() {
    return {
      pk: this.$store.state.publicKey,
      error: [],
    };
  },
  directives: {
    tabs(el) {
      jquery(el).tabs();
    },
  },
  components: {
    Error,
    VaultContents,
    Deposit,
    VaultCreation,
  },
  computed: {
    updatedKey: {
      get() {
        return this.$store.state.publicKey;
      },
      set(value) {
        this.$store.commit('updatePK', value);
        this.pk = value;
      },
    },
    startsWithG() {
      return this.pk[0] === 'G';
    },
    isMinLength() {
      return this.pk.length < 56;
    },
    isMaxLength() {
      return this.pk.length > 56;
    },
  },
  methods: {
    getWalletInfo() {
      server.loadAccount(this.$store.state.publicKey)
      .then(data => {
        if (data.data_attr.hasOwnProperty('vault_account')) {
          const vaultkey =  window.atob(data.data_attr.vault_account);
          // add vaultkey to the state to have the public key of the vault in the state
          this.$store.commit('setVaultPublicKey', vaultkey);
          server.loadAccount(vaultkey)
          .then(vaultdata => {
            // console.log(vaultdata.balances);
            this.$store.commit('setBalances', vaultdata.balances);
            this.$store.commit('confirmVault', true);
          })
          .catch(err => {
            alert(err + 'The vault account associated to your account is invalid');
          })
          return null //required by javacript to return something
        }
        else{
          this.$store.commit('confirmVault', false);
        }
      })
      .catch(err => { alert('Invalid Public Key')})
    },
  },
};
</script>

<style>
.row {
  display: flex;
}

.vaultinfo {
  max-height: 100%;
  /* overflow-y: scroll; */
}

.input-field {
  margin: auto;
  margin-right: 1rem;
  margin-bottom: 0px;
  flex: 10;
}

.prefix {
  margin-top: 0.5rem
}

.input-field .prefix.active {
  color: black;
}

.input-field input[type=text]:focus+label {
  color: black;
}

.input-field input[type=text]:focus {
  border-bottom: 1px solid black;
  box-shadow: 0 1px 0 0 black;
}

.modal {
  margin: auto;
  height: 7rem;
  height: inherit;
}

.btn-large {
  margin: auto;
  margin-right: 0.5rem;
}

.container {
  flex: 1;
}

.formRow {
  display: flex;
  flex-direction: row;
  flex: 4;
  -webkit-box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  height: 6rem;
  background: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to
/* .fade-leave-active below version 2.1.8 */

  {
  opacity: 0;
}

/* label color */

.input-field label {
  color: black !important;
}

/* label focus color */

.input-field input[type=text]:focus+label {
  color: #337ab7 !important;
}

/* label underline focus color */

.input-field input[type=text]:focus {
  border-bottom: 1px solid #337ab7 !important;
  box-shadow: 0 1px 0 0 #337ab7 !important;
}

/* valid color */

.input-field input[type=text].valid {
  border-bottom: 1px solid #337ab7 !important;
  box-shadow: 0 1px 0 0 #337ab7 !important;
}

/* invalid color */

.input-field input[type=text].invalid {
  border-bottom: 1px solid #337ab7 !important;
  box-shadow: 0 1px 0 0 #337ab7 !important;
}

/* icon prefix focus color */

.input-field .prefix.active {
  color: #337ab7 !important;
}

.tabscomp {
  width: 60%;
  min-width: 597px;
  -webkit-box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  background-color: white;
}

.tabscomp1 {
  padding: 0 !important;
}

.tabs .indicator {
  background-color: #337ab7;
  color: #337ab7;
}

.statustab {
  color: #337ab7 !important;
}
</style>
