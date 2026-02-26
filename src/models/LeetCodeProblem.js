import mongoose from "mongoose";

const LeetCodeProblemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    titleSlug: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    content: {
      type: String, // Problem description HTML/Markdown
    },
    userCode: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      default: "javascript",
    },
    tags: [String],
    solved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.models.LeetCodeProblem ||
  mongoose.model("LeetCodeProblem", LeetCodeProblemSchema);
