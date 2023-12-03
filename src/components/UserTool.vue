<script setup>
import { ref, reactive } from "vue";
import Talk from "./Talk.vue";
import Member from "./Member.vue";
import MeetingMinutes from "./MeetingMinutes.vue";
import FileList from "./fileList.vue";
import AI_teaching_assistant from "./AI_teaching_assistant.vue";
import { event } from "quasar";
const navSwitchType = ref(false);

//工具是否啟用(預設狀態)
const show = reactive({
  memberList: false,
  // meetingMinutes: false,
  charRoom: true,
  fileList: false,
});

function reset_show() {
  show.memberList = false;
  // show.meetingMinutes = false;
  show.charRoom = false;
  show.fileList = false;
}

// 各工具功能是否顯示
function tool_onClick(event, tool_name) {
  switch (tool_name) {
    case "memberList":
      show.memberList ? navSwitchType.value = !navSwitchType.value : (() => {reset_show(); show.memberList = true})();
      break;
    // case "meetingMinutes":
    //   show.meetingMinutes ? navSwitchType.value = !navSwitchType.value : (() => { reset_show(); show.meetingMinutes = true; })()
    //   break;
    case "charRoom":
      show.charRoom ? navSwitchType.value = !navSwitchType.value : (() => { reset_show(); show.charRoom = true; })()
      break;
    case "fileList":
      show.fileList ? navSwitchType.value = !navSwitchType.value : (() => { reset_show(); show.fileList = true; })()
      break;
    default:
      break;
  }
  // 阻止冒泡
  event.stopPropagation();
}
</script>

<template>
  <div id="body">
    <div id="main" v-show="navSwitchType">
      <Talk v-show="show.charRoom" />
      <Member v-show="show.memberList" />
      <MeetingMinutes v-show="show.meetingMinutes" />
      <FileList v-show="show.fileList" />
      <AI_teaching_assistant v-show="show.AI_teaching_assistant" />
    </div>
    <div id="nav" @click="navSwitchType = !navSwitchType">
      <q-btn class="btn" @click="tool_onClick($event, 'memberList')" size="100%" no-caps stack unelevated>
        <q-icon class="btn icon" name="groups_3" size="36px" />
        <label class="btn label">成員</label>
      </q-btn>
      <!-- <q-btn class="btn" @click="tool_onClick($event, 'meetingMinutes')" size="100%" no-caps stack unelevated>
        <q-icon class="btn icon" name="library_books" size="36px" />
        <label class="btn label">會議紀錄</label>
      </q-btn> -->
      <q-btn class="btn" @click="tool_onClick($event, 'charRoom')" size="100%" no-caps stack unelevated>
        <q-icon class="btn icon" name="chat" size="36px" />
        <label class="btn label">聊天室</label>
      </q-btn>
      <q-btn class="btn" @click="tool_onClick($event, 'fileList')" size="100%" no-caps stack unelevated>
        <q-icon class="btn icon" name="description" size="36px" />
        <label class="btn label">檔案</label>
      </q-btn>
    </div>
  </div>
</template>

<style scoped>
.btn{
  width: 100%;
  padding: 0;
  font-size: 12px;
  white-space:nowrap;
}
.btn:hover{
  cursor: pointer;
}
#body {
  height: 100%;
  display: flex;
  justify-content: right;
}

#nav {
  height: 100%;
  width: 60px;
  border-radius: 30pt;
  background-color: rgb(200, 200, 200);
  user-select: none;
  padding: 20px 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

#main {
  height: 90%;
  width: 300px;
  margin-top: 10%;
  margin-bottom: 10%;
  border-radius: 30pt 0pt 0pt 30pt;
  background-color: white;
  padding: 5%;
}
</style>
