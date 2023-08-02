<script setup>
import { reactive, ref } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useUserData } from "src/stores/UserData";
import { api } from "../boot/axios";

const $q = useQuasar();
const store = useUserData();
const router = useRouter();
//密碼是否可見
const isPwd = ref(true);
//登入或註冊
const haveAccount = ref(true);
const user = reactive({
  Email: null,
  Pwd: null,
  Name: null,
});

//設定Axios攔截器，加入等待中動畫
api.interceptors.request.use(
  (req) => {
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
              store.setUserData(res.data.data.userID, res.data.data.userName);
              router.push({ path: "/" });
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
          $q.notify({
            message: "發生錯誤，請稍後再試",
            color: "negative",
          });
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
          } else {
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
            type="text"
            label="name"
            :rules="[(value) => !!value || '請輸入名稱']"
          />
          <q-input
            id="Email_box"
            v-model="user.Email"
            type="email"
            label="Email"
            :rules="[(value) => !!value || '請輸入信箱']"
          />
          <q-input
            id="pwd_box"
            v-model="user.Pwd"
            :type="isPwd ? 'password' : 'text'"
            label="password"
            :rules="[(value) => !!value || '請輸入密碼']"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
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
