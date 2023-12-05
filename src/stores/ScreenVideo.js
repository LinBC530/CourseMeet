import { defineStore } from "pinia";
import { LocalStream, Client } from "ion-sdk-js";
import { useMeetingData } from "./Meeting";
// import { api } from "../boot/axios";

const Meeting = useMeetingData();
export const useScreenVideo = defineStore("counter", {
  state: () => ({
    isOpenMic: false,
    isREC: false,
    isPub: false,
    sub_video: null,
    pub_video: null,
    client_Stream: null,
    client: null,
    userMedia: null,
    displayMedia: null,
    mediaRecorder: null,
  }),
  persist: false,
  getters: {},
  actions: {
    // 聲音開關
    soundSwitch() {
      this.isOpenMic
        ? (this.userMedia.getAudioTracks()[0].enabled = true)
        : (this.userMedia.getAudioTracks()[0].enabled = false);
    },
    // 取得目前設備之麥克風
    async getUserMedia() {
      this.userMedia = await LocalStream.getUserMedia({
        // resolution: "vga",
        video: false,
        audio: true,
        // codec: "vp8",
      }).catch(() => null);
    },
    // 取得目前設備分享之畫面
    async getDisplayMedia() {
      this.displayMedia = await LocalStream.getDisplayMedia({
        // resolution: "vga",
        video: true,
        audio: true,
        // codec: "vp8",
      }).catch(() => null);
    },
    stop_all_media() {
      if (this.displayMedia) this.displayMedia.getTracks().forEach(track => {track.stop()});
      if (this.userMedia) this.userMedia.getTracks().forEach(track => {track.stop()});
    },
    stop_pub_video_src() {
      console.dir("stop1");
      if (this.displayMedia) {
        this.displayMedia.getTracks().forEach((track) => {
          track.stop();
        });
        this.displayMedia.unpublish();
        this.displayMedia = null;
        this.pub_video.srcObject = null;
        this.isPub = false;
      }
    },
    REC() {
      if (!this.isREC) {
        // 錄製分享畫面
        if (this.client_Stream)
          this.mediaRecorder = new MediaRecorder(this.client_Stream);
        else if (this.displayMedia)
          this.mediaRecorder = new MediaRecorder(this.displayMedia);
        else return;
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
        return true;
      } else if (this.isREC) {
        this.mediaRecorder.stop();
        return false;
      }
    },
    async set_Pub_video_src() {
      if (!this.isPub) {
        await this.getUserMedia();
        await this.getDisplayMedia();
        // this.displayMedia = await LocalStream.getDisplayMedia({
        //   resolution: "vga",
        //   video: true,
        //   audio: true,
        //   codec: "vp8",
        // }).catch(() => null);
        // console.dir(this.displayMedia);
        this.isPub = true;
        if (this.userMedia){
          this.displayMedia.addTrack(this.userMedia.getAudioTracks()[0]);
          this.userMedia.getAudioTracks()[0].enabled = false;
          this.isOpenMic = false;
        }
        this.displayMedia.getTracks().forEach((track) => {
          console.dir(track);
        });
        // this.displayMedia.mute()
        this.pub_video.srcObject = this.displayMedia;
        this.pub_video.srcObject.mute();
        this.client.publish(this.displayMedia);
        this.displayMedia.getTracks().forEach((track) => {
          // 停止分享被點擊時停止分享畫面
          track.onended = () => {
            console.dir("stop2");
            // if (this.isREC) this.mediaRecorder.stop();
            console.dir("ended");
            this.pub_video.srcObject = null;
            track.stop();
            this.displayMedia.removeTrack(track);
            this.displayMedia.unpublish();
            this.displayMedia = null;
            this.isPub = false;
          };
        });
      } else if (this.isPub) {
        console.dir("stop3");
        // if (this.isREC) this.mediaRecorder.stop();
        this.pub_video.srcObject = null;
        this.displayMedia.unpublish();
        this.displayMedia.getTracks().forEach((track) => {
          track.stop();
        });
        this.displayMedia = null;
        this.isPub = false;
      }
    },
    joinRoom() {
      this.client.join(Meeting.RoomID);
      // 請求麥克風權限
      LocalStream.getUserMedia({
        video: false,
        audio: true,
      })
    },
  },
});
