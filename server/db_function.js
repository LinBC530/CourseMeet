module.exports = {
  setUserData: setUserData,
  getUserData: getUserData,
  setChatRecord: setChatRecord,
  creatChatRoom: creatChatRoom,
  getChatRecord: getChatRecord
};

const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb://127.0.0.1:27017/";
const client = new MongoClient(uri);

//..................................................User.........................................................
//新增用戶資料至User Collectoin
async function setUserData(name, email, pwd) {
  //傳回之資料格式
  const data_out = {
    type: false,
    reason: "",
  };
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
        data_out.type = true;
        data_out.reason = "";
        return data_out;
      }
      //DB發生錯誤
      else {
        data_out.type = false;
        data_out.reason = "發生錯誤，請稍後再試";
        return data_out;
      }
    }
    //DB查無資料
    else {
      data_out.type = false;
      data_out.reason = "此信箱已被註冊";
      return data_out;
    }
  } catch {
    //此方法發生錯誤
    data_out.type = false;
    data_out.reason = "發生錯誤，請稍後再試";
    return data_out;
  }
}

//取得對應之用戶資料
async function getUserData(email, pwd) {
  //傳回之資料格式
  const data_out = {
    type: false,
    reason: "",
    data: null,
  };
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
        data_out.type = true;
        data_out.reason = "";
        data_out.data = { name: user.name };
        return data_out;
      }
      //密碼不相符
      else {
        data_out.type = false;
        data_out.reason = "密碼錯誤";
        data_out.data = null;
        return data_out;
      }
    }
    //DB查無資料
    else {
      data_out.type = false;
      data_out.reason = "此信箱尚未註冊帳戶";
      data_out.data = null;
      return data_out;
    }
  } catch {
    //此方法發生錯誤
    data_out.type = false;
    data_out.reason = "發生錯誤，請稍後再試";
    data_out.data = null;
    return data_out;
  }
}
//...............................................................................................................

//...............................................MeetingRoom.....................................................
//建立會議記錄(建立會議時)
async function creatChatRoom(roomID) {
  //傳回之資料格式
  const data_out = {
    type: false,
    reason: "",
  };
  try {
    const database = client.db("Meet");
    const Users = database.collection("MeetingRoom");
    //傳入之部分資料打包
    const data_in = {
      RoomID: roomID,
      Messages: [],
    };
    const result = await Users.insertOne(data_in);
    //收到DB資料
    if (result) {
      data_out.type = true;
      data_out.reason = "";
      return data_out;
    }
    //DB發生錯誤
    else {
      data_out.type = false;
      data_out.reason = "發生錯誤，請稍後再試";
      return data_out;
    }
  } catch {
    //此方法發生錯誤
    data_out.type = false;
    data_out.reason = "發生錯誤，請稍後再試";
    return data_out;
  }
}

async function setChatRecord(roomID, userID, msg) {
  //傳回之資料格式
  const data_out = {
    type: false,
    reason: "",
  };
  try {
    const database = client.db("Meet");
    const Users = database.collection("MeetingRoom");
    //傳入之部分資料打包
    const data_in = {
      UserID: userID,
      Message: msg,
    };
    const haveData = await Users.findOne({ RoomID: roomID });
    if (haveData) {
      const result = await Users.updateOne(
        { RoomID: roomID },
        { $push: { Messages: data_in } }
      );
      //收到DB資料
      if (result) {
        data_out.type = true;
        data_out.reason = "";
        return data_out;
      }
      //DB發生錯誤
      else {
        data_out.type = false;
        data_out.reason = "發生錯誤，請稍後再試";
        return data_out;
      }
    }
    //DB查無資料
    else {
      data_out.type = false;
      data_out.reason = "無此會議";
      return data_out;
    }
  } catch {
    //此方法發生錯誤
    data_out.type = false;
    data_out.reason = "發生錯誤，請稍後再試";
    return data_out;
  }
}

async function getChatRecord(roomID) {
  //傳回之資料格式
  const data_out = {
    type: false,
    reason: "",
    data: null
  };
  try {
    const database = client.db("Meet");
    const Users = database.collection("MeetingRoom");
    // //傳入之部分資料打包
    // const data_in = {
    //   RoomID: roomID,
    //   Messages: [],
    // };
    const result = await Users.findOne(roomID);
    //收到DB資料
    if (result) {
      data_out.type = true;
      data_out.reason = "";
      data_out.data = result.Messages;
      return data_out;
    }
    //DB發生錯誤
    else {
      data_out.type = false;
      data_out.reason = "發生錯誤，請稍後再試";
      data_out.data = null
      return data_out;
    }
  } catch {
    //此方法發生錯誤
    data_out.type = false;
    data_out.reason = "發生錯誤，請稍後再試";
    data_out.data = null
    return data_out;
  }
}

//...............................................................................................................
