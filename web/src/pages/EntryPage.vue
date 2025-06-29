<template>
  <q-page class="content-center">
    <Join v-if="tab === 'join'" class="card" />
    <Login v-if="tab === 'login'" class="card" />
    <Register v-if="tab === 'register'" class="card" />
    <Forgetpwd v-if="tab === 'forgetpwd'" class="card" />
  </q-page>
</template>

<script setup>
import Login from '../components/auth/Login.vue';
import Join from '../components/auth/Join.vue';
import Register from '../components/auth/Register.vue';
import Forgetpwd from 'src/components/auth/Forgetpwd.vue';
import { useTab } from 'src/stores/tab';
import { storeToRefs } from 'pinia';

const { tab } = storeToRefs(useTab());
</script>

<style scoped>
@media screen and (max-width: 600px) {
  .card {
    width: 100%;
    margin: auto;
  }
}
@media screen and (min-width: 600px) {
  .card {
    width: 500px;
    margin: auto;
  }
}
</style>
