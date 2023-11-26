<script setup>
import UserTool from "src/components/UserTool.vue";
import View from "src/components/View.vue";
import call_Nav from "src/components/call_Nav.vue";
import { useMeetingData } from "src/stores/Meeting";
import { useScreenVideo } from "src/stores/ScreenVideo";
import { useRouter } from "vue-router";
import { onUnmounted } from "vue";

onUnmounted(() => {
  // 斷開始用者連線
  socket.disconnect()
  // DOM銷毀時關閉socket(避免事件重複觸發)
  socket.off()
  // DOM銷毀時重置視訊及會議相關資料
  ScreenVideo.$reset();
  // Meeting.$reset();
  // DOM銷毀時清除socket夾帶的資料
  // Meeting.socket.auth = null;
});

const router = useRouter();
const Meeting = useMeetingData();
const ScreenVideo = useScreenVideo();
const socket = Meeting.socket;

// 判斷socket是否有夾帶使用者資料及會議代碼
if (!Meeting.socket.auth) {
  // 返回加入會議頁面
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
        <!-- 視訊畫面 -->
        <div id="MeetingContent"><View /></div>
        <!-- 底部工具列 -->
        <div id="MeetingCallNav"><call_Nav /></div>
      </div>
    </div>
    <!-- 右側工具列 -->
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
