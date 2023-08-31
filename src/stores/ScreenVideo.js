import { defineStore } from "pinia";
import { LocalStream, Client } from "ion-sdk-js";

export const useScreenVideo = defineStore("counter", {
  state: () => ({
    isPub: false,
    sub_video: null,
    pub_video: null,
    sub_video_userMedia: null,
    pub_video_userMedia: null,
    client: null,
    userMedia: null,
    displayMedia: null,
  }),
  persist: false,
  getters: {},
  actions: {
    // 聲音開關
    soundSwitch(isMute) {
      if (isMute) this.userMedia.unmute(); //取消靜音
      else this.userMedia.mute(); //靜音
    },
    // 取得目前設備之鏡頭及麥克風
    async getUserMedia() {
      this.userMedia = await LocalStream.getUserMedia({
        resolution: "vga",
        video: true,
        audio: false,
        codec: "vp8",
      }).catch(() => null);
    },
    set_sub_video_src(isOpen) {
      if (isOpen && this.userMedia) {
        this.sub_video_userMedia.srcObject = this.userMedia;
        this.sub_video_userMedia.autoplay = true;
        // this.userMedia.type = "userMedia"
        console.dir(this.userMedia)
        this.client.publish(this.userMedia);
        this.sub_video = null;
      } else if (!isOpen && this.userMedia) {
        this.sub_video_userMedia.srcObject = null;
        this.userMedia.unpublish();
      }
    },
    async set_Pub_video_src(isOpen) {
      if (isOpen) {
        this.isPub = true;
        this.displayMedia = await LocalStream.getDisplayMedia({
          resolution: "vga",
          video: true,
          // audio: true,
          codec: "vp8",
        });

        this.pub_video.srcObject = this.displayMedia;
        this.client.publish(this.displayMedia);
        console.dir(this.displayMedia)
      } else {
        this.pub_video.srcObject = null;
        this.displayMedia.getTracks().forEach((track) => {
          track.stop();
        });
        this.isPub = false;
        this.displayMedia.unpublish();
      }
    },
    joinRoom() {
      this.client.join("test room");
    },
  },
});
