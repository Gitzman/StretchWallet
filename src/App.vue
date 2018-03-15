<template>
<div id="app">
  <NavBar></NavBar>
  <FormInfoWallet v-if='!isExtraInfo'></FormInfoWallet>
  <router-view class='router' />
  <div class="switch" v-if='!isExtraInfo'>
    <label>
      TESTNET
      <input type="checkbox" v-model='pubnet'>
      <span class="lever"></span>
      PUBNET
    </label>
  </div>
</div>
</template>

<script>
import NavBar from './components/Navbar';
import FormInfoWallet from './components/FormInfoWallet';
export default {
  name: 'App',
  data() {
    return {
      pubnet: false,
    }
  },
  watch: {
    pubnet: function() {
      this.$store.commit('reset');
      this.$store.commit('switchNetwork', this.pubnet);
      this.$router.push('/');
    }
  },
  components: {
    NavBar,
    FormInfoWallet,
  },
  computed: {
    isExtraInfo() {
      if (this.$route.path === 'deposit' ||
        this.$route.path === 'withdraw' ||
        this.$route.path === '/' ||
        this.$route.path === 'send') {
        return false
      }
      else {
        return true
      }
    }
  }
};
</script>

<style scoped>
#app {
  font-family: 'Open Sans', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  width: 100%;
  height: 100%
}

.switch {
  position: absolute;
  bottom: 10px;
  margin: auto;
  margin-left: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: white;
  padding: 0.4rem;
  -webkit-box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.switch label input[type=checkbox]:checked+.lever {
  background-color: #337ab7;
}

.switch label input[type=checkbox]:checked+.lever:after {
  background-color: #337ab7;
}
</style>
