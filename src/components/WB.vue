<script setup>
import { ref, reactive, onMounted } from "vue";
import { useMeetingData } from "src/stores/Meeting";

const Meeting = useMeetingData();
const socket = Meeting.socket;
const canvas = ref();
var context = null;
let drawing = false;
const tool = reactive({
  type: "brush",
  size: 2,
});
const current = reactive({
  x: 0,
  y: 0,
  color: "black",
});

onMounted(() => {
  // canvas
  context = canvas.value.getContext("2d");
  console.dir(canvas.value);
  canvas.value.addEventListener("mousedown", onMouseDown, false);
  canvas.value.addEventListener("mouseup", onMouseUp, false);
  canvas.value.addEventListener("mouseout", onMouseUp, false);
  canvas.value.addEventListener("mousemove", throttle(onMouseMove, 10), false);
  onResize();
});

function donwload_as_png() {
  canvas.value.toBlob((blob) => {
    const link = document.createElement("a");
    link.innerText = "Download";
    link.href = URL.createObjectURL(blob);
    link.download = "whiteBoardPage.png";
    link.click();
  });
}

function drawLine(x0, y0, x1, y1, color, emit) {
  console.log(x0, y0, x1, y1, color, emit);
  context.beginPath();
  context.moveTo(x0, y0);
  context.lineTo(x1, y1);
  context.strokeStyle = color;
  context.lineWidth = tool.size;
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

function eraser(x, y, size) {
  context.clearRect(x - size * 5, y - size * 5, size * 10, size * 10);
}

function onMouseDown(e) {
  console.log(e);
  drawing = true;
  current.x = e.offsetX;
  current.y = e.offsetY;
  if (tool.type == "eraser") eraser(e.offsetX, e.offsetY, tool.size);
  // switch (tool.type) {
  //   case "brush":
  //     current.x = e.offsetX;
  //     current.y = e.offsetY;
  //     console.log(e.offsetX, e.offsetY);
  //     break;
  //   case "eraser":
  //     eraser(e.offsetX, e.offsetY, tool.size);
  //     break;
  //   default:
  //     break;
  // }
}

function onMouseUp(e) {
  if (!drawing) return;
  drawing = false;
  switch (tool.type) {
    case "brush":
      drawLine(
        current.x,
        current.y,
        e.offsetX,
        e.offsetY,
        current.color,
        false
      );
      break;
    case "eraser":
      eraser(e.offsetX, e.offsetY, tool.size);
      break;
    case "Triangle":
      drawTriangle(e);
      break;
    default:
      break;
  }
}

function onMouseMove(e) {
  if (!drawing) return;
  switch (tool.type) {
    case "brush":
      drawLine(current.x, current.y, e.offsetX, e.offsetY, current.color, true);
      current.x = e.offsetX;
      current.y = e.offsetY;
      break;
    case "eraser":
      eraser(e.offsetX, e.offsetY, tool.size);
      break;
    // case "Triangle":
    //   drawTriangle(e);
    //   break;
    default:
      break;
  }
}

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

// function onDrawingEvent(data) {
//   var w = canvas.value.width;
//   var h = canvas.value.height;
//   drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
// }

function onResize() {
  canvas.value.width = canvas.value.clientWidth;
  canvas.value.height = canvas.value.clientHeight;
}

// 畫三角形
const drawTriangle = (e) => {
  context.beginPath();
  context.moveTo(current.x, current.y);
  context.lineTo(e.offsetX, e.offsetY);
  context.lineTo(current.x * 2 - e.offsetX, e.offsetY);
  context.closePath();
  context.stroke();
};
</script>

<template>
  <div id="whiteBoard">
    <div id="left">
      <q-card id="toolBar">
        <q-card-section class="toolbox">
          <div class="toolbox title">
            <span>圖形</span>
          </div>
          <div class="toolbox tools">
            <q-btn-group unelevated>
              <q-btn
                size="lg"
                icon="change_history"
                @click="tool.type = 'Triangle'"
                stack
              />
              <q-btn size="lg" icon="crop_square" stack />
              <q-btn size="lg" icon="radio_button_unchecked" stack />
            </q-btn-group>
          </div>
        </q-card-section>

        <q-card-section class="toolbox">
          <div class="toolbox title">
            <span>繪圖工具</span>
          </div>
          <div class="toolbox tools">
            <q-btn-group unelevated>
              <q-btn size="md" icon="create" @click="tool.type = 'brush'" stack>
                <span style="font-size: 8px">畫筆</span>
              </q-btn>
              <q-btn
                size="md"
                icon="crop_portrait"
                @click="tool.type = 'eraser'"
                stack
              >
                <span style="font-size: 8px">橡皮擦</span></q-btn
              >
              <!-- <q-btn size="lg" label="?" stack /> -->
            </q-btn-group>
          </div>
        </q-card-section>

        <q-card-section class="toolbox">
          <div class="toolbox title">
            <span>工具大小</span>
          </div>
          <div class="toolbox tools">
            <q-slider
              style="width: 80%"
              v-model="tool.size"
              :min="2"
              :max="20"
              label
            />
          </div>
        </q-card-section>

        <q-card-section class="toolbox">
          <div class="toolbox title">
            <span>色彩</span>
          </div>
          <div class="toolbox tools colors">
            <div style="border: 2px; display: flex">
              <div style="border: 2px">
                <div style="display: flex">
                  <button
                    class="color"
                    style="background-color: black"
                    @click="current.color = 'black'"
                  />
                  <button
                    class="color"
                    style="background-color: red"
                    @click="current.color = 'red'"
                  />
                  <button
                    class="color"
                    style="background-color: blue"
                    @click="current.color = 'blue'"
                  />
                </div>
                <div style="display: flex">
                  <button
                    class="color"
                    style="background-color: blueviolet"
                    @click="current.color = 'blueviolet'"
                  />
                  <button
                    class="color"
                    style="background-color: gold"
                    @click="current.color = 'gold'"
                  />
                  <button
                    class="color"
                    style="background-color: green"
                    @click="current.color = 'green'"
                  />
                </div>
              </div>
              <div
                style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                "
              >
                <button
                  class="color palette"
                  :style="{ backgroundColor: current.color }"
                >
                  <q-icon name="palette" size="md" />
                  <q-popup-proxy>
                    <q-color v-model="current.color" no-header no-footer flat />
                  </q-popup-proxy>
                </button>
              </div>
            </div>
          </div>
        </q-card-section>
        <q-card-section>
          <center>
            <q-btn
              style="width: 80%"
              color="green"
              label="Donwload"
              @click="donwload_as_png"
            />
          </center>
        </q-card-section>
      </q-card>
    </div>

    <div id="right">
      <canvas class="eraser" id="canvas" ref="canvas" />
    </div>
  </div>
</template>

<style scoped>
#whiteBoard {
  height: 100%;
  width: 100%;
  min-height: 700px;
  min-width: 1200px;
  display: flex;
}

#left {
  height: 100%;
  width: 20%;
  padding: 10px;
}
#toolBar {
  height: 100%;
}
.toolbox {
  padding-bottom: 0;
}
.toolbox.title {
  padding-bottom: 5px;
  font-size: 16px;
}
.toolbox.tools {
  display: flex;
  align-items: center;
  justify-content: center;
}
.color {
  height: 30px;
  width: 30px;
  margin: 5px;
  border: 0px;
  border-radius: 5px;
}
.color.palette {
  height: 50px;
  width: 50px;
  margin: 5px;
  border: 0px;
  border-radius: 5px;
}

#right {
  height: 100%;
  width: 80%;
  padding: 10px;
}
#canvas {
  height: 100%;
  width: 100%;
  border-radius: 10px;
  background-color: rgb(255, 255, 255);
}
</style>
