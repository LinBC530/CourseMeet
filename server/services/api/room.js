import { Router } from "express";
import Room from "../database/room.js";
import { authorizeRoles } from "./jwt.js";
import { customAlphabet } from "nanoid";
const router = Router();
const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  8
);

// 新增房間
router.post("/", authorizeRoles(["user", "guest"]), async (req, res) => {
  try {
    const room_db = new Room();
    const MAX_ATTEMPTS = 10;
    let room_id, existence_room;

    // 嘗試生成唯一的房間ID
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      room_id = nanoid();
      existence_room = await room_db.get({ room_id });
      if (!existence_room) break;
    }

    if (existence_room) {
      return res
        .status(500)
        .json({ message: "無法生成唯一的房間ID，請稍後再試" });
    }

    const { acknowledged } = await room_db.create(room_id);

    return acknowledged
      ? res.status(201).json({ room_id })
      : res.status(500).json({ message: "創建房間失敗" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "伺服器錯誤" });
  }
});

router.get("/:room_id", authorizeRoles(["user", "guest"]), async (req, res) => {
  const { room_id } = req.params;
  try {
    const room_db = new Room();
    const room = await room_db.get(room_id);

    if (!room) {
      return res.status(404).json({ message: "房間不存在" });
    }

    return res.status(200).json(room);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "伺服器錯誤" });
  }
});

export default router;
