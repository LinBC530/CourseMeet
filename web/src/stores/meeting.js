import { defineStore } from "pinia";
import { io } from "socket.io-client";

export const useMeetingStore = defineStore("useMeetingStore", {
  state: () => ({
    socket: io("https://localhost:3000", { transports: ["websocket"], autoConnect: false }),
    room_id: null,
    clients: new Map(),
    drawer_open: false,
    touched: false,
  }),
  persist: {
    storage: sessionStorage,
    paths: ["RoomID"],
  },
  getters: {
    clients_array: (state) => {
      return Array.from(state.clients.entries()) || [];
    },
    clients_length: (state) => {
      return state.clients.size || 0;
    }
  },
  actions: {
    toggleDrawer() {
      this.drawer_open = !this.drawer_open;
    },
    set_room_id(room_id) {
      this.room_id = room_id;
    },
    /**
     * 連接到指定的房間
     * @param {string} room - 房間 ID
     * @param {Object} user - 使用者信息
     */
    async socker_join_room(room , user) {
      console.log("Joining room:", room, "with user:", user);
      this.socket.emit("joinRoom", room, user);
      this.RoomID = room;
    },
    /**
     * 檢查客戶端是否存在，若不存在則新增一個空對象
     * @param {string} user_id
     * @return {Object} 返回該使用者的客戶端對象
     */
    get_client(user_id) {
      if (!this.clients.has(user_id)) {
        this.clients.set(user_id, {});
      }
      return this.clients.get(user_id);
    },
    /**
     * 創建一個新的客戶端對象
     * @param {string} user_id - 使用者 ID
     * @return {Object} 返回新創建的客戶端對象
     */
    create_client(user_id) {
      if (!this.clients.has(user_id)) {
        this.clients.set(user_id, {
          socket_id: null,
          name: null,
        });
      }
      return this.clients.get(user_id);
    },
    /**
     * 設置客戶端信息
     * @param {string} user_id - 使用者 ID
     * @param {Object} info - 包含 socket_id, name, mail 的信息對象
     * @param {string} info.socket_id - 使用者的 socket ID
     * @param {string} info.name - 使用者名稱
     * @param {string} info.mail - 使用者郵箱
     * @returns {void}
     */
    set_client(user_id, info) {
      const client = this.create_client(user_id);
      client.socket_id = info.socket_id;
      client.name = info.name;
    }
  },
});
