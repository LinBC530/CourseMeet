import express from "express";
import { errors } from "celebrate";
import account from "./account.js";
import file from "./file.js";
import room from "./room.js";

const router = express.Router();
router.use(express.json());
router.use("/account", account);
router.use("/files", file);
router.use("/room", room);


router.use(errors());

export default router;
