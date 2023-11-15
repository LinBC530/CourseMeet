<script setup>
import Login from '../components/Login.vue';
import { useRouter } from "vue-router";
import { useUserData } from 'src/stores/UserData';
import { onMounted } from 'vue';
import { useQuasar } from 'quasar';

const store = useUserData();
const router = useRouter();
const $q = useQuasar();

$q.loading.show({message:'頁面載入中，請稍後'});
onMounted(() => {
  $q.loading.hide();
})


//如果瀏覽器有儲存的帳戶資訊，則導向加入會議頁面
if(store.haveUserData()){
  router.push({ path: "/" })
}
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
