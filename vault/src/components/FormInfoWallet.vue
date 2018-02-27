<template>
<div class='forminfo'>
  <div id='FormInfoWallet'>
    <div class="row">
      <div class='container'></div>
      <form class="formRow" autocomplete="off">
        <div class="input-field">
          <i class="material-icons prefix">vpn_key</i>
          <input id="icon_prefix" v-model="updatedKey" name="textfield" value="" type="text" class="validate">
          <label for="icon_prefix">Public Key, Starts with G</label>
        </div>
        <a class="btn-large waves-effect light-blue darken-3" @click='vaultExist = true'>
          <i class="material-icons right">send</i>
          Send
        </a>
      </form>
      <div class='container'></div>
    </div>
  </div>
  <!-- <Error :message="'PublicStartsWithG'" :valid='startsWithG'></Error> -->
  <transition name="fade">

    <div v-if='vaultExist' class='vaultinfo'>
      <VaultContents />
    </div>
  </transition>

</div>
</template>


<script>
import VaultContents from './VaultContents';
import Error from './Error';

export default {
  name: 'FormInfoWallet',
  data() {
    return {
      pk: this.$store.state.publicKey,
      vaultExist: false,
      error: [],
    };
  },
  components: {
    Error,
    VaultContents,
  },
  computed: {
    updatedKey: {
      get() {
        return this.$store.state.publicKey;
      },
      set(value) {
        this.$store.commit('updatePK', value);
        this.pk = value;
      },
    },
    startsWithG() {
      return this.pk[0] === 'G';
    },
    isMinLength() {
      return this.pk.length < 56;
    },
    isMaxLength() {
      return this.pk.length > 56;
    },
  },
  methods: {},
};
</script>

<style>
.row {
  display: flex;
}

.vaultinfo {
  max-height: 100%;
  /* overflow-y: scroll; */
}

.input-field {
  margin: auto;
  margin-right: 1rem;
  margin-bottom: 0px;
  flex: 10;
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

.modal {
  margin: auto;
  height: 7rem;
  height: inherit;
}

.btn-large {
  margin: auto;
}

.container {
  flex: 1;
}

.formRow {
  display: flex;
  flex-direction: row;
  flex: 4;
  -webkit-box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  height: 6rem;
  background: white;
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

.btn-large{
  margin-right: 0.5rem
}

</style>
