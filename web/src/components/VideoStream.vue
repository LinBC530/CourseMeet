<template>
  <div class="relative-position row">
    <div v-show="name" class="absolute-bottom-right q-pa-xs q-ma-sm bg-green-8 rounded-borders overflow-hidden">
      <span>{{ name }}</span>
    </div>
    <video ref="video" class="bg-black col fit" style="object-fit: contain; aspect-ratio: 16 / 9;"  autoplay :muted="muted" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";

const { name, stream, muted } = defineProps({ name: String, stream: Object, muted: Boolean });
const video = ref();

onMounted(() => {
  if (stream && video.value) {
    video.value.srcObject = stream;
  }
});

// 監控 stream 的變化，更新 srcObject
watch(
  () => stream,
  (stream) => {
    if (stream && video.value) {
      video.value.srcObject = stream;
    } else {
      video.value.srcObject = null;
    }
  },
  // { deep: true }
);
</script>

<style scoped>
.overflow-hidden {
  max-width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
}
</style>
