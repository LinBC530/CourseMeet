<template>
  <q-page class="content-center">
    <div class="card q-pa-md">
      <div class="text-h4 text-center text-bold">視訊會議平台</div>

      <q-form @submit="submit_reset_password">

        <!-- 密碼 -->
        <q-input v-model="password" label="密碼" type="password" :rules="[
          value => value.length >= 8 || '密碼長度至少為8個字元',
          value => /[A-Z]/.test(value) || '密碼必須包含至少一個大寫字母',
          value => /[a-z]/.test(value) || '密碼必須包含至少一個小寫字母',
          value => /[0-9]/.test(value) || '密碼必須包含至少一個數字',
        ]" @update:model-value="validate_confirm_password" />

        <!-- 確認密碼 -->
        <q-input v-model="confirm_password" ref="confirm_password_element" label="再次輸入密碼" type="password" :rules="[
          value => value === password || '兩次密碼輸入不一致'
        ]" />

        <!-- 註冊按鈕 -->
        <q-btn class="fit q-mt-lg" label="確認變更密碼" color="green" type="submit" />

      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { ref } from 'vue';
import { reset_password } from 'src/request/account';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';

const route = useRoute();
const router = useRouter();
const password = ref('');
const confirm_password = ref('');
const confirm_password_element = ref();
const token = route.params.token;

const { notify } = useQuasar();

/**
 * 驗證密碼與驗證密碼是否一致
 */
function validate_confirm_password() {
  if (confirm_password.value) {
    confirm_password_element.value?.validate?.();
  }
};

/**
 * 提交重設密碼請求
 */
async function submit_reset_password() {
  if (password.value !== confirm_password.value) {
    confirm_password_element.value?.validate?.();
    return;
  }

  const { status, message } = await reset_password(token, password.value);
  switch (status) {
    case 'success':
      alert('密碼已成功重設');
      router.push('/');
      break;
    case 'failed':
      notify({
        type: 'warning',
        message: message || '重設密碼失敗，請稍後再試',
      });
      return;
    default:
      notify({
        type: 'negative',
        message: message || '密碼重設發生錯誤，請稍後再試',
      });
      return;
  }
}
</script>

<style scoped>
@media screen and (min-width: 768px) {
  .card {
    width: 35%;
    margin: auto;
  }
}

@media screen and (max-width: 768px) {
  .card {
    width: 90%;
    margin: auto;
  }
}
</style>
