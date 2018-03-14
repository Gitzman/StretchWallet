<template>
<transition name="fade">
  <div id='VaultCreation' v-if='$store.state.vaultExist === false'>
    <ul class="collapsiblelumen" data-collapsible="expandable">
      <li v-for='asset in $store.state.personalBalances' v-if='!asset.asset_code'>
        <div class="collapsible-header">
          <i class="material-icons">
            monetization_on
          </i> XLM {{asset.balance}}
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
    <div class='beforeCreation collapsible' v-if='!startVaultCreation'>
      <h3>No Associated Vault</h3>
      <a class="btn-large waves-effect light-blue darken-3" @click='createVault()'>
        <i class="material-icons right">
          add
        </i>
        Create vault to public key
        </a>
    </div>
    <div v-else class='collapsible'>
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
        <br>
        <div class='keycontainer'>
          <h6 class='vaultTitle'>Vault public key: </h6>
          <h6 class='vaultkey' id='publicKey'> {{vaultPublicKey}}</h6>
        </div>
        <br>
        <div class='keycontainer'>
          <h6 class='vaultTitle'>Vault secret: </h6>
          <h6 class='vaultkey' id='secret'> {{vaultPrivateKey}}</h6>
        </div>
        <br>
        <br>
        <div class="row">
          <form class="col s12">
            <label>Transaction to sign</label>
            <div class="row">
              <div class="input-field col">
                <textarea id="textarea1" disabled class="materialize-textarea" v-model='xdrEnvelope'></textarea>
              </div>
            </div>
          </form>
        </div>
        <div class="row">
          <div class="input-field col s6 signingcomp">
            <input id="signingkey" type="text" v-model='privateKey' class="validate">
            <label for="signingkey">Secret to sign</label>
            <a @click='submitTransaction()' v-if='creationStep === "button"' class="btn-large waves-effect light-blue darken-3">
                <i class="material-icons right">send</i> Create Vault
            </a>
            <div class="preloader-wrapper big active" v-if='creationStep === "loader"'>
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
            <div v-if='creationStep === "check"'>
              <i class='material-icons'>check</i>
            </div>
          </div>
          <a @click='createVault()' v-if='xdrEnvelope == null' class="btn-large waves-effect light-blue darken-3">
              <i class="material-icons right" >send</i> Create Transaction
            </a>
        </div>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
import axios from 'axios';
import jquery from 'jquery';
import material from 'materialize-css';
import StellarSdk from 'stellar-sdk';
// StellarSdk.Network.useTestNetwork();

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
      secret: '',
      creationStep: 'button',
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
    submitTransaction() {
      const server = new StellarSdk.Server(this.$store.state.networkURL);
      if (this.$store.state.networkURL === 'https://horizon.stellar.org') {
        StellarSdk.Network.usePublicNetwork();
      } else {
        StellarSdk.Network.useTestNetwork();
      }
      var transaction = new StellarSdk.Transaction(this.xdrEnvelope);
      try {
        var privKP = kp.fromSecret(this.privateKey)
        transaction.sign(privKP);
        this.creationStep = 'loader';
        server.submitTransaction(transaction)
          .then(data => {
            Materialize.toast('SUCCESS, Vault Created');
            Materialize.toast(data._links.transaction.href);
            this.creationStep = 'check'
            this.$router.push('/')
          })
          .catch(err => {
            Materialize.toast('Invalid Secret', 4000);
          })
      } catch (err) {
        Materialize.toast('Invalid Private Key');
      }
    },
    createVault() {
      const server = new StellarSdk.Server(this.$store.state.networkURL);

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
            masterWeight: 2,
            signer: {
              ed25519PublicKey: this.$store.state.publicKey,
              weight: 2,
            },
            highThreshold: 5,
            medThreshold: 3,
          };
          const setOptionOperation = operation.setOptions(ops2);

          // add vault data to my accound data
          const ops3 = {
            name: 'vault_account',
            value: vaultKP.publicKey(),
          };
          const addDataOperation = operation.manageData(ops3);

          // create a memo
          const msg = new StellarSdk.Memo('text', 'Creating Vault');

          // create final transaxction with 3 operations and a memo
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
  mounted() {},
};
</script>

<style scoped>
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

tbody {
  overflow-y: scroll;
}

.novaultmessage {
  margin: 1rem;
}

.collapsible {
  width: 90%;
  margin: auto;
  min-width: 597px;
  /* height: 33rem; */
  -webkit-box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  background: rgb(250, 250, 250);
  overflow: hidden;
}

.vaultkey {
  overflow-x: scroll;
}

.keycontainer {
  display: flex;
  margin: auto;
  width: 44rem;
}

#textarea1 {
  height: 100%;
  padding: 0;
  color: black;
  width: 80%;
  overflow-y: scroll;
}

.btn-large {
  margin: 1rem;
}

.vaultTitle {
  font-weight: 600;
}

.row {
  display: flex;
  margin: 0;
  height: 12rem;
  margin-bottom: 3rem;
}

.input-field {
  width: 90%;
  margin: auto;
  height: 90%;
  margin-bottom: 10rem;
}

.signingcomp {
  margin-top: 3rem;
}

.collapsiblelumen {
  width: 90%;
  min-width: 597px;
  margin: auto;
  margin-bottom: 2rem;
  overflow-y: scroll;
  -webkit-box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
}

#toast-container {
  top: auto !important;
  right: auto !important;
  bottom: 10%;
  left: 7%;
}
</style>
