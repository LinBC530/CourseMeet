<script setup>
import { useScreenVideo } from "src/stores/ScreenVideo";
import { useMeetingData } from "src/stores/Meeting";
import { useUserData } from "src/stores/UserData";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { ref } from "vue";

const REC_msg = ref(false);
const $q = useQuasar();
const store = useScreenVideo();
const Meeting = useMeetingData();
const UserData = useUserData();
const router = useRouter();
const socket = Meeting.socket;
// const mic_isOpen = ref(false);
// const cam_isOpen = ref(false);
// const REC_isOpen = ref(false);
// const ShareScreen_isOpen = ref(false);

function end() {
  router.push({ path: "Main/Exit" });
}
function openWhiteBoard() {
  const routeData = router.resolve({
    path: "Main/whiteboard",
  });
  window.open(routeData.href, "_blank");
}
function raisedHand() {
  socket.emit("sendMessage", {
    dataType: "SystemMsg",
    sender: UserData.userName,
    content: UserData.userName + "舉手",
  });
}
function REC_onClick() {
  if (store.REC()) REC_msg.value = true;
  else REC_msg.value = false;
}
// function VideoCamButtonOnClick() {
//   cam_isOpen.value = !cam_isOpen.value;
//   store.set_sub_video_src(cam_isOpen.value);
// }
function MicButtonOnClick() {
  store.isOpenMic = !store.isOpenMic;
  store.soundSwitch();
}
// function ShareScreenButtonOnClick() {
//   // ShareScreen_isOpen.value = !ShareScreen_isOpen.value;
//   // store.set_Pub_video_src(ShareScreen_isOpen.value);
//   store.set_Pub_video_src();
// }
function RoomID_OnClick() {
  navigator.clipboard.writeText(Meeting.RoomID).then(() => {
    $q.notify({
      message: "已複製會議代碼",
      color: "purple",
      position: "bottom",
    });
  });
}
// function REC_onClick() {
//   store.REC();
// }
</script>

<template>
  <div id="botton">
    <div id="left">
      <button class="btn" id="whiteboard" @click="openWhiteBoard">
        <q-icon class="material-symbols-outlined" name="draw" size="36px" color="black"></q-icon>
        <q-tooltip style="font-size: 12px;">多人白板</q-tooltip>
      </button>
      <div id="RoomID">
        <span @click="RoomID_OnClick">
          {{ Meeting.RoomID }}
          <q-tooltip style="font-size: 12px;">
            複製會議代碼
          </q-tooltip>
        </span>
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
        <q-icon class="material-symbols-outlined" name="call_end" size="36px"></q-icon>
        <q-tooltip style="font-size: 12px;">
          離開討論
        </q-tooltip>
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
      </button> -->
      <button v-show="store.isPub" class="btn" id="Mic" @click="MicButtonOnClick">
        <q-icon class="material-symbols-outlined" :name="store.isOpenMic ? 'mic' : 'mic_off'"
          :color="store.isOpenMic ? 'grey-10' : 'red'" size="36px" color="black"></q-icon>
        <q-tooltip v-if="store.isOpenMic" style="font-size: 12px;">關閉麥克風</q-tooltip>
        <q-tooltip v-else style="font-size: 12px;">開啟麥克風</q-tooltip>
      </button>
      <button class="btn" id="Present" @click="store.set_Pub_video_src()">
        <q-icon class="material-symbols-outlined" name="present_to_all" size="36px" :color="store.isPub? 'blue' : 'black'"></q-icon>
        <q-tooltip v-if="store.isPub" style="font-size: 12px;">停止分享螢幕畫面</q-tooltip>
        <q-tooltip v-else style="font-size: 12px;">分享螢幕畫面</q-tooltip>
      </button>
      <button class="btn" id="REC" @click="REC_onClick">
        <q-icon class="material-symbols-outlined" name="radio_button_checked " :color="store.isREC ? 'red' : 'grey-10'"
          size="36px" color="black"></q-icon>
        <q-tooltip v-if="store.isREC" style="font-size: 12px;">停止錄製螢幕畫面</q-tooltip>
        <q-tooltip v-else style="font-size: 12px;">錄製螢幕畫面</q-tooltip>
      </button>
      <q-dialog v-model="REC_msg" seamless position="top">
        <q-card style="width: 400px; background-color: rgb(67, 67, 67)">
          <q-card-section class="row items-center no-wrap">
            <div style="color: rgb(255, 255, 255)">正在錄製此影像</div>
            <q-space />
            <q-btn flat round color="grey-1" icon="close" v-close-popup />
          </q-card-section>
        </q-card>
      </q-dialog>
      <button class="btn" id="raised_hand" @click="raisedHand">
        <q-icon class="material-symbols-outlined" name="pan_tool" size="36px" color="black"></q-icon>
        <q-tooltip style="font-size: 12px;">舉手</q-tooltip>
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
