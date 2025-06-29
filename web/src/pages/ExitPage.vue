<template>
  <q-page class="flex flex-center">
    <div class="column items-center">
      <div class="text-h4">您已離開會議</div>
      <q-circular-progress show-value class="text-light-blue q-ma-md" max="30" :value="countdown" size="100px"
        color="light-blue" />
      <q-btn class="q-mt-md" color="primary" label="返回首頁" to="/" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const countdown = ref(30)
const router = useRouter()

onMounted(() => {
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      router.push('/')
    }
  }, 1000)
})
</script>

<style scoped></style>
