<template>
<transition name="fade">
  <div id='VaultContents'>
    <div v-if='vaultExist === 1'>
      <h5 class="vaultTitle">Vault Contents</h5>
      <ul v-collapsible class="collapsible" data-collapsible="accordion">
        <li v-for='asset in balanceInfo'>
          <div class="collapsible-header" v-if='asset.asset_code'>
            <i class="material-icons">
              filter_drama
            </i> {{asset.asset_code}}
          </div>
          <div class="collapsible-header" v-else>
            <i class="material-icons">
              star
            </i> Lumens
          </div>
          <div class="collapsible-body">
            <span class='issuer_title'>Issuer:</span>
            <span>{{asset.asset_issuer}}</span>
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
                  <td>{{asset.balance}}</td>
                  <td>{{asset.limit}}</td>
                  <td>{{asset.asset_type}}</td>
                  <td>{{asset.asset_type}}</td>
                  <td v-if='asset.asset_code'>{{asset.asset_code}}</td>
                  <td v-else>Lumens</td>
                </tr>
              </tbody>
            </table>
          </div>
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
import axios from 'axios';
import jquery from 'jquery';
import material from 'materialize-css';
import StellarSdk from 'stellar-sdk';

const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const kp = StellarSdk.Keypair;

const accountId = ''; //include public key here for dev
const personalkeypair = kp.fromSecret('');// include private key here for dev
let personalAccount = null;
const operation = StellarSdk.Operation;
const network = StellarSdk.Network.useTestNetwork('TESTNET');



window.startDemo = function startDemo(accountdemo) {
  // create personal random kp
  // make request to network to get the actual sequence sequenceNumber
  const address = `https://horizon-testnet.stellar.org/accounts/${accountdemo}`;
  axios.get(address)
  .then((data) => {
    personalAccount = new StellarSdk.Account(accountdemo, data.data.sequence);
  })
  .catch((err) => {
    console.log(err);
  })
  // create account with sequence number new StellarSdk.Account(accountId, "0");

}

// vaultAccount is by default started at null, after creating a random KP
// account with createRandomAccount() this var is set to an actual value
var vaultAccount = null;

window.getinfo = function getinfo() {
  server.transactions()
    .forAccount(accountId)
    .call()
    .then(function(page) {
      console.log('Page 1: ');
      console.log(page.records);
      return page.next();
    })
    .then(function(page) {
      console.log('Page 2: ');
      console.log(page.records);
    })
    .catch(function(err) {
      console.log(err);
    });
}

window.createVaultAccount = function createVaultAccount() {
  // creating KP, this do not create the actual account, only its keys
  const vaultPK = kp.random();
  const ops1 = {
    destination: vaultPK.publicKey(),
    startingBalance: '2',
    source: accountId,
  };

  //Returns Type:  xdr.CreateAccountOp
  const createOperation = operation.createAccount(ops1);

  // add my personal accountid ad signer and set options
  const ops2 = {
    source: vaultPK.publicKey(),
    master_weight: 2,
    signer_type: 'ed25519PublicKey',
    signer_address: accountId,
    signer_weight: 2,
    high_threshold: 5,
    med_threshold: 3,
  };
  const setOptionOperation = operation.setOptions(ops2);

  // add vault data to my accound data
  const ops3 = {
    name: 'vaultaccount',
    value: vaultPK.publicKey(),
  };
  const addDataOperation = operation.manageData(ops3);

  const operations = [createOperation, setOptionOperation, addDataOperation];

  // create a memo
  const msg = new StellarSdk.Memo('text', 'Creating Vault');

  // create final transaxction with 3 operations and a memo
  const transaction = new StellarSdk.TransactionBuilder(personalAccount)
    .addOperation(createOperation)
    .addOperation(setOptionOperation)
    .addOperation(addDataOperation)
    .addMemo(msg)
    .build();


  // sign transactions with both personal and vault keypairs
  transaction.sign(personalkeypair);
  transaction.sign(vaultPK);

  server.submitTransaction(transaction)
    .then(data => console.log(data))
    .catch(err => console.log(err));
};

export default {
  name: 'VaultContents',
  data() {
    return {
      balanceInfo: {},
      vaultExist: null,
      wrongPK: null,
    };
  },
  computed: {},
  directives: {
    collapsible(el) {
      jquery(el).collapsible();
    },
  },
  methods: {
    getWalletInfo() {
      const pk = this.$store.state.publicKey;
      const address = `https://horizon-testnet.stellar.org/accounts/${pk}`;
      console.log(address);
      axios.get(address)
        .then((data) => {
          this.balanceInfo = data.data.balances;
          if (data.data.data !== {}) {
            this.vaultExist = 1;
          } else {
            this.vaultExist = 0;
          }
        })
        .catch((err) => {
          console.log(err);
          this.wrongPK = true;
        });
    },
    // processContent(content) {
    //   console.log
    //   // window.getinfo(content);
    // },
  },
  mounted() {
    this.getWalletInfo();
  },
  props: [
    'balanceinfo',
  ],
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
