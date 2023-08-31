<script setup>
import { ref, reactive } from "vue";
import Talk from "./Talk.vue";
import Member from "./Member.vue";
import MeetingMinutes from "./MeetingMinutes.vue";
const navSwitchType = ref(false);

//工具是否啟用(預設狀態)
const show = reactive({
  memberList: false,
  meetingMinutes: false,
  charRoom: true,
  assistant_AI: false,
  userAccount: false,
});

//各工具功能是否顯示
function ToolOnClick(obj) {
  //由元素class分類功能
  if (obj.target.matches(".memberList")) {
    if (show.memberList == true) {
      navSwitchType.value = !navSwitchType.value;
    } else {
      show.memberList = true;
      show.meetingMinutes = false;
      show.charRoom = false;
      show.assistant_AI = false;
      show.userAccount = false;
    }
  } else if (obj.target.matches(".meetRecord")) {
    if (show.meetingMinutes == true) {
      navSwitchType.value = !navSwitchType.value;
    } else {
      show.memberList = false;
      show.meetingMinutes = true;
      show.charRoom = false;
      show.assistant_AI = false;
      show.userAccount = false;
    }
  } else if (obj.target.matches(".charRoom")) {
    if (show.charRoom == true) {
      navSwitchType.value = !navSwitchType.value;
    } else {
      show.memberList = false;
      show.meetingMinutes = false;
      show.charRoom = true;
      show.assistant_AI = false;
      show.userAccount = false;
    }
  } else if (obj.target.matches(".assistant_AI")) {
    if (show.assistant_AI == true) {
      navSwitchType.value = !navSwitchType.value;
    } else {
      show.memberList = false;
      show.meetingMinutes = false;
      show.charRoom = false;
      show.assistant_AI = true;
      show.userAccount = false;
    }
  } else if (obj.target.matches(".userAccount")) {
    if (show.userAccount == true) {
      navSwitchType.value = !navSwitchType.value;
    } else {
      show.memberList = false;
      show.meetingMinutes = false;
      show.charRoom = false;
      show.assistant_AI = false;
      show.userAccount = true;
    }
  }
  //阻止冒泡
  obj.stopPropagation();
}
</script>

<template>
  <div id="body">
    <div id="main" v-show="navSwitchType">
      <Talk v-show="show.charRoom" />
      <Member v-show="show.memberList" />
      <MeetingMinutes v-show="show.meetingMinutes" />
    </div>
    <div id="nav" @click="navSwitchType = !navSwitchType">
      <div class="memberList" id="memberList_Button" @click="ToolOnClick">
        <q-icon class="memberList" name="groups_3" size="36px"></q-icon>
        <span class="memberList" id="icon_text">成員</span>
      </div>
      <div class="meetRecord" id="meetRecord_Button" @click="ToolOnClick">
        <q-icon class="meetRecord" name="library_books" size="36px"></q-icon>
        <span class="meetRecord" id="icon_text">會議紀錄</span>
      </div>
      <div class="charRoom" id="charRoom_Button" @click="ToolOnClick">
        <q-icon class="charRoom" name="chat" size="36px"></q-icon>
        <span class="charRoom" id="icon_text">聊天室</span>
      </div>
      <div class="assistant_AI" id="assistant_AI_Button" @click="ToolOnClick">
        <q-icon class="assistant_AI" name="school" size="36px"></q-icon>
        <span class="assistant_AI" id="icon_text">AI助教</span>
      </div>
      <!-- <div class="userAccount" id="userAccount_Button" @click="ToolOnClick">
        <q-icon class="userAccount" name="account_circle" size="36px"></q-icon>
        <span class="userAccount" id="icon_text">帳戶</span>
      </div> -->
    </div>

  </div>
</template>

<style scoped>
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
#memberList_Button,
#meetRecord_Button,
#charRoom_Button,
#assistant_AI_Button,
#userAccount_Button {
  height: 60px;
  width: 45px;
  display: flex;
  justify-content: center;
  align-content: center;
  flex-wrap: wrap;
}
#memberList_Button:hover,
#meetRecord_Button:hover,
#charRoom_Button:hover,
#assistant_AI_Button:hover,
#userAccount_Button:hover {
  cursor: pointer;
  border-radius: 10pt;
  background-color: rgb(113, 113, 113);
}
#icon_text {
  font-size: 5pt;
}
</style>
