<template>
  <q-page class="q-pa-md row flex flex-center bg-grey-10 text-white fit">
    <div class="q-pa-md column items-center">
      <p class="text-h3 q-mb-md">準備好加入會議?</p>
      <q-btn label="加入會議" color="primary" class="q-mt-md" @click="go_meeting_page"/>
    </div>

  </q-page>
</template>

<script setup>
import { useMeetingStore } from "src/stores/meeting";
import { useRouter } from 'vue-router';

const MeetingStore = useMeetingStore();
const router = useRouter();

// 前往會議頁面
function go_meeting_page() {
  MeetingStore.touched = true;
  MeetingStore.room_id = router.currentRoute.value.params.id;
  router.replace(`/meeting/${router.currentRoute.value.params.id}`);
}
</script>
