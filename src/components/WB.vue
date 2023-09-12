<script setup>
import { ref } from "vue";

const canvas = ref();
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
              <q-btn size="lg" icon="change_history" stack />
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
              <q-btn size="lg" icon="brush" stack />
              <q-btn size="lg" icon="ink_eraser" stack />
              <q-btn size="lg" label="?" stack />
            </q-btn-group>
          </div>
        </q-card-section>

        <q-card-section class="toolbox">
          <div class="toolbox title">
            <span>色彩</span>
          </div>
          <div class="toolbox tools"></div>
        </q-card-section>
      </q-card>
    </div>

    <div id="right">
      <canvas id="canvas" ref="canvas" />
    </div>
  </div>
</template>

<style scoped>
#whiteBoard {
  height: 100%;
  width: 100%;
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
.toolbox{
  padding-bottom: 0;
}
.toolbox.title{
  padding-bottom: 5px;
  font-size: 16px;
}
.toolbox.tools{
  display: flex;
  align-items: center;
  justify-content: center;
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
