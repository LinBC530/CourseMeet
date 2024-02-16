<script setup>
import { ref, reactive, onMounted } from "vue";
import { useUserData } from "src/stores/UserData";
import { useMeetingData } from "src/stores/Meeting";
import { storeToRefs } from "pinia";
import { api } from "../boot/axios";

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
socket.value.on("sendMessage", (msg) => judgmentDataType(msg));
socket.value.on("allMessage", (msgs) => {
  if (!messages[0]) {
    judgmentDataType(msgs);
  }
});


onMounted(() => {
  // 取得 scroll element 並新增拖曳事件監聽
  scroll.value.getScrollTarget().addEventListener("dragenter", dragenter, false);
  scroll.value.getScrollTarget().addEventListener("dragover", dragover, false);
  scroll.value.getScrollTarget().addEventListener("drop", drop, false);
});

function get_recipient() {
  if (input_msg.value.indexOf(" ") == -1) return input_msg.value.slice(1);
  else return input_msg.value.slice(1, input_msg.value.indexOf(" "));
}

//將訊息傳送至Server做處理
function sendMessage() {
  if (input_msg.value) {
    socket.value.emit("sendMessage", {
      dataType: "msg",
      recipient: input_msg.value[0] == "@" ? get_recipient() : "all",
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
    // 圖像訊息
    case "img":
      messages.push({
        dataType: "img",
        userName: msg.sender,
        message: '<img class="img" src="' + msg.content + '" />',
        sent: userName.value == msg.sender,
        time: msg.time
      });
      break;
    // 文字訊息
    case "msg":
      messages.push({
        dataType: "msg",
        userName: msg.sender,
        message: msg.content,
        sent: userName.value == msg.sender,
        time: msg.time
      });
      break;
    // 檔案訊息
    case "file":
      messages.push({
        dataType: "file",
        userName: msg.sender,
        fileName: msg.fileName,
        message: msg.content,
        sent: userName.value == msg.sender,
        time: msg.time
      });
      break;
    // 系統訊息
    case "SystemMsg":
      messages.push({
        dataType: "SystemMsg",
        userName: "System",
        message: msg.content,
        sent: false,
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

function dragenter(e) {
  //阻止冒泡及停止預設行為
  e.stopPropagation();
  e.preventDefault();
}

function dragover(e) {
  //阻止冒泡及停止預設行為
  e.stopPropagation();
  e.preventDefault();
}

function drop(e) {
  //阻止冒泡及停止預設行為
  e.stopPropagation();
  e.preventDefault();

  handleFiles(e.dataTransfer.files);
}

//處理圖片及檔案
function handleFiles(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imageType = /image.*/;

    //處理圖片格式並傳送至伺服器(與聊天訊息相同方式傳送)
    if (file.type.match(imageType)) {
      console.log(file)
      const reader = new FileReader();
      //轉Base64
      reader.readAsDataURL(file);
      reader.onload = () => {
        socket.value.emit("sendMessage", {
          dataType: "img",
          sender: userName.value,
          fileName: file.name,
          content: reader.result,
          time: current_time()
        });
      };
    }
    //檔案傳送至伺服器
    else {
      let formData = new FormData();
      formData.append("file", file);
      api
        .post("/sendFile", formData)
        .then((res) => {
          if (res.data.type) {
            socket.value.emit("sendMessage", {
              dataType: "file",
              sender: userName.value,
              fileName: res.data.data.fileName,
              content: res.data.data.fileID,
              time: current_time()
            });
          } else throw new Error("upload file error");
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }
}

//下載檔案
function getFile(fileID, fileName) {
  //對server發出請求，等待srver傳回對應檔案ID(fileID)之檔案，並指定傳回格式為blob
  api
    .post("/getFile", { fileID: fileID }, { responseType: "blob" })
    .then((res) => {
      //產生一個超連結，並設置下載屬性，且指定下載之連結位置為傳回之檔案的參考位置，後執行下載
      const Link = document.createElement("a");
      Link.download = fileName;
      Link.style.display = "none";
      Link.href = URL.createObjectURL(res.data);
      Link.click();
      URL.revokeObjectURL(Link.href);
    })
    .catch((e) => {
      console.log(e);
    });
}

function upload_file() {
  const file = document.createElement("input");
  file.type = "file";
  file.multiple = "multiple";
  file.addEventListener("change", (e) => {
    handleFiles(e.target.files);
  });
  file.click();
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
  if(info.verticalSize > scroll_heignt) {
    scroll_heignt = info.verticalSize;
    scroll.value.setScrollPercentage("vertical", 1.0, 100)
  }
}
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
          <!-- text, img -->
        <div style="white-space: pre-wrap" v-if="msg.dataType == 'msg' ||
          msg.dataType == 'GPT_Msg' ||
          msg.dataType == 'img' ||
          msg.dataType == 'SystemMsg'
          " v-html="msg.message" />

          <!-- file msg -->
        <div v-if="msg.dataType == 'file'" class="file" @click="getFile(msg.message, msg.fileName)">
          <span>{{ msg.fileName }}</span>
          <q-icon name="download" />
        </div>
      </q-chat-message>
    </q-scroll-area>

    <!-- chatroom tools -->
    <div class="chatroom tool">
      <q-btn @click="upload_file" icon="add" padding="5px" size="20px" unelevated rounded>
        <q-tooltip style="font-size: 12px"> 分享媒體 </q-tooltip>
      </q-btn>
      <q-form class="tool form" @submit="sendMessage" style="width: auto">
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
  height: calc(100% - 60px);
}

.chatroom.tool {
  height: 60px;
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

.file {
  color: rgb(0, 64, 255);
  font-size: 20px;
}

.file:hover {
  cursor: pointer;
  color: rgb(92, 133, 255);
}

.message {
  font-size: 18px;
  margin: 10px;
}
</style>
