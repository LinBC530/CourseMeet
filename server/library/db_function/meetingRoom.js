const { ObjectId } = require("mongodb");
const { client, Data } = require("./mongo.js")

module.exports = {
  creatMeetingRoom,
  getMeetingRoomData
}

//建立會議記錄(建立會議時)
async function creatMeetingRoom(teacherID) {
  //傳回之資料格式
  const data_out = new Data();
  try {
    const database = client.db("Meet");
    const Users = database.collection("MeetingRoom");
    const chatRoomID = await (await creatChatRoom()).data.chatRoomID;
    //傳入之部分資料打包
    const data_in = {
      _id: new ObjectId(),
      Teacher: teacherID,
      Stuednts: [],
      ChatRoomID: chatRoomID,
    };
    const result = await Users.insertOne(data_in);
    //收到DB資料
    if (result) {
      data_out.success({
        MeetingRoomID: result.insertedId.toString(),
        ChatRoomID: chatRoomID,
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

//取得會議室資料
async function getMeetingRoomData(MeetingRoomID) {
  //傳回之資料格式
  const data_out = new Data();
  try {
    const database = client.db("Meet");
    const Users = database.collection("MeetingRoom");
    const result = await Users.findOne({ _id: MeetingRoomID });
    //收到DB資料
    if (result) {
      data_out.success(result);
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
