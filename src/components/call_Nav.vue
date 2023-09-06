<script setup>
import { useScreenVideo } from "src/stores/ScreenVideo";
import { useMeetingData } from "src/stores/Meeting";
import { useUserData } from "src/stores/UserData";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { ref } from "vue";

const $q = useQuasar();
const store = useScreenVideo();
const Meeting = useMeetingData();
const UserData = useUserData();
const router = useRouter();
const socket = Meeting.socket;
const mic_isOpen = ref(false);
const cam_isOpen = ref(false);
const ShareScreen_isOpen = ref(false);

function end() {
  router.push({ path: "/Exit" });
}
function openWhiteBoard() {
  const routeData = router.resolve({
    path: "/whiteboard",
  });
  window.open(routeData.href, "_blank");
}
function raisedHand() {
  $q.notify({
    message: "你舉手",
    color: "purple",
    position: "bottom-right",
  });
  socket.emit("sendMessage", {
    dataType: "SystemMsg",
    sender: UserData.userName,
    content: UserData.userName+"舉手",
  });
}
// function VideoCamButtonOnClick() {
//   cam_isOpen.value = !cam_isOpen.value;
//   store.set_sub_video_src(cam_isOpen.value);
// }
// function MicButtonOnClick() {
//   mic_isOpen.value = !mic_isOpen.value;
//   store.soundSwitch(mic_isOpen.value);
// }
function ShareScreenButtonOnClick() {
  ShareScreen_isOpen.value = !ShareScreen_isOpen.value;
  store.set_Pub_video_src(ShareScreen_isOpen.value);
}
function RoomID_OnClick() {
  navigator.clipboard.writeText(Meeting.RoomID).then(() => {
    $q.notify({
      message: "已複製會議代碼",
      color: "purple",
      position: "bottom",
    });
  });
}
</script>

<template>
  <div id="botton">
    <div id="left">
      <button class="btn" id="whiteboard" @click="openWhiteBoard">
        <q-icon
          class="material-symbols-outlined"
          name="draw"
          size="36px"
          color="black"
        ></q-icon>
      </button>
      <div id="RoomID">
        <span @click="RoomID_OnClick">{{ Meeting.RoomID }}</span>
      </div>
      <!-- <button class="btn" id="web">
        <q-icon
          class="material-symbols-outlined"
          name="web_asset"
          size="36px"
          color="black"
        ></q-icon>
      </button> -->
    </div>
    <div id="center">
      <button id="end_Call" @click="end">
        <q-icon
          class="material-symbols-outlined"
          name="call_end"
          size="36px"
        ></q-icon>
      </button>
    </div>
    <div id="right">
      <!-- <button class="btn" id="VideoCam" @click="VideoCamButtonOnClick">
        <q-icon
          class="material-symbols-outlined"
          :name="cam_isOpen ? 'videocam' : 'videocam_off'"
          :color="cam_isOpen ? 'grey-10' : 'red'"
          size="36px"
          color="black"
        ></q-icon>
      </button>
      <button class="btn" id="Mic" @click="MicButtonOnClick">
        <q-icon
          class="material-symbols-outlined"
          :name="mic_isOpen ? 'mic' : 'mic_off'"
          :color="mic_isOpen ? 'grey-10' : 'red'"
          size="36px"
          color="black"
        ></q-icon>
      </button> -->
      <button class="btn" id="Present" @click="ShareScreenButtonOnClick">
        <q-icon
          class="material-symbols-outlined"
          name="present_to_all"
          size="36px"
          color="black"
        ></q-icon>
      </button>
      <button class="btn" id="raised_hand" @click="raisedHand">
        <q-icon
          class="material-symbols-outlined"
          name="pan_tool"
          size="36px"
          color="black"
        ></q-icon>
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
#left {
  height: 100%;
  width: 45%;
  display: flex;
  align-items: center;
}
#center {
  height: 100%;
  width: 10%;
  display: flex;
  align-items: center;
  justify-content: center;
}
#right {
  height: 100%;
  width: 45%;
  display: flex;
  align-items: center;
}
#RoomID {
  width: 100%;
  text-align: center;
  font-size: 20px;
}
#RoomID span:hover {
  cursor: pointer;
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
  cursor: pointer;
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
../stores/ScreenVideo
