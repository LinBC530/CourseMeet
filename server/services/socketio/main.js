import { Server } from "socket.io";
import { Joi } from "celebrate";
import Chat from "../database/chat.js";

export default function init_scoket(server) {
  const io = new Server(server, { maxHttpBufferSize: 1e8 });

  io.on("connection", async (socket) => {
    // 加入房間
    socket.on("joinRoom", async (room_id, user, callback) => {
      try {
        // 驗證房間 ID 格式
        const { error } = Joi.string()
          .alphanum()
          .length(8)
          .required()
          .validate(room_id);
        if (error) {
          console.error(`Invalid room ID: ${error.message}`);
          throw new Error("參數驗證失敗");
        }
        socket.data.user_id = user.id;
        socket.join(room_id);
        io.to(room_id).emit("receiveMessage", {
          type: "systemMsg",
          sender: "system",
          recipient: "all",
          content: `${user.name} 加入了會議`,
          time_stamp: new Date(),
        });
        socket.broadcast.emit("UserInfo", {
          socket_id: socket.id,
          user_id: user.id,
          name: user.name,
        });
        if (typeof callback === "function") callback({ status: "success" });
      } catch (err) {
        console.error(`Error joining room: ${err.message}`);
        if (typeof callback === "function")
          callback({
            status: "error",
            message: err.message || "伺服器錯誤",
          });
      }
    });

    // 離開房間
    socket.on("leaveRoom", (room_id, user_id, callback) => {
      try {
        // 驗證房間 ID 格式
        const { error } = Joi.string()
          .alphanum()
          .length(8)
          .required()
          .validate(room_id);
        if (error) {
          throw new Error("參數驗證失敗");
        }
        socket.broadcast.emit("leaveRoom", user_id);
        socket.leave(room_id);
        if (typeof callback === "function") callback({ status: "success" });
      } catch (err) {
        if (typeof callback === "function")
          callback({
            status: "error",
            message: err.message || "伺服器錯誤",
          });
      }
    });

    // 送出用戶資訊
    socket.on("UserInfo", (recipient, user_info, callback) => {
      try {
        // 驗證用戶資訊格式
        const validate_recipient_error = Joi.alternatives()
          .try(Joi.string().valid("all"), Joi.string().min(1))
          .required()
          .validate(recipient).error;
        const validate_user_info_error = Joi.object({
          socket_id: Joi.string().required(),
          user_id: Joi.string().required(),
          name: Joi.string().required(),
        }).validate(user_info).error;
        if (validate_recipient_error || validate_user_info_error) {
          console.error(validate_recipient_error, validate_user_info_error);
          throw new Error("參數驗證失敗");
        }
        if (recipient === "all") {
          socket.broadcast.emit("UserInfo", user_info);
        } else {
          io.to(recipient).emit("UserInfo", user_info);
        }
        if (typeof callback === "function") callback({ status: "success" });
      } catch (err) {
        if (typeof callback === "function")
          callback({
            status: "error",
            message: err.message || "伺服器錯誤",
          });
      }
    });

    // 取得該會議所有訊息
    socket.on("getAllMessages", async (room_id, callback) => {
      try {
        // 驗證房間 ID 格式
        const { error } = Joi.string()
          .alphanum()
          .length(8)
          .required()
          .validate(room_id);
        if (error) {
          throw new Error("參數驗證失敗");
        }
        // 取得房間內所有訊息
        const chat = new Chat();
        const messages = await chat.get_all_message_by_room_id(room_id);
        socket.emit("getAllMessages", messages);
        if (typeof callback === "function")
          callback({ status: "success", messages: messages });
      } catch (err) {
        if (typeof callback === "function")
          callback({
            status: "error",
            message: err.message || "伺服器錯誤",
          });
      }
    });

    // 轉發訊息
    socket.on("sendMessage", async (message, callback) => {
      try {
        // 驗證訊息格式
        const { error } = Joi.object({
          room_id: Joi.string().alphanum().length(8).required(),
          type: Joi.string()
            .valid("text", "image", "file", "systemMsg")
            .required(),
          sender: Joi.when("type", {
            switch: [{ is: "systemMsg", then: Joi.forbidden() }],
            otherwise: Joi.object({
              id: Joi.string().required(),
              name: Joi.string().required(),
            }).required(),
          }),
          recipient: Joi.alternatives()
            .try(
              Joi.object({
                id: Joi.string().required(),
                name: Joi.string().required(),
              }).required(),
              Joi.string().valid("all").required()
            )
            .required(),
          content: Joi.when("type", {
            switch: [{ is: "text", then: Joi.string().required() }],
            otherwise: Joi.forbidden(),
          }),
          file_name: Joi.when("type", {
            switch: [
              { is: "image", then: Joi.string().required() },
              { is: "file", then: Joi.string().required() },
            ],
            otherwise: Joi.forbidden(),
          }),
          file_size: Joi.when("type", {
            switch: [
              { is: "image", then: Joi.number().required() },
              { is: "file", then: Joi.number().required() },
            ],
            otherwise: Joi.forbidden(),
          }),
          file_id: Joi.when("type", {
            switch: [
              { is: "image", then: Joi.string().required() },
              { is: "file", then: Joi.string().required() },
            ],
            otherwise: Joi.forbidden(),
          }),
        }).validate(message);
        if (error) {
          throw new Error(error);
        }
        // 加入時間戳
        message.time_stamp = new Date();
        socket.broadcast.emit("receiveMessage", message);
        // 儲存訊息到資料庫
        const chat = new Chat();
        const result = await chat.add_message(message);
        if (!result.acknowledged) {
          throw new Error("訊息儲存失敗");
        }
        if (typeof callback === "function") callback({ status: "success" });
      } catch (err) {
        if (typeof callback === "function")
          callback({
            status: "error",
            message: err.message || "伺服器錯誤",
          });
      }
    });

    /**
     * 當客戶端發送串流資訊時，將其轉發給其他客戶端
     * @param {string} recipient - 接收者的 socket ID | "all"
     * @param {Object} stream_info - 包含串流資訊的物件
     * @param {function} callback - 回調函數，用於處理回應
     */
    socket.on("sendStreamInfo", (recipient, stream_info, callback) => {
      try {
        // 驗證收件者資訊格式
        const validate_recipient_error = Joi.alternatives()
          .try(
            Joi.string().valid("all"),
            Joi.string().alphanum().min(1) // 也可為 socket.id
          )
          .required()
          .validate(recipient).error;
        // 驗證串流資訊格式
        const validate_stream_info_error = Joi.object({
          type: Joi.string().valid("screen", "camera", "mic").required(),
          stream_id: Joi.string().required(),
          user_id: Joi.string().required(),
        }).validate(stream_info).error;

        if (validate_recipient_error && validate_stream_info_error)
          throw new Error("參數驗證失敗");

        // 轉發串流資訊
        if (recipient === "all") {
          socket.broadcast.emit("getStreamInfo", stream_info);
        } else {
          io.to(recipient).emit("getStreamInfo", stream_info);
        }

        if (typeof callback === "function") {
          callback({ status: "success" });
        }
      } catch (err) {
        if (typeof callback === "function")
          callback({
            status: "error",
            message: err.message || "參數驗證失敗",
          });
        return;
      }
    });

    /**
     * 當客戶端發送串流控制事件時，將其轉發給其他客戶端
     * @param {string} event - 事件類型 "start" | "stop"
     * @param {Object} data - 包含事件相關資料的物件
     * @param {function} callback - 回調函數，用於處理回應
     */
    socket.on("streamControllerEvent", (event, data, callback) => {
      try {
        // 驗證事件格式
        const { error } = Joi.object({
          event: Joi.string().valid("start", "stop").required(),
          data: Joi.object().required(),
        }).validate({ event, data });
        if (error) {
          throw new Error("參數驗證失敗");
        }

        // 轉發事件
        socket.broadcast.emit("streamControllerEvent", { event, data });

        if (typeof callback === "function") {
          callback({ status: "success" });
        }
      } catch (err) {
        if (typeof callback === "function")
          callback({
            status: "error",
            message: err.message || "參數驗證失敗",
          });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket ${socket.id} disconnected`);
      socket.broadcast.emit("leaveRoom", socket.data.user_id);
    });
  });

  io.on("disconnect", async (socket) => {
    console.log(`Socket ${socket.id} disconnected`);
  });
}
