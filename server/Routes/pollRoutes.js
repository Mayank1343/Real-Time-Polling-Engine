import express from "express";

import {
  createPoll,
  getPollById,
  votePoll,
  closePoll,
  getAllPolls,
} from "../controllers/pollController.js";

const router = express.Router();

router.get("/", getAllPolls);
router.post("/", createPoll);

router.get("/:id", getPollById);
router.post("/:id/vote", votePoll);
router.patch("/:id/close", closePoll);

export default router;