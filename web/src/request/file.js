import { api } from "src/boot/axios";

// 檔案上傳
export async function upload_file(file) {
  return await api
    .post("/files", file)
    .then(({ status, data }) => {
      return status === 201
        ? { status: "success", data: data }
        : { status: "error", message: "上傳檔案發生錯誤，請稍後再試" };
    })
    .catch(({ response }) => {
      if (response) {
        return {
          status: "failure",
          message: "上傳檔案失敗，請稍後再試",
        };
      } else {
        return {
          status: "error",
          message: "伺服器無法連線，請稍後再試",
        };
      }
    });
}

// 檔案下載
export async function download_file(file_id) {
  return await api
    .get(`/files/donwload/${file_id}`, {
      responseType: "blob",
    })
    .then(({ status, data }) => {
      return status === 200
        ? { status: "success", data: URL.createObjectURL(data) }
        : { status: "error", message: "下載檔案發生錯誤，請稍後再試" };
    })
    .catch(({ response }) => {
      if (response) {
        switch (response.status) {
          case 400:
            return {
              status: "error",
              message: "無效的檔案 ID",
            };
          case 404:
            return {
              status: "failure",
              message: "該檔案不存在",
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
          message: "伺服器無法連線，請稍後再試",
        };
      }
    });
}
