const express = require("express");
const DB = require('../db_function/main')
const { app } = require('./main')

//api
//確認帳戶資料用
app.post("/checkAccount", express.json(), async (req, res) => {
  JSON.stringify(req.body);
  // setTimeout(async() => res.send(await DB.getUserData(req.body.Email, req.body.Pwd)),5000)
  res.send(await DB.getUserData(req.body.Email, req.body.Pwd));
});
//新增帳戶資料用
app.post("/newAccount", express.json(), async (req, res) => {
  JSON.stringify(req.body);
  // setTimeout(async() => res.send(await DB.setUserData(req.body.Name, req.body.Email, req.body.Pwd)),5000)
  res.send(await DB.setUserData(req.body.Name, req.body.Email, req.body.Pwd));
});
//修改帳戶資料
app.patch("/changeAccountData", express.json(), async (req, res) => {
  JSON.stringify(req.body);
  res.send(
    await DB.updateUserData(req.body.userID, req.body.pwd, req.body.data)
  );
});
