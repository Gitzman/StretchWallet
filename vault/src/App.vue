<template>
<div id="app">
  <NavBar></NavBar>
  <Modal></Modal>
</div>
</template>

<script>
import NavBar from './components/Navbar';
import Modal from './components/Modal';

export default {
  name: 'App',
  components: {
    NavBar,
    Modal,
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
