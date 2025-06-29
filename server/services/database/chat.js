import client from "./mongodb.js";

const collection = client.collection("chat");
class Chat {
  async add_message(message) {
    const result = await collection.insertOne(message);
    return { acknowledged: result.acknowledged };
  }
  async get_all_message_by_room_id(room_id) {
    const result = await collection.find({ room_id: room_id }).toArray();
    return result;
  }
}

export default Chat;
