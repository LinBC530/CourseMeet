import { ObjectId } from "mongodb";
import client from "./mongodb.js";

const collection = client.collection("verification");
class Verification {
  /**
   * 新增或更新驗證碼或令牌
   * @param {Object} params - 驗證碼或令牌的詳細資訊
   * @param {string} params.email - 使用者的電子郵件地址
   * @param {ObjectId} params.user_id - 使用者的ID（可選）
   * @param {string} params.purpose - 驗證的目的 register | reset_password
   * @param {string} params.token - 驗證碼或令牌
   * @param {Date} params.exp - 驗證碼或令牌的過期時間
   * @returns {Promise<Object>} 返回新增的結果
   */
  async upset({ email, user_id, purpose, token, exp }) {
    let result;
    switch (purpose) {
      case "register":
        result = await collection.updateOne(
          { email, purpose },
          {
            $set: {
              code: token,
              exp: exp,
            },
          },
          { upsert: true }
        );
        break;
      case "reset_password":
        result = await collection.updateOne(
          { user_id, purpose },
          {
            $set: {
              token,
              exp,
            },
          },
          { upsert: true }
        );
        break;
      default:
        throw new Error("Unsupported verification type");
    }
    return result;
  }

  /**
   * 刪除驗證碼或令牌
   * @param {string} id - 驗證碼或令牌的ID
   * @returns {Promise<{acknowledged: boolean}>} - 返回操作是否成功
   */
  async delete(id) {
    const result = await collection.deleteOne({
      _id: id,
    });
    return { acknowledged: result.acknowledged };
  }

  /**
   * 更新驗證碼或令牌
   * @param {Object} params - 包含更新資訊的物件
   * @param {string} params.email - 使用者的電子郵件地址（可選）
   * @param {ObjectId} params.user_id - 使用者的ID（可選）
   * @param {string} params.purpose - 驗證的目的 register | reset_password
   * @param {string} params.token - 新的驗證碼或令牌
   * @returns {Promise<{acknowledged: boolean}>} - 返回操作是否成功
   */
  async update({ email, user_id, purpose, token }) {
    let result;
    switch (purpose) {
      case "register":
        result = await collection.updateOne(
          { email: email, purpose: "register" },
          { $set: { code: token } }
        );
        break;
      case "reset_password":
        result = await collection.updateOne(
          { user_id: user_id, purpose: "reset_password" },
          { $set: { token: token } }
        );
        break;
      default:
        throw new Error("Unsupported verification type");
    }
    return { acknowledged: result.acknowledged };
  }

  /**
   * 獲取驗證碼或令牌
   * @param {Object} params - 包含查詢條件的物件
   * @param {string} params.email - 使用者的電子郵件地址（可選）
   * @param {ObjectId} params.user_id - 使用者的ID（可選）
   * @param {string} params.purpose - 驗證的目的 register | reset_password
   * @returns {Promise<Object|null>} 返回找到的驗證碼或令牌
   */
  async get({ email, token, purpose }) {
    let result;
    switch (purpose) {
      case "register":
        result = await collection.findOne({
          email: email,
          purpose: "register",
        });
        break;
      case "reset_password":
        result = await collection.findOne({
          token: token,
          purpose: "reset_password",
        });
        break;
      default:
        throw new Error("Unsupported verification type");
    }
    return result;
  }
}

export default Verification;
