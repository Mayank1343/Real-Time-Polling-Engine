import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },

    // Stores a unique identifier for the voter.
    // For this assignment we'll use the request IP.
    voterId: {
      type: String,
      required: true,
    },

    selectedOption: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate votes for the same poll
voteSchema.index(
  {
    pollId: 1,
    voterId: 1,
  },
  {
    unique: true,
  }
);

const Vote = mongoose.model("Vote", voteSchema);

export default Vote;