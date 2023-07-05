<script setup>
import { reactive, ref } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useCounterStore } from "../stores/example-store";
import { api } from "../boot/axios";

const $q = useQuasar();
const store = useCounterStore();
const router = useRouter();
const haveAccount = ref(true);
const user = reactive({
  Email: null,
  Pwd: null,
  Name: null,
});

//設定Axios攔截器，加入等待中動畫
api.interceptors.request.use(
  (req) => {
    console.log("show");
    $q.loading.show();
    return req;
  },
  (err) => {
    $q.loading.hide();
    return Promise.reject(err);
  }
);
api.interceptors.response.use(
  (res) => {
    $q.loading.hide();
    return res;
  },
  (err) => {
    $q.loading.hide();
    return Promise.reject(err);
  }
);

function sendAccountData() {
  //登入
  if (haveAccount.value == true) {
    if (user.Email && user.Pwd) {
      api
        .post("/checkAccount", { Email: user.Email, Pwd: user.Pwd })
        .then((res) => {
          if (res.data) {
            if (res.data.type) {
              store.userName = res.data.data.name;
              router.push({ path: "/Main" });
            } else {
              $q.notify({
                message: res.data.reason,
                color: "negative",
              });
            }
          } else {
            $q.notify({
              message: "發生錯誤，請稍後再試",
              color: "negative",
            });
          }
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }
  //註冊
  else {
    if (user.Email && user.Pwd && user.Name) {
      api
        .post("/newAccount", {
          Name: user.Name,
          Email: user.Email,
          Pwd: user.Pwd,
        })
        .then((res) => {
          if (res.data) {
            if (res.data.type == true) {
              alert("註冊成功");
              haveAccount.value = true;
            } else {
              // alert("此帳戶已被註冊");
              $q.notify({
                message: res.data.reason,
                color: "negative",
              });
            }
          }
          else {
            $q.notify({
              message: "發生錯誤，請稍後再試",
              color: "negative",
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
}
</script>

<template>
  <q-card id="loginPage">
    <q-card-section>
      <div id="title">
        <span>Discuss</span>
      </div>
      <div id="nav">
        <span @click="haveAccount = true">登入</span>
        /
        <span @click="haveAccount = false">註冊</span>
      </div>
      <q-form @submit="sendAccountData">
        <div id="input">
          <q-input
            id="name_box"
            v-model="user.Name"
            v-if="!haveAccount"
            label="name"
          />
          <q-input id="Email_box" v-model="user.Email" label="Email" />
          <q-input id="pwd_box" v-model="user.Pwd" label="password" />
        </div>
        <div id="button" v-if="haveAccount">
          <q-btn
            id="btn"
            type="submit"
            label-color="dark"
            unelevated
            rounded
            color="secondary"
            label="登入"
          />
        </div>
        <div id="button" v-else>
          <q-btn
            id="btn"
            type="submit"
            label-color="dark"
            unelevated
            rounded
            color="secondary"
            label="註冊"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<style scoped>
#loginPage {
  width: 50%;
  min-height: 300pt;
  min-width: 500pt;
  padding: 10pt;
}
#nav {
  display: flex;
  justify-content: center;
  font-size: 20pt;
}
#nav span {
  color: rgb(46, 46, 170);
}
#nav span:hover {
  cursor: pointer;
}
#title {
  height: 40%;
  display: flex;
  justify-content: center;
}
#title span {
  display: flex;
  align-items: center;
  font-size: 50pt;
}
form {
  height: 60%;
  width: 80%;
  margin: 0 auto;
}
#button {
  width: 100%;
  margin: 10pt;
  display: flex;
  justify-content: center;
}
#input {
  height: 80;
  width: 80%;
  margin-left: auto;
  margin-right: auto;
}
#btn {
  height: 20%;
  width: 50%;
  font-size: 15pt;
}
</style>
