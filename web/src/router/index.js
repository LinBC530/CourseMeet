import { route } from "quasar/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import { useAuth } from "src/stores/auth";
import { useMeetingStore } from "src/stores/meeting";
import { get_meeting_room } from "src/request/meeting";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    const Auth = useAuth();
    const MeetingStore = useMeetingStore();

    if (to.meta.requiresAuth && Auth.isTokenExpired) {
      // 如果需要認證但未認證，導向登入頁
      return next({ path: "/", query: { redirect: to.fullPath } });
    }

    // 檢查是否為會議路徑，且會議代碼是否存在
    const to_path_match = to.path.match(
      /^\/meeting\/([a-zA-Z0-9]{8})(\/prejoin)?$/
    );

    if (to_path_match) {
      const meeting_room_id = to_path_match[1];
      const isPrejoin = !!to_path_match[2];

      const { status } = await get_meeting_room(meeting_room_id);
      // 若不存在導向錯誤頁
      if (status !== "success") return next({ path: "/404" });

      // 如果尚未與網站互動，轉去預先加入頁面
      if (!isPrejoin && !MeetingStore.touched) {
        return next({ path: `/meeting/${meeting_room_id}/prejoin` });
      } else {
        // 儲存會議代碼
        MeetingStore.room_id = meeting_room_id;
      }
    }

    next();
  });

  return Router;
});
