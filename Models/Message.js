const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  conversationId: { type: String, required: true },
  text: { type: String, required: false },
  image: { type: String, default: null },
}, { timestamps: true });

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;
