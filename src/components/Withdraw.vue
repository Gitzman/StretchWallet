<template>
<div class='withdrawcomp' v-show='$store.state.vaultExist'>
  <div class='inputs'>
    <div class='content'>
      <select v-model='symbol' :disabled='xdrEnvelope != null'>
      <option value='initial' disabled selected>Choose your token</option>
      <option v-for='token in tokens' v-if='token.text!="undefined"' v-bind:value='token.value'>
        {{token.text}}
      </option>
    </select>
    </div>
    <div class='container'></div>
    <div class='content'>
      <input placeholder='Amount' type='number' v-model.number='amount' :disabled='xdrEnvelope != null'>
      </input>
    </div>
  </div>

  <div v-if='xdrEnvelope'>
    <form class="col s12">
      <label>Transaction to sign</label>
      <div class="row">
        <div class="input-field col m3">
          <textarea id="textarea1" disabled class="materialize-textarea" v-model='xdrEnvelope'>
          </textarea>
        </div>
      </div>
    </form>
    <div>
      <input v-model='userPrivateKey' placeholder='[Optional] User Private Key'>
      </input>
      <input v-model='vaultPrivateKey' placeholder='[Optional] Vault Private Key'>
      </input>
    </div>
  </div>

  <a @click='createTransaction()' v-if='xdrEnvelope == null' class="btn-large waves-effect light-blue darken-3">
    <i class="material-icons right">send</i> Create Transaction
  </a>

  <a @click='submitTransaction()' v-else class="btn-large waves-effect light-blue darken-3">
    <i class="material-icons right">send</i> Withdraw
  </a>

</div>
</template>



<script>
import jquery from 'jquery';
import StellarSdk from 'stellar-sdk';

StellarSdk.Network.useTestNetwork();

const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const kp = StellarSdk.Keypair;

export default {
  name: 'Withdraw',
  data() {
    return {
      depositOld: false, //is true if the deposit is in the same field as an old safe box
      amount: 500,
      symbol: 'SAFEDEMO',
      denomination: 10,
      vaultPrivateKey: null,
      userPrivateKey: null,
      xdrEnvelope: null,
    };
  },
  computed: {
    balances() {
      const res = Object.keys(this.$store.state.balances);
      return res;
    },
    tokens() {
      var res = [];
      const balanceKeys = Object.keys(this.$store.state.balances);
      for (var i = 0; i < balanceKeys.length; i++) {
        res.push({
          'text': balanceKeys[i],
          'value': balanceKeys[i]
        })
      }
      return res
    }
  },
  mounted() {},
  methods: {
    submitTransaction() {
      var transaction = new StellarSdk.Transaction(this.xdrEnvelope);
      var privKP = kp.fromSecret(this.userPrivateKey);
      var vaultprivKP = kp.fromSecret(this.vaultPrivateKey);
      transaction.sign(privKP);
      transaction.sign(vaultprivKP);
      server.submitTransaction(transaction)
        .then(data => {
          alert("Success: " + data._links.transaction.href);
        })
        .catch(err => console.log(err))

    },
    createTransaction() {

      const symbol = this.symbol;
      const safePublicKey = this.$store.state.balances[this.symbol].safes[0].issuer;
      const safeAsset = new StellarSdk.Asset(this.symbol, safePublicKey)
      const storedAsset = new StellarSdk.Asset('XLM', null);

      console.log('symbol: ', symbol);
      console.log('safePublicKey: ', safePublicKey);
      console.log('safeasset: ', safeAsset);

      const ops1 = {
        'source': this.$store.state.newVault.publicKey,
        'selling': safeAsset,
        'buying': storedAsset,
        'amount': (this.amount / 1) + '',
        'price': 1
      };

      var withdrawOffer = StellarSdk.Operation.manageOffer(ops1);

      const ops2 = {
        'source': this.$store.state.newVault.publicKey,
        'destination': this.$store.state.publicKey,
        'amount': this.amount + '',
        'asset': new StellarSdk.Asset('XLM', null)
      };

      var payTransactionWallet = StellarSdk.Operation.payment(ops2);

      server.loadAccount(this.$store.state.newVault.publicKey)
        .then(accountresp => {

          const sequence = accountresp.sequenceNumber() + '';

          const msg = new StellarSdk.Memo('text', 'Withdrawing from safe');

          const vaultAccount = new StellarSdk.Account(this.$store.state.newVault.publicKey, sequence)
          var transaction = new StellarSdk.TransactionBuilder(vaultAccount)
            .addOperation(withdrawOffer)
            .addOperation(payTransactionWallet)
            .addMemo(msg)
            .build();

          this.xdrEnvelope = transaction.toEnvelope().toXDR().toString("base64");
        })
        .catch(err => console.log('error:', err))
    },
  }
};
</script>

<style scoped>
.materialize-textarea {
  overflow-y: scroll;
  margin: 0;
}

select {
  display: block;
}

.inputs {
  display: flex;
}

.contianer {
  flex: 1;
}

.content {
  flex: 12
}

.withdrawcomp {
  display: block;
  padding: 1rem;
  width: 60%;
  min-width: 597px;
  height: 15rem;
  max-height: 50rem;
  min-height: 45rem;
  margin: auto;
  width: 50%;
  height: 50%;
  background-color: white;
  -webkit-box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
}
</style>
