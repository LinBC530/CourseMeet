import { api } from "src/boot/axios";

export async function create_meeting_room() {
  return await api
    .post("/room")
    .then(({ status, data }) => {
      return status === 201
        ? { status: "success", data: data }
        : { status: "error", message: "發生錯誤，請稍後再試" };
    })
    .catch(({ response }) => {
      if (response) {
        return {
          status: "error",
          message: "伺服器錯誤，請稍後再試",
        };
      } else {
        return {
          status: "error",
          message: "伺服器無法連線，請稍後再試",
        };
      }
    });
}

export async function get_meeting_room(room_id) {
  return await api
    .get(`/room/${room_id}`)
    .then(({ status, data }) => {
      return status === 200
        ? { status: "success", data: data }
        : { status: "error", message: "發生錯誤，請稍後再試" };
    })
    .catch(({ response }) => {
      if (response) {
        switch (response.status) {
          case 400:
            return {
              status: "error",
              message: "無效的會議代碼",
            };
          case 404:
            return {
              status: "failure",
              message: "該會議不存在",
            };
          default:
            return {
              status: "error",
              message: "伺服器錯誤，請稍後再試",
            };
        }
      } else {
        return {
          status: "error",
          message: "無法與伺服器連線，請稍後再試",
        };
      }
    });
}
