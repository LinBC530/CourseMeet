const DB = require("./db_function");
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const cors = require("cors");
const port = process.env.PORT || 3000;

http.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

//啟用所有CORS請求
app.use(cors());

//api
//確認帳戶資料用
app.post("/checkAccount", express.json(), async (req, res) => {
  console.dir(req.method);
  JSON.stringify(req.body);
  // setTimeout(async() => {res.send(await DB.getUserData(req.body.Email, req.body.Pwd))}, 5000)
  res.send(await DB.getUserData(req.body.Email, req.body.Pwd));
});
//新增帳戶資料用
app.post("/newAccount", express.json(), async (req, res) => {
  console.dir(req.method);
  JSON.stringify(req.body);
  res.send(await DB.setUserData(req.body.Name, req.body.Email, req.body.Pwd));
});
//test
// app.post("/test", express.json(), async (req, res) => {
//   console.dir(req.method);
//   console.dir(JSON.stringify(req.body))
//   res.send(await DB.setChatRecord(req.body.roomID, req.body.userID, req.body.msg));
// });
// app.post("/test2", express.json(), async (req, res) => {
//   console.dir(req.method);
//   console.dir(JSON.stringify(req.body))
//   res.send(await DB.creatChatRoom(req.body.roomID));
// });

//所有聊天訊息
var msgs = [];

io.on("connection", async (socket) => {
  console.log("a user connection");

  socket.on("disconnect", () => {
    console.log("a user disconnected");
  });
  //對新進用戶傳送所有訊息
  socket.emit("allMessage", msgs);
  // socket.emit("allMessage", await DB.getChatRecord("123"));

  //傳送訊息給所有用戶並將訊息存至msgs
  socket.on("sendMessage", (msg) => {
    console.log("name: " + msg.name + "\nmessage: " + msg.message);
    msgs.push(msg);
    DB.setChatRecord(msg.roomID, msg.name, msg.message)
    io.emit("sendMessage", msg);
  });

  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
});
