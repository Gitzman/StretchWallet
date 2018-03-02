<template>
<div class='depositcomp'>
  <br>
  <form action="#">
    <p>
      <input type="checkbox" class="filled-in" id="filled-in-box" checked="checked" />
      <label for="filled-in-box">Create new token</label>
    </p>
  </form>
  <div class="input-field col s12">
    <select class='selecttag'>
      <option disbled selected></option>
      <option v-for='asset in $store.state.balances' v-if='asset.asset_code' :value='asset.asset_code' class='optiontag #337ab7'>{{asset.asset_code}}</option>
    </select>
    <label>Materialize Select</label>
  </div>
</div>
</template>



<script>
import jquery from 'jquery';
export default {
  name: 'Deposit',
  data() {
    return {
      depositOld: false //is true if the deposit is in the same field as an old safe box

    };
  },
  computed: {},
  directives: {
    select(el) {
      jquery(el).material_select()
    }
  },
  mounted() {
    jquery(document).ready(function() {
      jquery('select').material_select();
    });
  },
  methods: {},
}
</script>

<style scoped>
.optiontag {
  color: #337ab7 !important;
}

.selecttag {
  width: 50%;
  height: 50%;
}

.input-field {
  width: 50%;
  height: 50%;
}

.depositcomp {
  display: block;
  padding: 1rem;
  width: 60%;
  min-width: 597px;
  height: 10rem;
  margin: auto;
  width: 50%;
  height: 50%;
  background-color: white;
  -webkit-box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
}
</style>
