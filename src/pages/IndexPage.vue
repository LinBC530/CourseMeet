<script setup>
import Login from '../components/Login.vue';
import { useCounterStore } from "../stores/example-store";
import { useRouter } from "vue-router";

const store = useCounterStore();
const router = useRouter();

// if(store.userName){
//   router.push({ path: "/Meet" })
// }
</script>

<template>
  <div id="login">
    <Login />
  </div>
</template>

<style scoped>
#login {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-content: center;
  flex-wrap: wrap;
}
</style>
