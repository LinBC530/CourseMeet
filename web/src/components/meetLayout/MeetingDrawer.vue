<template>
  <div class="row no-wrap fit">
    <!-- 會議工具 -->
    <div class="col q-ma-md">
      <chat v-show="drawer_state === 'chat'" />
      <member v-show="drawer_state === 'member'" />
    </div>

    <!-- 工具切換按鈕 -->
    <div class="col-2 column no-wrap" style="height: 100%;">
      <q-btn class="col" size="lg" icon="groups" padding="md" color="green" square flat @click="drawer_state = 'member'" />
      <q-btn class="col" size="lg" icon="chat" padding="md" color="green" square flat @click="drawer_state = 'chat'" />
    </div>
  </div>
</template>

<script setup>
import chat from '../meet_tools/Chat.vue';
import member from '../meet_tools/Member.vue';
import { ref } from 'vue';

// 工具列狀態 'chat' | 'member'
const drawer_state = ref('chat');
</script>

<style scoped></style>
