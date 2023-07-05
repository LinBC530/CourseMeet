<script setup>
import { LocalStream, Client } from "ion-sdk-js";
import { IonSFUJSONRPCSignal } from "ion-sdk-js/lib/signal/json-rpc-impl";
import { useCounterStore } from "../stores/example-store";
import { ref, onMounted } from "vue";
const store = useCounterStore();

// var test = navigator.mediaDevices.getUserMedia(constraints);

let client;
const sub_video = ref();
const pub_video = ref();
const isPub = ref(false);

const signal = new IonSFUJSONRPCSignal("ws://localhost:7000/ws");
client = new Client(signal);

onMounted(() => {
  store.sub_video = sub_video;
  store.pub_video = pub_video;
  store.isPub = isPub;
  store.LocalStream = LocalStream;
  store.client = client;
});

// LocalStream.getUserMedia({
//   resolution: "vga",
//   video: true,
//   audio: true,
//   codec: "vp8",
// })
//   .then((stream) => {
//     pub_video.srcObject = stream;
//     client.publish(stream);
//   })
//   .catch((error) => {
//     console.error("Error accessing media devices.", error);
//   });

// function startPublish(type) {
//   isPub.value = true;
//   if (type) {
//     LocalStream.getUserMedia({
//       resolution: "vga",
//       audio: true,
//       codec: "vp8",
//     })
//       .then((stream) => {
//         pub_video.value.srcObject = stream;
//         client.publish(stream);
//       })
//       .catch(console.error);
//   } else {
//     LocalStream.getDisplayMedia({
//       resolution: "vga",
//       video: true,
//       audio: true,
//       codec: "vp8",
//     })
//       .then((stream) => {
//         pub_video.value.srcObject = stream;
//         client.publish(stream);
//       })
//       .catch(console.error);
//   }
// }

// signal.onopen = () => client.join("test room");
// // if (!isPub.value) {
// if (!isPub.value) {
//   client.ontrack = (track, stream) => {
//     sub_video.value.srcObject = stream;
//     sub_video.value.autoplay = true;
//     sub_video.value.muted = false;

//     stream.onremovetrack = () => {
//       sub_video.value.srcObject = null;
//     };
//   };
// }

signal.onopen = () => store.client.join("test room");
if (!store.isPub) {
  client.ontrack = (track, stream) => {
    store.sub_video.srcObject = stream;
    store.sub_video.autoplay = true;
    store.sub_video.muted = false;

    stream.onremovetrack = () => {
      store.sub_video.srcObject = null;
    };
  };
}
</script>

<template>
  <div id="View_main">
    <div id="View">
      <video
        style="height: 100%"
        ref="pub_video"
        autoplay
        controls
        v-if="isPub"
      ></video>
      <video
        style="height: 100%"
        ref="sub_video"
        autoplay
        controls
        v-else
      ></video>
    </div>
  </div>
</template>

<style scoped>
#View_main {
  height: 100%;
  width: 100%;
  min-height: 400pt;
  min-width: 500pt;
  display: flex;
  align-items: center;
  justify-content: center;
}

#View {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80%;
  width: 95%;
}
video {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
</style>
