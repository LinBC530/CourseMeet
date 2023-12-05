<script setup>
import { ref, reactive, onMounted } from "vue";
import io from "socket.io-client";
// 引入 drawing pinia
import { useDrawData } from "src/stores/drawing"
// 引入pinia解構方法
import { storeToRefs } from "pinia";

const socket = io("https://localhost:3000", { transports: ['websocket'] });
// 使用 drawing pinia
const Draw = useDrawData();
// 解構draw canvas，解構後為ref物件，使用時須加上.value (ex: canvas.value)，不解構則加上Draw (Draw.canvas)
const { canvas } = storeToRefs(Draw)

let context = null;
// 是否正在繪圖
let isDrawing = false;
// 工具狀態
const tool = reactive({
  // 畫筆、橡皮擦、三角形、長方形、圓形...
  type: "brush",
  // 筆刷粗細
  size: 2,
  // 筆刷顏色
  color: 'black'
});
const current = reactive({ x: 0, y: 0, });

// 接收繪圖資料
socket.on("drawing", (data) => drawing(data));

// 繪製圖形
function drawing(data) {
  // 取得目前畫布大小，以根據畫布大小還原圖形
  const w = canvas.value.width;
  const h = canvas.value.height;
  // 判斷要繪製的圖形種類
  switch (data.type) {
    // 線條
    case 'Line':
      drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.size, data.color, false)
      break;
    // 橡皮擦
    case 'eraser':
      eraser(data.x * w, data.y * h, data.size, false);
      break;
    // 三角形
    case 'triangle':
      drawTriangle(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.size, false);
      break;
    // 長方形
    case 'rectangle':
      drawRectangle(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.size, false);
      break;
    // 圓形
    case 'circle':
      drawCircle(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.size, false);
      break;
    case 'text':
      drawText(data.x * w, data.y * h, 'hello world', data.size, 'Comic Sans MS', data.color, false)
    default:
      break;
  }
}

onMounted(() => {
  // canvas
  context = canvas.value.getContext("2d");
  canvas.value.addEventListener("mousedown", onMouseDown, false);
  canvas.value.addEventListener("mouseup", onMouseUp, false);
  canvas.value.addEventListener("mouseout", onMouseUp, false);
  canvas.value.addEventListener("mousemove", throttle(onMouseMove, 10), false);
  // 設定實際上畫布大小(js)等於視覺上畫布大小(css)
  canvas.value.width = canvas.value.clientWidth;
  canvas.value.height = canvas.value.clientHeight;
});

// 下載繪圖
function donwload_as_png() {
  canvas.value.toBlob((blob) => {
    const link = document.createElement("a");
    link.innerText = "Download";
    link.href = URL.createObjectURL(blob);
    link.download = "whiteBoardPage.png";
    link.click();
  });
}

function onMouseDown(e) {
  // snapshot = context.getImageData(0, 0, canvas.value.width, canvas.value.height);
  isDrawing = true;
  current.x = e.offsetX;
  current.y = e.offsetY;
  if (tool.type == "eraser") eraser(e.offsetX, e.offsetY, tool.size, true);
  else if (tool.type == 'text') drawText(e.offsetX, e.offsetY, 'hello world', tool.size, 'Comic Sans MS', tool.color, true);
}

function onMouseUp(e) {
  if (!isDrawing) return;
  isDrawing = false;
  switch (tool.type) {
    case "brush":
      drawLine(current.x, current.y, e.offsetX, e.offsetY, tool.size, tool.color, true);
      break;
    case "eraser":
      eraser(e.offsetX, e.offsetY, tool.size, true);
      break;
    case "triangle":
      drawTriangle(current.x, current.y, e.offsetX, e.offsetY, tool.color, tool.size, true);
      break;
    case 'rectangle':
      drawRectangle(current.x, current.y, e.offsetX, e.offsetY, tool.color, tool.size, true);
      break;
    case 'circle':
      drawCircle(current.x, current.y, e.offsetX, e.offsetY, tool.color, tool.size, true);
      break;
    default:
      break;
  }
}

function onMouseMove(e) {
  if (!isDrawing) return;
  switch (tool.type) {
    case "brush":
      drawLine(current.x, current.y, e.offsetX, e.offsetY, tool.size, tool.color, true);
      current.x = e.offsetX;
      current.y = e.offsetY;
      break;
    case "eraser":
      eraser(e.offsetX, e.offsetY, tool.size, true);
      break;
    // case "triangle":
    //   context.putImageData(snapshot, 0, 0);
    //   drawTriangle(current.x, e.offsetX, current.y, e.offsetY, tool.color, tool.size, true);
    //   break;
    // case 'rectangle':
    //   context.putImageData(snapshot, 0, 0);
    //   drawRectangle(current.x, current.y, e.offsetX, e.offsetY, tool.color, tool.size, true);
    //   break;
    // case 'circle':
    //   context.putImageData(snapshot, 0, 0);
    //   drawCircle(current.x, current.y, e.offsetX, e.offsetY, tool.color, tool.size, true);
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

// 畫筆
function drawLine(x0, y0, x1, y1, size, color, emit) {
  context.beginPath();
  context.moveTo(x0, y0);
  context.lineTo(x1, y1);
  context.strokeStyle = color;
  context.lineWidth = size ? size : tool.size;
  context.stroke();
  context.closePath();
  if (!emit) {
    return;
  }
  let w = canvas.value.width;
  let h = canvas.value.height;
  socket.emit("drawing", {
    type: 'Line',
    x0: x0 / w,
    y0: y0 / h,
    x1: x1 / w,
    y1: y1 / h,
    color: color,
    size: tool.size,
    emit: false,
  });
}

// 橡皮擦
function eraser(x, y, size, emit) {
  context.clearRect(x - size * 5, y - size * 5, size * 10, size * 10);
  if (!emit) {
    return;
  }
  let w = canvas.value.width;
  let h = canvas.value.height;
  socket.emit("drawing", {
    type: 'eraser',
    x: x / w,
    y: y / h,
    size: tool.size,
    emit: false,
  });
}

// 畫三角形
function drawTriangle(x0, y0, x1, y1, color, size, emit) {
  context.beginPath();
  context.strokeStyle = color;
  context.lineWidth = size ? size : tool.size;
  context.moveTo(x0, y0);
  context.lineTo(x1, y1);
  context.lineTo(x0 * 2 - x1, y1);
  context.closePath();
  context.stroke();
  if (!emit) {
    return;
  }
  let w = canvas.value.width;
  let h = canvas.value.height;
  socket.emit("drawing", {
    type: 'triangle',
    x0: x0 / w,
    y0: y0 / h,
    x1: x1 / w,
    y1: y1 / h,
    color: color,
    size: tool.size,
    emit: false,
  });
};

// 畫長方形
function drawRectangle(x0, y0, x1, y1, color, size, emit) {
  context.strokeStyle = color;
  context.lineWidth = size ? size : tool.size;
  context.strokeRect(x0, y0, x1 - x0, y1 - y0);
  if (!emit) {
    return;
  }
  const w = canvas.value.width;
  const h = canvas.value.height;
  socket.emit("drawing", {
    type: 'rectangle',
    x0: x0 / w,
    y0: y0 / h,
    x1: x1 / w,
    y1: y1 / h,
    color: color,
    size: tool.size,
    emit: false
  });

}

// 畫圓形
function drawCircle(x0, y0, x1, y1, color, size, emit) {
  context.beginPath();
  context.strokeStyle = color;
  context.lineWidth = size ? size : tool.size;
  let radius = Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
  context.arc(x0, y0, radius, 0, Math.PI * 2);
  context.stroke();
  if (!emit) {
    return;
  }
  const w = canvas.value.width;
  const h = canvas.value.height;
  socket.emit("drawing", {
    type: 'circle',
    x0: x0 / w,
    y0: y0 / h,
    x1: x1 / w,
    y1: y1 / h,
    color: color,
    size: tool.size,
    emit: false,
  });
}

// 畫文字
function drawText(x, y, text, size, font, color, emit) {
  context.textAlign = 'left';
  context.font = (size * 10).toString() + 'px ' + font
  context.fillStyle = color;
  context.fillText(text, x, y, context.measureText(text).width);
  if (!emit) {
    return;
  }
  const w = canvas.value.width;
  const h = canvas.value.height;
  socket.emit("drawing", {
    type: 'text',
    x: x / w,
    y: y / h,
    color: color,
    size: tool.size,
    emit: false,
  });
}
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
            <div class="toolbox tools group">
              <q-btn-group unelevated>
                <q-btn size="lg" icon="change_history" @click="tool.type = 'triangle'" stack />
                <q-btn size="lg" icon="crop_square" @click="tool.type = 'rectangle'" stack />
                <q-btn size="lg" icon="radio_button_unchecked" @click="tool.type = 'circle'" stack />
              </q-btn-group>
              <q-btn-group unelevated>
                <q-btn size="lg" icon="title" @click="tool.type = 'text'" stack />
              </q-btn-group>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="toolbox">
          <div class="toolbox title">
            <span>繪圖工具</span>
          </div>
          <div class="toolbox tools">
            <q-btn-group unelevated>
              <q-btn size="md" icon="create" @click="tool.type = 'brush'" stack>
                <label style="font-size: 12px;cursor: pointer;">畫筆</label>
              </q-btn>
              <q-btn size="md" icon="crop_portrait" @click="tool.type = 'eraser'" stack>
                <label style="font-size: 12px;cursor: pointer;">橡皮擦</label>
              </q-btn>
            </q-btn-group>
          </div>
        </q-card-section>

        <q-card-section class="toolbox">
          <div class="toolbox title">
            <span>工具大小</span>
          </div>
          <div class="toolbox tools">
            <q-slider style="width: 80%" v-model="tool.size" :min="2" :max="20" label />
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
                  <button class="color" style="background-color: black" @click="tool.color = 'black'" />
                  <button class="color" style="background-color: red" @click="tool.color = 'red'" />
                  <button class="color" style="background-color: blue" @click="tool.color = 'blue'" />
                </div>
                <div style="display: flex">
                  <button class="color" style="background-color: blueviolet" @click="tool.color = 'blueviolet'" />
                  <button class="color" style="background-color: gold" @click="tool.color = 'gold'" />
                  <button class="color" style="background-color: green" @click="tool.color = 'green'" />
                </div>
              </div>
              <div style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                <button class="color palette" :style="{ backgroundColor: tool.color }">
                  <q-icon name="palette" size="md" />
                  <q-popup-proxy>
                    <q-color v-model="tool.color" no-header no-footer flat />
                  </q-popup-proxy>
                </button>
              </div>
            </div>
          </div>
        </q-card-section>
        <q-card-section>
          <center>
            <q-btn style="width: 80%" color="green" label="Donwload" @click="donwload_as_png" />
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.toolbox.tools.group {
  align-items: start;
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
