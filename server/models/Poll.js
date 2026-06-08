import mongoose from "mongoose";

// Each option stores its text and current vote count
const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },

  votes: {
    type: Number,
    default: 0,
  },
});

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [optionSchema],
      validate: {
        validator: (value) => value.length >= 2,
        message: "A poll must have at least two options",
      },
    },

    // Open polls can receive votes,
    // closed polls are read-only.
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

const Poll = mongoose.model("Poll", pollSchema);

export default Poll;