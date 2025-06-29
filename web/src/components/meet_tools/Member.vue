<template>
  <q-scroll-area class="fit">
    <q-list>
      <q-item-label class="text-subtitle2">參與人數: {{ clients_length + 1 }}</q-item-label>
      <q-list dense>
        <q-item v-for="([key, client]) in members" :key="key" clickable>
          <q-item-section class="q-pa-md">
            <q-item-label class="text-h6">{{ client.name }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-list>
  </q-scroll-area>
</template>

<script setup>
import { computed } from 'vue';
import { useMeetingStore } from 'src/stores/meeting';
import { storeToRefs } from 'pinia';
import { useAuth } from 'src/stores/auth';

const MeetingStore = useMeetingStore();
const { socket, clients_array, clients_length } = storeToRefs(MeetingStore);
const { user } = storeToRefs(useAuth());

const members = computed(() => {
  return [[user.value.id, { socket_id: socket.value.id, name: user.value.name }], ...clients_array.value]
});
</script setup>
