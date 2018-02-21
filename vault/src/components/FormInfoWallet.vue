<template>
<div id='FormInfoWallet'>
  <div class="row InitialForm">
    <div class='FlexContainer'>
      <form class="col s12 row" autocomplete="off">
        <div class="input-field">
          <i class="material-icons prefix">vpn_key</i>
          <input id="icon_prefix" v-model="updatedKey" name="textfield" value="" type="text" class="validate">
          <label for="icon_prefix">Public Key, Starts with G</label>
        </div>
        <a class="btn-large waves-effect light-blue darken-3" @click='getWalletInfo()'>
          <i class="material-icons right">send</i>
          Send
        </a>
      </form>
    </div>
  </div>
  <!-- <Error :message="'PublicStartsWithG'" :valid='startsWithG'></Error> -->
  <br>
  <div v-if='vaultExist'>
    <hr>
    <VaultContents :balanceinfo="balanceInfo"></VaultContents>
  </div>
</div>
</template>


<script>
import axios from 'axios'
import VaultContents from './VaultContents';
import Error from './Error';

export default {
  name: 'FormInfoWallet',
  data() {
    return {
      pk: this.$store.state.publicKey,
      vaultExist: false,
      error: [],
      balanceInfo: []
    };
  },
  components: {
    Error,
    VaultContents,
  },
  computed: {
    updatedKey: {
      get: function() {
        return this.$store.state.publicKey;
      },
      set: function(value) {
        this.$store.commit('updatePK', value);
        this.pk = value;
      },
    },
    startsWithG: function() {
      return this.pk[0] === 'G';
    },
    isMinLength: function() {
      return this.pk.length < 56;
    },
    isMaxLength: function() {
      return this.pk.length > 56;
    },
  },
  methods: {
    getWalletInfo: function(){
      const pk = this.pk
      const address = `https://horizon-testnet.stellar.org/accounts/${pk}`
      console.log(address)
      axios.get(address)
      .then(data => {
        this.balanceInfo = data.data.balances
        this.vaultExist = true
      })
      .catch(err => console.log(err))
    }
  }
};
</script>

<style>
.row {
  margin: 1rem;
  margin-bottom: 0px;
  /* display: flex; */
}

form {
  display: flex;
  flex: 10;
}


.input-field {
  margin: auto;
  margin-right: 1rem;
  flex: 10;
}

.InitialForm {
  margin: auto;
}

.prefix {
  margin-top: 0.5rem
}

.input-field .prefix.active {
  color: black;
}

.input-field input[type=text]:focus+label {
  color: black;
}

.input-field input[type=text]:focus {
  border-bottom: 1px solid black;
  box-shadow: 0 1px 0 0 black;
}
</style>
