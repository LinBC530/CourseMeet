<script setup>
import { useMeetingData } from "src/stores/Meeting";
const Meeting = useMeetingData();
</script>

<template>
  <div id="memberList">
    <div id="title"><span>成員名單</span></div>
    <q-separator color="grey-8" size="3px" />
    <div id="content">
      <q-scroll-area id="scroll">
        <q-list>
          <!-- <q-expansion-item class="title" label="主持人" default-opened>
            <q-item class="items" clickable v-show="Meeting.teacher != 'null'">
              <q-item-section>{{ Meeting.teacher }}</q-item-section>
            </q-item>
          </q-expansion-item> -->
          <q-expansion-item class="title" label="目前參與者" default-opened>
            <q-item class="items" clickable v-for="user in Meeting.studens">
              <q-item-section>{{ user.userName }}</q-item-section>
            </q-item>
          </q-expansion-item>
        </q-list>
      </q-scroll-area>
    </div>
  </div>
</template>

<style scoped>
#memberList {
  height: 100%;
}

#title {
  height: 30px;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

#content {
  height: calc(100% - 30px);
}

#scroll {
  height: 100%;
  max-width: 100%;
}

.title {
  font-weight: bold;
  text-align: center;
  user-select: none;
}

.items {
  font-weight: normal;
  text-align: left;
}
</style>
