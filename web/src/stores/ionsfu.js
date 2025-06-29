import { defineStore } from "pinia";
import { Client, LocalStream, RemoteStream } from "ion-sdk-js";
import { IonSFUJSONRPCSignal } from "ion-sdk-js/lib/signal/json-rpc-impl";
import { useMeetingStore } from "./meeting";
import { storeToRefs } from "pinia";
const { socket } = storeToRefs(useMeetingStore());

export const useIonsfuStore = defineStore("useIonsfuStore", {
  state: () => ({
    signal: null,
    client: null,

    mic_is_on: false,
    rec_is_on: false,

    // my streams
    camera_stream: null,
    mic_stream: null,
    screen_stream: null,

    // {stream_id: { type: "camera" | "mic" | "screen", remote_id: user_id, stream: RemoteStream}}
    remote_streams: new Map(),
  }),
  getters: {
    remote_streams_array: (state) => {
      return Array.from(state.remote_streams.entries()) || [];
    },
    remote_camera_streams_array: (state) => {
      return (
        Array.from(state.remote_streams.entries()).filter(
          ([key, stream]) => stream.type === "camera"
        ) || []
      );
    },
    remote_mic_streams_array: (state) => {
      return (
        Array.from(state.remote_streams.entries()).filter(
          ([key, stream]) => stream.type === "mic"
        ) || []
      );
    },
  },
  actions: {
    /**
     * 取得使用者鏡頭串流
     * @description 這個方法會請求使用者的鏡頭權限，並返回一個包含視訊的本地串流。
     * @returns {Promise<LocalStream>} 返回鏡頭的本地串流
     */
    async get_user_camera_media_stream() {
      this.camera_stream = await LocalStream.getUserMedia({
        codec: "vp8",
        audio: false,
        video: {
          frameRate: 15,
        },
        resolution: "hd",
        simulcast: true,
      });
      return this.camera_stream;
    },

    /**
     * 取得使用者麥克風串流
     * @description 這個方法會請求使用者的麥克風權限，並返回一個包含音訊的本地串流。
     * @returns {Promise<LocalStream>} 返回麥克風的本地串流
     */
    async get_user_mic_media_stream() {
      this.mic_stream = await LocalStream.getUserMedia({
        audio: true,
        video: false,
        simulcast: true,
      });
      return this.mic_stream;
    },

    /**
     * 取得螢幕分享串流
     * @description 這個方法會請求使用者的螢幕分享權限，並返回一個包含音訊和視訊的本地串流。
     * @returns {Promise<LocalStream>} 返回螢幕分享的本地串流
     */
    async get_display_media_stream() {
      this.screen_stream = await LocalStream.getDisplayMedia({
        codec: "vp8",
        audio: true,
        video: {
          frameRate: 15,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        resolution: "vga",
        simulcast: true,
      });
      return this.screen_stream;
    },

    /**
     * 連接到 SFU Server
     * @param {string} sfu_url SFU 的 URL
     * @param {string} room_id 房間 ID
     * @param {string} user_id 使用者 ID
     * @returns {Promise<Client>} 返回連接的 Client 對象
     */
    async connect_to_sfu(sfu_url) {
      this.signal = new IonSFUJSONRPCSignal(sfu_url);
      this.client = new Client(this.signal);

      // 等待連線
      return await new Promise((resolve, reject) => {
        this.signal.onopen = () => resolve(this.client);
        this.signal.onerror = (err) =>
          reject(err || new Error("SFU signal 連線失敗"));
        this.signal.onclose = () => reject(new Error("SFU signal 連線中斷"));
      });
    },

    /**
     * 加入房間
     * @param {string} room_id 房間 ID
     * @param {string} user_id 使用者 ID
     * @returns {Promise<void>}
     */
    async join_room(room_id, user_id) {
      if (!this.client) throw new Error("尚未連接到 SFU");

      try {
        await this.client.join(room_id, user_id);
        console.log(`已加入房間 ${room_id}`);
      } catch (err) {
        throw err || new Error("加入房間失敗");
      }
    },

    /**
     * 共享串流
     * @param {string} type "camera" | "mic" | "screen"
     * @param {LocalStream} stream
     * @returns {Promise<void>}
     */
    async share_stream(type, stream) {
      this.client.publish(stream);
      socket.value.emit("sendStreamInfo", "all", {
        user_id: "1",
        type: type,
        stream_id: stream.id,
      });
    },

    stop_share_stream(stream) {
      stream.unpublish();
      stream.getTracks().forEach((track) => track.stop());
    },

    /**
     * 創建遠端串流資訊
     * @param {string} stream_id 遠端串流的 ID
     * @returns {Object} 返回遠端串流資訊對象
     */
    create_remote_stream(stream_id) {
      if (!this.remote_streams.has(stream_id))
        this.remote_streams.set(stream_id, {
          type: null,
          user_id: null,
          stream: null,
        });
      return this.remote_streams.get(stream_id);
    },

    /**
     * 設置遠端串流
     * @param {RemoteStream} stream 遠端串流對象
\     */
    set_remote_stream(stream) {
      const stream_info = this.create_remote_stream(stream.id);
      stream_info.stream = stream;
    },

    /**
     * 設置遠端串流資訊
     * @param {string} stream_id 遠端串流的 ID
     * @param {string} type "camera" | "mic" | "screen"
     * @param {string} user_id 使用者 ID
     */
    set_remote_stream_info(stream_id, type, user_id) {
      const stream_info = this.create_remote_stream(stream_id);
      stream_info.type = type;
      stream_info.user_id = user_id;
    },
  },
});
