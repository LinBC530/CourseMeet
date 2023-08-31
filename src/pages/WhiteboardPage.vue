<script setup>
import Whiteboard from 'src/components/Whiteboard.vue';
import WB from 'src/components/WB.vue';
</script>

<template>
  <div id="WhiteBoard">
    <!-- <Whiteboard /> -->
    <WB/>
  </div>
</template>

<style scoped>
#WhiteBoard {
  height: 100%;
  width: 100%;
}
/*
#WhiteBoard {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-content: center;
  flex-wrap: wrap;
}*/
</style>
