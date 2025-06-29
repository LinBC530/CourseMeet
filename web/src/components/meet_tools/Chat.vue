<template>
  <div class="column fit q-gutter-y-sm relative-position">
    <q-scroll-area class="col" ref="scroll" @scroll="scroll_event" @dragover="dragover" @dragenter="dragenter"
      @dragleave="dragleave" @drop="drop">
      <template v-for="(message, index) in sortedMessages" :key="index">
        <!-- 聊天訊息 -->
        <q-chat-message class="q-mx-sm" v-if="message.type !== 'systemMsg'" :name="message.sender.name"
          :sent="message.sender.id === user.id" :stamp="message_time_stamp(message.time_stamp)"
          :bg-color="message.sender.id === user.id ? 'green-4' : 'grey-4'">

          <!-- 文字 -->
          <template v-if="message.type === 'text'">
            <span style="white-space: pre-wrap">{{ message.content }}</span>
          </template>

          <!-- 影像 -->
          <template v-else-if="message.type === 'image'">
            <img class="img fit" :src="message.content" />
          </template>

          <!-- 檔案 -->
          <template v-else-if="message.type === 'file'">
            <div class="row no-wrap q-gutter-sm cursor-pointer"
              @click="donload_file_to_disk(message.file_id, message.file_name)">
              <q-avatar rounded color="grey-4" icon="description" />
              <div class="">
                <div class="text-bold">{{ message.file_name }}</div>
                <div class="text-caption">
                  檔案大小: {{ format_file_size(message.file_size) }}
                </div>
              </div>
            </div>
          </template>
        </q-chat-message>

        <!-- 系統訊息 -->
        <q-chat-message v-else>
          <template v-slot:label>
            <span class="q-pa-sm bg-grey-4 text-grey-8 rounded-borders">{{ message.content }}</span>
          </template>
        </q-chat-message>
      </template>
    </q-scroll-area>
    <div v-show="show_overlay" class="overlay overlay-grey no-pointer-events">
      <div class="absolute-center column items-center">
        <q-icon name="drive_folder_upload" size="xl" class="text-white" />
        <div class="bold text-white">上傳檔案</div>
      </div>
    </div>
    <q-form class="col-auto column" @submit="send_input_message">
      <q-input v-model="input_msg" class="rounded-borders" label="請輸入訊息" :maxlength="input_text_maxlength" outlined>
        <template v-slot:append>
          <q-btn class="fit" flat icon="send" />
          <q-btn class="fit" flat icon="attach_file" @click="open_file()" />
        </template>
      </q-input>
    </q-form>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { useMeetingStore } from 'src/stores/meeting';
import { storeToRefs } from 'pinia';
import { upload_file, download_file } from 'src/request/file.js';
import { useChatStore } from 'src/stores/chat';
import { useAuth } from 'src/stores/auth';

const chat_store = useChatStore();
const user_store = useAuth();
const meeting_store = useMeetingStore();
const { user } = storeToRefs(user_store);
const { messages } = storeToRefs(chat_store);
const { socket, room_id } = storeToRefs(meeting_store)
const show_overlay = ref(false);
const scroll = ref();
const input_text_maxlength = 1000;
const input_msg = ref('');
// 按時間戳排序訊息
const sortedMessages = computed(() => {
  return [...messages.value].sort((a, b) => {
    return new Date(a.time_stamp) - new Date(b.time_stamp);
  });
});

const { addMessage, setMessages } = chat_store;

// 接收訊息 (先清除舊的事件監聽器，避免重複監聽)
socket.value.off("receiveMessage");
socket.value.on("receiveMessage", async (msg) => {
  await addMessage(msg)
  if (isAtBottom) scroll_to_bottom(150);
});
socket.value.off("getAllMessages");
socket.value.on("getAllMessages", (msgs) => {
  setMessages(msgs)
  scroll_to_bottom();
});

/**
 * 下載檔案到磁碟
 * @param {string} file_id 檔案ID
 * @param {string} file_name 檔案名稱
 */
function donload_file_to_disk(file_id, file_name) {
  download_file(file_id)
    .then(({ status, data }) => {
      if (status === "success") {
        const Link = document.createElement("a");
        Link.download = file_name;
        Link.style.display = "none";
        Link.href = data;
        Link.click();
        URL.revokeObjectURL(Link.href);
      } else {
        // 下載失敗
        console.error("檔案下載失敗:", res.message);
      }
    })
    .catch((err) => {
      console.error("下載檔案時發生錯誤:", err);
    });
}

// 是否在底部50px以內
let isAtBottom = false;

/**
 * 滾動事件處理(QScrollArea 的 scroll 事件)
 * @param {object} info 滾動資訊
 * @param {number} info.verticalPosition 當前垂直位置
 * @param {number} info.verticalSize 垂直內容大小
 * @param {number} info.verticalContainerSize 垂直容器大小
 */
function scroll_event(info) {
  const { verticalPosition, verticalSize, verticalContainerSize } = info;
  isAtBottom = (verticalSize - verticalContainerSize - verticalPosition) < 50
}

/**
 * 滾動到最底部
 * @param {number} delay 延遲時間 (毫秒)
 * @description 確保在滾動區域元素已經渲染完成後再執行滾動
 * @description 使用 requestAnimationFrame 來確保滾動在下一個渲染週期執行
 */
function scroll_to_bottom(delay = 0) {
  // 確保在滾動區域元素已經渲染完成後再執行滾動
  nextTick(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scroll.value.setScrollPercentage("vertical", 1, delay);
      })
    });
  });
}

/**
 * 傳送輸入框訊息
 * @description 如果輸入訊息為空，則不發送
 * @returns {void}
 */
function send_input_message() {
  // 如果輸入訊息為空，則不發送
  if (!input_msg.value || !input_msg.value.trim()) return;
  // 傳送文字訊息
  sendMessage({
    type: "text",
    content: input_msg.value,
    sender: { id: user.value.id, name: user.value.name },
    recipient: "all"
  });
  // 清空輸入框
  input_msg.value = '';
}

/**
 * 傳送訊息
 * @description 傳送訊息到伺服器，並將訊息加入到本地訊息列表
 * @param {object} message 訊息物件
 * @param {string} message.type 訊息類型 (text, image, file, systemMsg)
 * @param {string} message.content 訊息內容 (文字訊息)
 * @param {object} message.sender 發送者資訊
 * @param {string} message.sender.id 發送者ID
 * @param {string} message.sender.name 發送者名稱
 * @param {object} message.recipient 接收者資訊
 * @param {string} message.recipient.id 接收者ID
 * @param {string} message.recipient.name 接收者名稱
 * @param {string} message.file_name 檔案名稱 (僅對 image/file 類型)
 * @param {number} message.file_size 檔案大小 (bytes, 僅對 image/file 類型)
 * @param {string} message.file_id 檔案ID (僅對 image/file 類型)
 * @returns {void}
 */
async function sendMessage(message) {
  const { type, content, sender, recipient, file_name, file_size, file_id } = message;
  let msg = {};
  switch (type) {
    // 文字訊息
    case "text":
      if (!content || !content.trim()) return;
      msg = {
        type: "text",
        sender: sender,
        content: content,
        recipient: recipient
      };
      break;
    // 圖像訊息
    case "image":
      msg = {
        type: "image",
        sender: sender,
        recipient: recipient,
        file_name: file_name,
        file_size: file_size,
        file_id: file_id,
      };
      break;
    // 檔案訊息
    case "file":
      msg = {
        type: "file",
        sender: sender,
        recipient: recipient,
        file_name: file_name,
        file_size: file_size,
        file_id: file_id,
      };
      break;
    default:
      return;
  }
  if (!msg) return;
  msg.room_id = room_id.value;
  socket.value.emit("sendMessage", msg);
  msg.time_stamp = new Date()
  // 將訊息加入到本地訊息列表
  addMessage(msg);
  if (isAtBottom) scroll_to_bottom(150);
}

let dragCounter = 0;

// 拖曳進入事件
function dragenter(e) {
  e.stopPropagation();
  e.preventDefault();
  dragCounter++;
  show_overlay.value = true;
}

// 拖曳移動事件
function dragover(e) {
  e.stopPropagation();
  e.preventDefault();
}

// 拖曳離開事件
function dragleave(e) {
  e.stopPropagation();
  e.preventDefault();
  dragCounter--;
  // 避免子元素觸發離開事件
  if (dragCounter === 0) {
    show_overlay.value = false;
  }
}

// 拖曳放置事件
function drop(e) {
  e.stopPropagation();
  e.preventDefault();
  // 上傳檔案
  handleFiles(e.dataTransfer.files);
  show_overlay.value = false;
}

/**
 * 處理拖曳或選擇的檔案
 * @param {FileList} files 檔案列表
 * @returns {Promise<void>}
 */
async function handleFiles(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const formData = new FormData();
    formData.append("file", file);
    const { status, data, message } = await upload_file(formData);
    if (status !== "success") {
      console.error("上傳失敗");
      continue;
    }
    sendMessage({
      room_id: room_id.value,
      type: file.type.match(/image.*/) ? "image" : "file",
      sender: { id: user.value.id, name: user.value.name },
      recipient: "all",
      file_name: file.name,
      file_size: file.size,
      file_id: data.file_id,
    });
  }
}

/**
 * 開啟檔案選擇器
 * @description 允許使用者選擇多個檔案，並處理選擇的檔案
 */
function open_file() {
  const file = document.createElement("input");
  file.type = "file";
  file.multiple = "multiple";
  file.addEventListener("change", (e) => {
    handleFiles(e.target.files);
  });
  file.click();
  file.remove();
}

/**
 * 格式化訊息時間戳
 * @param {string} date 日期字串
 * @returns {string} 格式化後的時間字串 ex: "2025/1/1 PM 2:30"
 * @description 如果是今天則不顯示日期部分
 */
function message_time_stamp(date) {
  // 將日期字串轉換為 Date 物件
  const time = new Date(date);
  const year = time.getFullYear();
  const month = time.getMonth() + 1;
  const day = time.getDate();
  const hour = time.getHours();
  const minute = time.getMinutes();

  // 判斷是否為今天，如果是今天則不顯示日期
  const today = new Date();
  const isToday =
    year === today.getFullYear() &&
    month === today.getMonth() + 1 &&
    day === today.getDate();
  const dateString = isToday ? '' : `${year}/${month}/${day}`;

  // 自訂格式化時間字串
  const currentTime = `${dateString} ${hour >= 12 ? "PM" : "AM"} ${hour % 12
    }:${minute < 10 ? "0" + minute : minute}`;
  return currentTime;
}

/**
 * 格式化檔案大小
 * @param {number} file_size 檔案大小 (bytes)
 * @returns {string} 格式化後的檔案大小字串 ex: "1.23 MB"
 */
function format_file_size(file_size) {
  if (file_size >= 1024 * 1024) {
    const sizeMB = file_size / 1024 / 1024;
    return Number.isInteger(sizeMB) ? `${sizeMB} MB` : `${sizeMB.toFixed(2)} MB`;
  } else if (file_size >= 1024) {
    const sizeKB = file_size / 1024;
    return Number.isInteger(sizeKB) ? `${sizeKB} KB` : `${sizeKB.toFixed(2)} KB`;
  } else {
    return `${file_size} bytes`;
  }
}

</script>

<style scoped>
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.overlay-grey {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
