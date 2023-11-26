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

// //api
// //確認帳戶資料用
// app.post("/checkAccount", express.json(), async (req, res) => {
//   JSON.stringify(req.body);
//   // setTimeout(async() => res.send(await DB.getUserData(req.body.Email, req.body.Pwd)),5000)
//   res.send(await DB.getUserData(req.body.Email, req.body.Pwd));
// });
// //新增帳戶資料用
// app.post("/newAccount", express.json(), async (req, res) => {
//   JSON.stringify(req.body);
//   // setTimeout(async() => res.send(await DB.setUserData(req.body.Name, req.body.Email, req.body.Pwd)),5000)
//   res.send(await DB.setUserData(req.body.Name, req.body.Email, req.body.Pwd));
// });
// //修改帳戶資料
// app.patch("/changeAccountData", express.json(), async (req, res) => {
//   JSON.stringify(req.body);
//   res.send(
//     await DB.updateUserData(req.body.userID, req.body.pwd, req.body.data)
//   );
// });

// //接收檔案之格式處理
// //存至硬碟
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./files");
//   },
//   filename: (req, file, cb) => {
//     //修改檔名為 日期+原檔名(ex: 202361311619_Test data.docx)
//     var today = new Date();
//     today =
//       today.getFullYear().toString() +
//       today.getMonth().toString() +
//       today.getDate().toString() +
//       today.getHours().toString() +
//       today.getMonth().toString() +
//       today.getSeconds().toString();
//     cb(null, today + "_" + file.originalname);
//   },
// });
// const upload = multer({ storage: storage });
// //接收檔案
// app.post("/sendFile", upload.single("file"), async (req, res) => {
//   console.dir(req.method);
//   res.send(await DB.setFile(req.file.originalname, req.file.path));
// });
// //傳送檔案
// app.post("/getFile", express.json(), async (req, res) => {
//   console.dir(req.method);
//   JSON.stringify(req.body);
//   res.download(await (await DB.getFile(new ObjectId(req.body.fileID))).data);
// });
// //建立會議
// app.post("/CreatMeetingRoom", express.json(), async (req, res) => {
//   console.dir(req.method);
//   JSON.stringify(req.body);
//   res.send(await DB.creatMeetingRoom(req.body.UserID));
// });
// //確認會議室是否存在
// app.post("/checkMeeting", express.json(), async (req, res) => {
//   console.dir(req.method);
//   JSON.stringify(req.body);
//   if ((await DB.getMeetingRoomData(new ObjectId(req.body.RoomID))).type)
//     res.send({ type: true, reason: "" });
//   else res.send({ type: false, reason: "查無此會議" });
// });

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

  //繪圖用
  socket.on("drawing", (data) => {
    socket.broadcast.emit("drawing", data);
    console.log(data);
  });
});
