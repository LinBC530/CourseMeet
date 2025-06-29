<template>
  <q-page class="row no-warp fit">
    <!-- 主螢幕 -->
    <VideoStream class="col fit bg-black" :name="main_stream_name" :stream="main_stream" :muted="main_stream_muted" />
    <!-- 視訊串流 -->
    <div class="col-3 column">
      <!-- 遠端視訊串流(攝影機) -->
      <q-scroll-area class="col bg-black" content-style="align-content: end;">
        <VideoStream class="camera bg-black" v-for="([key, stream]) in remote_camera_streams_array" :key="key"
          :name="clients.get(stream.user_id).name" :stream="stream.stream" />
      </q-scroll-area>

      <!-- 本地視訊串流(攝影機) -->
      <VideoStream class="col-auto q-pa-xs bg-green-8 rounded-borders" :name="user.name" :stream="camera_stream" />

      <!-- 遠端音訊串流(麥克風) -->
      <AudioStream class="hidden" v-for="([key, stream]) in remote_mic_streams_array" :key="key"
        :stream="stream.stream" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue";
import { useIonsfuStore } from "src/stores/ionsfu";
import { useMeetingStore } from "src/stores/meeting";
import { useChatStore } from "src/stores/chat";
import { useAuth } from "src/stores/auth";
import { storeToRefs } from 'pinia';
import VideoStream from "src/components/VideoStream.vue";
import AudioStream from "src/components/AudioStream.vue";

const ChatStore = useChatStore();
const IonsfuStore = useIonsfuStore();
const MeetingStore = useMeetingStore();
const AuthStore = useAuth();

const main_stream_id = ref(null);
const { user } = storeToRefs(AuthStore);
const { socket, clients, room_id } = storeToRefs(MeetingStore)
const { remote_streams, camera_stream, mic_stream, screen_stream, remote_camera_streams_array, remote_mic_streams_array } = storeToRefs(IonsfuStore);

const { connect_to_sfu, set_remote_stream_info, set_remote_stream, join_room } = IonsfuStore;
const { socker_join_room, set_client } = MeetingStore;

const main_stream = computed(() => {
  return screen_stream.value ? screen_stream.value : main_stream_id.value ? remote_streams.value.get(main_stream_id.value)?.stream ?? null : null;
});

const main_stream_muted = computed(() => {
  return screen_stream.value === main_stream.value;
});

const main_stream_name = computed(() => {
  return screen_stream.value ? user.value.name : main_stream_id.value ? clients.value.get(remote_streams.value.get(main_stream_id.value)?.user_id)?.name ?? null : null;
});


// 離開時重置所有狀態
onUnmounted(() => {
  IonsfuStore.$reset();
  MeetingStore.$reset();
  ChatStore.$reset();
});

// 連接到 Socket.IO Server
socket.value.connect();
socker_join_room(room_id.value, { id: user.value.id, name: user.value.name }).then(() => {
  socket.value.emit("getAllMessages", room_id.value);
}).catch(err => {
  console.error("加入會議房間失敗: ", err);
});


// 連接到 SFU Server
connect_to_sfu(process.env.ION_SFU_URL).then((client) => {
  // 設定本地影像流
  console.log("已連接到 SFU Server");
  client.ontrack = (track, stream) => {
    set_remote_stream(stream);
    stream.onremovetrack = (e) => {
      if (stream.id === main_stream_id.value) {
        main_stream_id.value = null;
        console.log("主螢幕流已移除");
      }
      stream.getTracks().forEach(track => track.stop());
      remote_streams.value.delete(stream.id);
      console.log("遠端流已移除");
    };
  }

  // 加入會議房間
  join_room(room_id.value, user.value.id)
}).catch(err => {
  console.error("無法連接到 SFU Server: ", err);
});

// 接收遠端流資訊
socket.value.on("getStreamInfo", async (info) => {
  set_remote_stream_info(info.stream_id, info.type, info.user_id)
  if (info.type === 'screen') {
    main_stream_id.value = info.stream_id;
    console.log("主螢幕流已更新");
  }
  console.log("收到遠端流資訊");
});

// 對新加入用戶發送自己的用戶資訊及串流資訊
socket.value.on("UserInfo", (remote_user) => {
  // 用戶
  if (clients.value.has(remote_user.user_id)) return;
  socket.value.emit("UserInfo", remote_user.socket_id, {
    socket_id: socket.value.id,
    user_id: user.value.id,
    name: user.value.name,
  });
  set_client(remote_user.user_id, remote_user);

  // 鏡頭
  if (camera_stream.value) {
    socket.value.emit("sendStreamInfo", remote_user.socket_id, {
      user_id: user.value.id,
      stream_id: camera_stream.value.id,
      type: 'camera'
    });
  }

  // 麥克風
  if (mic_stream.value) {
    socket.value.emit("sendStreamInfo", remote_user.socket_id, {
      user_id: user.value.id,
      stream_id: mic_stream.value.id,
      type: 'mic'
    });
  }

  // 螢幕
  if (screen_stream.value) {
    socket.value.emit("sendStreamInfo", remote_user.socket_id, {
      user_id: user.value.id,
      stream_id: screen_stream.value.id,
      type: 'screen'
    });
  }
});

// 刪除離開會議的用戶資訊
socket.value.on("leaveRoom", (user_id) => {
  console.log("用戶離開房間: ", user_id);
  clients.value.delete(user_id);
});

</script>

<style scoped>
.camera {
  width: 100%;
  border: 1px solid #ccc;
}
</style>
