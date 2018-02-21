<template>
<div id="error">
  <transition name="fade">
    <p v-if="!valid">{{message}}</p>
  </transition>
</div>
</template>

<script>
/* eslint-disable indent */

export default {
  name: 'Error',
  data() {
    return {

    };
  },
  props: [
    'valid',
    'message',
  ],
};
</script>


<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity .5s;
}

.fade-enter,
.fade-leave-to
/* .fade-leave-active below version 2.1.8 */

  {
  opacity: 0;
}
</style>
