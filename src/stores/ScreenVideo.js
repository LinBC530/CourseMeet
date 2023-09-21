import { defineStore } from "pinia";
import { LocalStream, Client } from "ion-sdk-js";
import { useMeetingData } from "./Meeting";
import { api } from "../boot/axios";

const Meeting = useMeetingData();
export const useScreenVideo = defineStore("counter", {
  state: () => ({
    isREC: false,
    isPub: false,
    sub_video: null,
    pub_video: null,
    // sub_video_userMedia: null,
    // pub_video_userMedia: null,
    client: null,
    // userMedia: null,
    displayMedia: null,
    mediaRecorder: null,
  }),
  persist: false,
  getters: {},
  actions: {
    // 聲音開關
    // soundSwitch(isMute) {
    //   isMute ? this.userMedia.unmute() : this.userMedia.mute();
    // },
    // 取得目前設備之鏡頭及麥克風
    async getUserMedia() {
      this.userMedia = await LocalStream.getUserMedia({
        resolution: "vga",
        video: true,
        audio: false,
        codec: "vp8",
      }).catch(() => null);
    },
    stop_pub_video_src() {
      if (this.displayMedia) {
        this.displayMedia.getTracks().forEach((track) => track.stop());
        this.displayMedia.unpublish();
        this.displayMedia = null;
        this.pub_video = null;
        this.isPub = false;
      }
    },
    // set_sub_video_src(isOpen) {
    //   if (isOpen && this.userMedia) {
    //     this.sub_video_userMedia.srcObject = this.userMedia;
    //     this.sub_video_userMedia.autoplay = true;
    //     // this.userMedia.type = "userMedia"
    //     console.dir(this.userMedia);
    //     this.client.publish(this.userMedia);
    //     this.sub_video = null;
    //   } else if (!isOpen && this.userMedia) {
    //     this.sub_video_userMedia.srcObject = null;
    //     this.userMedia.unpublish();
    //   }
    // },
    REC() {
      if (!this.isREC && this.displayMedia) {
        // 錄製分享畫面
        this.mediaRecorder = new MediaRecorder(this.displayMedia);
        this.mediaRecorder.start();
        this.mediaRecorder.ondataavailable = (e) => {
          // 產生連結自動下載影像
          const blob = new Blob([e.data], { type: "video/mp4" });
          const downloadLink = document.createElement("a");
          downloadLink.href = window.URL.createObjectURL(blob);
          downloadLink.download = "課程影像";
          downloadLink.click();
          this.isREC = false;
        };
        this.isREC = true;
      } else if (this.isREC) {
        this.mediaRecorder.stop();
      }
    },
    async set_Pub_video_src() {
      if (!this.isPub) {
        this.displayMedia = await LocalStream.getDisplayMedia({
          resolution: "vga",
          video: true,
          // audio: true,
          codec: "vp8",
        });
        console.dir(this.displayMedia)
        this.isPub = true;
        this.pub_video.srcObject = this.displayMedia;
        this.client.publish(this.displayMedia);
        this.displayMedia.getTracks().forEach((track) => {
          // 停止分享被點擊時停止分享畫面
          track.onended = () => {
            // if (this.isREC) this.mediaRecorder.stop();
            console.dir("ended");
            this.pub_video.srcObject = null;
            track.stop();
            this.displayMedia.unpublish();
            this.displayMedia = null;
            this.isPub = false;
          };
        });
      } else if (this.isPub) {
        // if (this.isREC) this.mediaRecorder.stop();
        this.pub_video.srcObject = null;
        this.displayMedia.getTracks().forEach((track) => {
          track.stop();
        });
        this.displayMedia.unpublish();
        this.displayMedia = null;
        this.isPub = false;
      }
    },
    joinRoom() {
      this.client.join(Meeting.RoomID);
    },
  },
});
