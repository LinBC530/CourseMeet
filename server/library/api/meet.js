const express = require("express");
const DB = require('../db_function/main')
const ObjectId = require("mongodb").ObjectId;
const { app } = require('./main')

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
  // if ((await DB.getMeetingRoomData(new ObjectId(req.body.RoomID))).type)
  if ((await DB.getMeetingRoomData(req.body.RoomID)).type)
    res.send({ type: true, reason: "" });
  else res.send({ type: false, reason: "查無此會議" });
});
