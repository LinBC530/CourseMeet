<script setup></script>

<template>
  <div id="Menu">
    <div id="top">
      <div id="HomeWork">
        <span class="top_title">近期作業及測驗</span>
        <div class="line" />
        <div class="main">content</div>
      </div>
      <div id="Event">
        <span class="top_title">會議</span>
        <div class="line" />
        <div class="main">content</div>
      </div>
    </div>
    <div id="botton">
      <div id="course">
        <div id="Botton_title">
          <span>課程</span>
          <button>
            <q-icon class="material-symbols-outlined" name="add" size="26px" />
          </button>
        </div>
      </div>
    </div>
  </div>
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

</style>
