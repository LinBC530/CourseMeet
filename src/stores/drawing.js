import { defineStore } from "pinia";
import { useMeetingData } from "./Meeting";

const Meet = useMeetingData();
const socket = Meet.socket
socket.connect()
export const useDrawData = defineStore("useDrawData", {
  state: () => ({
    // 分頁名稱(切換分頁用)
    canvas_page_name: "canvas1",
    // 畫布分頁總數
    canvas_total: 1,
    // 目前畫布分頁
    cnavas_page_number: 1,
    // 目前畫布
    canvas: null,
    canvasID: null,
    all_canvasID: [],
    WhiteboardID: null,
    // 暫存繪圖資料
    drawing_event: {events: []},
  }),
  persist: false,
  getters: {},
  actions: {
    reset_drawing_event() {
      this.drawing_event = {events: []}
    },
    change_canvas_page(type) {
      switch (type) {
        case "add_canvas":
          if (this.cnavas_page_number == 15) break;
          if (this.cnavas_page_number == this.canvas_total) this.canvas_total++;
          this.cnavas_page_number++;
          socket.emit('canvas', {
            type: 'canvas_next_page',
            data: {
              WhiteboardID: this.WhiteboardID
            }
          })
          break;
        case "next":
          if (this.cnavas_page_number == 15) break;
          if (this.cnavas_page_number == this.canvas_total) this.canvas_total++;
          this.cnavas_page_number++;
          socket.emit('canvas', {
            type: 'canvas_next_page',
            data: {WhiteboardID: this.WhiteboardID}
          })
          break;
        case "back":
          if (this.cnavas_page_number == 1) break;
          this.cnavas_page_number--;
          socket.emit('canvas', {
            type: 'canvas_back_page',
            data: {WhiteboardID: this.WhiteboardID}
          })
        case "goto":
          break;
        default:
          return;
      }
      this.canvas_page_name = "canvas" + this.cnavas_page_number.toString();
    },


  },
});
