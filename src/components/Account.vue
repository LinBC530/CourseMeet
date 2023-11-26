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

const slide = ref("user");
const show_pwd = ref(false);
const showLogin = ref(true);
const checkPwd = ref();
const user = reactive({
  Email: null,
  Name: null,
});
const pwd = reactive({
  oldPwd: null,
  newPwd: null,
});

//檢查密碼並取得用戶資料
function checkPwd_And_GetUserData() {
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
          } else {
            $q.notify({
              message: res.data.reason,
              color: "negative",
            });
          }
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
  if (pwd.oldPwd && pwd.newPwd) {
    if (pwd.oldPwd == pwd.newPwd) {
      $q.notify({
        message: "舊密碼不可與新密碼相同",
        color: "negative",
      });
      return;
    }
    api
      .patch("/changeAccountData", {
        userID: store.userID,
        pwd: checkPwd.value,
        data: {
          oldPwd: pwd.oldPwd,
          newPwd: pwd.newPwd,
        },
      })
      .then((res) => {
        if (res.data) {
          if (res.data.type) {
            alert("密碼已變更，請重新登入");
            store.$reset();
            router.push({ path: "/Login" });
          } else {
            $q.notify({
              message: res.data.reason,
              color: "negative",
            });
          }
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
  <div id="loginPage">
    <q-carousel
      v-model="slide"
      transition-prev="scale"
      transition-next="scale"
      animated
      control-color="primary"
      class="rounded-borders carousel"
    >
      <q-carousel-slide
        name="user"
        class="column no-wrap flex-center carousel slide"
      >
        <div id="back">
          <q-btn
            id="backBtn"
            icon="arrow_back"
            @click="router.push({ path: '/' })"
          />
        </div>
        <div id="title">
          <span>我的帳戶</span>
        </div>
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
            <q-btn
              id="name_box"
              v-model="user.Name"
              type="button"
              label="變更密碼"
              @click="slide = 'pwd'"
            />
            <!-- <q-btn
              id="name_box"
              color="red"
              v-model="user.Name"
              type="button"
              label="刪除帳戶"
              @click="slide = 'pwd'"
            /> -->
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
      </q-carousel-slide>
      <q-carousel-slide
        name="pwd"
        class="column no-wrap flex-center carousel slide"
      >
        <div id="back">
          <q-btn id="backBtn" icon="arrow_back" @click="slide = 'user'" />
        </div>
        <div id="title">
          <span>變更密碼</span>
        </div>
        <q-form @submit="changePwd()">
          <div id="input">
            <q-input
              id="pwd_box"
              v-model="pwd.oldPwd"
              :type="show_pwd ? 'text' : 'password'"
              label="old password"
              :rules="[(value) => !!value || '請輸入密碼']"
            >
              <template v-slot:append>
                <q-icon
                  :name="show_pwd ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  @click="show_pwd = !show_pwd"
                />
              </template>
            </q-input>

            <q-input
              id="pwd_box"
              v-model="pwd.newPwd"
              :type="show_pwd ? 'text' : 'password'"
              label="new password"
              :rules="[(value) => !!value || '請輸入密碼']"
            >
              <template v-slot:append>
                <q-icon
                  :name="show_pwd ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  @click="show_pwd = !show_pwd"
                />
              </template>
            </q-input>
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
      </q-carousel-slide>
    </q-carousel>

    <!-- <div class="row justify-center">
      <q-btn-toggle
        glossy
        v-model="slide"
        :options="[
          { label: 1, value: 'user' },
          { label: 2, value: 'pwd' },
        ]"
      />
    </div> -->
  </div>

  <q-dialog v-model:model-value="showLogin" persistent>
    <q-card>
      <q-card-section>
        <div class="text-h6">請輸入密碼</div>
      </q-card-section>

      <q-form @submit="checkPwd_And_GetUserData">
        <q-card-section class="q-pt-none">
          <!-- <q-input label="pwd" v-model="checkPwd" autofocus /> -->
          <q-input
            autofocus
            v-model="checkPwd"
            :type="show_pwd ? 'text' : 'password'"
            label="password"
            :rules="[(value) => !!value || '請輸入密碼']"
          >
            <template v-slot:append>
              <q-icon
                :name="show_pwd ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="show_pwd = !show_pwd"
              />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn type="submit" flat label="確認" color="primary" />
          <q-btn
            flat
            label="取消"
            color="primary"
            @click="router.push({ path: '/' })"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<style scoped>
#loginPage {
  width: 50%;
  min-width: 500pt;
  padding: 10pt;
  border-radius: 20px;
}

.carousel {
  height: auto;
  background-color: rgba(255, 255, 255, 0);
}
.carousel.slide {
  background-color: rgb(255, 255, 255);
}

#back {
  width: 100%;
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
