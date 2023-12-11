const user = require("./user.js");
const meetingRoom = require("./meetingRoom.js");
const chatRoom = require("./chatRoom.js");
const file = require("./file.js");
const whiteboard = require("./Whiteboard.js")

module.exports = {
  //user
  newVerificationCode: user.newVerificationCode,
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

  //whiteBoard
  creatCanvas: whiteboard.creatCanvas,
  try_get_Whiteboard: whiteboard.try_get_Whiteboard,
  pushDrawingEvent: whiteboard.pushDrawingEvent,
  getCanvas: whiteboard.getCanvas
};
