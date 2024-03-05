<script setup>
import { ref, reactive } from "vue";
import { useUserData } from "src/stores/UserData";
import { useMeetingData } from "src/stores/Meeting";
import { storeToRefs } from "pinia";

// use Meeting store
const Meeting_store = useMeetingData();
const { socket } = storeToRefs(Meeting_store);

// use User store
const User_store = useUserData();
const { userName } = storeToRefs(User_store);

const scroll = ref();
const input_msg = ref();
const messages = reactive([]);

// 接收訊息
socket.value.on("GPT_function", (msg) => judgmentDataType(msg));

//將訊息傳送至Server做處理
function sendMessage() {
  if (input_msg.value) {
    socket.value.emit("GPT_function", {
      dataType: GPT_btn.c_to_e ? 'c_to_e' : GPT_btn.e_to_c ? 'e_to_c' : GPT_btn.explain ? 'explain' : GPT_btn.focus ? 'focus' : null,
      sender: userName.value,
      content: input_msg.value,
      time: current_time()
    });
    input_msg.value = "";
  }
}

// 處理收到的訊息
function judgmentDataType(msg) {
  //收到多筆訊息(array)時，透過遞迴方式取得單一筆訊息
  if (Array.isArray(msg)) {
    for (let m of msg) {
      judgmentDataType(m);
    }
    return;
  }
  //對不同資料型態，進行對應處理
  switch (msg.dataType) {
    case "msg":
      messages.push({
        dataType: "msg",
        userName: msg.sender,
        message: msg.content,
        sent: userName.value == msg.sender,
        time: msg.time
      });
      break;
    // ChatGPT 傳回之訊息
    case "GPT":
      messages.push({
        dataType: "GPT_Msg",
        userName: "GPT",
        message: msg.content,
        sent: false,
        time: msg.time
      });
      break;
    default:
      break;
  }
}


function current_time() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();
  const minute = now.getMinutes();

  const currentTime = `${year}/${month}/${day} ${hour >= 12 ? "PM" : "AM"} ${hour % 12
    }:${minute < 10 ? "0" + minute : minute}`;
  return currentTime;
}

let scroll_heignt = 0
function scroll_heignt_change(info) {
  if (info.verticalSize > scroll_heignt) {
    scroll_heignt = info.verticalSize;
    scroll.value.setScrollPercentage("vertical", 1.0, 100)
  }
}

function GPT_btn_onclick(event, type) {
  switch (type) {
    case 'c_to_e':
      reset_GPT_btn()
      GPT_btn.c_to_e = true;
      break;
    case 'e_to_c':
      reset_GPT_btn()
      GPT_btn.e_to_c = true;
      break;
    case 'explain':
      reset_GPT_btn()
      GPT_btn.explain = true;
      break;
    case 'focus':
      reset_GPT_btn()
      GPT_btn.focus = true;
      break;
    default:
      break;
  }
  // 阻止冒泡
  event.stopPropagation();
}

function reset_GPT_btn() {
  GPT_btn.c_to_e = false;
  GPT_btn.e_to_c = false;
  GPT_btn.explain = false;
  GPT_btn.focus = false;
}

const GPT_btn = reactive({
  c_to_e: true,
  e_to_c: false,
  explain: false,
  focus: false,
})
</script>

<template>
  <div class="chatroom">
    <!-- chat -->
    <q-scroll-area class="chatroom scroll" ref="scroll" @scroll="scroll_heignt_change">
      <q-chat-message class="message" v-for="msg in messages" :key="msg.id" :name="msg.userName" :sent="msg.sent"
        :stamp="msg.time" :bg-color="msg.dataType == 'SystemMsg'
          ? 'orange-5'
          : msg.dataType == 'file'
            ? 'blue-4'
            : msg.sent
              ? 'green-4'
              : 'grey-4'
          ">
        <div style="white-space: pre-wrap" v-if="msg.dataType == 'msg' ||
          msg.dataType == 'GPT_Msg' ||
          msg.dataType == 'img' ||
          msg.dataType == 'SystemMsg'
          " v-html="msg.message" />
      </q-chat-message>
    </q-scroll-area>

    <!-- chatroom tools -->
    <div class="chatroom AI_tool">
      <q-btn-group style="margin: 0 auto;">
        <!-- color="grey-5" -->
        <q-btn @click="GPT_btn_onclick($event, 'c_to_e')" :disable="GPT_btn.c_to_e" class="AI_tool btn" padding="10px"
          :color="GPT_btn.c_to_e ? 'grey-7' : 'green-5'" icon="img:icons/translate.svg" label="中翻英" no-caps stack
          unelevated no-wrap />
        <q-btn @click="GPT_btn_onclick($event, 'e_to_c')" :disable="GPT_btn.e_to_c" class="AI_tool btn" padding="10px"
          :color="GPT_btn.e_to_c ? 'grey-7' : 'green-5'" icon="img:icons/translate.svg" label="英翻中" no-caps stack
          unelevated no-wrap />
        <q-btn @click="GPT_btn_onclick($event, 'explain')" :disable="GPT_btn.explain" class="AI_tool btn" padding="10px"
          :color="GPT_btn.explain ? 'grey-7' : 'green-5'" icon="img:icons/mist.svg" label="解釋內容" no-caps stack unelevated
          no-wrap />
        <!-- <q-btn @click="GPT_btn_onclick($event, 'focus')" :disable="GPT_btn.focus" class="AI_tool btn" padding="10px"
          :color="GPT_btn.focus ? 'grey-7' : 'green-5'" icon="img:icons/mist.svg" label="重點整理" no-caps stack unelevated
          no-wrap /> -->
      </q-btn-group>
    </div>
    <div class="chatroom tool">
      <q-form class="tool form" @submit="sendMessage">
        <input v-model="input_msg" class="tool input" autofocus />
      </q-form>
      <q-btn icon="send" padding="5px" size="20px" @click="sendMessage" unelevated rounded>
        <q-tooltip style="font-size: 12px"> 送出訊息 </q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<style scoped>
.tool.form {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chatroom {
  height: 100%;
  width: 100%;
}

.chatroom.scroll {
  overflow: hidden;
  height: calc(100% - 140px);
}

.chatroom.AI_tool {
  height: 80px;
  display: flex;
  justify-content: content;
  align-content: content;
}

.chatroom.tool {
  height: 60px;
  width: 100%;
  padding: 8px;
  display: flex;
  justify-content: content;
  align-content: content;
}

.tool.input {
  height: 80%;
  width: 100%;
  border: 0px;
  border-radius: 15px;
  outline: none;
  font-size: 18px;
  background-color: rgb(200, 200, 200);
}

.message {
  font-size: 18px;
  margin: 10px;
}

.AI_tool.btn {
  width: 100%;
  color: black;
}</style>
