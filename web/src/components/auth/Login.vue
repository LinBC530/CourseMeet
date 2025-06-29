<template>
  <q-card :class="[screen.lt.sm || platform.is.mobile ? 'q-px-sm' : 'shadow-5 q-px-xl q-pt-md q-pb-xl']"
    :flat="screen.lt.sm || platform.is.mobile">
    <q-card-section align="right">
      <q-btn label="返回" text-color="primary" flat @click="back_to_previous_tab" />
    </q-card-section>

    <q-card-section class="q-pt-xs">
      <div class="text-h4 text-center text-bold">視訊會議平台</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit="login">
        <q-input type="email" v-model="account.email" label="信箱" maxlength="30"
          :rules="[(val, rules) => rules.email(val) || '請輸入有效的電子郵件地址']" hide-bottom-space />

        <q-input type="password" v-model="account.password" label="密碼" :rules="[(val) =>
          val.length > 0 || '請輸入密碼'
        ]" hide-bottom-space />
        <a @click="change_tab('forgetpwd')" class="text-overline">忘記密碼</a>

        <q-btn type="submit" class="full-width" label="登入" color="green"
          :disable="!(account.email && account.password)" />

        <div class="text-overline">還沒有帳號? <a @click="change_tab('register')">立即註冊</a></div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useTab } from 'src/stores/tab';
import { ref, reactive } from 'vue';
import { login_account } from 'src/request/account';
import { useQuasar } from 'quasar';
import { useAuth } from 'src/stores/auth';


const { screen, platform, notify } = useQuasar();
const loading = ref(false);
const account = reactive({
  email: '',
  password: '',
})
const { setUser } = useAuth();
const { change_tab, back_to_previous_tab } = useTab();

/**
 * 登入
 * @returns {Promise<void>}
 */
async function login() {
  loading.value = true;
  if (!account.email || !account.password) {
    alert('請輸入信箱和密碼');
    return;
  }
  const { status, data, message } = await login_account(account.email, account.password);
  switch (status) {
    case "success":
      setUser({ role: data.role, name: data.name, id: data.id, token: data.token });
      change_tab('join');
      break;
    case "failed":
      notify({
        type: 'warning',
        message: message || '登入失敗，請檢查您的帳號和密碼',
      });
      break;
    default:
      notify({
        type: 'negative',
        message: message || '伺服器錯誤，請稍後再試',
      });
      break;
  }
}

</script>

<style scoped>
a {
  color: #1976d2;
  cursor: pointer;
  text-decoration: none
}
</style>
