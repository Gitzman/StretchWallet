<template>
<transition name="fade">
  <div id='VaultContents'>
    <div v-if='vaultExist === 1'>
      <h3 class="vaultTitle">Vault Contents</h3>
      <!-- <table class='VaultTableComponent highlight centered'>
        <thead>
          <tr>
            <th>Asset Type</th>
            <th>Amount</th>
            <th style='text-align:right'>Operations</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for='asset in balanceInfo'>
            <td v-if='asset.asset_code'>{{asset.asset_code}}</td>
            <td v-else>Lumens</td>
            <td>{{asset.balance}}</td>
            <td><i class='material-icons'>add</i></td>
            <td><i class='material-icons'>remove</i></td>
          </tr>
        </tbody>
      </table> -->
      <ul class="collapsible" data-collapsible="accordion">
        <li>
          <div class="collapsible-header"><i class="material-icons">filter_drama</i>First</div>
          <div class="collapsible-body"><span>Lorem ipsum dolor sit amet.</span></div>
        </li>
        <li>
          <div class="collapsible-header"><i class="material-icons">place</i>Second</div>
          <div class="collapsible-body"><span>Lorem ipsum dolor sit amet.</span></div>
        </li>
        <li>
          <div class="collapsible-header"><i class="material-icons">whatshot</i>Third</div>
          <div class="collapsible-body"><span>Lorem ipsum dolor sit amet.</span></div>
        </li>
      </ul>
    </div>
    <div v-if='vaultExist === 0' class='errorResponse'>
      <h3>No Associated Vault</h3>
      <a class="btn-large waves-effect light-blue darken-3" @click='vaultExist = true'>
        <!-- <i class="material-icons right">add</i> -->
        Create Vault
      </a>
    </div>
    <div v-if='wrongPK === true' class='errorResponse'>
      <h4>No account associated to this public key</h4>
    </div>
  </div>
</transition>
</template>

<script>
import jquery from 'jquery'
import axios from 'axios';

export default {
  name: 'VaultContents',
  data() {
    return {
      balanceInfo: {},
      vaultExist: null,
      wrongPK: null
    };
  },
  computed: {

  },
  methods: {
    getWalletInfo: function() {
      const pk = this.$store.state.publicKey
      const address = `https://horizon-testnet.stellar.org/accounts/${pk}`
      console.log(address)
      axios.get(address)
        .then(data => {
          this.balanceInfo = data.data.balances;
          console.log(data.status);
          if (data.data.data != {}) {
            this.vaultExist = 1
          } else {
            this.vaultExist = 0
          }
        })
        .catch(err => {
          console.log(err);
          this.wrongPK = true
        })
    }
  },
  mounted: function() {
    this.getWalletInfo()
  },
  props: [
    'balanceinfo'
  ],
  inserted: function() {
    // Focus the element
    $('.collapsible').collapsible();
  }
};
</script>

<style>
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
</style>
