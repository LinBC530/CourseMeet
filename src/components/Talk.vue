<script setup>
import { ref, reactive, onMounted, onUpdated } from "vue";
import { useMeetingData } from "src/stores/Meeting";
import { useUserData } from "src/stores/UserData";
import { api } from "../boot/axios";
import { useQuasar } from "quasar";

const store = useUserData();
const Meeting = useMeetingData();
const $q = useQuasar();
const socket = Meeting.socket;
const message = ref("");
let output, ap;
const messages = reactive([]);

onMounted(() => {
  output = document.getElementById("output");
  //錨點
  ap = document.getElementById("ap");

  //拖曳事件監聽
  output.addEventListener("dragenter", dragenter, false);
  output.addEventListener("dragover", dragover, false);
  output.addEventListener("drop", drop, false);
});

onUpdated(() => {
  //更新時滾動至錨點位置(ap)
  ap.scrollIntoView({ behavior: "smooth" });
});

//將訊息傳送至Server做處理
function sendMessage() {
  if (message.value) {
    socket.emit("sendMessage", {
      dataType: "msg",
      sender: store.userName,
      content: message.value,
    });
    message.value = "";
  }
}

//判斷訊息型態並處理
function judgmentDataType(msg) {
  // console.dir("get msg")
  //使用遞迴方式取得單一訊息
  if (Array.isArray(msg)) {
    for (let m of msg) {
      judgmentDataType(m);
    }
    return;
  }
  //對不同資料型態，進行對應處理
  switch (msg.dataType) {
    case "img":
      messages.push({
        dataType: "img",
        userName: msg.sender,
        message: '<img class="img" src="' + msg.content + '" />',
        sent: !(store.userName == msg.sender),
      });
      break;
    case "msg":
      messages.push({
        dataType: "msg",
        userName: msg.sender,
        message: msg.content,
        sent: !(store.userName == msg.sender),
      });
      break;
    case "file":
      console.dir(msg);
      messages.push({
        dataType: "file",
        userName: msg.sender,
        fileName: msg.fileName,
        message: msg.content,
        sent: !(store.userName == msg.sender),
      });
      break;
    case "SystemMsg":
      messages.push({
        dataType: "SystemMsg",
        userName: 'System',
        message: msg.content,
        sent: true,
      });
      break;
    default:
      break;
  }
}

//將收到的訊息新增至messages，以顯示於聊天室
socket.on("sendMessage", (msg) => judgmentDataType(msg));

//將收到的訊息新增至messages，以顯示於聊天室
socket.on("allMessage", (msgs) => judgmentDataType(msgs));

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

  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
}

//處理圖片及檔案
function handleFiles(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imageType = /image.*/;

    //處理圖片格式並傳送至伺服器(與聊天訊息相同方式傳送)
    if (file.type.match(imageType)) {
      const reader = new FileReader();
      //轉Base64
      reader.readAsDataURL(file);
      reader.onload = () => {
        socket.emit("sendMessage", {
          dataType: "img",
          sender: store.userName,
          content: reader.result,
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
          //(未處理完成)
          if (res.data.type) {
            $q.notify({
              message: "上傳成功",
              color: "negative",
            });
            socket.emit("sendMessage", {
              dataType: "file",
              sender: store.userName,
              fileName: res.data.data.fileName,
              content: res.data.data.fileID,
            });
          } else
            $q.notify({
              message: res.data.reason,
              color: "negative",
            });
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
</script>

<template>
  <div id="talk-main">
    <div id="output">
      <div id="messages" style="padding: 5pt" v-for="msg in messages">
        <q-chat-message
          :name="msg.userName"
          :sent="msg.sent"
          :bg-color="msg.dataType == 'SystemMsg' ? 'orange-5' : null"
        >
          <div
            v-if="msg.dataType == 'msg' || msg.dataType == 'img' || msg.dataType == 'SystemMsg'"
            v-html="msg.message"
          />
          <!-- <div v-if="msg.dataType == 'SystemMsg'" v-html="msg.userName" /> -->
          <div
            v-if="msg.dataType == 'file'"
            class="file"
            @click="getFile(msg.message, msg.fileName)"
          >
            <span>{{ msg.fileName }}</span>
            <q-icon name="download" />
          </div>
        </q-chat-message>
      </div>
      <div id="ap" />
    </div>
    <div id="input">
      <form onclick="return false">
        <input id="msgbox" v-model="message" type="text" autocomplete="off" />
        <button id="snedButton" @click="sendMessage">
          <q-icon name="send" size="36px" />
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

.file {
  color: rgb(0, 64, 255);
  font-size: 20px;
}

.file:hover {
  cursor: pointer;
  color: rgb(92, 133, 255);
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
  background-color: rgb(223, 223, 223);
  padding-left: 15pt;
}

#snedButton {
  height: 35pt;
  width: 35pt;
  margin-left: 1%;
  border: 0pt;
  border-radius: 100%;
  color: rgb(35, 105, 167);
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
