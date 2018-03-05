<template>
<div class='depositcomp' v-show='$store.state.vaultExist'>
  <!-- <br>
  <form action="#">
    <p>
      <input type="checkbox" class="filled-in" id="filled-in-box" checked="checked" />
      <label for="filled-in-box">Create new token</label>
    </p>
  </form> -->

  <div class='row'>
    <!-- <h1 v-for='asset in balances'> ALOHA {{asset}}</h1> -->
    <div class="left-column input-field col s6">
      <input list='tokens' placeholder='Token code'></input>
      <datalist id='tokens'>
        <option value='NEW: Create new token' />
        <option v-for='asset in balances' :value='asset.asset_code' />
      </datalist>
      <input placeholder="Amount" type='number' v-model='amount'></input>
      <input placeholder="Symbol ABC QWE" v-model='symbol'></input>
    </div>
    <div class="right-column input-field col s6">
      <input placeholder="Description" v-model='description'></input>
      <input placeholder="Denomination" v-model='denomination'></input>
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
      symbol: 'IGN',
      description: 'new token ignacio',
      denomination: 10,
    };
  },
  computed: {
    balances() {
      return this.$store.state.balances;
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
    makeDeposit() {
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
        amount: (this.amount / this.denomination) + '',
        asset: safeAsset,
      };

      const payUserOperation = StellarSdk.Operation.payment(ops6);

      const ops7 = {
        source: safeKP.publicKey(),
        selling: storedAsset,
        buying: safeAsset,
        amount: this.amount + '',
        price: (1.0 / this.denomination) + '',
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
          console.log(vaultAccount);
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


          // transaction.sign(kp.fromPublicKey(this.$store.state.newVault.publicKey));
          // transaction.sign(kp.fromPublicKey(this.$store.state.publicKey));
          transaction.sign(safeKP);
          // create transaction to be signed in the stellar laboratory
          console.log(transaction.toEnvelope().toXDR().toString("base64"));



        })
        .catch(err => alert(err))
    },
  },
}
</script>

<style scoped>
.right-column {
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

.depositcomp {
  display: block;
  padding: 1rem;
  width: 60%;
  min-width: 597px;
  height: 10rem;
  max-height: 22rem;
  min-height: 22rem;
  margin: auto;
  width: 50%;
  height: 50%;
  background-color: white;
  -webkit-box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
}
</style>
