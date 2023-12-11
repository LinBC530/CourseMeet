const express = require("express");
const DB = require('../db_function/main')
const { app } = require('./main')

//新增畫布
app.post("/wb/new/canvas", express.json(), async (req, res) => {
  JSON.stringify(req.body);
  res.send(await DB.creatCanvas(req.body.WhiteboardID));
});

//取得白板
app.post("/wb/get/whiteboard", express.json(), async (req, res) => {
  JSON.stringify(req.body);
  res.send(await DB.try_get_Whiteboard(req.body.MeetingRoomID));
});

//取得畫布
app.post("/wb/get/canvas", express.json(), async (req, res) => {
  JSON.stringify(req.body);
  res.send(await DB.getCanvas(req.body.WhiteboardID, req.body.canvasID));
});

//取得繪圖資料
// app.post("/wb/set/drawing", express.json(), async (req, res) => {
//   JSON.stringify(req.body);
//   // setTimeout(async() => res.send(await DB.setUserData(req.body.Name, req.body.Email, req.body.Pwd)),5000)
//   res.send(await DB.pushDrawingEvent(req.body.WhiteboardID, req.body.canvasID, req.body.events));
// });
