const { ObjectId } = require("mongodb");
const { client, Data } = require("./mongo.js");

module.exports = {
  creatCanvas,
  try_get_Whiteboard,
  pushDrawingEvent,
  getCanvas,
};

async function try_get_Whiteboard(MeetingRoomID) {
  const data_out = new Data();
  try {
    const database = client.db("Meet");
    const WB = database.collection("Whiteboard");
    const Whiteboard = await WB.aggregate([
      // { $match: { MeetingRoomID: new ObjectId(MeetingRoomID) } },
      { $match: { MeetingRoomID: MeetingRoomID } },
      { $project: { allCanvasID: "$canvas._id" } },
    ]).toArray();

    if (!Whiteboard[0]) {
      // 傳入之部分資料打包
      const data_in = {
        _id: new ObjectId(),
        // MeetingRoomID: new ObjectId(MeetingRoomID),
        MeetingRoomID: MeetingRoomID,
        canvas: [],
      };
      // data_in.canvas.push(await creatCanvas(data_in._id))
      const result = await WB.insertOne(data_in);
      const canvas = await creatCanvas(data_in._id);
      // 收到DB資料
      if (result && canvas.type) {
        data_out.success({
          WhiteboardID: result.insertedId,
          allCanvasID: [canvas.data.canvasID],
          // canvasID: canvas.data.canvasID,
          // canvas_total: 1,
        });
        return data_out;
      }
      // DB發生錯誤
      else throw new Error("error");
    } else {
      const drawing_event = await (await getCanvas(Whiteboard[0]._id, Whiteboard[0].allCanvasID[0])).data.canvas.drawing_event
      data_out.success({
        WhiteboardID: Whiteboard[0]._id,
        allCanvasID: Whiteboard[0].allCanvasID,
        drawing_event: drawing_event,
      });
      return data_out;
    }
  } catch (e) {
    // 此方法發生錯誤
    data_out.fail("發生錯誤，請稍後再試....");
    return data_out;
  }
}

async function creatCanvas(WB_ID) {
  //傳回之資料格式
  const data_out = new Data();
  try {
    const database = client.db("Meet");
    const WB = database.collection("Whiteboard");
    // 傳入之部分資料打包
    const data_in = {
      _id: new ObjectId(),
      WhiteboardID: new ObjectId(WB_ID),
      drawing_event: [],
    };
    const result = await WB.updateOne(
      { _id: new ObjectId(WB_ID) },
      { $push: { canvas: data_in } }
    );
    //收到DB資料
    if (result.matchedCount) {
      data_out.success({ canvasID: data_in._id.toString() });
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

// async function removeCanvas(WB_ID, canvas_ID) {
//   //傳回之資料格式
//   const data_out = new Data();
//   try {
//     const database = client.db("Meet");
//     const WB = database.collection("Whiteboard");
//     // 傳入之部分資料打包
//     const data_in = {
//       _id: new ObjectId(),
//       WhiteboardID: WB_ID,
//       drawing_event: [],
//     };
//     const result = await WB.updateOne(
//       { _id: new ObjectId(WB_ID) },
//       { $push: { canvas: data_in } }
//     );
//     //收到DB資料
//     if (result.matchedCount) {
//       data_out.success({ canvasID: data_in._id.toString() });
//       return data_out;
//     }
//     //DB發生錯誤
//     else {
//       data_out.fail("發生錯誤，請稍後再試");
//       return data_out;
//     }
//   } catch {
//     //此方法發生錯誤
//     data_out.fail("發生錯誤，請稍後再試");
//     return data_out;
//   }
// }

// 取得指定畫布資料
async function getCanvas(WB_ID, canvas_ID) {
  //傳回之資料格式
  const data_out = new Data();
  try {
    const database = client.db("Meet");
    const WB = database.collection("Whiteboard");
    const result = await WB.aggregate([
      { $match: { _id: new ObjectId(WB_ID) } },
      { $unwind: { path: "$canvas" } },
      { $match: { "canvas._id": new ObjectId(canvas_ID) } },
      { $project: { _id: 0, canvas: 1 } },
    ]).toArray();
    //收到DB資料
    if (result.length) {
      data_out.success({ canvas: result[0].canvas });
      return data_out;
    }
    //DB發生錯誤
    else {
      data_out.fail("發生錯誤，請稍後再試");
      return data_out;
    }
  } catch(e) {
    //此方法發生錯誤
    console.log(e)
    data_out.fail("發生錯誤，請稍後再試");
    return data_out;
  }
}

async function pushDrawingEvent(WB_ID, canvasID, events) {
  //傳回之資料格式
  const data_out = new Data();
  try {
    const database = client.db("Meet");
    const WB = database.collection("Whiteboard");
    // 傳入之部分資料打包
    const result = await WB.updateOne(
      {
        _id: new ObjectId(WB_ID),
        canvas: { $elemMatch: { _id: new ObjectId(canvasID) } },
      },
      { $push: { "canvas.$.drawing_event": events } }
    );
    //收到DB資料
    if (result.matchedCount) {
      data_out.success({ canvasID: data_in._id.toString() });
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
