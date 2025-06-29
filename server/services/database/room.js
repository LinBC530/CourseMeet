import client from "./mongodb.js";

const collection = client.collection("rooms");
class Room {
  async create(room_id) {
    const result = await collection.insertOne({ room_id: room_id });
    return { acknowledged: result.acknowledged };
  }
  async get(room_id) {
    const result = await collection.findOne({ room_id: room_id });
    return result;
  }
}

export default Room;
