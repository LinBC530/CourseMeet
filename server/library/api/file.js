const express = require("express");
const multer = require("multer");
// const ObjectId = require("mongodb").ObjectId;
const DB = require('../db_function/main')
const { app } = require('./main')

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
  // res.download(await (await DB.getFile(new ObjectId(req.body.fileID))).data);
  res.download(await (await DB.getFile(req.body.fileID)).data);
});
