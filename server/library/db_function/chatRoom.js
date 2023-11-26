const { ObjectId } = require("mongodb");
const { client, Data } = require("./mongo.js")

module.exports = {
  creatChatRoom,
  setChatRecord,
  getChatRecord,
};

//建立聊天記錄(建立會議時)
async function creatChatRoom() {
  //傳回之資料格式
  const data_out = new Data();
  try {
    const database = client.db("Meet");
    const Users = database.collection("ChatRoom");
    //傳入之部分資料打包
    const data_in = {
      _id: new ObjectId(),
      Messages: [],
    };
    const result = await Users.insertOne(data_in);
    //收到DB資料
    if (result) {
      data_out.success({ chatRoomID: result.insertedId.toString() });
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

//儲存聊天紀錄
async function setChatRecord(roomID, message) {
  //傳回之資料格式
  const data_out = new Data();
  try {
    const database = client.db("Meet");
    const Meet = database.collection("MeetingRoom");
    const chat = database.collection("ChatRoom");
    const ChatRoomID = await (await Meet.findOne({ _id: roomID })).ChatRoomID;
    if (ChatRoomID) {
      const result = await chat.updateOne(
        { _id: new ObjectId(ChatRoomID) },
        { $push: { Messages: message } }
      );
      //收到DB資料
      if (result.matchedCount) {
        data_out.success();
        return data_out;
      }
      //DB發生錯誤
      else {
        data_out.fail("發生錯誤，請稍後再試");
        return data_out;
      }
    } else {
      data_out.fail("無此會議");
      return data_out;
    }
  } catch {
    //此方法發生錯誤
    data_out.fail("發生錯誤，請稍後再試");
    return data_out;
  }
}

async function getChatRecord(roomID) {
  //傳回之資料格式
  const data_out = new Data();
  try {
    const database = client.db("Meet");
    const Meet = database.collection("MeetingRoom");
    const Chat = database.collection("ChatRoom");
    const ChatRoomID = await (
      await Meet.findOne({ _id: new ObjectId(roomID) })
    ).ChatRoomID;
    if (ChatRoomID) {
      const result = await Chat.findOne({ _id: new ObjectId(ChatRoomID) });
      //收到DB資料
      if (result) {
        data_out.success(result.Messages);
        return data_out;
      }
      //DB發生錯誤
      else {
        data_out.fail("發生錯誤，請稍後再試");
        return data_out;
      }
    } else {
      data_out.fail("無此會議");
      return data_out;
    }
  } catch {
    //此方法發生錯誤
    data_out.fail("發生錯誤，請稍後再試");
    return data_out;
  }
}
