<script setup>
// import Login from '../components/Login.vue';
import Join from "src/components/Join.vue";

import { useRouter } from "vue-router";
import { useUserData } from "src/stores/UserData";
import { useMeetingData } from 'src/stores/Meeting';

const Meeting = useMeetingData()
const store = useUserData();
const router = useRouter();

if (!store.haveUserData()) {
  router.push({ path: "/Login" });
} else {
  Meeting.socket.auth = {
    userID: store.userID,
    userName: store.userName,
  };
}
</script>

<template>
  <div id="login">
    <Join />
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
