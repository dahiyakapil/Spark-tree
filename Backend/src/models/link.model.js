import mongoose from "mongoose";

const linkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Link title is required"],
      trim: true,
    },
    url: {
      type: String,
      required: [true, "Link URL is required"],
      trim: true,
      match: [/^https?:\/\/.*/, "Please enter a valid URL"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Link", linkSchema);
