import Poll from "../models/Poll.js";

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