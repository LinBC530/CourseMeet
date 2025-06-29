<template>
  <q-layout view="hHr lpR fFf">

    <q-drawer :width="400" show-if-above v-model="drawer_open" side="right" bordered>
      <router-view name="drawer" />
    </q-drawer>

    <q-page-container class="page">
      <router-view />
    </q-page-container>

    <q-footer class="bg-grey-8 text-white footer">
      <router-view name="footer" />
    </q-footer>

  </q-layout>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useMeetingStore } from 'src/stores/meeting';

const { drawer_open } = storeToRefs(useMeetingStore());
</script>

<style scoped>
.page {
  height: calc(100vh - 60px);
}

.footer {
  height: 60px;
}
</style>
