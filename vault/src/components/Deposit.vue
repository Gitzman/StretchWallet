<template>
<div class='depositcomp'>
  <!-- <br>
  <form action="#">
    <p>
      <input type="checkbox" class="filled-in" id="filled-in-box" checked="checked" />
      <label for="filled-in-box">Create new token</label>
    </p>
  </form> -->
  <div class='row'>
    <div class="input-field col s6">
      <select class='selecttag'>
        <option disbled selected></option>
        <option v-for='asset in $store.state.balances' v-if='asset.asset_code' :value='asset.asset_code' class='optiontag #337ab7'>{{asset.asset_code}}</option>
      </select>
      <label>Materialize Select</label>
      <input placeholder="amount" type='number' v-model='amount'></input>
    </div>
  </div>
  <div class='row'>
    <div class="input-field col s6">
      <input placeholder="symbol" v-model='symbol'></input>
      <input placeholder="description" v-model='description'></input>
      <input placeholder="denomination" v-model='denomination'></input>
    </div>
  </div>
  <a @click='makeDeposit()' class="btn-large waves-effect light-blue darken-3">
    <i class="material-icons right">send</i> Deposit
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
  name: 'Deposit',
  data() {
    return {
      depositOld: false, //is true if the deposit is in the same field as an old safe box
      amount: 500,
      symbol: 'SAFEDEMO',
      description: 'This is a fake token on test net',
      denomination: 10,
    };
  },
  computed: {},
  directives: {
    select(el) {
      jquery(el).material_select()
    }
  },
  mounted() {
    jquery(document).ready(function() {
      jquery('select').material_select();
    });
  },
  methods: {
    makeDeposit() {
      const safeKP = kp.random();
      const storedAsset = new StellarSdk.Asset('XLM', null);
      const safeAsset = new StellarSdk.Asset(this.symbol, safeKP.publicKey());

      const ops1 = {
        source: this.$store.state.publicKey,
        destination: safeKP.publicKey(),
        amount: '1',
        asset: new StellarSdk.Asset('XLM', null),
      };

      const payTrustlineOperation = StellarSdk.Operation.payment(ops1);

      const ops2 = {
        source: this.$store.state.newVault.publicKey,
        destination: safeKP.publicKey(),
        startingBalance: this.amount + 1.5 + '',
      };

      const issueAccountOperation = StellarSdk.Operation.createAccount(ops2);

      const ops3 = {
        source: this.$store.state.newVault.publicKey,
        asset: safeAsset,
        limit: this.amount / this.denomination + '',
      };

      const trustIssuerOperation = StellarSdk.Operation.changeTrust(ops3);

      const ops4 = {
        'source': safeKP.publicKey(),
        'set_flags': 1,
      };

      const setAuthorityOperation = StellarSdk.Operation.setOptions(ops4);

      const ops5 = {
        'source': this.$store.state.publicKey,
        'trustor': this.$store.state.newVault.publicKey,
        'assetCode': this.symbol,
        'authorize': 'True',
      };

      const trustUserOperation = StellarSdk.Operation.allowTrust(ops5);

      const ops6 = {
        'source': safeKP.publicKey(),
        'destination': this.$store.state.newVault.publicKey,
        'amount': (this.amount / this.denomination) + '',
        'asset': safeAsset,
      };

      const payUserOperation = StellarSdk.Operation.payment(ops6);

      const ops7 = {
        'source': safeKP.publicKey(),
        'selling': storedAsset,
        'buying': safeAsset,
        'amount': this.amount + '',
        'price': (1.0 / this.denomination) + '',
      };

      const sellOfferOperation = StellarSdk.Operation.createPassiveOffer(ops7);

      const ops8 = {
        'source': safeKP.publicKey(),
        'master_weight': 0
      };

      const killSafeKeyOperation = StellarSdk.Operation.setOptions(ops8);

      const ops9 = {
        'name': safeKP.publicKey(),
        'value': this.description,
      };

      const storeDescriptionOperation = StellarSdk.Operation.manageData(ops9);

      const operations = [
        issueAccountOperation,
        payTrustlineOperation,
        trustIssuerOperation,
        setAuthorityOperation,
        trustUserOperation,
        payUserOperation,
        sellOfferOperation,
        killSafeKeyOperation,
        storeDescriptionOperation,
      ];


      server.loadAccount(this.$store.state.newVault.publicKey)
        .then(accountresp => {
          const sequence = accountresp.sequenceNumber() + '';

          const msg = new StellarSdk.Memo('text', 'Creating a safe deposit');

          const vaultAccount = new StellarSdk.Account(this.$store.state.newVault.publicKey, sequence)

          const transaction = new StellarSdk.TransactionBuilder(vaultAccount)
            .addOperation(issueAccountOperation)
            .addOperation(payTrustlineOperation)
            .addOperation(trustIssuerOperation)
            .addOperation(setAuthorityOperation)
            .addOperation(trustUserOperation)
            .addOperation(payUserOperation)
            .addOperation(sellOfferOperation)
            .addOperation(killSafeKeyOperation)
            .addOperation(storeDescriptionOperation)
            .addMemo(msg)
            .build()


          transaction.sign(kp.fromPublicKey( this.$store.state.newVault.publicKey ));
          transaction.sign(kp.fromPublicKey( this.$store.state.publicKey ));
          transaction.sign(safeKP);
          // create transaction to be signed in the stellar laboratory
          console.log( transaction.toEnvelope().toXDR().toString("base64") );



        })
        .catch(err => alert(err))
    },
  },
}
</script>

<style scoped>
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

.depositcomp {
  display: block;
  padding: 1rem;
  width: 60%;
  min-width: 597px;
  height: 10rem;
  margin: auto;
  width: 50%;
  height: 50%;
  background-color: white;
  -webkit-box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
}
</style>
