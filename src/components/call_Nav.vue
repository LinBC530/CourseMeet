<script setup>
import { useCounterStore } from "../stores/example-store";
import { useRouter } from "vue-router";

const store = useCounterStore();
const router = useRouter();

function end() {
  router.push({ path: "/Exit" });
}
</script>

<template>
  <div id="botton">
    <div id="left">
      <button class="btn" id="whiteboard">
        <q-icon class="material-symbols-outlined" name="draw" size="36px" color="black"></q-icon>
      </button>
      <button class="btn" id="web">
        <q-icon class="material-symbols-outlined" name="web_asset" size="36px" color="black"></q-icon>
      </button>
    </div>
    <div id="center">
      <button id="end_Call" @click="end">
        <q-icon class="material-symbols-outlined" name="call_end" size="36px"></q-icon>
      </button>
    </div>
    <div id="right">
      <button class="btn" id="VideoCam">
        <q-icon class="material-symbols-outlined" name="videocam" size="36px" color="black"></q-icon>
      </button>
      <button class="btn" id="Mic">
        <q-icon class="material-symbols-outlined" name="mic" size="36px" color="black"></q-icon>
      </button>
      <button class="btn" id="Present" @click="store.startPublish(false)">
        <q-icon class="material-symbols-outlined" name="present_to_all" size="36px" color="black"></q-icon>
      </button>
      <button class="btn" id="raised_hand">
        <q-icon class="material-symbols-outlined" name="pan_tool" size="36px" color="black"></q-icon>
      </button>
    </div>
  </div>
</template>

<style scoped>
#botton {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(240, 240, 240);
  border-radius: 20pt 20pt 0pt 0pt;
}
#left{
  height: 100%;
  width: 45%;
  display: flex;
  align-items: center;
  border: 2pt solid rgb(0, 120, 139);
}
#center{
  height: 100%;
  width: 10%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2pt solid rgb(0, 139, 49);
}
#right{
  height: 100%;
  width: 45%;
  display: flex;
  align-items: center;
  border: 2pt solid rgb(132, 0, 139);
}
.btn {
  height: 50px;
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  border: 0;
  border-radius: 15pt;
  background-color: rgb(240, 240, 240);
  margin: 0pt 3px;
  fill: rgb(50, 50, 50);
}
.btn:hover {
  background-color: rgb(205, 205, 205);
}
#end_Call {
  height: 40pt;
  width: 40pt;
  border: 0pt;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background-color: red;
}
#end_Call:hover {
  cursor: pointer;
  background-color: rgb(200, 0, 0);
}
</style>
