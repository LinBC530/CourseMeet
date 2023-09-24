<script setup>
import { useRouter } from "vue-router";
import io from "socket.io-client";
import { reactive, ref, onMounted } from "vue";

const copyrouter = useRouter();
const socket = io("http://localhost:3000", { transports: ["websocket"] });

function WhiteBoard2() {
  copyrouter.push({ path: "/" });
}

const canvas = ref(null);
const toolBtns = ref(null);
const fillcolor = ref(null);
const sizeSlider = ref(null);
const colorBtns = ref(null);
const colorPicker = ref(null);
var ctx = null;

onMounted(() => {
  console.dir(canvas.value)
  ctx = canvas.value.getContext("2d");
  canvas.value.addEventListener("mousedown", startDraw);
  canvas.value.addEventListener("mousemove", drawing);
  canvas.value.addEventListener("mouseup", () => (isDrawing = false));

  if (toolBtns.value != null) {
    for (var i = 0; i < toolBtns.value.children.length; i++) {
      // console.dir(toolBtns.value.children[i])
      toolBtns.value.children[i].addEventListener("click", (btn) => {
        document.querySelector(".options .active").classList.remove("active");
        console.dir(btn.target.id);
        btn.target.classList.add("active");
        // selectedTool = btn.target.id;
        // console.log(selectedTool);
      });
    }
  }

  if (colorBtns.value != null) {
  for (var i = 0; i < colorBtns.value.children.length; i++) {
    colorBtns.value.children[i].addEventListener("click", (btn) => {
      document.querySelector(".options .selected").classList.remove("selected");
      btn.target.classList.add("selected");
      console.log(btn.target.classList)
      selectedColor = window.getComputedStyle(btn.target).getPropertyValue("background-color")
    });
  }
}
});

let prevMouseX, prevMouseY, snapshot;
let isDrawing = false;
const selectedTool = "brush";
const brushWidth = 5;
let selectedColor = "#000";

// window.addEventListener("load", () => {
//   canvas.value.width = canvas.value.clientWidth;
//   canvas.value.height = canvas.value.clientHeigh;
// });
//畫長方形
const drawRect = (e) => {
  if (!fillcolor.checked) {
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
  fillcolor.checked ? ctx.fill() : ctx.stroke();
};
//畫三角形
const drawTriangle = (e) => {
  ctx.beginPath();
  ctx.moveTo(prevMouseX, prevMouseY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
  ctx.closePath();
  fillcolor.checked ? ctx.fill() : ctx.stroke();
};

//e.clientX e.clientY

const startDraw = (e) => {
  isDrawing = true;
  prevMouseX = e.offsetX;
  prevMouseY = e.offsetY;
  ctx.beginPath();
  // ctx.lineWidth = brushWidth;
  ctx.lineWidth = 2;
  ctx.strokeStyle = selectedColor;
  ctx.fillStyle = selectedColor;
  snapshot = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height);
};
const drawing = (e) => {
  if (!isDrawing) return;
  ctx.putImageData(snapshot, 0, 0);
  if (selectedTool === "brush" || selectedTool === "earaser") {
    ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    console.log("游標在白色區塊的位置1");
    console.log(e.offsetX, e.offsetY);
    console.log("游標在整個畫面的位置2");
    console.log(e.clientX, e.clientY);
    console.log(e.offsetX + e.clientX, e.offsetY + e.clientY);
  } else if (selectedTool === "rectangle") {
    drawRect(e);
    console.log("a");
  } else if (selectedTool === "circle") {
    drawCircle(e);
  } else {
    drawTriangle(e);
  }
};

if (sizeSlider.value != null) {
  sizeSlider.addEventListener("change", () => (brushWidth = sizeSlider.value));
}

if (colorPicker.value != null) {
  colorPicker.addEventListener("chang", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
  });
}


</script>

<template>
  <div class="container">
    <section class="tools-board">
      <div class="row">
        <label class="title">Shapes</label>
        <ul class="options">
          <li class="opotion tool" id="rectangle" ref="tool">
            <img src="" alt="" />
            <span>Rectangle</span>
          </li>
          <li class="opotion tool" id="circle" ref="tool">
            <img src="" alt="" />
            <span>Circle</span>
          </li>
          <li class="opotion tool" id="triangle" ref="tool">
            <img src="" alt="" />
            <span>Triangle</span>
          </li>
          <li class="opotion">
            <input type="checkbox" id="fill-color" ref="fillcolor" />
            <label for="fill-color">fill color</label>
          </li>
        </ul>
      </div>
      <div class="row">
        <label class="title">Options</label>
        <ul class="options">
          <li class="opotion active tool" id="brush" ref="tool">
            <img src="" alt="" />
            <span>Brush</span>
          </li>
          <li class="opotion tool" id="eraser" ref="tool">
            <img src="" alt="" />
            <span>Eraser</span>
          </li>
          <li class="opotion">
            <input
              type="range"
              id="size-slider"
              ref="sizeSlider"
              min="1"
              max="30"
              value="5"
            />
          </li>
        </ul>
      </div>
      <div class="row colors">
        <label class="title">Colors</label>
        <ul class="options" ref="colorBtns">
          <li class="option" @="abcd1"></li>
          <li class="option selected"></li>
          <li class="option"></li>
          <li class="option"></li>
          <li class="option"></li>
          <input
            type="color"
            id="color-picker"
            ref="colorPicker"
            value="#4A98F7"
          />
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

/* .colors .option:hover::before{
    position:absolute;
    content: "";
    top: 50%;
    left: 50%;
    height: 12px;
    width: 12px;
    background: inherit;
    border-radius: inherit;
    border: 2px solid #fff;
    transform: translate(-50%, -50%);
}
.colors .option:first-child:hover::before{
    border-color:#ccc;
} */
.drawing-board canvas {
  width: 100%;
  height: 100%;
}

.colors {
  position: fixed;
}

canvas {
  height: 100%;
  width: 100%;
}
</style>
