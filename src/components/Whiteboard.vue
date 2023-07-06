<script setup>
import { useRouter } from "vue-router";
import io from "socket.io-client";
import { reactive, ref, onMounted } from "vue";

const copyrouter = useRouter();
const socket = io("http://localhost:3000", { transports: ["websocket"] });

function WhiteBoard() {
  copyrouter.push({ path: "/" });
}

//const socket = io();
const canvas = ref(null);
const colors = ref(null);
var context = null;
let drawing = false;

// Before the component is mounted, the value
// of the ref is `null` which is the default
// value we've specified above.
onMounted(() => {
  context = canvas.value.getContext("2d");

  canvas.value.addEventListener("mousedown", onMouseDown, false);
  canvas.value.addEventListener("mouseup", onMouseUp, false);
  canvas.value.addEventListener("mouseout", onMouseUp, false);
  canvas.value.addEventListener("mousemove", throttle(onMouseMove, 10), false);

  //Touch support for mobile devices
  canvas.value.addEventListener("touchstart", onMouseDown, false);
  canvas.value.addEventListener("touchend", onMouseUp, false);
  canvas.value.addEventListener("touchcancel", onMouseUp, false);
  canvas.value.addEventListener("touchmove", throttle(onMouseMove, 10), false);
  for (var i = 0; i < colors.value.children.length; i++) {
    colors.value.children[i].addEventListener("click", onColorUpdate, false);
  }
  onResize();
});

var current = {
  color: "black",
};

socket.on("drawing", onDrawingEvent);

window.addEventListener("resize", onResize, false);

function drawLine(x0, y0, x1, y1, color, emit) {
  console.log(x0, y0, x1, y1, color);
  context.beginPath();
  context.moveTo(x0, y0);
  context.lineTo(x1, y1);
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.stroke();
  context.closePath();

  if (!emit) {
    return;
  }
  var w = canvas.value.width;
  var h = canvas.value.height;

  socket.emit("drawing", {
    x0: x0 / w,
    y0: y0 / h,
    x1: x1 / w,
    y1: y1 / h,
    color: color,
  });
}

function onMouseDown(e) {
  console.log(e);
  drawing = true;
  current.x = e.clientX || e.touches[0].clientX;
  current.y = e.clientY || e.touches[0].clientY;
}

function onMouseUp(e) {
  if (!drawing) {
    return;
  }
  drawing = false;
  console.log(e);
  drawLine(
    current.x,
    current.y,
    e.clientX || e.touches[0].clientX,
    e.clientY || e.touches[0].clientY,
    current.color,
    false
  );
}

function onMouseMove(e) {
  if (!drawing) {
    return;
  }
  drawLine(
    current.x,
    current.y,
    e.clientX || e.touches[0].clientX,
    e.clientY || e.touches[0].clientY,
    current.color,
    true
  );
  current.x = e.clientX || e.touches[0].clientX;
  current.y = e.clientY || e.touches[0].clientY;
}

function onColorUpdate(e) {
  current.color = e.target.className.split(" ")[1];
}

// limit the number of events per second
function throttle(callback, delay) {
  var previousCall = new Date().getTime();
  return function () {
    var time = new Date().getTime();

    if (time - previousCall >= delay) {
      previousCall = time;
      callback.apply(null, arguments);
    }
  };
}

function onDrawingEvent(data) {
  var w = canvas.value.width;
  var h = canvas.value.height;
  drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
}

// make the canvas fill its parent
function onResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  console.log(canvas.width, canvas.height);
}
</script>

<template>
  <canvas class="whiteboard" ref="canvas" width="500" height="500"></canvas>
  <div class="colors" ref="colors">
    <div class="color black"></div>
    <div class="color white"></div>
    <div class="color red"></div>
    <div class="color green"></div>
    <div class="color blue"></div>
    <div class="color yellow"></div>
  </div>
  <!-- 輸入數值改變筆刷粗細 -->
  <!-- <q-form @submit = "pensize">
  <div id="input">

    <q-input id="pen_size" v-model="pensize" label="pen_size" />
  </div>
  </q-form> -->
  <q-card id="msg_box">
    <q-form @submit="WhiteBoard"> </q-form>
  </q-card>
</template>

<style scoped>
.whiteboard {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background-color: white;
  border: 1px solid black;
}

.colors {
  position: fixed;
}

.color {
  display: inline-block;
  height: 48px;
  width: 48px;
}

.color.black {
  background-color: black;
}

.color.red {
  background-color: red;
}

.color.green {
  background-color: green;
}

.color.blue {
  background-color: blue;
}

.color.yellow {
  background-color: yellow;
}

.color.white {
  background-color: white;
}

#WhiteBoard {
  height: 100%;
  width: 100%;

  display: flex;
  justify-content: center;
  align-content: center;
  flex-wrap: wrap;
}
</style>
