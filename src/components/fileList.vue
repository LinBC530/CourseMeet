<script setup>
import { api } from "../boot/axios";
import { useMeetingData } from "src/stores/Meeting";
import { ref } from "vue";

const Meeting = useMeetingData();
const socket = Meeting.socket

const messages = ref([]);

//判斷訊息型態並處理
function getDataType_as_file(msg) {
  //使用遞迴方式取得單一訊息
  if (Array.isArray(msg)) {
    for (let m of msg) {
      getDataType_as_file(m);
    }
    return;
  }
  if (msg.dataType == "file") {
    messages.value.push({
      dataType: "file",
      userName: msg.sender,
      fileName: msg.fileName,
      message: msg.content,
    });
  }
}

//將收到的訊息新增至messages，以顯示於聊天室
socket.on("sendMessage", (msg) => getDataType_as_file(msg));

//將收到的訊息新增至messages，以顯示於聊天室
socket.on("allMessage", (msgs) => getDataType_as_file(msgs));

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
  <div id="memberList">
    <div id="title"><span>會議檔案</span></div>
    <q-separator color="grey-8" size="3px" />
    <div id="content">
      <q-scroll-area id="scroll">
        <q-list>
          <q-item class="items" clickable v-for="file of messages">
            <q-item-section @click="getFile(file.message, file.fileName)">
              {{ file.fileName }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </div>
  </div>
</template>

<style scoped>
#memberList {
  height: 100%;
}

#title {
  height: 30px;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

#content {
  height: calc(100% - 30px);
}

#scroll {
  height: 100%;
  max-width: 100%;
}

.title {
  font-weight: bold;
  text-align: center;
  user-select: none;
}

.items {
  font-weight: normal;
  text-align: left;
}
</style>
