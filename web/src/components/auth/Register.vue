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
      <q-form @submit="register">

        <!-- 名稱 -->
        <q-input type="text" v-model="account.name" label="名稱" maxlength="10" :rules="[val => !!val || '名稱為必填項']"
          hide-bottom-space />

        <!-- 信箱 -->
        <q-input type="email" v-model="account.email" label="信箱" maxlength="50" :rules="[
          value => !!value || '信箱為必填項',
          (value, rules) => rules.email(value) || '請輸入有效的信箱'
        ]" hide-bottom-space />

        <!-- 驗證碼 -->
        <q-input type="text" v-model="account.verification_code" label="驗證碼" maxlength="6" :rules="[
          value => !!value || '驗證碼為必填項',
          value => /^[0-9]+$/.test(value) || '必須為數值',
          value => value.length === 6 || '驗證碼必須為6位數'
        ]" hide-bottom-space>
          <template v-slot:after>
            <q-btn label="發送驗證碼" color="blue" @click="send_verification_code" />
          </template>
        </q-input>

        <!-- 密碼 -->
        <q-input type="password" v-model="account.password" label="密碼" :rules="[
          value => !!value || '密碼為必填項',
          value => value.length >= 8 || '密碼長度至少為8個字元',
          value => /[A-Z]/.test(value) || '密碼必須包含至少一個大寫字母',
          value => /[a-z]/.test(value) || '密碼必須包含至少一個小寫字母',
          value => /[0-9]/.test(value) || '密碼必須包含至少一個數字'
        ]" hide-bottom-space />

        <!-- 確認密碼 -->
        <q-input type="password" v-model="account.confirm_password" label="再次輸入密碼" :rules="[
          value => !!value || '密碼驗證為必填項',
          value => value === account.password || '密碼不一致'
        ]" hide-bottom-space />

        <!-- 註冊按鈕 -->
        <q-btn class="fit q-mt-lg" label="註冊" color="green" type="submit"
          :disable="!account.name || !account.email || !account.password || !account.confirm_password" />

      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useTab } from 'src/stores/tab';
import { reactive } from 'vue';
import { useQuasar } from 'quasar';
import { register_account, get_verification_code } from 'src/request/account';
const { screen, platform, notify } = useQuasar();

const $q = useQuasar();
const { back_to_previous_tab, change_tab } = useTab();
const account = reactive({
  name: '',
  email: '',
  password: '',
  confirm_password: '',
  verification_code: ''
})

/**
 * 發送驗證碼到使用者的電子郵件
 * @returns {Promise<void>}
 */
async function send_verification_code() {
  if (!account.email) {
    notify({
      type: 'negative',
      message: '請輸入信箱',
    });
    return;
  }
  const { status, message } = await get_verification_code(account.email);
  switch (status) {
    case "success":
      notify({
        type: 'positive',
        message: '驗證碼已發送至您的信箱',
      });
      break;
    case "failed":
      notify({
        type: 'warning',
        message: message || '發送失敗，請檢查信箱是否正確',
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

/**
 * 註冊新帳戶
 * @returns {Promise<void>}
 */
async function register() {
  if (!account.name || !account.email || !account.password || !account.confirm_password) {
    alert('請輸入所有欄位');
    return;
  }
  const { status, message } = await register_account(account.name, account.email, account.password, account.verification_code);
  switch (status) {
    case "success":
      notify({
        type: 'positive',
        message: '註冊成功',
      });

      change_tab('join');
      break;
    case "failed":
      notify({
        type: 'warning',
        message: message || '註冊失敗，請檢查輸入資料',
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
