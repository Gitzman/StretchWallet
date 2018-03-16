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
    <transition name='fade'>
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
            <h6 class=''>Public key: </h6>
            <h6 class='vaultkey vaultTitle' id='publicKey'> {{vaultPublicKey}}</h6>
          </div>
          <div class='keycontainer'>
            <h6 class=''>Vault secret: </h6>
            <h6 class='vaultkey vaultTitle' id='secret'> {{vaultPrivateKey}}</h6>
          </div>
          <div class="row middlediv">
            <form class="col s12 middlebutton">
              <div class="row middlediv">
                <!-- <div class="input-field col m3 coltextarea">
                <textarea id="textarea1" disabled class="materialize-textarea" v-model='xdrEnvelope'></textarea>
              </div> -->
                <br>
                <div>
                  <a class="btn waves-effect light-blue darken-3" target="_blank" :href='laboratoryLink'>
                Sign outside
              </a>
                </div>
              </div>
            </form>
          </div>
          <div>
            <label class='labeloption'>or sign here</label>
          </div>
          <div class="row lastrow">
            <div class='container'></div>
            <div class="input-field col s6 lastrowdiv">

              <input id="signingkey" type="text" v-model='privateKey' class="validate">
              <label for="signingkey">Secret to sign</label>
              <a @click='submitTransaction()' v-if='creationStep === "button"' id='finalbutton' class="btn-large waves-effect light-blue darken-3">
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
            <div>
              <a @click='createVault()' v-if='xdrEnvelope == null' class="btn-large waves-effect light-blue darken-3">
              <i class="material-icons right" >send</i> Create Transaction
          </a>
            </div>
            <div class='container'></div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</transition>
</template>

<script>
import axios from 'axios';
import jquery from 'jquery';
import material from 'materialize-css';
import StellarSdk from 'stellar-sdk';

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
      var privKP = kp.fromSecret(this.privateKey)
      transaction.sign(privKP);
      this.creationStep = 'loader';
      server.submitTransaction(transaction)
        .then(data => {
          Materialize.toast('SUCCESS, Vault Created', 2000);
          Materialize.toast(data._links.transaction.href, 2000);
          this.creationStep = 'check'
          this.$router.push('/')
          this.getWalletInfo();
        })
        .catch(err => {
          Materialize.toast('Invalid Secret', 2000);
        })
    },
    getWalletInfo() {
      const server = new StellarSdk.Server(this.$store.state.networkURL);
      if (this.$store.state.networkURL === 'https://horizon.stellar.org') {
        StellarSdk.Network.usePublicNetwork();
      } else {
        StellarSdk.Network.useTestNetwork();
      }
      this.$router.push('/');
      server.loadAccount(this.$store.state.publicKey)
        .then(data => {
          if (data.data_attr.hasOwnProperty('vault_account')) {
            const vaultkey = window.atob(data.data_attr.vault_account);
            // add vaultkey to the state to have the public key of the vault in the state
            this.$store.commit('setVaultPublicKey', vaultkey);
            server.loadAccount(vaultkey)
              .then(vaultdata => {
                this.$store.commit('setBalances', vaultdata.balances);
                this.$store.commit('confirmVault', true);
                this.$store.commit('setPersonalBalances', data.balances)
              })
              .catch(err => {
                Materialize.toast('The vault account associated to your account is invalid',2000);
              })
            return null //required by javacript to return something
          } else {
            this.$store.commit('confirmVault', false);
            this.$store.commit('setPersonalBalances', data.balances)
          }
        })
        .catch(err => {
          Materialize.toast('Invalid Public Key', 2000)
        })
    },
    createVault() {
      const server = new StellarSdk.Server(this.$store.state.networkURL);

      // vaultAccount is by default started at null, after creating a random KP
      // account with createVaultAccount() this var is set to an actual value
      this.startVaultCreation = true

      let vaultAccount = null;
      let personalAccount = null;

      server.loadAccount(this.$store.state.publicKey)
        .then(data => {
          console.log(data)
          console.log(data.data.sequence);
          personalAccount = new StellarSdk.Account(this.$store.state.publicKey, data.sequenceNumber() + '');

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
          alert(err);
          console.log(err);
        });
    }
  },
  mounted() {},
  computed: {
    laboratoryLink: function() {
      if (this.$store.state.networkPassphrase === 'PUBLIC') {
        return `https://www.stellar.org/laboratory/#txsigner?xdr=${encodeURIComponent(this.xdrEnvelope)}&network=public`;
      } else {
        return `https://www.stellar.org/laboratory/#txsigner?xdr=${encodeURIComponent(this.xdrEnvelope)}&network=test`;
      }
    },
  }
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
  margin: auto;
  -webkit-box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  background: rgb(250, 250, 250);
  overflow: hidden;
}

.vaultkey {
  overflow-x: scroll;
  min-width: 38rem;
}

.keycontainer {
  /* display: flex; */
  margin: auto;
  width: 44rem;
}


.btn-large {
  margin: 1rem;
}

.vaultTitle {
  font-weight: 600;
}

.collapsiblelumen {
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

.container {
  flex: 1
}

.lastrow {
  display: flex;
}

.lastrowdiv {
  flex-direction: row;
  flex: 7;
  margin: 0;
}

#finalbutton {
  margin: 0;
}

.middlediv {
  margin: 0;
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
</style>
