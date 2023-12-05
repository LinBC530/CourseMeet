import { defineStore } from "pinia";
import { io } from "socket.io-client";

export const useMeetingData = defineStore("useMeetingData", {
  state: () => ({
    socket: io("https://localhost:3000", { transports: ["websocket"], autoConnect: false }),
    teacher: "null",
    studens: [],
    RoomID: null,
  }),
  persist: false,
  getters: {},
  actions: {
    setMeetingData(teacher, studens) {
      this.teacher = teacher;
      this.studens = studens;
    },
    socket_connect() {
      this.socket.connect();
    }
  },
});
