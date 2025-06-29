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
      <q-form @submit="send_reset_password_email">
        <q-input type="email" label="信箱" v-model="email" :rules="[(val, rules) => rules.email(val) || '請輸入有效的信箱']" />
        <q-btn class="fit q-mt-lg" label="發送重置密碼連結" color="green" :disable="!email" type="submit" />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useTab } from 'src/stores/tab';
import { forgot_password } from 'src/request/account';

const { screen, platform, notify } = useQuasar();
const back_to_previous_tab = useTab().back_to_previous_tab;
const email = ref('');

/**
 * 發送重設密碼的電子郵件
 * @returns {Promise<void>}
 */
async function send_reset_password_email() {
  if (!email.value) {
    alert('請輸入信箱');
    return;
  }
  const { status, message } = await forgot_password(email.value);
  switch (status) {
    case "success":
      notify({
        type: "positive",
        message: '重置密碼連結已發送至信箱',
      });
      return;
    case "failed":
      notify({
        type: "warning",
        message: message || '發送失敗，請稍後再試',
      });
      return;
    case "error":
      notify({
        type: "negative",
        message: message || '發生錯誤，請稍後再試',
      });
      return;
  }
};
</script>
