import { defineStore } from "pinia";

export const useCounterStore = defineStore("counter", {
  state: () => ({
    userName: null,
    isPub: false,
    sub_video: null,
    pub_video: null,
    LocalStream: null,
    client: null,
  }),
  persist: true,
  getters: {},
  actions: {
    set_userName(name){
      this.userName = name
    },
    startPublish(type) {
      this.isPub = true;
      if (type) {
        this.LocalStream.getUserMedia({
          resolution: "vga",
          audio: true,
          codec: "vp8",
        })
          .then((stream) => {
            this.pub_video.srcObject = stream;
            this.client.publish(stream);
          })
          .catch(console.error);
      } else {
        this.LocalStream.getDisplayMedia({
          resolution: "vga",
          video: true,
          audio: true,
          codec: "vp8",
        })
          .then((stream) => {
            this.pub_video.srcObject = stream;
            this.client.publish(stream);
          })
          .catch(console.error);
      }
    },
    test() {
      try {
        this.LocalStream.getUserMedia();
        alert("get it")
      } catch (e) {
        alert(e);
      }
    },
  },
});
