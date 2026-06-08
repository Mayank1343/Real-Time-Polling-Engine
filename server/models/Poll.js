import mongoose from "mongoose";

// Each option stores its text and vote count
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
        validator: (options) => options.length >= 2,
        message: "A poll must have at least 2 options",
      },
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },

    // Automatic poll expiry
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Poll = mongoose.model("Poll", pollSchema);

export default Poll;