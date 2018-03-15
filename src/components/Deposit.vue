<template>
<transition name="fade">
  <div class='depositcomp' v-show='$store.state.vaultExist'>
    <div class='row inputs'>
      <div class="column input-field col s6">
        <input list='tokens' placeholder='Token code' v-model='symbol' type='text' :disabled='xdrEnvelope != null'></input>
        <datalist id='tokens' :disabled='xdrEnvelope != null'>
          <option value='NEW: Create new token' />
          <option v-for='asset in balances' :value='asset' v-if='asset != "undefined"'/>
        </datalist>
        <input placeholder="Amount" id='amountinput' type='number' min='0' v-model.number='amount' :disabled='xdrEnvelope != null'></input>
      </div>
      <div class="column input-field col s6">
        <input placeholder="Description" v-model='description' type='text' :disabled='xdrEnvelope != null'></input>
      </div>
    </div>
    <div v-if='xdrEnvelope'>
      <form class="col s12">
        <div class="row xdrEnvelope">
          <div class='summary'>
            <label>Summary</label>
            <p>{{summary}}</p>
          </div>
          <div>
            <a class="btn waves-effect light-blue darken-3" target="_blank" :href='laboratoryLink'>
            Sign and deposit in the stellar laboratory
          </a>
          </div>
        </div>
      </form>
      <div>
        <label>or sign here</label>
      </div>
      <div class='input-field signingkeys'>
        <input v-model='userPrivateKey' type='text' placeholder='User Private Key'></input>
        <input v-model='vaultPrivateKey' type='text' placeholder='Vault Private Key'></input>
      </div>
    </div>
    <a @click='createTransaction()' v-if='xdrEnvelope == null' :class="{'btn-large waves-effect light-blue darken-3':true, 'disabled': !validAmount}">
      <i class="material-icons right">send</i> Create Transaction
    </a>
    <a @click='submitTransaction()' v-if='xdrEnvelope != null && depositStage == "button"' class="btn-large waves-effect light-blue darken-3">
      <i class="material-icons right">send</i> Sign and Deposit
    </a>
    <div class="preloader-wrapper big active" v-if='depositStage === "loader"'>
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
    <div v-if='depositStage === "check" || depositStage === "close"'>
      <i class='material-icons'>{{depositStage}}</i>
    </div>
  </div>
</transition>
</template>

<script>
import jquery from 'jquery';
import StellarSdk from 'stellar-sdk';

const kp = StellarSdk.Keypair;

export default {
  name: 'Deposit',
  data() {
    return {
      depositOld: false, //is true if the deposit is in the same field as an old safe box
      amount: null,
      symbol: null,
      description: null,
      tion: 1,
      vaultPrivateKey: null,
      userPrivateKey: null,
      xdrEnvelope: null,
      newSymbol: null,
      depositStage: "button",
    };
  },
  computed: {
    balances() {
      var res = Object.keys(this.$store.state.balances);
      return res;
    },
    laboratoryLink: function() {
      const finalUrl = encodeURIComponent(this.xdrEnvelope)
      if (this.$store.state.networkPassphrase === 'PUBLIC') {
        return `https://www.stellar.org/laboratory/#txsigner?xdr=${finalUrl}&network=public`;
      } else {
        return `https://www.stellar.org/laboratory/#txsigner?xdr=${finalUrl}&network=test`;
      }
    },
    summary: function() {
      return `You are depositing ${parseFloat(this.amount)} XLM in the "${this.symbol}" vault. Your final personal balance will be ${parseFloat(this.$store.state.balances["undefined"][0].balance) - this.amount} XLM`
    },
    validAmount: function() {
      return (parseFloat(this.$store.state.balances["undefined"][0].balance) - this.amount) >= 0
    }
  },
  directives: {
    select(el) {
      jquery(el).material_select()
    },
  },
  mounted() {
    jquery(document).ready(function() {
      jquery('select').material_select();
    });
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
      var privKP = kp.fromSecret(this.userPrivateKey);
      var vaultprivKP = kp.fromSecret(this.vaultPrivateKey);
      transaction.sign(privKP);
      transaction.sign(vaultprivKP);
      this.depositStage = 'loader';
      server.submitTransaction(transaction)
        .then(data => {
          Materialize.toast("SUCCESS, Deposit Complete");
          Materialize.toast(data._links.transaction.href);
          this.depositStage = 'check'
          this.$router.push('/')
        })
        .catch(err => {
          Materialize.toast('FAILURE, Not possible to deposit');
          this.depositStage = 'close';
          this.$router.push('/')
          console.log(err);
        })
    },
    createTransaction() {
      const server = new StellarSdk.Server(this.$store.state.networkURL);
      const safeKP = kp.random();
      const storedAsset = new StellarSdk.Asset('XLM', null);
      const safeAsset = new StellarSdk.Asset(this.symbol, safeKP.publicKey());

      const ops1 = {
        source: this.$store.state.publicKey,
        destination: this.$store.state.newVault.publicKey,
        amount: '1',
        asset: new StellarSdk.Asset('XLM', null),
      };

      const payTrustlineOperation = StellarSdk.Operation.payment(ops1);

      const ops2 = {
        source: this.$store.state.publicKey,
        destination: safeKP.publicKey(),
        startingBalance: (this.amount + 1.5) + '',
      };

      const issueAccountOperation = StellarSdk.Operation.createAccount(ops2);

      const ops3 = {
        source: this.$store.state.newVault.publicKey,
        asset: safeAsset,
        limit: this.amount / this.tion + '',
      };

      const trustIssuerOperation = StellarSdk.Operation.changeTrust(ops3);

      const ops4 = {
        source: safeKP.publicKey(),
        setFlags: 1,
      };

      const setAuthorityOperation = StellarSdk.Operation.setOptions(ops4);

      const ops5 = {
        source: safeKP.publicKey(),
        trustor: this.$store.state.newVault.publicKey,
        assetCode: this.symbol,
        authorize: true,
      };

      const trustUserOperation = StellarSdk.Operation.allowTrust(ops5);

      const ops6 = {
        source: safeKP.publicKey(),
        destination: this.$store.state.newVault.publicKey,
        amount: (this.amount / this.tion) + '',
        asset: safeAsset,
      };

      const payUserOperation = StellarSdk.Operation.payment(ops6);

      const ops7 = {
        source: safeKP.publicKey(),
        selling: storedAsset,
        buying: safeAsset,
        amount: this.amount + '',
        price: (1.0 / this.tion) + '',
      };

      const sellOfferOperation = StellarSdk.Operation.createPassiveOffer(ops7);

      const ops8 = {
        source: safeKP.publicKey(),
        masterWeight: 0
      };

      const killSafeKeyOperation = StellarSdk.Operation.setOptions(ops8);

      const ops9 = {
        name: safeKP.publicKey(),
        value: this.description,
      };

      const storeDescriptionOperation = StellarSdk.Operation.manageData(ops9);

      server.loadAccount(this.$store.state.newVault.publicKey)
        .then(accountresp => {

          const sequence = accountresp.sequenceNumber() + '';

          const msg = new StellarSdk.Memo('text', 'Creating a safe deposit');

          const vaultAccount = new StellarSdk.Account(this.$store.state.newVault.publicKey, sequence)
          const transaction = new StellarSdk.TransactionBuilder(vaultAccount)
            .addOperation(payTrustlineOperation)
            .addOperation(issueAccountOperation)
            .addOperation(trustIssuerOperation)
            .addOperation(setAuthorityOperation)
            .addOperation(trustUserOperation)
            .addOperation(payUserOperation)
            .addOperation(sellOfferOperation)
            .addOperation(killSafeKeyOperation)
            .addOperation(storeDescriptionOperation)
            .addMemo(msg)
            .build()

          transaction.sign(safeKP);
          // create transaction to be signed in the stellar laboratory
          this.xdrEnvelope = transaction.toEnvelope().toXDR().toString("base64");

        })
        .catch(err => alert(err))
    },
  },
}
</script>

<style scoped>
.inputs {
  margin: 0;
}

.column {
  margin: 0px;
}

.optiontag {
  color: #337ab7 !important;
}

.selecttag {
  width: 50%;
  height: 50%;
}

.input-field {
  width: 100%;
  height: 100%;
  overflow-y: scroll;
}

.materialize-textarea {
  overflow-y: scroll;
  margin: 0;
}

.depositcomp {
  display: block;
  padding: 1rem;
  width: 60%;
  min-width: 597px;
  /* height: 15rem; */
  /* max-height: 50rem; */
  /* min-height: 45rem; */
  margin: auto;
  width: 50%;
  /* height: 50%; */
  background-color: white;
  -webkit-box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
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

.xdrEnvelope {
  /* display: flex; */
  width: 100%;
}

.coltextarea {
  margin: auto;
  width: 77% !important;
}

.summary p {
  margin: auto;
  margin-bottom: 1rem;
  width: 70%;
  font-weight: 800;
  font-size: 1.2rem;
}

.summary {
  margin-top: 0rem;
}

/* label focus color */

.input-field input[type=text]:focus+label {
  color: #337ab7;
}

/* label underline focus color */

.input-field input[type=text]:focus {
  border-bottom: 1px solid #337ab7;
  box-shadow: 0 1px 0 0 #337ab7;
}

/* label underline focus color */

.input-field input[type=number]:focus {
  border-bottom: 1px solid #337ab7;
  box-shadow: 0 1px 0 0 #337ab7;
}

.signingkeys {
  margin-top: 0;
}

#amountinput {
  margin-bottom: 1rem;
}
</style>
