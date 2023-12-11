<script setup>
import { ref, reactive, onMounted, onUpdated } from "vue";
import { useQuasar } from "quasar";
import { useDrawData } from "src/stores/drawing"
import { useMeetingData } from "src/stores/Meeting";
import { storeToRefs } from "pinia";
import { api } from "../boot/axios"

const $q = useQuasar();
const Draw = useDrawData();
const Meet = useMeetingData();
const socket = Meet.socket;
socket.connect();
const {
  canvas,
  canvas_total,
  cnavas_page_number,
  canvas_page_name,
  drawing_event,
  all_canvasID
} = storeToRefs(Draw)
let context = null;
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
// if(Meet.RoomID){
//   socket.connect
// }

// 接收繪圖資料
socket.on("drawing", (data) => drawing(data));
socket.on("canvas", (data) => canvas_settings(data));

// 嘗試取得白板ID及預設畫布ID，如果沒有就建立一個
if (Meet.RoomID) {
  try {
    api.post("/wb/get/whiteboard", { MeetingRoomID: Meet.RoomID }).then((res) => {
      if (res.data) {
        if (res.data.type) {
          Draw.WhiteboardID = res.data.data.WhiteboardID;
          Draw.canvasID = res.data.data.allCanvasID[0];
          all_canvasID.value = res.data.data.allCanvasID;
          canvas_total.value = res.data.data.allCanvasID.length;
          for (let event of res.data.data.drawing_event)
            drawing(event)
        } else throw new Error('data type return false')
      } else throw new Error('server error')
    });
  } catch (e) {
    console.log(e)
    $q.notify({
      message: "發生錯誤，請稍後再試",
      color: "negative",
    });
  }
}
else {
  $q.notify({
    message: "尚未加入會議，無法共用白板",
    color: "negative",
  });
}

// 設定畫布
function canvas_settings(data) {
  switch (data.type) {
    case 'add':
      canvas_total.value++;
      Draw.all_canvasID.push(data.canvasID)
      break;
    default:
      return;
  }
}

// 變更畫布分頁
async function change_canvas_page(type) {
  switch (type) {
    case 'next':
      if (cnavas_page_number.value == 15) break;
      // 如果目前頁數為最後一頁
      if (cnavas_page_number.value == canvas_total.value) {
        // 在DB新增畫布資料，並取得畫布ID
        try {
          canvas_total.value++;
          if (!Draw.WhiteboardID) throw Error("error");
          await api.post("/wb/new/canvas", { WhiteboardID: Draw.WhiteboardID }).then((res) => {
            if (res.data) {
              if (res.data.type) {
                Draw.canvasID = res.data.data.canvasID;
                all_canvasID.value.push(res.data.data.canvasID);
              } else {
                $q.notify({
                  message: res.data.reason,
                  color: "negative",
                });
              }
            } else throw Error('error')
          });
          // 通知其他用戶端更新畫布總數，以及新增新畫布
          socket.emit('canvas', { type: 'add', canvasID: Draw.canvasID })
        } catch {
          $q.notify({
            message: "發生錯誤，請稍後再試4",
            color: "negative",
          });
        }
        canvas_page_name.value = 'canvas' + cnavas_page_number.value.toString();
      }
      else {
        cnavas_page_number.value++;
        canvas_page_name.value = 'canvas' + cnavas_page_number.value.toString();
        try {
          if (!Draw.WhiteboardID && !Draw.canvasID) throw Error("error");
          await api.post("/wb/get/canvas", {
            WhiteboardID: Draw.WhiteboardID,
            // canvasID: Draw.canvasID
            canvasID: all_canvasID.value[cnavas_page_number.value - 1]
          }).then((res) => {
            if (res.data) {
              if (res.data.type) {
                Draw.canvasID = all_canvasID.value[cnavas_page_number.value - 1];
                for (let event of res.data.data.canvas.drawing_event)
                  drawing(event)
              } else {
                $q.notify({
                  message: res.data.reason,
                  color: "negative",
                });
              }
            } else throw Error('error')
          });
        } catch (e) {
          console.log(e)
          $q.notify({
            message: "發生錯誤，請稍後再試",
            color: "negative",
          });
        }
        break;
      }
      cnavas_page_number.value++;
      break;
    case 'back':
      if (cnavas_page_number.value == 1) break;
      cnavas_page_number.value--;
      canvas_page_name.value = 'canvas' + cnavas_page_number.value.toString();
      try {
        if (!Draw.WhiteboardID && !Draw.canvasID) throw Error("error");
        await api.post("/wb/get/canvas", {
          WhiteboardID: Draw.WhiteboardID,
          canvasID: all_canvasID.value[cnavas_page_number.value - 1]
        }).then((res) => {
          if (res.data) {
            if (res.data.type) {
              Draw.canvasID = all_canvasID.value[cnavas_page_number.value - 1];
              for (let event of res.data.data.canvas.drawing_event)
                drawing(event)
            } else {
              $q.notify({
                message: res.data.reason,
                color: "negative",
              });
            }
          } else throw Error('error')
        });
      } catch {
        $q.notify({
          message: "發生錯誤，請稍後再試8",
          color: "negative",
        });
      }
      break;
    case 'goto':
      if (cnavas_page_number.value != canvas_total.value) return;
      break;
    default:
      return;
  }
  // Draw.canvasID = all_canvasID.value[cnavas_page_number.value - 1]
  // canvas_page_name.value = 'canvas' + cnavas_page_number.value.toString();
}

// 繪製圖形
function drawing(data) {
  const w = canvas.value[0].width;
  const h = canvas.value[0].height;

  for (let event of data.events) {
    if (cnavas_page_number.value != all_canvasID.value.indexOf(event.canvas_id) + 1) return;
    // 判斷要繪製的圖形種類
    switch (event.type) {
      // 線條
      case 'Line':
        drawLine(event.x0 * w, event.y0 * h, event.x1 * w, event.y1 * h, event.size, event.color, false)
        break;
      // 橡皮擦
      case 'eraser':
        eraser(event.x * w, event.y * h, event.size, false);
        break;
      // 三角形
      case 'triangle':
        drawTriangle(event.x0 * w, event.y0 * h, event.x1 * w, event.y1 * h, event.color, event.size, false);
        break;
      // 長方形
      case 'rectangle':
        drawRectangle(event.x0 * w, event.y0 * h, event.x1 * w, event.y1 * h, event.color, event.size, false);
        break;
      // 圓形
      case 'circle':
        drawCircle(event.x0 * w, event.y0 * h, event.x1 * w, event.y1 * h, event.color, event.size, false);
        break;
      case 'text':
        drawText(event.x * w, event.y * h, 'hello world', event.size, 'Comic Sans MS', event.color, false)
      default:
        break;
    }
  }
}

onMounted(() => {
  setEventListener();
  set_canvas_size()
});

onUpdated(() => {
  setEventListener()
  set_canvas_size()
})

function setEventListener() {
  // canvas
  context = canvas.value[0].getContext("2d");
  canvas.value[0].addEventListener("mousedown", onMouseDown, false);
  canvas.value[0].addEventListener("mouseup", onMouseUp, false);
  canvas.value[0].addEventListener("mouseout", onMouseUp, false);
  canvas.value[0].addEventListener("mousemove", throttle(onMouseMove, 10), false);
}

function set_canvas_size() {
  // 設定實際上畫布大小(js)等於視覺上畫布大小(css)
  canvas.value[0].width = canvas.value[0].clientWidth;
  canvas.value[0].height = canvas.value[0].clientHeight;
}

// 下載繪圖
function donwload_as_png() {
  canvas.value[0].toBlob((blob) => {
    const link = document.createElement("a");
    link.innerText = "Download";
    link.href = URL.createObjectURL(blob);
    link.download = "whiteBoardPage.png";
    link.click();
  });
}

function onMouseDown(e) {
  // snapshot = context.getImageData(0, 0, canvas.value[0].width, canvas.value[0].height);
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
    case 'text':
      break;
    default:
      return;
  }
  socket.emit("drawing", {
    WhiteboardID: Draw.WhiteboardID,
    canvasID: Draw.canvasID,
    drawing_event: drawing_event.value
  });
  Draw.reset_drawing_event()
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
  const w = canvas.value[0].width;
  const h = canvas.value[0].height;
  drawing_event.value.events.push({
    type: 'Line',
    // canvas_id: all_canvasID.value.indexOf(cnavas_page_number.value),
    canvas_id: Draw.canvasID,
    x0: x0 / w,
    y0: y0 / h,
    x1: x1 / w,
    y1: y1 / h,
    color: color,
    size: tool.size,
    emit: false,
  })
  // let w = canvas.value[0].width;
  // let h = canvas.value[0].height;
  // socket.emit("drawing", {
  //   type: 'Line',
  //   canvas_id: cnavas_page_number.value,
  //   x0: x0 / w,
  //   y0: y0 / h,
  //   x1: x1 / w,
  //   y1: y1 / h,
  //   color: color,
  //   size: tool.size,
  //   emit: false,
  // });
}

// 橡皮擦
function eraser(x, y, size, emit) {
  context.clearRect(x - size * 5, y - size * 5, size * 10, size * 10);
  if (!emit) {
    return;
  }
  const w = canvas.value[0].width;
  const h = canvas.value[0].height;
  drawing_event.value.events.push({
    type: 'eraser',
    canvas_id: Draw.canvasID,
    x: x / w,
    y: y / h,
    size: tool.size,
    emit: false,
  })
  // let w = canvas.value[0].width;
  // let h = canvas.value[0].height;
  // socket.emit("drawing", {
  //   type: 'eraser',
  //   canvas_id: cnavas_page_number.value,
  //   x: x / w,
  //   y: y / h,
  //   size: tool.size,
  //   emit: false,
  // });
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
  const w = canvas.value[0].width;
  const h = canvas.value[0].height;
  drawing_event.value.events.push({
    type: 'triangle',
    canvas_id: Draw.canvasID,
    x0: x0 / w,
    y0: y0 / h,
    x1: x1 / w,
    y1: y1 / h,
    color: color,
    size: tool.size,
    emit: false,
  })
  // let w = canvas.value[0].width;
  // let h = canvas.value[0].height;
  // socket.emit("drawing", {
  //   type: 'triangle',
  //   canvas_id: cnavas_page_number.value,
  //   x0: x0 / w,
  //   y0: y0 / h,
  //   x1: x1 / w,
  //   y1: y1 / h,
  //   color: color,
  //   size: tool.size,
  //   emit: false,
  // });
};

// 畫長方形
function drawRectangle(x0, y0, x1, y1, color, size, emit) {
  context.strokeStyle = color;
  context.lineWidth = size ? size : tool.size;
  context.strokeRect(x0, y0, x1 - x0, y1 - y0);
  if (!emit) {
    return;
  }
  const w = canvas.value[0].width;
  const h = canvas.value[0].height;
  drawing_event.value.events.push({
    type: 'rectangle',
    canvas_id: Draw.canvasID,
    x0: x0 / w,
    y0: y0 / h,
    x1: x1 / w,
    y1: y1 / h,
    color: color,
    size: tool.size,
    emit: false
  })
  // const w = canvas.value[0].width;
  // const h = canvas.value[0].height;
  // socket.emit("drawing", {
  //   type: 'rectangle',
  //   canvas_id: cnavas_page_number.value,
  //   x0: x0 / w,
  //   y0: y0 / h,
  //   x1: x1 / w,
  //   y1: y1 / h,
  //   color: color,
  //   size: tool.size,
  //   emit: false
  // });

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
  const w = canvas.value[0].width;
  const h = canvas.value[0].height;
  drawing_event.value.events.push({
    type: 'circle',
    canvas_id: Draw.canvasID,
    x0: x0 / w,
    y0: y0 / h,
    x1: x1 / w,
    y1: y1 / h,
    color: color,
    size: tool.size,
    emit: false,
  })
  // const w = canvas.value[0].width;
  // const h = canvas.value[0].height;
  // socket.emit("drawing", {
  //   type: 'circle',
  //   canvas_id: cnavas_page_number.value,
  //   x0: x0 / w,
  //   y0: y0 / h,
  //   x1: x1 / w,
  //   y1: y1 / h,
  //   color: color,
  //   size: tool.size,
  //   emit: false,
  // });
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
  const w = canvas.value[0].width;
  const h = canvas.value[0].height;
  drawing_event.value.events.push({
    type: 'text',
    canvas_id: Draw.canvasID,
    x: x / w,
    y: y / h,
    color: color,
    size: tool.size,
    emit: false,
  })
  // const w = canvas.value[0].width;
  // const h = canvas.value[0].height;
  // socket.emit("drawing", {
  //   type: 'text',
  //   canvas_id: cnavas_page_number.value,
  //   x: x / w,
  //   y: y / h,
  //   color: color,
  //   size: tool.size,
  //   emit: false,
  // });
}
</script>

<template>
  <div id="whiteBoard">
    <div id="left">
      <q-card id="toolBar">
        <q-card-section class="toolbox">
          <div class="toolbox title">
            <span>畫布分頁</span>
          </div>
          <div class="toolbox tools">
            <q-btn-group unelevated>
              <q-btn icon="arrow_back_ios" @click="change_canvas_page('back')" stack />
              <q-form @submit="change_canvas_page('goto')">
                <q-input item-aligned v-model="cnavas_page_number" :suffix="'/ ' + canvas_total.toString()" />
              </q-form>
              <q-btn icon="arrow_forward_ios" @click="change_canvas_page('next')" stack />
            </q-btn-group>
          </div>
        </q-card-section>

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
      <q-carousel v-model="canvas_page_name" class="carousel" transition-prev="slide-right" transition-next="slide-left"
        animated control-color="primary">
        <q-carousel-slide v-for="i in canvas_total" :name="'canvas' + i.toString()" class="carousel slide">
          <canvas :id="i" class="carousel slide canvas" ref="canvas" />
        </q-carousel-slide>
      </q-carousel>
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
  margin: 0;
  padding: 10px;
}

.carousel {
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
  background-color: rgba(255, 255, 255, 0)
}

.carousel.slide {
  padding: 6px;
  border-radius: 10px;
}

.carousel.slide.canvas {
  padding: 0;
  background-color: rgb(255, 255, 255);
}
</style>
