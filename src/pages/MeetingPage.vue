<script setup>
import UserTool from "src/components/UserTool.vue";
import View from "src/components/View.vue";
import call_Nav from "src/components/call_Nav.vue";
import { useMeetingData } from "src/stores/Meeting";
import { useScreenVideo } from "src/stores/ScreenVideo";
import { useRouter } from "vue-router";
import { onUnmounted } from "vue";

onUnmounted(() => {
  //刪除users_in_the_room事件監聽(避免事件重複觸發)
  // Meeting.socket.removeListener("users_in_the_room");
  //銷毀時關閉socket(避免事件重複觸發)
  socket.off()
  //銷毀時清除視訊相關資料
  ScreenVideo.$reset();
});

const router = useRouter();
const Meeting = useMeetingData();
const ScreenVideo = useScreenVideo();
const socket = Meeting.socket;

if (!Meeting.socket.auth) {
  // socket.off()
  router.push({ path: "/" });
} else {
  Meeting.socket.connect();
}

//更新目前在線用戶
socket.on("users_in_the_room", (users) => {
  Meeting.studens = users;
});

</script>

<template>
  <div id="main">
    <div id="view">
      <div id="Meeting">
        <div id="MeetingContent"><View /></div>
        <div id="MeetingCallNav"><call_Nav /></div>
      </div>
    </div>
    <div id="tool"><UserTool /></div>
  </div>
</template>

<style scoped>
#main {
  height: 100%;
  width: 100%;
  min-height: 500pt;
  min-width: 1000pt;
  display: flex;
}

#tool {
  height: 100%;
}
#view,
#CourseMenu,
#Meeting {
  height: 100%;
  width: 100%;
}
#MeetingContent {
  height: 90%;
  width: 100%;
}
#MeetingCallNav {
  height: 10%;
  width: 100%;
}
#exit {
  height: 100%;
  width: 100%;
  border-radius: 30pt;
  display: flex;
  justify-content: center;
  align-content: center;
  flex-wrap: wrap;
  background-color: white;
}
</style>
