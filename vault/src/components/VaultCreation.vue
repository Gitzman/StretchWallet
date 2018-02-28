<template>
<div id='VaultCreation'>
  <transition name="fade">
    <div v-if='$store.vaultExist === false' class='errorResponse'>
      <div class='beforeCreation' v-if='!startVaultCreation'>
        <h3>No Associated Vault</h3>
        <a class="btn-large waves-effect light-blue darken-3" @click='createVault()'>
        <i class="material-icons right">
          add
        </i>
        Create vault to public key
        </a>
      </div>
      <div v-else>
        <div class="preloader-wrapper big active" v-if="xdrEnvelope===''">
          <div class="spinner-layer spinner-blue-only">
            <div class="circle-clipper left">
              <div class="circle"></div>
            </div>
            <div class="gap-patch">
              <div class="circle"></div>
            </div>
            <div class="circle-clipper right">
              <div class="circle"></div>
            </div>
          </div>
        </div>
        <div v-else>
          <h5>Vault Public Key:</h5>
          <div class='keycontainer'>
            <h5 class='vaultkey'>{{vaultPublicKey}}</h5>
            <i class="material-icons right">content_copy</i>
          </div>
          <br>
          <h5>Vault Secret:</h5>
          <div class='keycontainer'>
            <h5 class='vaultkey'>{{vaultPrivateKey}}</h5>
            <i class="material-icons right">content_copy</i>
          </div>
          <br>
          <br>
          <div class="row">
            <form class="col s12">
              <div class="row">
                <div class="input-field col m3">
                  <textarea id="textarea1" disabled class="materialize-textarea" v-model='xdrEnvelope'></textarea>
                  <label for="textarea1">Transaction To sign</label>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </transition>
</div>
</template>

<script>
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
  name: 'VaultCreation',
  data() {
    return {
      wrongPK: null,
      privateKey: '',
      xdrEnvelope: '',
      startVaultCreation: false,
      vaultPublicKey: '',
      vaultPrivateKey: '',
    };
  },
  directives: {
    collapsible(el) {
      jquery(el).collapsible();
    },
    tabs(el) {
      jquery(el).tabs()
    }
  },
  beforeRouteUpdate(to) {
    getWalletInfo()
  },
  methods: {
    getWalletInfo() {
      const pk = this.$store.state.publicKey;
      const address = `https://horizon-testnet.stellar.org/accounts/${pk}`;
      console.log(address);
      axios.get(address)
        .then((data) => {
          this.balanceInfo = data.data.balances;
          if (Object.keys(data.data.data).length > 0) {
            console.log(data.data.data)
            this.$store.commit('confirmVault', true);
          } else {
            console.log("account exists but no vault found")
          }
        })
        .catch((err) => {
          console.log(err);
          this.wrongPK = true;
        });
    },
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
    }
  },
  mounted() {
    this.getWalletInfo();
  },
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
  margin: auto;
  min-width: 597px;
  height: 30rem;
  overflow-y: scroll;
  -webkit-box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  background: rgb(250, 250, 250);
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
