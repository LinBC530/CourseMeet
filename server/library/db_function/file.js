const { client, Data } = require("./mongo.js")
const { ObjectId } = require("mongodb");

module.exports = {
  setFile,
  getFile,
};

//儲存上傳之檔案
async function setFile(fileName, filePATH) {
  //傳回之資料格式
  const data_out = new Data();
  try {
    const database = client.db("Meet");
    const Users = database.collection("Files");
    const result = await Users.insertOne({
      fileName: fileName,
      path: filePATH,
    });
    //收到DB資料
    if (result) {
      data_out.success({
        fileID: result.insertedId.toString(),
        fileName: fileName,
      });
      return data_out;
    }
    //DB發生錯誤
    else {
      data_out.fail("發生錯誤，請稍後再試");
      return data_out;
    }
  } catch {
    //此方法發生錯誤
    data_out.fail("發生錯誤，請稍後再試");
    return data_out;
  }
}
//取得檔案路徑
async function getFile(fileID) {
  //傳回之資料格式
  const data_out = new Data();
  try {
    const database = client.db("Meet");
    const Users = database.collection("Files");
    const result = await Users.findOne({ _id: new ObjectId(fileID) });
    //收到DB資料
    if (result) {
      data_out.success(result.path);
      return data_out;
    }
    //DB發生錯誤
    
    else {
      data_out.fail("發生錯誤，請稍後再試");
      return data_out;
    }
  } catch {
    //此方法發生錯誤
    data_out.fail("發生錯誤，請稍後再試");
    return data_out;
  }
}
