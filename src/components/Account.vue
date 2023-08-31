<script setup>
import { reactive, ref } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useUserData } from "src/stores/UserData";
import { api } from "../boot/axios";

const $q = useQuasar();
const store = useUserData();
const router = useRouter();
const err = new Error("server error");

const showLogin = ref(true);
const checkPwd = ref();
const user = reactive({
  Email: null,
  Name: null,
});
const pwd = reactive({
  OldPwd: null,
  NewPwd: null,
});

//檢查密碼並取得用戶資料
function checkPwdAndGetUserData() {
  if (checkPwd.value)
    api
      .post("/checkAccount", { Email: store.userEmail, Pwd: checkPwd.value })
      .then((res) => {
        if (res.data) {
          if (res.data.type) {
            user.Email = res.data.data.userEmail;
            user.Name = res.data.data.userName;
            showLogin.value = false;
          } else
            $q.notify({
              message: "密碼驗證失敗",
              color: "negative",
            });
        } else throw err;
      })
      .catch((e) => {
        console.log(e);
        $q.notify({
          message: "發生錯誤，請稍後再試",
          color: "negative",
        });
      });
  else
    $q.notify({
      message: "請輸入密碼",
      color: "negative",
    });
}

//修改用戶資料
function changeAccountData() {
  console.dir(true);
  if (user.Email && user.Name) {
    api
      .patch("/changeAccountData", {
        userID: store.userID,
        pwd: checkPwd.value,
        data: { name: user.Name },
      })
      .then((res) => {
        if (res.data) {
          if (res.data.type) {
            $q.notify({
              message: "更新成功",
              color: "negative",
            });
          } else throw err;
        } else throw err;
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

//修改密碼
function changePwd() {
  if (pwd.OldPwd && pwd.NewPwd) {
    if (pwd.OldPwd == pwd.NewPwd) {
      $q.notify({
        message: "舊密碼不可與新密碼相同",
        color: "negative",
      });
      return;
    }
    api
      .patch("/changePwd", {
        userID: store.userID,
        oldPwd: pwd.OldPwd,
        newPwd: pwd.NewPwd,
      })
      .then((res) => {
        if (res.data) {
          if (res.data.type) {
            //###############
          } else throw err;
        } else throw err;
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
  <q-dialog v-model:model-value="showLogin" persistent>
    <q-card>
      <q-card-section>
        <div class="text-h6">請輸入密碼</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input label="pwd" v-model="checkPwd" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="確認"
          color="primary"
          @click="checkPwdAndGetUserData"
        />
        <q-btn
          flat
          label="取消"
          color="primary"
          @click="router.push({ path: '/' })"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

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
