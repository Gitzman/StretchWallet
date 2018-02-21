<template>
<transition name="fade">
  <div id='VaultContents'>
    <h3 class="vaultTitle">Vault Contents</h3>
    <div>
      <table class='VaultTableComponent highlight centered'>
        <thead>
          <tr>
            <th>Asset Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for='asset in balanceinfo'>
            <td v-if='asset.asset_code'>{{asset.asset_code}}</td>
            <td v-else>Lumens</td>
            <td>{{asset.balance}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</transition>
</template>

<script>
export default {
  name: 'VaultContents',
  data() {
    return {};
  },
  computed: {

  },
  methods: {

  },
  props: [
    'balanceinfo'
  ]
};
</script>

<style>
.VaultTableComponent {
  width: 70%;
  height: 70%;
  margin: auto;
}

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

.vaultTitle {
  margin: auto;
}
</style>
