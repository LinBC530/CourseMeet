import { defineStore } from "pinia";
import { LocalStream, Client } from "ion-sdk-js";

export const useScreenVideo = defineStore("counter", {
  state: () => ({
    // userName: null,
    isPub: false,
    sub_video: null,
    pub_video: null,
    // LocalStream: null,
    client: null,
    local: null,
  }),
  persist: true,
  getters: {},
  actions: {
    ONmic() {
      this.local.mute();
    },
    startPublish(type) {
      this.isPub = true;
      if (type) {
        LocalStream.getUserMedia({
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
        LocalStream.getDisplayMedia({
          // resolution: "vga",
          video: true,
          audio: true,
          // codec: "vp8",
        })
          .then((stream) => {
            this.pub_video.srcObject = stream;
            this.client.publish(stream);
          })
          .catch(console.error);
      }
    },
    getUserMedia() {
      this.local = LocalStream.getUserMedia({
        resolution: "vga",
        video: true,
        audio: true,
        codec: "vp8",
      }).catch((err) => console.log(err));
    },
    set_sub_video_src() {
      if (this.local)
        this.local
          .then((stream) => {
            this.sub_video.srcObject = stream;
            this.sub_video.autoplay = true;
            this.sub_video.muted = false;
          })
          .catch(console.error);
    },
  },
});
