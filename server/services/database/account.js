import client from "./mongodb.js";

const account_collection = client.collection("account");
class Account {
  async add(name, email, password) {
    const result = await account_collection.insertOne({
      name: name,
      email: email,
      password: password,
    });
    return result;
  }
  async updatedt_password(user_id, new_password) {
    const result = await account_collection.updateOne(
      { _id: user_id },
      { $set: { password: new_password } }
    );
    return result;
  }
  async get_one(user_id) {
    const result = await account_collection.findOne({ _id: user_id });
    return result;
  }
  async get_one_by_email(email) {
    const result = await account_collection.findOne({ email: email });
    return result;
  }
}

export default Account;
