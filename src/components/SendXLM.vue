<template>
<transition name='fade'>
  <div id='SendXLM' class='sendcomps' v-show='$store.state.vaultExist'>
    <input placeholder='Amount' v-model='amount' type='number' :disabled='xdrEnvelope != null'></input>
    <input placeholder='Destination' v-model='destination' type='text' :disabled='xdrEnvelope != null'></input>

    <div v-if='xdrEnvelope'>
      <form class="col s12">
        <label>Transaction to sign</label>
        <div class="row xdrEnvelope">
          <div class="input-field col m3 coltextarea">
            <textarea id="textarea1" disabled class="materialize-textarea" v-model='xdrEnvelope'></textarea>
          </div>
        </div>
      </form>
      <div>
        <input v-model='userPrivateKey' placeholder='[Optional] User Private Key'></input>
      </div>
    </div>

    <a @click='createTransaction()' v-if='xdrEnvelope == null' class="btn-large waves-effect light-blue darken-3">
      <i class="material-icons right">send</i> Create Transaction
    </a>

    <a @click='submitTransaction()' v-if='xdrEnvelope != null && sendingStage == "button"' class="btn-large waves-effect light-blue darken-3">
      <i class="material-icons right">send</i> Send XLM
    </a>
    <div class="preloader-wrapper big active" v-if='sendingStage === "loader"'>
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
    <div v-if='sendingStage === "check" || sendingStage === "close"'>
      <i class='material-icons'>{{sendingStage}}</i>
    </div>
  </div>
</transition>
</template>

<script>
import StellarSdk from 'stellar-sdk';

const kp = StellarSdk.Keypair;

export default {
  name: 'SendXLM',
  data() {
    return {
      pk: this.$store.state.publicKey,
      error: [],
      xdrEnvelope: null,
      destination: null,
      userPrivateKey: null,
      amount: null,
      sendingStage: 'button',
    };
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
      transaction.sign(privKP);
      this.sendingStage = 'loader';
      server.submitTransaction(transaction)
        .then(data => {
          Materialize.toast('SUCCESS: XLM Transfer Complete');
          Materialize.toast( data._links.transaction.href);
          this.sendingStage = 'check';
          this.$router.push('/');
        })
        .catch(err => {
          Materialize.toast('FAILURE, Not possible to send XLM');
          this.sendingStage = 'close'
          this.$router.push('/');
        })
    },
    createTransaction() {
      const server = new StellarSdk.Server(this.$store.state.networkURL);
      const ops = {
        destination: this.destination,
        asset: new StellarSdk.Asset('XLM', null),
        amount: this.amount,
        source: this.$store.state.publicKey
      };
      console.log('ops', ops);
      const sendXLMOperation = StellarSdk.Operation.payment(ops);
      console.log('print operation', sendXLMOperation);

      server.loadAccount(this.$store.state.publicKey)
        .then(accountresp => {

          const sequence = accountresp.sequenceNumber() + '';

          const msg = new StellarSdk.Memo('text', 'Sending XLM');

          const personalAccount = new StellarSdk.Account(this.$store.state.publicKey, sequence);

          const transaction = new StellarSdk.TransactionBuilder(personalAccount)
            .addOperation(sendXLMOperation)
            .addMemo(msg)
            .build();

          this.xdrEnvelope = transaction.toEnvelope().toXDR().toString("base64");
        })
        .catch(err => console.log(err))
    }
  }
};
</script>

<style scoped>
.sendcomps {
  display: block;
  padding: 1rem;
  width: 60%;
  min-width: 597px;
  /* height: 100%; */
  /* min-height: 29rem; */
  /* max-height: 32rem; */
  margin: auto;
  width: 50%;
  /* height: 50%; */
  background-color: white;
  -webkit-box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
}

#textarea1 {
  min-height: 7rem;
  padding: 0;
  margin: auto
}

.row {
  margin: 0;
}

.xdrEnvelope {
  display: flex;
  width: 100%;
}

.coltextarea {
  margin: auto;
  width: 77% !important;
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
</style>
