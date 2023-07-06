<script setup>
import { ref } from "vue";
const add_onClick = ref(false);
</script>

<template>
  <div id="Menu">
    <div id="top">
      <div id="HomeWork">
        <span class="top_title">近期作業及測驗</span>
        <div class="line" />
        <div class="main">
          <div class="HomeWork_main_item">
            <div class="HomeWork_main_title"><span>Test_Title</span></div>
            <div class="HomeWork_main_endDate"><span>8/1</span></div>
          </div>
        </div>
      </div>
      <div id="Event">
        <span class="top_title">會議</span>
        <div class="line" />
        <div class="main">content</div>
      </div>
    </div>
    <div id="botton">
      <div id="course">
        <div id="botton_title">
          <span>課程</span>
          <button id="addButton" @click="add_onClick = true">
            <q-icon
              id="addicon"
              class="material-symbols-outlined"
              name="add"
              size="26px"
            />
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 彈出式對話框 -->
  <q-dialog v-model="add_onClick">
    <q-card>
      <q-card-section>
        <div id="dialog_title">
          <span>加入課程</span>
          /
          <span>建立課程</span>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        content
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="取消" color="primary" v-close-popup />
        <q-btn flat label="新增" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
#Menu {
  height: 100%;
  width: 100%;
  padding: 15pt;
  border-radius: 30pt;
  background-color: rgb(230, 230, 230);
}
#top {
  height: 30%;
  width: 100%;
  border-radius: 30pt;
  background-color: white;
  display: flex;
  padding: 10pt;
}
#HomeWork,
#Event {
  height: 100%;
  width: 50%;
  padding: 0pt 5pt;
  border: 1pt solid red;
}
.top_title {
  font-size: 20pt;
  font-weight: bold;
}
.line {
  height: 3pt;
  width: 100%;
  background-color: black;
  border-radius: 50pt;
}
.HomeWork_main_item {
  height: 100%;
  width: 100%;
  font-size: 12pt;
  display: flex;
  border: 1pt solid red;
}
.HomeWork_main_title {
  height: 100%;
  width: 70%;
  color: blue;
  border: 1pt solid rebeccapurple;
}
.HomeWork_main_endDate {
  height: 100%;
  width: 30%;
  color: red;
  display: flex;
  justify-content: center;
  border: 1pt solid rebeccapurple;
}
#botton_title {
  font-size: 20pt;
  font-weight: bold;
  padding-top: 5pt;
  padding-left: 10pt;
  display: flex;
  align-items: center;
}
#addButton {
  height: 20pt;
  width: 20pt;
  border: 0;
  border-radius: 5pt;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(230, 230, 230);
}
#addButton:hover {
  cursor: pointer;
  background-color: rgb(181, 181, 181);
}
#addButton:active {
  background-color: rgb(230, 230, 230);
}
#dialog_title {
  width: 300pt;
  display: flex;
  justify-content: center;
  font-size: 15pt;
}
#dialog_title span {
  color: rgb(46, 46, 170);
}
#dialog_title span:hover {
  cursor: pointer;
}
</style>
