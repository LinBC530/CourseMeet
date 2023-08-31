<script setup>
import { Client } from "ion-sdk-js";
import { IonSFUJSONRPCSignal } from "ion-sdk-js/lib/signal/json-rpc-impl";
import { useScreenVideo } from "src/stores/ScreenVideo";
import { ref, reactive, onMounted } from "vue";
const store = useScreenVideo();

const sub_video = ref();
const pub_video = ref();
const sub_video_userMedia = ref();
const pub_video_userMedia = ref();
const Streams = reactive({
  userMider: [],
  displayMider: [],
});

const signal = new IonSFUJSONRPCSignal("ws://localhost:7000/ws");
const client = new Client(signal);
signal.onopen = () => {
  store.joinRoom();
};

onMounted(() => {
  store.sub_video = sub_video;
  store.pub_video = pub_video;
  store.sub_video_userMedia = sub_video_userMedia;
  store.pub_video_userMedia = pub_video_userMedia;
  store.client = client;
  console.dir(client);

  // store.joinRoom();
  // console.dir(client);
  // const dc = store.client.createDataChannel("data");
  // dc.onopen = () => {
  //   dc.send("hello world");
  //   console.dir(dc);
  //   store.client.ondatachannel = (e) => {
  //     console.dir(e);
  //     e.channel.onmessage = (e) => {
  //       console.dir("msg");
  //       // this.mySpeakingCallback(JSON.parse(e.data));
  //     };
  //   };
  // };

  store.getUserMedia();

  if (!store.isPub) {

    client.onactivelayer = (a) => {console.dir(a)}

    client.ontrack = (track, stream) => {
      Streams.userMider.push({media: stream, active: stream.active});

      // stream.no = Streams.userMider.length - 1
      console.dir(stream)
      // store.sub_video.srcObject = stream;
      // store.sub_video.autoplay = true;
      // store.sub_video.muted = false;
      stream.onremovetrack = () => {

        // Streams.userMider.splice(stream.no,1)
        // store.sub_video.srcObject = null;
        console.dir("removetrack");
      };
      stream.oninactive = () => {

      }
    };
  }
});

// local.signal.onopen = () => store.client.join("test room");
</script>

<template>
  <div id="View_main">
    <div id="View">
      <div id="left">
        <video
          class="displayMider"
          ref="pub_video"
          autoplay
          controls
          v-show="store.isPub"
        ></video>
        <video
          class="displayMider"
          ref="sub_video"
          autoplay
          controls
          v-show="!store.isPub"
        ></video>
      </div>
      <div id="right">
        <div id="right_top">
          <video
            class="userMider"
            ref="sub_video_userMedia"
            autoplay
            controls
          ></video>
        </div>
        <div id="rigth_button" v-for="userMider in Streams.userMider">
          <video
            class="userMider"
            :srcObject="userMider.media"
            ref="pub_video_userMedia"
            autoplay
            controls
          ></video>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#View_main {
  height: 100%;
  width: 100%;
  min-height: 400pt;
  min-width: 800pt;
}
#View {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}
#left {
  height: 100%;
  width: 80%;
}
#right {
  height: 100%;
  border-radius: 10px;
  background-color: rgb(180, 180, 180);
}
#right_top {
  padding: 10px;
  border: 3px solid rgb(50, 50, 50);
  border-radius: 10px;
  background-color: rgb(88, 88, 88);
}
#rigth_button {
  padding: 10px;
}
video {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  background-color: rgb(50, 50, 50);
}
video::-webkit-media-controls-enclosure {
  display: none;
}
.displayMider {
  height: 100%;
  width: 100%;
}
.userMider {
  height: 150px;
  width: 250px;
}
</style>
