const MongoClient = require("mongodb").MongoClient;
require("dotenv").config({ path: "../../server.env" });
// const uri = "mongodb://127.0.0.1:27017/";
const uri = process.env.mongodb_url
const client = new MongoClient(uri);

class Data {
  constructor() {
    this.type = false;
    this.reason = "";
    this.data = null;
  }
  success(data) {
    this.type = true;
    if (data) this.data = data;
  }
  fail(reason) {
    this.reason = reason;
  }
}

module.exports = {client, Data}
