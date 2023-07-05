<script setup>
import { io } from "socket.io-client";
import { ref, reactive, onMounted, onUpdated } from "vue";
import { useCounterStore } from "../stores/example-store";
const store = useCounterStore();

// const URL = "http://localhost:3000"
// const socket = io(URL)
const socket = io("http://localhost:3000", { transports: ["websocket"] });
const message = ref("");
const isBase64 = /base64/;
var output, ap;
const messages = reactive([]);

onMounted(() => {
  output = document.getElementById("output");
  //錨點
  ap = document.getElementById("ap");

  //圖片事件監聽
  output.addEventListener("dragenter", dragenter, false);
  output.addEventListener("dragover", dragover, false);
  output.addEventListener("drop", drop, false);
});
onUpdated(() => {
  ap.scrollIntoView({ behavior: "smooth" });
});

//將訊息傳送至Server做處理
function sendMessage() {
  if (message.value) {
    socket.emit("sendMessage", {
      roomID: 123,
      name: store.userName,
      message: message.value,
    });
    message.value = "";
  }
}

//將收到的訊息新增以<p class='msg'>格式顯示於聊天室
socket.on("sendMessage", function (msg) {
  if (isBase64.test(msg.message)) {
    messages.push({
      userName: msg.name,
      message: '<img class="img" src="' + msg.message + '" />',
      sent: !(store.userName == msg.name),
    });
  } else {
    messages.push({
      userName: msg.name,
      message: msg.message,
      sent: !(store.userName == msg.name),
    });
  }
});

//將所有聊天室訊息以<p class='msg'>格式顯示於聊天室
socket.on("allMessage", (msgs) => {
  for (let i = 0; i < Object.keys(msgs).length; i++) {
    if (isBase64.test(msgs[i].message)) {
      messages.push({
        userName: msgs[i].name,
        message: '<img class="img" src="' + msgs[i].message + '" />',
        sent: !(store.userName == msgs[i].name),
      });
    } else {
      messages.push({
        userName: msgs[i].name,
        message: msgs[i].message,
        sent: !(store.userName == msgs[i].name),
      });
    }
  }
});

function dragenter(e) {
  //停止預設行為
  e.stopPropagation();
  e.preventDefault();
}

function dragover(e) {
  //停止預設行為
  e.stopPropagation();
  e.preventDefault();
}

function drop(e) {
  //停止預設行為
  e.stopPropagation();
  e.preventDefault();

  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
}

function handleFiles(files) {
  for (var i = 0; i < files.length; i++) {
    const file = files[i];
    const imageType = /image.*/;

    if (!file.type.match(imageType)) {
      continue;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      socket.emit("sendMessage", {
        name: store.userName,
        message: e.target.result,
      });
    };
    reader.readAsDataURL(file);
  }
}
</script>

<template>
  <div id="talk-main">
    <div id="output">
      <div id="messages" style="padding: 5pt" v-for="msg in messages">
        <q-chat-message :name="msg.userName" :sent="msg.sent">
          <div v-html="msg.message" />
        </q-chat-message>
      </div>
      <div id="ap" />
    </div>
    <div id="input">
      <form onclick="return false">
        <input id="msgbox" v-model="message" type="text" autocomplete="off" />
        <button id="snedButton" @click="sendMessage">
          <q-icon name="send" size="36px"/>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
#talk-main {
  height: 100%;
  width: 100%;
}

#output {
  height: 90%;
  width: 100%;
  min-height: 200pt;
  justify-content: center;
  overflow-wrap: break-word;
  overflow-y: scroll;
  overflow-x: hidden;
  background-color: rgb(235, 235, 235);
  border-radius: 10pt;
}

#output::-webkit-scrollbar {
  width: 6pt;
}
#output::-webkit-scrollbar-track {
  margin: 3pt 0pt;
}
#output::-webkit-scrollbar-thumb {
  background-color: rgb(140, 140, 140);
  border-radius: 10pt;
}

.msg {
  color: black;
  background-color: rgb(200, 200, 200);
  margin: 10pt 5pt;
  padding: 5pt;
  border-radius: 5pt;
  width: fit-content;
  max-width: 80%;
}

.img {
  width: 80%;
}

#input,
form {
  height: 10%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

#msgbox {
  height: 30pt;
  width: 70%;
  border: 0pt;
  border-radius: 30pt;
  font-size: large;
  background-color: rgb(195, 195, 195);
  padding-left: 15pt;
}

#snedButton {
  height: 35pt;
  width: 35pt;
  margin-left: 1%;
  border: 0pt;
  border-radius: 100%;
  color: rgb(61, 61, 61);
  background-color: rgba(0, 0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
}

#snedButton:hover {
  color: white;
  background-color: rgb(105, 105, 105);
}
</style>
