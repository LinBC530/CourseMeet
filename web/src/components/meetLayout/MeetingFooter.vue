<template>
  <q-toolbar class="row no-wrap">
    <div class="col">
      會議代碼：
      <span @click="copy_text(room_id)">
        {{ room_id }}
        <q-tooltip style="font-size: 12px;">
          複製會議代碼
        </q-tooltip>
      </span>
    </div>
    <div class="col flex justify-center no-wrap">
      <q-btn size="xl" :icon="camera_is_open ? 'videocam' : 'videocam_off'" :color="camera_is_open ? 'blue' : 'red'"
        flat @click="camera_switch">
        <q-tooltip v-if="camera_is_open" style="font-size: 12px;">
          關閉攝影機
        </q-tooltip>
        <q-tooltip v-else style="font-size: 12px;">
          開啟攝影機
        </q-tooltip>
      </q-btn>
      <q-btn size="xl" :icon="mic_is_open ? 'mic' : 'mic_off'" :color="mic_is_open ? 'blue' : 'red'" flat
        @click="mic_switch">
        <q-tooltip v-if="mic_is_open" style="font-size: 12px;">
          關閉麥克風
        </q-tooltip>
        <q-tooltip v-else style="font-size: 12px;">
          開啟麥克風
        </q-tooltip>
      </q-btn>
      <q-btn size="xl" icon="present_to_all" :color="screen_is_share ? 'blue' : null" @click="display_media_switch" flat>
        <q-tooltip v-if="screen_is_share" style="font-size: 12px;">
          停止分享畫面
        </q-tooltip>
        <q-tooltip v-else style="font-size: 12px;">
          分享畫面
        </q-tooltip>
      </q-btn>
      <q-btn size="xl" icon="call_end" color="red" @click="router.push('/Exit')" flat>
        <q-tooltip style="font-size: 12px;">
          結束會議
        </q-tooltip>
      </q-btn>
    </div>
    <div class="col flex justify-end">
      <q-btn size="xl" icon="apps" flat @click="toggleDrawer">
        <q-tooltip style="font-size: 12px;">
          工具列
        </q-tooltip>
      </q-btn>
    </div>

  </q-toolbar>
</template>

<script setup>
import { computed } from 'vue';
import { useMeetingStore } from 'src/stores/meeting';
import { useIonsfuStore } from 'src/stores/ionsfu';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const { notify } = useQuasar();
const router = useRouter();
const { room_id } = storeToRefs(useMeetingStore());
const { toggleDrawer } = useMeetingStore();
const IonsfuStore = useIonsfuStore();
const { camera_stream, mic_stream, screen_stream } = storeToRefs(IonsfuStore);
const { get_display_media_stream, get_user_mic_media_stream, get_user_camera_media_stream, share_stream } = IonsfuStore;

const camera_is_open = computed(() => !!camera_stream.value);
const mic_is_open = computed(() => !!mic_stream.value);
const screen_is_share = computed(() => !!screen_stream.value);

/**
 * 分享螢幕媒體流
 * @returns {Promise<void>}
 */
async function display_media_switch() {
  try {
    if (screen_stream.value) {
      screen_stream.value.unpublish();
      screen_stream.value.getTracks().forEach(track => track.stop())
      screen_stream.value = null;
    } else {
      const stream = await get_display_media_stream();
      stream.getTracks().forEach(track => track.onended = () => {
        stream.unpublish();
        screen_stream.value = null;
      });
      share_stream("screen", stream);
    }
  } catch (err) {
    console.error("取得顯示媒體失敗: ", err);
  }
}

/**
 * 切換麥克風媒體流
 * @returns {Promise<void>}
 */
async function mic_switch() {
  try {
    if (mic_stream.value) {
      mic_stream.value.unpublish();
      mic_stream.value.getTracks().forEach(track => track.stop())
      mic_stream.value = null;
    } else {
      const stream = await get_user_mic_media_stream();
      stream.getTracks().forEach(track => track.onended = () => {
        stream.unpublish();
        mic_stream.value = null;
      });
      share_stream("mic", stream);
    }
  } catch (err) {
    console.error("取得麥克風媒體失敗: ", err);
  }
}

/**
 * 切換攝影機媒體流
 * @returns {Promise<void>}
 */
async function camera_switch() {
  try {
    if (camera_stream.value) {
      camera_stream.value.unpublish();
      camera_stream.value.getTracks().forEach(track => track.stop())
      camera_stream.value = null;
    } else {
      const stream = await get_user_camera_media_stream();
      stream.getTracks().forEach(track => track.onended = () => {
        stream.unpublish();
        camera_stream.value = null;
      });
      share_stream("camera", stream);
    }
  } catch (err) {
    console.error("取得攝影機媒體失敗: ", err);
  }
}

/**
 * 複製文字到剪貼簿
 * @param {string} text - 要複製的文字
 */
function copy_text(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      notify({
        type: 'positive',
        message: '已複製',
      })
    })
    .catch(() => {
      notify({
        type: 'negative',
        message: '複製失敗',
      })
    })
}

</script>

<style scoped></style>
