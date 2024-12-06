const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      max: 500,
      required: true,
    },
    username: {
      type: String,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    imgs: {
      type: [],
    },
    tagsFriends: {
      type: [],
    },
    likes: {
      type: Array,
      default: [],
    },
    dislikes: {
      type: Array,
      default: [],
    },
    comments: {
      type: Array,
      default: [],
    },
    location: {
      type: String,

    },
    feeling: {
      type: String,

    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
