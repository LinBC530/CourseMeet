const { ObjectId } = require("mongodb");
const { client, Data } = require("./mongo.js");

module.exports = {
  setUserData,
  getUserData,
  updateUserData,
  removeUserData,
};

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
  //傳回之資料格式
  const data_out = new Data();

  if ("name" in data) data = { name: data.name };
  else if ("oldPwd" in data && "newPwd" in data) {
    if (data.oldPwd != data.newPwd) data = { password: data.newPwd };
    else {
      data_out.fail("新密碼與舊密碼相同");
      return data_out;
    }
  } else data = {};
  try {
    const database = client.db("Meet");
    const Users = database.collection("User");

    const account = await Users.findOne({ _id: id, password: pwd });
    if (account) {
      if (account.password != pwd) {
        data_out.fail("密碼錯誤");
        return data_out;
      }
      const result = await Users.updateOne({ _id: id }, { $set: data });
      //收到DB資料
      if (result) {
        data_out.success();
        return data_out;
      }
      //DB發生錯誤
      else throw new Error("DB error");
    }
    //DB查無資料
    else throw new Error("not finde account");
  } catch {
    //此方法發生錯誤
    data_out.fail("發生錯誤，請稍後再試");
    return data_out;
  }
}

async function removeUserData(id, pwd, data) {
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
