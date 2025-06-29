import { api } from "src/boot/axios";

// 登入帳戶
export async function login_account(email, password) {
  return await api
    .post("/account/login/user", {
      email: email,
      password: password,
    })
    .then(({ status, data, message }) => {
      return status === 200
        ? { status: "success", data: data }
        : {
            status: "error",
            message: message || "登入過程發生錯誤，請稍後再試",
          };
    })
    .catch(({ response }) => {
      if (response) {
        switch (response.status) {
          case 400:
            return {
              status: "error",
              message: "無效的電子郵件或密碼格式",
            };
          case 401:
            return {
              status: "failure",
              message: "帳號或密碼錯誤，請檢查後再試",
            };
          case 404:
            return {
              status: "failure",
              message: "查無此帳號，請確認電子郵件是否正確",
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

// 訪客登入
export async function guest_login(user_name) {
  return await api
    .post("/account/login/guest", {
      name: user_name,
    })
    .then(({ status, data, message }) => {
      return status === 200
        ? { status: "success", data: data }
        : {
            status: "error",
            message: "登入過程發生錯誤，請稍後再試",
          };
    })
    .catch((err) => {
      if (err.response) {
        return {
          status: "error",
          message: "登入過程發生錯誤，請稍後再試",
        };
      } else {
        return {
          status: 500,
          message: "伺服器無法連線，請稍後再試",
        };
      }
    });
}

// 註冊帳戶
export async function register_account(
  name,
  email,
  password,
  verification_code
) {
  return await api
    .post("/account/register", {
      name: name,
      email: email,
      password: password,
      verification_code: verification_code,
    })
    .then(({ status, data }) => {
      return status === 201
        ? { status: "success", data: data }
        : {
            status: "error",
            message: "註冊過程發生錯誤，請稍後再試",
          };
    })
    .catch(({ response }) => {
      if (response) {
        switch (response.status) {
          case 400:
            return {
              status: "error",
              message: "無效的電子郵件或密碼格式",
            };
          case 409:
            return {
              status: "failure",
              message: "此電子郵件已被註冊，請使用其他電子郵件",
            };
          case 404:
            return {
              status: "failure",
              message: "驗證碼錯誤或已過期，請重新獲取驗證碼",
            };
          default:
            return {
              status: "error",
              message: "伺服器錯誤，請稍後再試",
            };
        }
      } else {
        return {
          status: 500,
          message: "伺服器無法連線，請稍後再試",
        };
      }
    });
}

// 取得驗證碼(註冊)
export async function get_verification_code(email, type) {
  return await api
    .post("/account/verification/email", {
      email: email,
      type: type,
    })
    .then(({ status, data }) => {
      return status === 200
        ? { status: "success", data: data }
        : {
            status: "error",
            message: "請求驗證碼過程發生錯誤，請稍後再試",
          };
    })
    .catch(({ response }) => {
      if (response) {
        switch (response.status) {
          case 400:
            return {
              status: "error",
              message: "無效的電子郵件格式",
            };
          case 404:
            return {
              status: "failure",
              message: "查無此電子郵件，請確認後再試",
            };
          case 409:
            return {
              status: "failure",
              message: "此電子郵件已被註冊，請使用其他電子郵件",
            };
          default:
            return {
              status: "error",
              message: "伺服器錯誤，請稍後再試",
            };
        }
      } else {
        return {
          status: 500,
          message: "伺服器無法連線，請稍後再試",
        };
      }
    });
}

// 忘記密碼(請求發送重置密碼信)
export async function forgot_password(email) {
  return await api
    .post("/account/verification/token", {
      email: email,
    })
    .then(({ status, data }) => {
      return status === 200
        ? { status: "success", data: data }
        : {
            status: "error",
            message: "發送重置密碼信過程發生錯誤，請稍後再試",
          };
    })
    .catch(({ response }) => {
      if (response) {
        switch (response.status) {
          case 400:
            return {
              status: "error",
              message: "無效的電子郵件格式",
            };
          case 404:
            return {
              status: "failure",
              message: "查無此電子郵件，請確認後再試",
            };
          default:
            return {
              status: "error",
              message: "伺服器錯誤，請稍後再試",
            };
        }
      } else {
        return {
          status: 500,
          message: "伺服器無法連線，請稍後再試",
        };
      }
    });
}

// 重置密碼
export async function reset_password(token, new_password) {
  return await api
    .post("/account/reset/password", {
      token: token,
      new_password: new_password,
    })
    .then(({ status, data }) => {
      return status === 200
        ? { status: "success", data: data }
        : {
            status: "error",
            message: "重置密碼過程發生錯誤，請稍後再試",
          };
    })
    .catch(({ response }) => {
      if (response) {
        switch (response.status) {
          case 400:
            return {
              status: "error",
              message: "無效的令牌或新密碼格式",
            };
          case 404:
            return {
              status: "failure",
              message: "令牌不存在或已過期，請重新請求重置密碼",
            };
          case 500:
            return {
              status: "error",
              message: "更新密碼失敗，請稍後再試",
            };
          default:
            return {
              status: "error",
              message: "伺服器錯誤，請稍後再試",
            };
        }
      } else {
        return {
          status: 500,
          message: "伺服器無法連線，請稍後再試",
        };
      }
    });
}
