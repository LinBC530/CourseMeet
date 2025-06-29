<template>
  <audio ref="audio" autoplay :muted="muted"/>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";

const { stream, muted } = defineProps({ stream: Object, muted: Boolean });
const audio = ref();

onMounted(() => {
  if (stream && audio.value) {
    audio.value.srcObject = stream;
  }
});

// 監控 stream 的變化，更新 srcObject
watch(
  () => stream,
  (stream) => {
    if (stream && audio.value) {
      audio.value.srcObject = stream;
    } else {
      audio.value.srcObject = null;
    }
  },
);
</script>
