const { ObjectId } = require("mongodb");
const { client, Data } = require("./mongo.js");
const nodemailer = require("nodemailer");
const fs = require("fs");
require("dotenv").config({ path: "library/db_function/mail.env" });

module.exports = {
  newVerificationCode,
  setUserData,
  getUserData,
  updateUserData,
  removeUserData,
};

let mail;
fs.readFile("library/api/mail.html", "utf-8", function (err, data) {
  if (err) {
    console.error(err);
  } else {
    mail = data;
  }
});

async function newVerificationCode(email) {
  //傳回之資料
  const data_out = new Data();
  try {
    const database = client.db("Meet");
    const Users = database.collection("User");
    let result;
    const data_in = {
      email: email,
      VerificationCode: Math.floor(Math.random() * (9999 - 1000)) + 1000,
    };
    const haveData = await Users.findOne({ email: data_in.email });
    if (!haveData) result = await Users.insertOne(data_in);
    else if(haveData.password && haveData.name) {
      data_out.fail("此信箱已被註冊");
      return data_out;
    }
    else
      result = await Users.updateOne(
        { email: email },
        { $set: { VerificationCode: data_in.VerificationCode } }
      );
    //收到DB資料
    if (result) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

      await transporter.verify();

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: "AI學習平台-信箱驗證",
        html:
          mail +
          "<h1 style='color: rgb(50, 50, 209);'>" +
          data_in.VerificationCode.toString() +
          "</<h1>",
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) throw new Error("Error sending email");
      });
      data_out.success();
      return data_out;
    }
    //DB發生錯誤
    else {
      data_out.fail("發生錯誤，請稍後再試");
      return data_out;
    }
  } catch (e) {
    console.dir(e);
    //此方法發生錯誤
    data_out.fail("發生錯誤，請稍後再試");
    return data_out;
  }
}

async function setUserData(name, email, pwd, VerificationCode) {
  //傳回之資料
  const data_out = new Data();
  try {
    const database = client.db("Meet");
    const Users = database.collection("User");
    //傳入之資料打包
    const data_in = {
      name: name,
      // email: email,
      password: pwd,
    };
    const VC = await (await Users.findOne({ email: email })).VerificationCode;
    if (VC) {
      if (VC != VerificationCode) {
        data_out.fail("驗證碼錯誤");
        return data_out;
      }
    } else {
      data_out.fail("請先取得驗證碼");
      return data_out;
    }
    const result = await Users.updateOne(
      { email: email },
      { $set: data_in, $unset: { VerificationCode: "" } }
    );
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
