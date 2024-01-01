<script setup>
import { reactive, ref } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useUserData } from "src/stores/UserData";
import { api } from "../boot/axios";

const $q = useQuasar();
const store = useUserData();
const router = useRouter();
let slide_tmp = "login";
const slide = ref("login");
//密碼是否可見
const isPwd = ref(true);
//登入或註冊
const user = reactive({
  login: {
    Email: null,
    Pwd: null,
  },
  register: {
    Email: null,
    Pwd: null,
    Name: null,
    VerificationCode: null,
  },
});
function clear_user() {
  user.login.Email = null;
  user.login.Pwd = null;
  user.register.Email = null;
  user.register.Name = null;
  user.register.Pwd = null;
}

//設定Axios攔截器，加入等待中動畫
api.interceptors.request.use(
  (req) => {
    // $q.loading.show();
    slide_tmp = slide.value;
    slide.value = "wait";
    return req;
  },
  (err) => {
    slide.value = slide_tmp;
    return Promise.reject(err);
  }
);
api.interceptors.response.use(
  (res) => {
    // $q.loading.hide();
    slide.value = slide_tmp;
    return res;
  },
  (err) => {
    // $q.loading.hide();
    slide.value = slide_tmp;
    return Promise.reject(err);
  }
);

function getVerificationCode() {
  if (
    user.register.Email &&
    /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(user.register.Email)
  ) {
    api
      .post("/newVerificationCode", { Email: user.register.Email })
      .then((res) => {
        if (res.data) {
          if (res.data.type) {
            $q.notify({
              message: "已寄送驗證碼至您的信箱",
              color: "negative",
            });
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
      });
  } else {
    $q.notify({
      message: "請先填寫信箱",
      color: "negative",
    });
  }
}

function sendAccountData() {
  //登入
  if (slide.value == "login") {
    if (user.login.Email && user.login.Pwd) {
      api
        .post("/checkAccount", { Email: user.login.Email, Pwd: user.login.Pwd })
        .then((res) => {
          if (res.data) {
            if (res.data.type) {
              store.setUserData(
                res.data.data.userID,
                res.data.data.userName,
                res.data.data.userEmail
              );
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
    if (user.register.Email && user.register.Pwd && user.register.Name && user.register.VerificationCode) {
      api
        .post("/newAccount", {
          Name: user.register.Name,
          Email: user.register.Email,
          Pwd: user.register.Pwd,
          VC: user.register.VerificationCode
        })
        .then((res) => {
          if (res.data) {
            if (res.data.type == true) {
              alert("註冊成功");
              clear_user();
              slide.value = "login";
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
  <div
    class="q-pa-md"
    id="loginPage"
    style="background-color: rgb(255, 255, 255)"
  >
    <div id="title">
      <span>輔助教學平台</span>
    </div>

    <!-- 控制項 -->
    <div id="nav" v-show="slide != 'wait'" class="row justify-center">
      <span @click="slide = 'login'">登入</span>
      /
      <span @click="slide = 'register'">註冊</span>
    </div>

    <q-carousel
      v-model="slide"
      transition-prev="slide-right"
      transition-next="slide-left"
      animated
      control-color="primary"
      class="rounded-borders carousel"
    >
      <!-- 登入 -->
      <q-carousel-slide name="login" class="column no-wrap flex-center">
        <q-form class="carousel slide from" @submit="sendAccountData">
          <div id="input">
            <q-input
              id="Email_box"
              v-model="user.login.Email"
              label="email"
              :rules="[
                (value) =>
                  !!value
                    ? /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(
                        value
                      )
                      ? null
                      : '信箱格式錯誤'
                    : '請輸入信箱',
              ]"
            />

            <q-input
              id="pwd_box"
              v-model="user.login.Pwd"
              :type="isPwd ? 'password' : 'text'"
              label="password"
              :rules="[(value) => !!value || '請輸入密碼']"
            >
              <!-- 圖示 -->
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
          </div>

          <div id="button">
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
        </q-form>
        <!-- <div>
          <span id="other_login" @click="slide = 'other_login'"
            >使用其他方式登入</span
          >
        </div> -->
      </q-carousel-slide>

      <!-- 註冊 -->
      <q-carousel-slide
        name="register"
        class="column no-wrap flex-center carousel slide"
      >
        <q-form class="carousel slide from" @submit="sendAccountData">
          <div id="input">
            <q-input
              id="name_box"
              v-model="user.register.Name"
              type="text"
              label="name"
              :rules="[(value) => !!value || '請輸入名稱']"
            />
            <q-input
              id="Email_box"
              v-model="user.register.Email"
              label="email"
              :rules="[
                (value) =>
                  !!value
                    ? /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(
                        value
                      )
                      ? null
                      : '信箱格式錯誤'
                    : '請輸入信箱',
              ]"
            />
            <q-input
              id="pwd_box"
              v-model="user.register.Pwd"
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
            <div style="display: flex; align-items: center">
              <q-input
                style="width: auto"
                id="VerificationCode_box"
                v-model="user.register.VerificationCode"
                type="text"
                label="驗證碼"
                :rules="[(value) => !!value || '請輸入驗證碼']"
              />
              <q-btn
                @click="getVerificationCode"
                style="height: auto; margin-left: 10px"
                label="取得驗證碼"
              />
            </div>
          </div>

          <div id="button">
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
      </q-carousel-slide>

      <!-- 其他登入方式 -->
      <!-- <q-carousel-slide
        name="other_login"
        class="column no-wrap flex-center carousel slide"
      >
        <div>開發中</div>
      </q-carousel-slide> -->

      <!-- 等待伺服器回應 -->
      <q-carousel-slide
        name="wait"
        class="column no-wrap flex-center cxarousel slide"
      >
        <div style="height: 200px; width: 100%">
          <q-inner-loading
            class="column no-wrap flex-center"
            :showing="true"
            label="請稍後..."
            label-class="text-teal"
            label-style="font-size: 25px;"
          />
        </div>
      </q-carousel-slide>
    </q-carousel>
  </div>
</template>

<style scoped>
#loginPage {
  height: auto;
  width: 50%;
  min-height: 300px;
  min-width: 600px;
  border-radius: 10px;
}

#nav {
  height: 30px;
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
  display: flex;
  justify-content: center;
}

#title span {
  display: flex;
  align-items: center;
  font-size: 50pt;
}

.carousel {
  height: auto;
  padding: 0;
}

.carousel.slide {
  padding: 0;
}

.carousel.from {
  width: 100%;
  margin: 0;
}

#button {
  width: calc(100% - 15px);
  margin: 15px;
  margin-top: 5px;
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

#other_login {
  size: 10px;
  cursor: pointer;
}
</style>
