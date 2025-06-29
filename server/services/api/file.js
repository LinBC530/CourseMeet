import { Router } from "express";
import { celebrate, Joi, Segments } from "celebrate";
import { authorizeRoles } from "./jwt.js";
import Files from "../database/file.js";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
const router = Router();

// 檢查儲存資料夾是否存在，不存在就建立
const uploadDir = process.env.FILE_STORAGE_PATH;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // 設定檔案儲存路徑
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // 取得副檔名 (.type)
      const ext = path.extname(file.originalname);
      // 使用UUID+副檔名儲存
      const newName = uuidv4() + ext;
      cb(null, newName);
    },
  }),
  // 限制檔案大小為 30MB
  limits: { fileSize: 30 * 1024 * 1024 },
});

// 上傳檔案
router.post(
  "/",
  authorizeRoles(["user", "guest"]),
  upload.single("file"),
  async (req, res) => {
    try {
      const { originalname, size, filename } = req.file;
      const file_db = new Files();
      const { acknowledged, insertedId } = await file_db.add(
        originalname,
        size,
        filename
      );
      return acknowledged
        ? res.status(201).json({ file_id: insertedId })
        : res.status(500).json({ message: "上傳檔案失敗" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "伺服器錯誤" });
    }
  }
);

// 取得檔案
router.get(
  "/donwload/:file_id",
  authorizeRoles(["user", "guest"]),
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      file_id: Joi.string().required(),
    }),
  }),

  async (req, res) => {
    const { file_id } = req.params;
    try {
      const file_db = new Files();
      const file = await file_db.get_one(file_id);
      const filePath = path.join(process.env.FILE_STORAGE_PATH, file.path);
      return file
        ? res.status(200).download(filePath)
        : res.status(404).send("檔案不存在");
    } catch (err) {
      console.error(err);
      return res.status(500).send("伺服器錯誤");
    }
  }
);

export default router;
