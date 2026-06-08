import express from "express";

import {
  createPoll,
  getPollById,
  votePoll,
} from "../controllers/pollController.js";

const router = express.Router();

router.post("/", createPoll);

router.get("/:id", getPollById);

router.post("/:id/vote", votePoll);

export default router;