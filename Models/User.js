const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  coverPicture: {
    type: String,
    default: "",
  },
  followers: {
    type: Array,
    default: [],
  }, Requetes: {
    type: Array,
    default: [],
  }, Invitations: {
    type: Array,
    default: [],
  },

  isAdmin: {
    type: Boolean,
    default: false,
  },
  desc: {
    type: String,
  },
  city: {
    type: String,
    maxlength: 50,
  },
  from: {
    type: String,
    maxlength: 50,
  },
  relationship: {
    type: String,
  }, // New field for storing avatar path
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
