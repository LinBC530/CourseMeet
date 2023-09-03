<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useMeetingData } from "src/stores/Meeting";
import { useUserData } from "src/stores/UserData";
import { api } from "../boot/axios";

const $q = useQuasar();
const Meeting = useMeetingData();
const user = useUserData();
const router = useRouter();
//判別為加入或建立會議
const join = ref(true);
const MeetingRoomID = ref("");

//加入會議室
function joinMeetingRoom() {
  if (MeetingRoomID.value && MeetingRoomID.value.length == 24) {
    api
      .post("/checkMeeting", { RoomID: MeetingRoomID.value })
      .then((res) => {
        if (res.data) {
          if (res.data.type) {
            Meeting.socket.auth["RoomID"] = MeetingRoomID.value;
            Meeting.RoomID = MeetingRoomID.value
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
    .post("/CreatMeetingRoom", { UserID: user.userID })
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

//登出
function signOut() {
  //重置LocalStorage中的UserData
  user.$reset();
  router.push({ path: "/Login" });
}
</script>

<template>
  <q-card id="loginPage">
    <q-card-section>
      <div id="account">
        <!-- <q-avatar size="md" style="margin-right: 10px">
          <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
        </q-avatar> -->
        <span>Hi, {{ user.userName }}</span>
        <q-menu style="text-align: center">
          <q-list>
            <q-item
              clickable
              v-ripple
              @click="router.push({ path: '/Account' })"
            >
              <q-item-section>帳戶設定</q-item-section>
            </q-item>
            <q-item @click="signOut" clickable v-ripple>
              <q-item-section style="color: red">登出</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
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
#account {
  width: 150px;
  padding: 10px;
  border-radius: 10px;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
  user-select: none;
}
#account:hover {
  background-color: rgb(234, 234, 234);
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
