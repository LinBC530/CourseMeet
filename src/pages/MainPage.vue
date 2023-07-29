<script setup>
import UserTool from "src/components/UserTool.vue";
import View from "src/components/View.vue";
import call_Nav from "src/components/call_Nav.vue";
import CourseMenu from "src/components/CourseMenu.vue";
import { useMeetingData } from "src/stores/Meeting";
import { reactive } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const Meeting = useMeetingData();

if (!Meeting.socket.auth) {
  router.push({ path: "/" });
} else {
  Meeting.socket.connect();
}
//Main頁面預設狀態
const ClientState = reactive({
  CourseMenu: false,
  Course: false,
  Meeting: true,
});
</script>

<template>
  <div id="main">
    <div id="view">
      <div id="Meeting" v-if="ClientState.Meeting">
        <div id="MeetingContent"><View /></div>
        <div id="MeetingCallNav"><call_Nav /></div>
      </div>
      <div id="CourseMenu" v-if="ClientState.CourseMenu"><CourseMenu /></div>
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
  border: 1pt solid red;
}
#view,
#CourseMenu,
#Meeting {
  height: 100%;
  width: 100%;
  border: 1pt solid blue;
}
#MeetingContent {
  height: 90%;
  width: 100%;
  border: 3pt solid red;
}
#MeetingCallNav {
  height: 10%;
  width: 100%;
  border: 3pt solid rgb(34, 0, 255);
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
