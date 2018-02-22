<template>
<div class="modal">
  <router-view class='router'/>
</div>
</template>

<script>
export default {
  name: 'Modal',
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.modal {
  display: flex;
  flex: 1;
}
</style>
