const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
   
    membres: {
      type: [],
    },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", ConversationSchema);
