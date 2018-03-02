<template>
<transition name="fade">
  <div id='VaultContents'>
    <div v-if='true'>
      <ul class="collapsiblelumen" data-collapsible="expandable">
        <li>
          <div class="collapsible-header">
            <i class="material-icons">
              star
            </i> Lumens {{$store.state.balances[$store.state.balances.length - 1].balance}} XLM
          </div>
        </li>
      </ul>
      <div class='spacer'>
      </div>
      <ul v-collapsible class="collapsible" data-collapsible="expandable">
        <li v-for='asset in $store.state.balances'>
          <div class="collapsible-header" v-if='asset.asset_code'>
            <i class="material-icons">
              lock
            </i> {{asset.asset_code}}: {{asset.balance}}
          </div>

          <div class="collapsible-body">
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

    <VaultCreation></VaultCreation>

    <transition name="fade">
      <div v-if='wrongPK === true' class='errorResponse'>
        <h4>No account associated to this public key</h4>
      </div>
    </transition>
  </div>
</transition>
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
    });
  // create account with sequence number new StellarSdk.Account(accountId, "0");
};

window.getinfo = function getinfo() {
  server.transactions()
    .forAccount(accountId)
    .call()
    .then((page) => {
      console.log('Page 1: ');
      console.log(page.records);
      return page.next();
    })
    .then((page) => {
      console.log('Page 2: ');
      console.log(page.records);
    })
    .catch((err) => {
      console.log(err);
    });
};

export default {
  name: 'VaultContents',
  data() {
    return {
      balanceInfo: {},
      vaultExist: null,
      wrongPK: null,
      privateKey: '',
      xdrEnvelope: '',
      startVaultCreation: false,
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
    createVault() {
      // vaultAccount is by default started at null, after creating a random KP
      // account with createVaultAccount() this var is set to an actual value
      this.startVaultCreation = true

      let vaultAccount = null;
      let personalAccount = null;
      const address = `https://horizon-testnet.stellar.org/accounts/${this.$store.state.publicKey}`;
      axios.get(address)
        .then((data) => {
          personalAccount = new StellarSdk.Account(this.$store.state.publicKey, data.data.sequence);

          // creating KP, this do not create the actual account, only its keys
          const vaultKP = kp.random();
          const ops1 = {
            destination: vaultKP.publicKey(),
            startingBalance: '2',
            source: this.$store.state.publicKey,
          };

          // Returns Type:  xdr.CreateAccountOp
          const createOperation = operation.createAccount(ops1);

          // add my personal accountid ad signer and set options
          const ops2 = {
            source: vaultKP.publicKey(),
            master_weight: 2,
            signer_type: 'ed25519PublicKey',
            signer_address: this.$store.state.publicKey,
            signer_weight: 2,
            high_threshold: 5,
            med_threshold: 3,
          };
          const setOptionOperation = operation.setOptions(ops2);

          // add vault data to my accound data
          const ops3 = {
            name: 'vaultaccount',
            value: vaultKP.publicKey(),
          };
          const addDataOperation = operation.manageData(ops3);

          // create a memo
          const msg = new StellarSdk.Memo('text', 'Creating Vault');

          // create final transaxction with 3 operations and a memo
          console.log(personalAccount)
          const transaction = new StellarSdk.TransactionBuilder(personalAccount)
            .addOperation(createOperation)
            .addOperation(setOptionOperation)
            .addOperation(addDataOperation)
            .addMemo(msg)
            .build();

          // sign transactions with both personal and vault public key
          transaction.sign(vaultKP);

          // create transaction to be signed in the stellar laboratory
          this.xdrEnvelope = transaction.toEnvelope().toXDR().toString("base64");
          this.vaultPublicKey = vaultKP.publicKey();
          this.vaultPrivateKey = vaultKP.secret();

        })
        .catch((err) => {
          console.log(err);
        });

    },
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
  width: 60%;
  min-width: 597px;
  margin: auto;
  height: 30rem;
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
  width: 60%;
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
