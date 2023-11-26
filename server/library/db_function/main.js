const user = require("./user.js");
const meetingRoom = require("./meetingRoom.js");
const chatRoom = require("./chatRoom.js");
const file = require("./file.js");

module.exports = {
  //user
  setUserData: user.setUserData,
  getUserData: user.getUserData,
  updateUserData: user.updateUserData,

  //meetingRoom
  creatMeetingRoom: meetingRoom.creatMeetingRoom,
  getMeetingRoomData: meetingRoom.getMeetingRoomData,

  //chatRoom
  creatChatRoom: chatRoom.creatChatRoom,
  setChatRecord: chatRoom.setChatRecord,
  getChatRecord: chatRoom.getChatRecord,

  //file
  setFile: file.setFile,
  getFile: file.getFile,
};
