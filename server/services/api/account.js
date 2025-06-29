import { Router } from "express";
import { celebrate, Joi, Segments } from "celebrate";
import Account from "../database/account.js";
import Verification from "../database/verification_code.js";
import bcrypt from "bcryptjs";
import { sign_token } from "./jwt.js";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import { customAlphabet } from "nanoid";
import { authorizeRoles } from "./jwt.js";
const router = Router();
const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  32
);

// 發送驗證信箱的驗證碼
router.post(
  "/verification/email",
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().email().required(),
    }),
  }),
  async (req, res) => {
    const { email } = req.body;
    try {
      const account_db = new Account();
      const verification_code_db = new Verification();

      // 檢查信箱是否被註冊
      const existing_account = await account_db.get_one_by_email(email);
      if (existing_account) return res.status(409).send("此信箱已被註冊");

      // 產生6位數驗證碼
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // 儲存驗證碼到資料庫
      const { acknowledged } = await verification_code_db.upset({
        email: email,
        purpose: "register",
        token: code,
        exp: new Date(Date.now() + 60 * 60 * 1000),
      });
      if (!acknowledged) return res.status(500).send("儲存驗證碼失敗");

      // 設定nodemailer
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // 設定郵件內容
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "驗證碼",
        text: `您的驗證碼是 ${code}，有效時間為1小時。`,
      };

      // 發送郵件
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          return res.status(500).send("發送郵件失敗");
        }
      });

      return res.status(200).send("驗證碼已發送");
    } catch (err) {
      console.error(err);
      return res.status(500).send("伺服器錯誤");
    }
  }
);

// 註冊
router.post(
  "/register",
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(12).required(),
      name: Joi.string().required(),
      verification_code: Joi.string().length(6).required(),
    }),
  }),
  async (req, res) => {
    const { email, password, name, verification_code } = req.body;
    try {
      const account_db = new Account();
      const verification_code_db = new Verification();
      // 檢查信箱是否被註冊
      const existingAccount = await account_db.get_one_by_email(email);
      if (existingAccount) {
        return res.status(409).send("此信箱已被註冊");
      }
      // 驗證驗證碼與時間
      const verify = await verification_code_db.get({ email: email, purpose: "register"});
      if (!verify) {
        return res.status(400).send("驗證碼不存在或已過期");
      }

      // 驗證碼正確性
      if (verify.code !== verification_code) {
        return res.status(400).send("驗證碼錯誤");
      }

      // 驗證碼是否過期（1小時內有效）
      if (new Date() - verify._id.getTimestamp() > 60 * 60 * 1000) {
        return res.status(400).send("驗證碼已過期");
      }

      // 刪除驗證碼
      await verification_code_db.delete(verify._id);

      // 加密密碼
      const hashed_password = await bcrypt.hash(password, 10);
      const { acknowledged } = await account_db.add(
        name,
        email,
        hashed_password
      );
      return acknowledged
        ? res.status(201).send("註冊成功")
        : res.status(500).send("註冊失敗");
    } catch (err) {
      console.error(err);
      return res.status(500).send("伺服器錯誤");
    }
  }
);

// 登入
router.post(
  "/login/user",
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  async (req, res) => {
    const { email, password } = req.body;
    try {
      const account_db = new Account();

      // 檢查帳號是否存在
      const result = await account_db.get_one_by_email(email);
      if (result === null) {
        return res.status(404).send("查無此帳號");
      }

      // 檢查密碼
      const is_password_valid = await bcrypt.compare(password, result.password);
      if (!is_password_valid) {
        return res.status(401).send("密碼錯誤");
      }

      // 簽發 JWT token
      const token = sign_token({ id: result._id, role: "user" });

      return res.status(200).send({
        id: result._id,
        name: result.name,
        role: "user",
        token: token,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("伺服器錯誤");
    }
  }
);

/**
 * 訪客登入，取得訪客 token
 */
router.post(
  "/login/guest",
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required(),
    }),
  }),
  async (req, res) => {
    try {
      const { name } = req.body;
      const guestId = uuidv4();
      const token = sign_token({ id: guestId, name: name, role: "guest" });
      return res
        .status(200)
        .send({ token, guest: true, name: name, id: guestId });
    } catch (err) {
      console.error(err);
      return res.status(500).send("伺服器錯誤");
    }
  }
);

// 取得帳戶資訊
router.get(
  "/:user_id",
  authorizeRoles(["user", "guest"]),
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      user_id: Joi.number().integer().min(1).required(),
    }),
  }),
  async (req, res) => {
    const { user_id } = req.params;
    try {
      const account = new Account();
      const result = await account.get_one(user_id);
      return res.send(result);
    } catch (err) {
      console.error(err);
      return res.status(500).send("伺服器錯誤");
    }
  }
);

// 重置密碼
router.post(
  "/verification/token",
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().email().required(),
    }),
  }),
  async (req, res) => {
    const { email } = req.body;
    try {
      // 檢查信箱是否存在
      const account_db = new Account();
      const verification_code_db = new Verification();
      const existing_account = await account_db.get_one_by_email(email);
      if (!existing_account) {
        return res.status(404).send("查無此信箱");
      }
      const user_id = existing_account._id;
      const token = nanoid();
      const url = `https://${process.env.DOMAIN}/resetpassword/${token}`;

      const result = await verification_code_db.upset({
        user_id: user_id,
        purpose: "reset_password",
        token: token,
        exp: new Date(Date.now() + 60 * 60 * 1000), // 1小時後過期
      });

      if (!result.acknowledged) {
        return res.status(500).send("儲存重置密碼令牌失敗");
      }

      // 設定nodemailer
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // 設定郵件內容
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "重置密碼",
        text: `您的重置密碼連結是 ${url}，有效時間為1小時。`,
      };

      // 發送郵件
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          return res.status(500).send("發送郵件失敗");
        }
      });

      return res.status(200).send("重置信件已發送");
    } catch (err) {
      console.error(err);
      return res.status(500).send("伺服器錯誤");
    }
  }
);

// 重置密碼
router.post(
  "/reset/password",
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      token: Joi.string().required(),
      new_password: Joi.string().required(),
    }),
  }),
  async (req, res) => {
    const { new_password, token } = req.body;
    try {
      const verification_code_db = new Verification();
      const account_db = new Account();

      // 檢查令牌是否存在
      const verify = await verification_code_db.get({
        token: token,
        purpose: "reset_password",
      });
      if (!verify) {
        return res.status(400).send("令牌不存在或已過期");
      }

      // 檢查令牌是否過期
      if (new Date() - verify._id.getTimestamp() > 60 * 60 * 1000) {
        return res.status(400).send("令牌已過期");
      }

      // 更新密碼
      const hashed_password = await bcrypt.hash(new_password, 10);
      const result = await account_db.updatedt_password(
        verify.user_id,
        hashed_password
      );
      if (!result.acknowledged) {
        return res.status(500).send("更新密碼失敗");
      }

      // 刪除令牌
      await verification_code_db.delete(verify._id);

      return res.status(200).send("密碼重置成功");
    } catch (err) {
      console.error(err);
      return res.status(500).send("伺服器錯誤");
    }
  }
);

export default router;
