<script setup>
import { useRouter } from "vue-router";
import io from "socket.io-client";
import { reactive, ref, onMounted } from "vue";

const router = useRouter();
// const socket = io("http://localhost:3000", { transports: ["websocket"] });

function WhiteBoard2() {
  router.push({ path: "/" });
}

let fillColor, colorPicker;

const canvas = ref();
const sizeSlider = ref();
onMounted(() => {
  ctx = canvas.value.getContext("2d");
  // toolBtns = document.querySelectorAll(".tool");
  fillColor = document.querySelector("#fill-color");
  // sizeSlider = document.querySelector("#size-slider");
  // colorBtns = document.querySelectorAll(".colors .option");
  colorPicker = document.querySelector("#color-picker");

  colorPicker.addEventListener("chang", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
  });

  canvas.value.addEventListener("mousedown", startDraw);
  canvas.value.addEventListener("mousemove", drawing);
  canvas.value.addEventListener("mouseup", () => (isDrawing = false));
});
var ctx;

let prevMouseX, prevMouseY, snapshot;
let isDrawing = false;
let selectedTool = "brush";
// let brushWidth = 5;
let selectedColor = "#000";

window.addEventListener("load", () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
});
//畫長方形
const drawRect = (e) => {
  if (!fillColor.checked) {
    return ctx.strokeRect(
      e.offsetX,
      e.offsetY,
      prevMouseX - e.offsetX,
      prevMouseY - e.offsetY
    );
  }
  ctx.fillRect(
    e.offsetX,
    e.offsetY,
    prevMouseX - e.offsetX,
    prevMouseY - e.offsetY
  );
};
//畫圓形
const drawCircle = (e) => {
  ctx.beginPath();
  let radius = Math.sqrt(
    Math.pow(prevMouseX - e.offsetX, 2) + Math.pow(prevMouseY - e.offsetY, 2)
  );
  ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
  fillColor.checked ? ctx.fill() : ctx.stroke();
};
//畫三角形
const drawTriangle = (e) => {
  ctx.beginPath();
  ctx.moveTo(prevMouseX, prevMouseY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
  ctx.closePath();
  fillColor.checked ? ctx.fill() : ctx.stroke();
};

const startDraw = () => {
  isDrawing = true;
  prevMouseX = e.offsetX;
  prevMouseY = e.offsetY;
  ctx.beginPath();
  ctx.lineWidth = sizeSlider.value;
  ctx.strokeStyle = selectedColor;
  ctx.fillStyle = selectedColor;
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};
const drawing = (e) => {
  if (!isDrawing) return;
  ctx.putImageData(snapshot, 0, 0);
  if (selectedTool === "brush" || selectedTool === "earaser") {
    context.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  } else if (selectedTool === "rectangle") {
    drawRect(e);
  } else if (selectedTool === "circle") {
    drawCircle(e);
  } else {
    drawTriangle(e);
  }
};

// console.dir(toolBtns)
function toolBtnOnClick() {
  document.querySelector(".options .active").classList.remove("active");
  btn.classList.add("active");
  selectedTool = btn.id;
  console.log(selectedTool);
}
// toolBtns.forEach((btn) => {
//   btn.addEventListener("click", () => {
//     document.querySelector(".options .active").classList.remove("active");
//     btn.classList.add("active");
//     selectedTool = btn.id;
//     console.log(selectedTool);
//   });
// });

// sizeSlider.addEventListener("change", () => (brushWidth = sizeSlider.value));

function colcorBtnOnClick() {
  document.querySelector(".options .selected").classList.remove("selected");
  btn.classList.add("selected");
  selectedColor.log(
    window.getComputedStyle(btn).getPropertyValue("background-color")
  );
}
// colorBtns.forEach((btn) => {
//   btn.addEventListener("click", () => {
//     document.querySelector(".options .selected").classList.remove("selected");
//     btn.classList.add("selected");
//     selectedColor.log(
//       window.getComputedStyle(btn).getPropertyValue("background-color")
//     );
//   });
// });

// colorPicker.addEventListener("chang", () => {
//   colorPicker.parentElement.style.background = colorPicker.value;
//   colorPicker.parentElement.click();
// });

// canvas.addEventListener("mousedown", startDraw);
// canvas.addEventListener("mousemove", drawing);
// canvas.addEventListener("mouseup", () => (isDrawing = false));
</script>


<template>
  <div class="container">
    <section class="tools-board">
      <div class="row">
        <label class="title">Shapes</label>
        <ul class="options">
          <li class="opotion tool" id="rectangle" @click="toolBtnOnClick">
            <img src="" alt="" />
            <span>Rectangle</span>
          </li>
          <li class="opotion tool" id="circle" @click="toolBtnOnClick">
            <img src="" alt="" />
            <span>Circle</span>
          </li>
          <li class="opotion tool" id="triangle" @click="toolBtnOnClick">
            <img src="" alt="" />
            <span>Triangle</span>
          </li>
          <li class="opotion">
            <input type="checkbox" id="fill-color" />
            <label for="fill-color">fill color</label>
          </li>
        </ul>
      </div>
      <div class="row">
        <label class="title">Options</label>
        <ul class="options">
          <li class="opotion active tool" id="brush" @click="toolBtnOnClick">
            <img src="" alt="" />
            <span>Brush</span>
          </li>
          <li class="opotion tool" id="eraser" @click="toolBtnOnClick">
            <img src="" alt="" />
            <span>Eraser</span>
          </li>
          <li class="opotion">
            <!-- <input type="range" id="size-slider" min="1" max="30" value="5" /> -->
            <q-slider
              id="size-slider"
              v-model="sizeSlider"
              :min="1"
              :max="30"
            />
          </li>
        </ul>
      </div>
      <div class="row colors">
        <label class="title">Colors</label>
        <ul class="options" @click="colcorBtnOnClick">
          <li class="option" @click="colcorBtnOnClick"></li>
          <li class="option selected" @click="colcorBtnOnClick"></li>
          <li class="option" @click="colcorBtnOnClick"></li>
          <li class="option" @click="colcorBtnOnClick"></li>
          <li class="option" @click="colcorBtnOnClick"></li>
          <input type="color" id="color-picker" value="#4A98F7" />
        </ul>
      </div>
      <div class="row buttons">
        <!-- <button class="clear-canvas">Clear Canvas</button>
                <button class="save-img">Save As Image</button> -->
      </div>
    </section>
    <section class="drawing-board">
      <canvas ref="canvas"></canvas>
    </section>
  </div>

  <q-card id="msg_box">
    <q-form @submit="WhiteBoard2"> </q-form>
  </q-card>
</template>

<style scoped>
.container {
  display: flex;
  width: 100%;
  gap: 10px;
  padding: 10px;
  max-width: 1050px;
}

section {
  background: #fff;
  border-radius: 7px;
}

.drawing-board {
  flex: 1;
}

.tools-board {
  widows: 210px;
  padding: 15px 22px 0;
}

.tools-board .row {
  margin-bottom: 20px;
}

.row .options {
  list-style: none;
  cursor: pointer;
  margin: 10px 0 0 5px;
}

.row .options .option {
  display: flex;
  cursor: pointer;
  align-items: center;
  margin-bottom: 10px;
}

/* .options:is(:hover, .active) img {
    fill: invert(17%) sepia(90%) saturate(3000%) hue-rotate(900deg) brightness(100%) contrast(100%);
} */

/* .options:is(:hover, .active) :where(span, label) {
    color: #4A98F7;
} */

.option :where(span, label) {
  color: #5a6168;
  cursor: pointer;
  padding-left: 10px;
}

#fill-color:checked ~ label {
  color: #4a98f7;
}

.option #fill-color {
  cursor: pointer;
  height: 14px;
  width: 14px;
}

.colors .options {
  display: flex;
  justify-content: space-between;
}

.colors .option {
  height: 20px;
  width: 20px;
  background: red;
  border-radius: 50%;
  margin-top: 3px;
}

.colors .option:nth-child(1) {
  background-color: #fff;
  border: 1px solid #bfbfbf;
}

.colors .option:nth-child(2) {
  background-color: #000;
}

.colors .option:nth-child(3) {
  background-color: #e02020;
}

.colors .option:nth-child(4) {
  background-color: #6dd400;
}

.colors .option:nth-child(5) {
  background-color: #4a98f7;
}

.drawing-board canvas {
  width: 100%;
  height: 100%;
}

.colors {
  position: fixed;
}
</style>
