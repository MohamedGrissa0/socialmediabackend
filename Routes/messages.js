const router = require("express").Router();
const Message = require("../Models/Message");
const multer = require("multer")
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the upload directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Create a unique filename
  }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('image'), async (req, res) => {

  // Create an instance of the Message model
  const newMessage = new Message({
    sender: req.body.sender,
    conversationId: req.body.conversationId,
    text: req.body.text,
    image: req.file ? req.file.filename : null // Store the image filename if exists
  });

  try {
    const savedMessage = await newMessage.save(); // Now this will work since newMessage is a Mongoose document
    res.status(200).json(savedMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;

router.get('/last/:userId/:friendId', async (req, res) => {
    const { userId, friendId } = req.params;
  
    try {
      // Find the last message between the two users
      const lastMessage = await Message.findOne({
        $or: [
          { sender: userId, receiver: friendId },
          { sender: friendId, receiver: userId }
        ]
      })
      .sort({ createdAt: -1 }) // Sort by date descending
      .populate('sender', 'username avatar') // Populate sender data
      .exec();
  
      res.status(200).json(lastMessage || { text: "No messages yet" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch last message: " + err.message });
    }
});

  


router.get('/:convId', async (req, res) => {
    try {
        const msgs = await Message.find({
            conversationId : req.params.convId
        })

        res.status(200).json(msgs)
    }
    catch (err) {
        res.status(500).json(err)

    }
})

module.exports = router;
