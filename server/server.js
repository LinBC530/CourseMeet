const DB = require("./db_function");
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const cors = require("cors");
const multer = require("multer");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 3000;

http.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

//啟用所有CORS請求
app.use(cors());

//api
//確認帳戶資料用
app.post("/checkAccount", express.json(), async (req, res) => {
  JSON.stringify(req.body);
  // setTimeout(async() => {res.send(await DB.getUserData(req.body.Email, req.body.Pwd))}, 5000)
  res.send(await DB.getUserData(req.body.Email, req.body.Pwd));
});
//新增帳戶資料用
app.post("/newAccount", express.json(), async (req, res) => {
  JSON.stringify(req.body);
  res.send(await DB.setUserData(req.body.Name, req.body.Email, req.body.Pwd));
});

//接收檔案之格式處理
//存至硬碟
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: (req, file, cb) => {
    //修改檔名為 日期+原檔名(ex: 202361311619_Test data.docx)
    var today = new Date();
    today =
      today.getFullYear().toString() +
      today.getMonth().toString() +
      today.getDate().toString() +
      today.getHours().toString() +
      today.getMonth().toString() +
      today.getSeconds().toString();
    cb(null, today + "_" + file.originalname);
  },
});
const upload = multer({ storage: storage });
//接收檔案
app.post("/sendFile", upload.single("file"), async (req, res) => {
  console.dir(req.method);
  res.send(await DB.setFile(req.file.originalname, req.file.path));
});
//傳送檔案
app.post("/getFile", express.json(), async (req, res) => {
  console.dir(req.method);
  JSON.stringify(req.body);
  res.download(await (await DB.getFile(new ObjectId(req.body.fileID))).data);
});
//建立會議
app.post("/CreatMeetingRoom", express.json(), async (req, res) => {
  console.dir(req.method);
  JSON.stringify(req.body);
  res.send(await DB.creatMeetingRoom(req.body.UserID));
});
//確認會議室是否存在
app.post("/checkMeeting", express.json(), async (req, res) => {
  console.dir(req.method);
  JSON.stringify(req.body);
  if ((await DB.getMeetingRoomData(new ObjectId(req.body.RoomID))).type)
    res.send({ type: true, reason: "" });
  else res.send({ type: false, reason: "查無此會議" });
});

// app.post("/setChatRecord", express.json(), async (req, res) => {
//   console.dir(req.method);
//   console.dir(JSON.stringify(req.body));
//   res.send(await DB.setChatRecord(new ObjectId(req.body.RoomID), req.body.userID, req.body.msg))
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
  // console.dir(socket.handshake.auth);
  socket.join(socket.handshake.auth.RoomID);
  // console.dir(socket.handshake.auth.RoomID)

  // socket.to(socket.handshake.auth.RoomID).emit("users_in_the_room", await getOnMeetingRoomUsers(socket.handshake.auth.RoomID));
  // console.log(await getOnMeetingRoomUsers(socket.handshake.auth.RoomID))

  console.log(socket.handshake.auth.userName + " 加入討論");

  socket.on("disconnect", () =>
    console.log(socket.handshake.auth.userName + " 離開討論")
  );

  //對新進用戶傳送目前會議訊息紀錄
  socket.on("allMessage", async (isOPEN) => {
    if (isOPEN)
      socket.emit(
        "allMessage",
        //取得訊息紀錄
        await (
          await DB.getChatRecord(socket.handshake.auth.RoomID)
        ).data
      );
  });

  //傳送訊息給所有用戶並儲存訊息
  socket.on("sendMessage", (msg) => {
    console.log(
      "type: " +
        msg.dataType +
        "\nname: " +
        msg.sender +
        "\nmessage: " +
        msg.content
    );
    // msg = {
    //   dataType: msg.dataType,
    //   sender: socket.handshake.auth.userName,
    //   content: msg.content,
    // };
    //紀錄聊天訊息
    DB.setChatRecord(
      new ObjectId(socket.handshake.auth.RoomID),
      msg.dataType,
      socket.handshake.auth.userID,
      socket.handshake.auth.userName,
      msg.content
    );
    io.to(socket.handshake.auth.RoomID).emit("sendMessage", msg);
  });

  //繪圖用
  socket.on("drawing", (data) => socket.broadcast.emit("drawing", data));
});
