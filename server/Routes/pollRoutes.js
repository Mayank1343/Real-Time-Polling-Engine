import express from "express";

import {
  createPoll,
  getPollById,
} from "../controllers/pollController.js";

const router = express.Router();

router.post("/", createPoll);

router.get("/:id", getPollById);

export default router;