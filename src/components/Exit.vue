<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

function exit() {
    router.push({ path: "/" });
}
</script>

<template>
  <q-card id="msg_box">
    <q-card-section>
      <div id="title">
        <span>已結束討論</span>
      </div>
      <q-form @submit="exit">
        <div id="button">
          <q-btn
            id="btn"
            type="submit"
            label-color="dark"
            unelevated
            rounded
            color="secondary"
            label="Exit"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<style scoped>
#msg_box {
  height: 30%;
  width: 35%;
  min-height: 200pt;
  min-width: 200pt;
  padding: 10pt;
}
#title {
  height: 40%;
  display: flex;
  justify-content: center;
}
#title span {
  display: flex;
  align-items: center;
  font-size: 30pt;
}
form {
  height: 60%;
}
#button {
  width: calc(100% - 20pt);
  margin: 10pt;
  display: flex;
  justify-content: center;
}
#btn {
  height: 20%;
  width: 50%;
  font-size: 15pt;
}
</style>
