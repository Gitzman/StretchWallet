<template>
<div class="modal">
  <router-view/>
</div>
</template>

<script>
export default {
  name: 'Modal',
  data() {
    return {
      msg: '',
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.modal {
  display: block;
}
</style>
