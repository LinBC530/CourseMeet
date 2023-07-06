<script setup>
import { ref, reactive } from "vue";
import Talk from "./Talk.vue";
const navSwitchType = ref(false);

//工具是否啟用(預設狀態)
const isON = reactive({
  talk: true,
  setting: false,
  homework: false,
});

//各工具功能是否顯示
function ToolOnClick(obj) {
  //由元素class分類功能
  if (obj.target.matches(".Message")) {
    if (isON.talk == true) {
      navSwitchType.value = !navSwitchType.value;
    } else {
      isON.talk = true;
      isON.setting = false;
      isON.homework = false;
    }
  } else if (obj.target.matches(".HomeWork")) {
    if (isON.homework == true) {
      navSwitchType.value = !navSwitchType.value;
    } else {
      isON.talk = false;
      isON.setting = false;
      isON.homework = true;
    }
  } else if (obj.target.matches(".Setting")) {
    if (isON.setting == true) {
      navSwitchType.value = !navSwitchType.value;
    } else {
      isON.talk = false;
      isON.setting = true;
      isON.homework = false;
    }
  }
  //阻止冒泡
  obj.stopPropagation();
}
</script>

<template>
  <div id="body">
    <div id="nav" @click="navSwitchType = !navSwitchType">
      <div class="Message" id="MsgButton" @click="ToolOnClick">
        <q-icon class="Message" name="chat" size="36px"></q-icon>
        <span class="Message" id="icon_text">聊天室</span>
      </div>
      <div class="HomeWork" id="HomeWorkButton" @click="ToolOnClick">
        <q-icon class="HomeWork" name="library_books" size="36px"></q-icon>
        <span class="HomeWork" id="icon_text">作業</span>
      </div>
      <div class="Setting" id="SettingButton" @click="ToolOnClick">
        <q-icon class="Setting" name="settings" size="36px"></q-icon>
        <span class="Setting" id="icon_text">設定</span>
      </div>
    </div>
    <div id="main" v-if="navSwitchType">
      <Talk v-if="isON.talk" />
    </div>
  </div>
</template>

<style scoped>
#body {
  height: 100%;
  width: 100%;
  display: flex;
}
#nav {
  height: 100%;
  width: 70px;
  border-radius: 30pt;
  background-color: rgb(200, 200, 200);
  user-select: none;
  display: flex;
  padding: 20px 0px;
  flex-direction: column;
  align-items: center;
}
#main {
  height: 90%;
  width: 100%;
  margin-top: 10%;
  margin-bottom: 10%;
  border-radius: 0pt 30pt 30pt 0pt;
  background-color: white;
  padding: 5%;
}
#MsgButton,
#HomeWorkButton,
#SettingButton {
  height: 60px;
  width: 45px;
  display: flex;
  justify-content: center;
  align-content: center;
  flex-wrap: wrap;
}
#MsgButton:hover,
#HomeWorkButton:hover,
#SettingButton:hover {
  cursor: pointer;
  border-radius: 10pt;
  background-color: rgb(113, 113, 113);
}
#icon_text {
  font-size: 5pt;
}
</style>
