<template>
<transition name='fade'>

  <iframe  v-if='this.$route.path === "/FAQ" '   src="https://docs.google.com/document/d/e/2PACX-1vQWLtScqehuJAhB7Qwpzf7-xM8Zx7S4wiZ4pJoXBYwDjHP0KipPXuEhCWTAoWrcREpZkkTxEYnwxO-F/pub?embedded=true"></iframe>
  <iframe  v-if='this.$route.path === "/Instructions" '   src="https://docs.google.com/document/d/e/2PACX-1vT_4YDIUcAD8TcBpPMUWh850rQ3yAD7TyEHZYRDjp9mY3qefnbDq8Xak68DEcEhPDi12GTAAhjKke5w/pub?embedded=true"></iframe>
  <iframe  v-if='this.$route.path === "/AboutUs" ' src='TODO'></iframe>

</transition>
</template>

<script>
export default {
  name: 'Extra'
}
</script>

<style>
iframe {
  width: 60%;
  height: 85%;
  margin: auto;
}
</style>
