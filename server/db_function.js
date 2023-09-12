const { ObjectId } = require("mongodb");

module.exports = {
  //user
  setUserData: setUserData,
  getUserData: getUserData,
  updateUserData: updateUserData,
  //meetingRoom
  creatMeetingRoom: creatMeetingRoom,
  getMeetingRoomData: getMeetingRoomData,
  //chatRoom
  creatChatRoom: creatChatRoom,
  setChatRecord: setChatRecord,
  getChatRecord: getChatRecord,
  //file
  setFile: setFile,
  getFile: getFile,
};

const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb://127.0.0.1:27017/";
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

//..................................................User.........................................................
//新增用戶資料至User Collectoin
async function setUserData(name, email, pwd) {
  //傳回之資料
  const data_out = new Data();
  try {
    const database = client.db("Meet");
    const Users = database.collection("User");
    //傳入之資料打包
    const data_in = {
      name: name,
      email: email,
      password: pwd,
    };
    const haveData = await Users.findOne({ email: data_in.email });
    if (!haveData) {
      const result = await Users.insertOne(data_in);
      //收到DB資料
      if (result) {
        data_out.success();
        return data_out;
      }
      //DB發生錯誤
      else {
        data_out.fail("發生錯誤，請稍後再試");
        return data_out;
      }
    }
    //DB查無資料
    else {
      data_out.fail("此信箱已被註冊");
      return data_out;
    }
  } catch {
    //此方法發生錯誤
    data_out.fail("發生錯誤，請稍後再試");
    return data_out;
  }
}

//取得對應之用戶資料
async function getUserData(email, pwd) {
  //傳回之資料格式
  const data_out = new Data();
  try {
    const database = client.db("Meet");
    const Users = database.collection("User");
    const data_in = {
      email: email,
      password: pwd,
    };
    const user = await Users.findOne({ email: data_in.email });
    //收到DB資料
    if (user) {
      //判斷密碼是否相符
      if (user.password == data_in.password) {
        data_out.success({
          userID: user._id.toString(),
          userName: user.name,
          userEmail: user.email,
        });
        return data_out;
      }
      //密碼不相符
      else {
        data_out.fail("密碼錯誤");
        return data_out;
      }
    }
    //DB查無資料
    else {
      data_out.fail("此信箱尚未註冊帳戶");
      return data_out;
    }
  } catch {
    //此方法發生錯誤
    data_out.fail("發生錯誤，請稍後再試");
    return data_out;
  }
}

async function updateUserData(id, pwd, data) {
  id = new ObjectId(id);
  if ("name" in data) data = { name: data.name };
  else if ("OldPwd" in data && "NewPwd" in data) data = { password: NewPwd };
  else data = {};
  //傳回之資料格式
  const data_out = new Data();
  try {
    const database = client.db("Meet");
    const Users = database.collection("User");
    // console.dir(data);

    const account = await Users.findOne({ _id: id, password: pwd });
    if (account) {
      // console.dir(data)
      const result = await Users.updateOne({ _id: id }, { $set: data });
      // console.dir(account)
      //收到DB資料
      if (result) {
        data_out.success();
        return data_out;
      }
      //DB發生錯誤
      else {
        data_out.fail("發生錯誤，請稍後再試");
        return data_out;
      }
    }
    //DB查無資料
    else {
      data_out.fail("此信箱已被註冊");
      return data_out;
    }
  } catch {
    //此方法發生錯誤
    data_out.fail("發生錯誤，請稍後再試");
    return data_out;
  }
}
//...............................................................................................................

//...............................................MeetingRoom.....................................................

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

//...............................................................................................................

//..................................................Files........................................................
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
    const result = await Users.findOne({ _id: fileID });
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
//...............................................................................................................
