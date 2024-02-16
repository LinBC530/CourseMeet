<script setup>
import { api } from "../boot/axios";
import { useMeetingData } from "src/stores/Meeting";
import { storeToRefs } from "pinia";
import { ref } from "vue";

// use Meeting store
const Meeting_store = useMeetingData();
const { socket } = storeToRefs(Meeting_store);

const files = ref([]);

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
    files.value.unshift({
      dataType: "file",
      userName: msg.sender,
      fileName: msg.fileName,
      message: msg.content,
    });
  }
  else if (msg.dataType == "img") {
    files.value.unshift({
      dataType: "img",
      userName: msg.sender,
      fileName: msg.fileName,
      message: msg.content,
    });
  }
}

//將收到的訊息新增至messages，以顯示於聊天室
socket.value.on("sendMessage", (msg) => getDataType_as_file(msg));

//將收到的訊息新增至messages，以顯示於聊天室
socket.value.on("allMessage", (msgs) => getDataType_as_file(msgs));

//下載檔案
function getFile(filetype, fileID_or_blob, fileName) {
  const Link = document.createElement("a");
  Link.download = fileName;
  Link.style.display = "none";
  if (filetype == 'img') {
    Link.href = fileID_or_blob
    Link.click();
    URL.revokeObjectURL(Link.href);
  }
  else
    api
      .post("/getFile", { fileID: fileID_or_blob }, { responseType: "blob" })
      .then((res) => {
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
          <q-item class="items" clickable v-for="file of files">
            <q-item-section class="section" v-if="file.dataType == 'file'"
              @click="getFile(file.dataType, file.message, file.fileName)">
              <div class="file">
                <q-icon name="description" size="36px" color="blue" />
                <span>{{ file.fileName }}</span>
              </div>
            </q-item-section>
            <q-item-section class="section" v-else @click="getFile(file.dataType, file.message, file.fileName)">
              <img class="img" :src="file.message" />
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

.file {
  display: flex;
  justify-content: content;
  font-size: 24px;
}

.img {
  width: 100%;
}
</style>
