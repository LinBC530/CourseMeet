const OpenAI = require("openai").default;
const openai = new OpenAI({
  apiKey: "API_KEY",
});
const express = require('express')
const DB = require("./library/db_function/main");
const { app } = require("./library/api/main");
const fs = require("fs");
var options = {
  key: fs.readFileSync("C:/Users/user/Desktop/SSL/server.key"),
  cert: fs.readFileSync("C:/Users/user/Desktop/SSL/server.crt"),
};
const https = require("https").Server(options, app);
const io = require("socket.io")(https);
const path = require("path");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 3000;

// 使用網站檔案
app.use(express.static(path.resolve('../dist/spa')));

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
    console.dir(msg);
    DB.setChatRecord(new ObjectId(socket.handshake.auth.RoomID), msg);
    io.to(socket.handshake.auth.RoomID).emit("sendMessage", msg);
    // gpt
    if (msg.recipient == "GPT") {
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
      };
      console.dir(msg.content);
      DB.setChatRecord(new ObjectId(socket.handshake.auth.RoomID), msg);
      io.to(socket.handshake.auth.RoomID).emit("sendMessage", msg);
    }
  });

  // 繪圖用
  socket.on("drawing", (data) => {
    socket.broadcast.emit("drawing", data);
    console.log(data);
  });
});
