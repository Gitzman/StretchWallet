<template>
  <nav class='navbar'>
    <div class="nav-wrapper">
      <h3>StretchWallet</h3>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
  data() {
    return {
      msg: '',
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 0.5rem
}

.nav-wrapper {
  margin: 0px;
  background-color: #337ab7;
}

.navbar {
  display: flex;
  background-color: #337ab7;
  margin-bottom: 5rem;
}
</style>
