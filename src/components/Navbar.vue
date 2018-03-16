<template>
  <nav class='navbar'>
    <div class="nav-wrapper">
      <ul class='left'>
        <a href='/' class="brand-logo">StretchWallet</a>
      </ul>
      <ul id="nav-mobile" class="right hide-on-med-and-down">
        <li><router-link to='/FAQ'>FAQ</router-link></li>
        <li><router-link to='/Instructions' >Instructions</router-link></li>
        <li><router-link to='/AboutUs'>About Us</router-link></li>
      </ul>
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
.brand-logo {
  margin-left: 0.5rem
}

.nav-wrapper {
  margin: 0px;
  background-color: #337ab7;
}

.navbar {
  /* display: flex; */
  background-color: #337ab7;
  margin-bottom: 2rem;

}
</style>
