<template>
<div id='VaultContents'>
  <transition name="fade">
    <div v-if='$store.state.vaultExist' >
      <ul class="collapsiblelumen" data-collapsible="expandable">
        <li>
          <div class="collapsible-header">
            <i class="material-icons">
              star
            </i> Lumens {{$store.state.balances['undefined']}} XLM
          </div>
        </li>
      </ul>
      <div class='spacer'>
      </div>
      <div>
        <ul class="collapsible" v-if='Object.keys($store.state.balances).length > 1' data-collapsible="expandable">
          <li v-for='asset in Object.keys($store.state.balances)' v-if='asset != "undefined"'>
            <div class="collapsible-header">
              <i class="material-icons">
              lock
            </i>{{calculateTotalBalance(asset)}} {{asset}}
            </div>

            <!-- <div class="collapsible-body">
              <table class='VaultTableComponent highlight centered'>
                <thead>
                  <tr>
                    <th>Balance</th>
                    <th>Limit</th>
                    <th>Asset Type</th>
                    <th>Asset Code</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{{calculateTotalBalance(asset)}}</td>
                    <td>{{asset.limit}}</td>
                    <td>{{asset.asset_type}}</td>
                    <td>{{asset.asset_type}}</td>
                    <td v-if='asset.asset_code'>{{asset.asset_code}}</td>
                    <td v-else>Lumens</td>
                  </tr>
                </tbody>
              </table>
            </div> -->
          </li>
        </ul>
      </div>
    </div>
    <VaultCreation v-else />
  </transition>

  <transition name="fade">
    <div v-if='wrongPK === true' class='errorResponse'>
      <h4>No account associated to this public key</h4>
    </div>
  </transition>
</div>
</template>

<script>
import VaultCreation from './VaultCreation';
import axios from 'axios';
import jquery from 'jquery';
import material from 'materialize-css';
import StellarSdk from 'stellar-sdk';
StellarSdk.Network.useTestNetwork();

const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const operation = StellarSdk.Operation;
const kp = StellarSdk.Keypair;

const accountId = ''; //include public key here for dev
// const personalkeypair = kp.fromSecret(''); // include private key here for dev

// vaultAccount is by default started at null, after creating a random KP
// account with createVaultAccount() this var is set to an actual value
let vaultAccount = null;
let personalAccount = null;

export default {
  name: 'VaultContents',
  data() {
    return {
      vaultExist: null,
      wrongPK: null,
      privateKey: '',
      xdrEnvelope: '',
      vaultPublicKey: '',
      vaultPrivateKey: '',
    };
  },
  components: {
    VaultCreation,
  },
  directives: {
    collapsible(el) {
      jquery(el).collapsible();
    }
  },
  methods: {
    calculateTotalBalance(tokencode) {
      const balances = this.$store.state.balances
      var counter = 0;
      for (var i = 0; i < balances[tokencode].safes.length; i++) {
        counter += balances[tokencode].safes[i].amount;
      }
      return counter;
    },
  },
};
</script>

<style !scoped>
.VaultTableComponent {
  margin: auto;
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

.vaultTitle {
  margin: auto;
}

tbody {
  overflow-y: scroll;
}

.novaultmessage {
  margin: 1rem;
}

.collapsible {
  width: 90%;
  min-width: 597px;
  margin: auto;
  /* height: 30rem; */
  overflow-y: scroll;
  -webkit-box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
}

.collapsiblelumen {
  width: 60%;
  min-width: 597px;
  margin: auto;
  overflow-y: scroll;
  -webkit-box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
}

.collapsible-body {
  background: rgb(250, 250, 250);
}

.spacer {
  height: 0.5rem;
  opacity: 0;
  background: none !important;
}

.errorResponse {
  /* background: white; */
  width: 90%;
  margin: auto;
}

.vaultkey {
  overflow-x: scroll;
}

.keycontainer {
  display: flex;
}

#textarea1 {
  min-height: 200px;
  color: black;
}
</style>
