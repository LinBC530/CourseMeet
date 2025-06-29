import client from "./mongodb.js";
import { ObjectId } from "mongodb";

const collection = client.collection("files");
class Files {
  async add(file_name, file_size, path) {
    const result = await collection.insertOne({
      name: file_name,
      size: file_size,
      path: path,
    });
    return {
      insertedId: result.insertedId,
      acknowledged: result.acknowledged,
    };
  }
  async get_one(file_id) {
    const result = await collection.findOne({ _id: new ObjectId(file_id) });
    if (!result) return null;
    try {
      return result;
    } catch (err) {
      throw new Error(err.message || "檔案讀取失敗");
    }
  }
}

export default Files;
