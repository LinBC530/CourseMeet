const express = require("express");
const app = express();
const cors = require("cors");

// 設定cors
// app.use(cors({origin: ['http://localhost:9000','https://localhost:3000', process.env.server_url]}))
app.use(cors({origin: ['http://localhost:9000','https://localhost:3000']}))


module.exports = {
  app,
}
require('./account')
require('./file')
require('./meet')
require('./Whiteboard')
