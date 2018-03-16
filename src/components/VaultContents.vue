<template>
<div id='VaultContents'>
  <transition name='fade'>
    <div v-if='$store.state.vaultExist'>
      <ul class="collapsiblelumen" data-collapsible="expandable">
        <li v-for='asset in $store.state.personalBalances' v-if='!asset.asset_code'>
          <div class="collapsible-header">
            <i class="material-icons">
              monetization_on
            </i> {{asset.balance}} XLM
          </div>
        </li>
        <li v-for='asset in $store.state.personalBalances' v-if='asset.asset_code'>
          <div class="collapsible-header">
            <i class="material-icons">
              work
            </i> {{asset.asset_code}} {{asset.balance}}
          </div>
        </li>
      </ul>
      <div class='spacer'>
      </div>
      <div>
        <ul class="collapsiblelumen" v-if='Object.keys($store.state.balances).length > 1' data-collapsible="expandable">
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
  <div v-if='wrongPK === true' class='errorResponse'>
    <h4>No account associated to this public key</h4>
  </div>
</div>
</template>

<script>
import VaultCreation from './VaultCreation';
import axios from 'axios';
import jquery from 'jquery';
import material from 'materialize-css';
import StellarSdk from 'stellar-sdk';
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
      document.getElementById('contentstab').click();
      return counter;
    },
    updateWalletInfo() {
      const server = new StellarSdk.Server(this.$store.state.networkURL);
      if (this.$store.state.networkURL === 'https://horizon.stellar.org') {
        StellarSdk.Network.usePublicNetwork();
      } else {
        StellarSdk.Network.useTestNetwork();
      }
      server.loadAccount(this.$store.state.publicKey)
        .then(data => {
          if (data.data_attr.hasOwnProperty('vault_account')) {
            const vaultkey = window.atob(data.data_attr.vault_account);
            // add vaultkey to the state to have the public key of the vault in the state
            var tmp = this.$store.state.publicKey
            // this.$store.commit('reset');
            server.loadAccount(vaultkey)
              .then(vaultdata => {
                this.$store.commit('setBalances', vaultdata.balances);
                this.$store.commit('setPersonalBalances', data.balances)
              })
            return null //required by javacript to return something
          } else {
            this.$store.commit('setPersonalBalances', data.balances)
          }
        })

    },
  },
  mounted() {
    this.updateWalletInfo()
  }
};
</script>

<style !scoped>
.VaultTableComponent {
  margin: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .5s;
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
