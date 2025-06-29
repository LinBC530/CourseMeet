<template>
  <q-card :class="[screen.lt.sm || platform.is.mobile ? 'q-px-sm' : 'shadow-5 q-px-xl q-pt-md q-pb-xl']"
    :flat="screen.lt.sm || platform.is.mobile">
    <q-card-section align="right">
      <q-btn v-if="!isLoggedIn" label="使用帳號登入" text-color="primary" flat @click="change_tab('login')" />
      <q-btn v-else :label="user.name" text-color="primary" flat>
        <q-menu>
          <q-list>
            <q-item class="text-red" clickable v-close-popup @click="loge_out">
              <q-item-section>登出</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-card-section>

    <q-card-section class="q-pt-xs">
      <div class="text-h4 text-center text-bold">視訊會議平台</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit="join_meeting_room">
        <q-input v-if="!isLoggedIn" type="text" v-model="user_name" label="暱稱" :maxlength="10"
          :rules="[val => val.length > 0 || '請輸入暱稱']" />
        <q-input type="text" v-model="meeting_id" label="會議代碼" :maxlength="10"
          :rules="[val => val.length > 0 || '請輸入會議代碼或新增會議']">
          <template v-if="isLoggedIn" v-slot:after>
            <q-btn label="新增會議" color="blue" @click="create_room" />
          </template>
        </q-input>
        <q-btn class="fit q-mt-md" label="加入會議" color="green"
          :disable="isLoggedIn ? meeting_id : !(user_name && meeting_id)" type="submit" />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useTab } from 'src/stores/tab';
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { useAuth } from 'src/stores/auth';
import { useMeetingStore } from 'src/stores/meeting';
import { useRouter } from 'vue-router';
import { guest_login } from 'src/request/account';
import { storeToRefs } from 'pinia';
import { create_meeting_room } from 'src/request/meeting';

const router = useRouter();
const auth_store = useAuth();
const meeting_store = useMeetingStore();
const { screen, platform, notify } = useQuasar();
const { user, isLoggedIn, isTokenExpired } = storeToRefs(auth_store);
const { touched } = storeToRefs(meeting_store);

const { setUser } = auth_store;
const { set_room_id } = meeting_store;
const { change_tab } = useTab();

const user_name = ref('');
const meeting_id = ref('');

/**
 * 加入會議室，如果已登入則直接加入會議，否則走訪客登入流程。
 */
async function join_meeting_room() {
  if (!(meeting_id.value?.length === 8)) return;

  // 已登入直接加入會議
  if (!isTokenExpired.value) {
    set_room_id(meeting_id.value);
    touched.value = true;
    router.push(`/meeting/${meeting_id.value}`);
    return;
  }

  // 未登入走訪客流程
  if (!(user_name.value?.trim())) return;
  const { status, data, message } = await guest_login(user_name.value);
  switch (status) {
    case "success":
      const { token } = data;
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ name: user_name.value, role: "guest", id: payload.id, token: token });
      set_room_id(meeting_id.value);
      touched.value = true;
      router.push(`/meeting/${meeting_id.value}`);
      return;
    case "failed":
      notify({
        type: 'negative',
        message: message || '訪客登入失敗，請稍後再試',
      });
      return;
    default:
      notify({
        type: 'negative',
        message: message || '加入會議發生錯誤，請稍後再試',
      });
      return;
  }
}

/**
 * 建立新的會議，並切換到該會議頁面。
 */
function create_room() {
  if (!isLoggedIn.value || isTokenExpired.value) {
    notify({
      type: 'negative',
      message: '請先登入或使用訪客身份',
    });
    return;
  }

  const { status, data, message } = create_meeting_room();
  switch (status) {
    case "success":
      set_room_id(data.room_id);
      router.push(`/meeting/${data.room_id}`);
      return;
    case "failed":
      notify({
        type: 'negative',
        message: message || '建立會議失敗，請稍後再試',
      });
      return;
    default:
      notify({
        type: 'negative',
        message: message || '建立會議過程中發生錯誤，請稍後再試',
      });
      return;
  }
}

/**
 * 登出功能，清除用戶資訊並切換到加入會議頁面。
 */
function loge_out() {
  auth_store.$reset();
  change_tab('join');
}
</script>
