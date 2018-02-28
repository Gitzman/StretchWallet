<template>
<div id="app">
  <NavBar></NavBar>
  <FormInfoWallet></FormInfoWallet>
  <!-- <Modal></Modal> -->
  <router-view class='router'/>

</div>
</template>

<script>
import NavBar from './components/Navbar';
import Modal from './components/Modal';
import FormInfoWallet from './components/FormInfoWallet';
export default {
  name: 'App',
  components: {
    NavBar,
    Modal,
    FormInfoWallet,
  },
};


</script>

<style>
#app {
  font-family: 'Open Sans', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  width: 100%;
  height: 100%
}
</style>
