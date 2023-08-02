<script setup>
import { reactive, ref } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useUserData } from "src/stores/UserData";
import { api } from "../boot/axios";

const $q = useQuasar();
const store = useUserData();
const router = useRouter();

const user = reactive({
  Email: store.userEmail,
  Name: store.userName,
  OldPwd: null,
  NewPwd: null,
});

function changeAccountData() {
  if (user.Email && user.Pwd) {
    api
      .post("/changeAccountData", { Name: user.Name })
      .then((res) => {
        if (res.data) {
          if (res.data.type) {
            //################
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
</script>

<template>
  <q-card id="loginPage">
    <q-btn id="backBtn" icon="arrow_back" @click="router.push({ path: '/' })" />
    <q-card-section>
      <div id="title">
        <span>我的帳戶</span>
      </div>
    </q-card-section>
    <q-card-section>
      <q-form @submit="changeAccountData">
        <div id="input">
          <q-input
            readonly
            id="Email_box"
            v-model="user.Email"
            type="email"
            label="Email"
          />
          <q-input
            id="name_box"
            v-model="user.Name"
            type="text"
            label="name"
            :rules="[(value) => !!value || '請輸入名稱']"
          />

          <!-- <q-input
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
          </q-input> -->
        </div>
        <div id="button">
          <q-btn
            class="btn"
            type="submit"
            label-color="dark"
            unelevated
            rounded
            color="secondary"
            label="儲存變更"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<style scoped>
#loginPage {
  width: 50%;
  min-width: 500pt;
  padding: 10pt;
}

#backBtn {
  height: 50px;
  width: 50px;
}

#title {
  height: 20%;
  display: flex;
  justify-content: center;
}
#title span {
  display: flex;
  align-items: center;
  font-size: 30px;
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

.btn {
  height: 20%;
  width: 30%;
  font-size: 15pt;
}
</style>
