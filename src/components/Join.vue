<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
// import { useUserData } from "src/stores/UserData";
import { useMeetingData } from "src/stores/Meeting";
import { api } from "../boot/axios";

const $q = useQuasar();
// const store = useUserData();
const Meeting = useMeetingData();
const router = useRouter();
const join = ref(true);
const MeetingRoomID = ref("");

//加入會議室
function joinMeetingRoom() {
  if (MeetingRoomID.value && MeetingRoomID.value.length == 24) {
    console.dir(MeetingRoomID.value.length);
    api
      .post("/checkMeeting", { RoomID: MeetingRoomID.value })
      .then((res) => {
        if (res.data) {
          if (res.data.type) {
            Meeting.socket.auth["RoomID"] = MeetingRoomID.value;
            router.push({ path: "/Main" });
          } else {
            $q.notify({
              message: res.data.reason,
              color: "negative",
            });
          }
        } else {
          $q.notify({
            message: "發生錯誤，請稍後再試",
            color: "negative",
          });
        }
      })
      .catch((e) => {
        console.log(e);
        $q.notify({
          message: "發生錯誤，請稍後再試",
          color: "negative",
        });
      });
  } else if (!MeetingRoomID.value) {
    $q.notify({
      message: "未輸入代碼",
      color: "negative",
    });
  } else {
    $q.notify({
      message: "查無此會議",
      color: "negative",
    });
  }
}

//建立會議室
function creatMeetingRoom() {
  api
    .post("/CreatMeetingRoom", { UserID: "123456" })
    .then((res) => {
      if (res.data) {
        if (res.data.type) {
          MeetingRoomID.value = res.data.data.MeetingRoomID;
        } else {
          $q.notify({
            message: res.data.reason,
            color: "negative",
          });
        }
      } else {
        $q.notify({
          message: "發生錯誤，請稍後再試",
          color: "negative",
        });
      }
    })
    .catch((e) => {
      console.log(e);
      $q.notify({
        message: "發生錯誤，請稍後再試",
        color: "negative",
      });
    });
}
</script>

<template>
  <q-card id="loginPage">
    <q-card-section>
      <div id="title">
        <span>Discuss</span>
      </div>
      <div id="nav">
        <span
          @click="
            join = true;
            MeetingRoomID = '';
          "
          >加入討論</span
        >
        /
        <span
          @click="
            join = false;
            creatMeetingRoom();
          "
          >建立討論</span
        >
      </div>
      <q-form @submit="joinMeetingRoom">
        <div id="input">
          <q-input
            id="Email_box"
            v-model="MeetingRoomID"
            label="RoomID"
            v-if="join"
          />
          <div v-else>
            <span>會議代碼: {{ MeetingRoomID }}</span>
          </div>
        </div>
        <div id="button">
          <q-btn
            id="btn"
            type="submit"
            label-color="dark"
            unelevated
            rounded
            color="secondary"
            label="加入"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<style scoped>
#loginPage {
  width: 50%;
  min-height: 300pt;
  min-width: 500pt;
  padding: 10pt;
}
#nav {
  display: flex;
  justify-content: center;
  font-size: 20pt;
}
#nav span {
  color: rgb(46, 46, 170);
}
#nav span:hover {
  cursor: pointer;
}
#title {
  height: 40%;
  display: flex;
  justify-content: center;
}
#title span {
  display: flex;
  align-items: center;
  font-size: 50pt;
}
form {
  height: 60%;
  width: 80%;
  margin: 0 auto;
}
#button {
  width: 100%;
  margin: 10pt;
  display: flex;
  justify-content: center;
}
#input {
  height: 80;
  width: 80%;
  margin-left: auto;
  margin-right: auto;
}
#btn {
  height: 20%;
  width: 50%;
  font-size: 15pt;
}
</style>
