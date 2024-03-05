require("dotenv").config({ path: "./server.env" });

// OpenAI
const OpenAI = require("openai").default;
const openai = new OpenAI({ apiKey: process.env.openai_key });

// MongoDB
const DB = require("./library/db_function/main");

// SSL
const fs = require("fs");
const options = {
  key: fs.readFileSync(process.env.ssl_key),
  cert: fs.readFileSync(process.env.ssl_cert),
};

// Express
const express = require("express");
const { app } = require("./library/api/main");
const https = require("https").Server(options, app);
const path = require("path");
// const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 3000;

// socket.io
const io = require("socket.io")(https, { maxHttpBufferSize: 1e8 });

// 使用網站檔案
app.use(express.static(path.resolve("../dist/spa")));

https.listen(port, () => {
  console.log(`Server running at https://localhost:${port}/`);
});

//取得在會議室中的用戶的資訊
async function getOnMeetingRoomUsers(RoomID) {
  const users = [];
  for (let socket of await io.in(RoomID).fetchSockets()) {
    users.push({
      userID: socket.handshake.auth.userID,
      userName: socket.handshake.auth.userName,
    });
  }
  return users;
}

function current_time() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();
  const minute = now.getMinutes();

  const currentTime = `${year}/${month}/${day} ${hour >= 12 ? "PM" : "AM"} ${hour % 12}:${minute < 10 ? "0" + minute : minute}`;
  return currentTime;
}

io.on("connection", async (socket) => {
  //加入至對應房間
  socket.join(socket.handshake.auth.RoomID);

  //傳送房間內所有用戶
  io.to(socket.handshake.auth.RoomID).emit(
    "users_in_the_room",
    await getOnMeetingRoomUsers(socket.handshake.auth.RoomID)
  );

  console.log(socket.handshake.auth.userName + " 加入討論");

  socket.on("disconnect", async () => {
    //傳送房間內所有用戶
    io.to(socket.handshake.auth.RoomID).emit(
      "users_in_the_room",
      await getOnMeetingRoomUsers(socket.handshake.auth.RoomID)
    );
    console.log(socket.handshake.auth.userName + " 離開討論");
  });

  //對新進用戶傳送目前會議訊息紀錄
  socket.emit(
    "allMessage",
    //取得訊息紀錄
    await (
      await DB.getChatRecord(socket.handshake.auth.RoomID)
    ).data
  );

  //傳送訊息給所有用戶並儲存訊息
  socket.on("sendMessage", async (msg) => {
    //紀錄聊天訊息
    msg.senderID = socket.handshake.auth.userID;
    // DB.setChatRecord(new ObjectId(socket.handshake.auth.RoomID), msg);
    DB.setChatRecord(socket.handshake.auth.RoomID, msg);
    io.to(socket.handshake.auth.RoomID).emit("sendMessage", msg);
    // gpt
    if (msg.recipient == "GPT" || msg.recipient == "gpt") {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: msg.content.slice(msg.content.indexOf(" ")),
          },
        ],
      });
      msg = {
        dataType: "GPT",
        recipient: "all",
        sender: "GPT",
        content: response.choices[0].message.content,
        time: current_time(),
      };
      // DB.setChatRecord(new ObjectId(socket.handshake.auth.RoomID), msg);
      DB.setChatRecord(socket.handshake.auth.RoomID, msg);
      io.to(socket.handshake.auth.RoomID).emit("sendMessage", msg);
    }
  });

  // GPT
  socket.on("GPT_function", async (data) => {
    let messages;
    switch (data.dataType) {
      case "c_to_e":
        messages = [
          { role: "system", content: "直接翻譯為英文" },
          { role: "user", content: data.content },
        ];
        break;
      case "e_to_c":
        messages = [
          { role: "system", content: "直接翻譯為中文" },
          { role: "user", content: data.content },
        ];
        break;
      case "explain":
        messages = [
          { role: "system", content: "詳細解釋內容" },
          { role: "user", content: data.content },
        ];
        break;
      case "focus":
        messages = [
          { role: "system", content: "做重點整理" },
          { role: "user", content: data.content },
        ];
        break;
      default:
        break;
    }
    data.dataType = "msg";
    socket.emit("GPT_function", data);
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });
    const msg = {
      dataType: "GPT",
      sender: "GPT",
      content: response.choices[0].message.content,
      time: current_time(),
    };
    socket.emit("GPT_function", msg);
  });

  // 繪圖用
  socket.on("drawing", (data) => {
    socket.broadcast.emit("drawing", data.drawing_event);
    DB.pushDrawingEvent(data.WhiteboardID, data.canvasID, data.drawing_event);
  });

  socket.on("canvas", (data) => {
    socket.broadcast.emit("canvas", data);
  });
});
