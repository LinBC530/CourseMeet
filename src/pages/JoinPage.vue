<script setup>
// import Login from '../components/Login.vue';
import Join from "src/components/Join.vue";

import { useRouter } from "vue-router";
import { useUserData } from "src/stores/UserData";
import { useMeetingData } from 'src/stores/Meeting';

const socket = useMeetingData().socket
const user_data = useUserData();
const router = useRouter();

if (!user_data.haveUserData()) {
  router.push({ path: "/Login" });
} else {
  socket.auth = {
    userID: user_data.userID,
    userName: user_data.userName,
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
