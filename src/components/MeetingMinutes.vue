<script setup></script>

<template>
  <div id="meetingMinutes">
    <div id="title"><span>會議記錄</span></div>
    <q-separator color="grey-8" size="3px" />
    <div id="content">
      <q-scroll-area id="scroll">
        <div class="msg">
          <div class="msg_title"><span>TalkUser: TEST</span></div>
          <div class="msg_content">
            <span>Content: This is a test message</span>
          </div>
        </div>
        <div class="msg">
          <div class="msg_title"><span>TalkUser: TEST</span></div>
          <div class="msg_content">
            <span>Content: This is a test message</span>
          </div>
        </div>
        <div class="msg">
          <div class="msg_title"><span>TalkUser: TEST</span></div>
          <div class="msg_content">
            <span>Content: This is a test message</span>
          </div>
        </div>
      </q-scroll-area>
    </div>
  </div>
</template>

<style scoped>
#meetingMinutes {
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

#scroll{
  height: 100%;
  max-width: 100%;
}

.msg {
  margin: 10px 0px;
  padding: 5px;
  border-radius: 10px;
  background-color: rgb(222, 222, 222);
}

</style>
