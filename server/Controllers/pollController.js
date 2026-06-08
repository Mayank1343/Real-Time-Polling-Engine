import Poll from "../models/Poll.js";
import Vote from "../models/Vote.js";
import { io } from "../server.js";

/*
 * Create a new poll
 * Expects:
 * {
 *   question: "...",
 *   options: ["A", "B", "C"]
 * }
 */
export const createPoll = async (req, res) => {
  try {
    const { question, options } = req.body;

    if (!question || !options || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Question and at least two options are required",
      });
    }

    const formattedOptions = options.map((option) => ({
      text: option,
    }));

    const poll = await Poll.create({
      question,
      options: formattedOptions,
    });

    res.status(201).json({
      success: true,
      poll,
    });
  } catch (error) {
    console.error("Create Poll Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create poll",
    });
  }
};

/*
 * Fetch a single poll by id
 */
export const getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found",
      });
    }

    res.status(200).json({
      success: true,
      poll,
    });
  } catch (error) {
    console.error("Get Poll Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch poll",
    });
  }
};

/*
 * Cast a vote on a poll
 * Body:
 * {
 *   optionIndex: 0
 * }
 */
export const votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const pollId = req.params.id;

    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found",
      });
    }

    // Closed polls cannot receive votes
    if (poll.status === "closed") {
      return res.status(400).json({
        success: false,
        message: "Voting has been closed",
      });
    }

    // Validate selected option
    if (
      optionIndex === undefined ||
      optionIndex < 0 ||
      optionIndex >= poll.options.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid option selected",
      });
    }

    // Using IP as voter identity for this assignment
    const voterId =
        req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const existingVote = await Vote.findOne({
      pollId,
      voterId,
    });

    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: "You have already voted on this poll",
      });
    }

    // Save vote record
    await Vote.create({
      pollId,
      voterId,
      selectedOption: optionIndex,
    });

    // Increment vote count
    poll.options[optionIndex].votes += 1;

    await poll.save();

    // Broadcast updated poll results
    io.to(pollId).emit("poll-updated", poll);

    res.status(200).json({
      success: true,
      message: "Vote recorded successfully",
      poll,
    });
  } catch (error) {
    console.error("Vote Poll Error:", error);

    // Handles duplicate key race conditions
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate vote detected",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to record vote",
    });
  }
};


/*
 * Close a poll manually
 * Once closed, no further votes are allowed
 */
export const closePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found",
      });
    }

    if (poll.status === "closed") {
      return res.status(400).json({
        success: false,
        message: "Poll is already closed",
      });
    }

    poll.status = "closed";

    await poll.save();

    // Notify connected clients immediately
    io.to(poll._id.toString()).emit("poll-updated", poll);

    res.status(200).json({
      success: true,
      message: "Poll closed successfully",
      poll,
    });
  } catch (error) {
    console.error("Close Poll Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to close poll",
    });
  }
};

//Recent Polls Dashboard
export const getAllPolls = async (req, res) => {
    try {
        const polls = await Poll.find()
        .sort({ createdAt: -1 })
        .limit(20);

        res.status(200).json({
        success: true,
        polls,
        });
    } catch (error) {
        console.error("Get All Polls Error:", error);

        res.status(500).json({
        success: false,
        message: "Failed to fetch polls",
        });
    }
    };