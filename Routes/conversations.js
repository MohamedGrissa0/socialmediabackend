const router = require("express").Router();
const Conversation = require("../Models/Coversation");



router.post('/', async (req, res) => {

    const { senderId, receiverId } = req.body;

    try {
        // Check if the conversation already exists
        const existingConv = await Conversation.findOne({
            membres: { $all: [senderId, receiverId] }
        });

        if (existingConv) {
            // If it exists, return the existing conversation
            return res.status(201).json(existingConv);
        }

        // Create a new conversation if it doesn't exist
        const newConv = new Conversation({
            membres: [senderId, receiverId],
        });

        const savedConv = await newConv.save();
        res.status(200).json(savedConv);
    } catch (err) {
        res.status(500).json(err);
    }
});



//get conv of a user 

router.get('/:userId', async (req, res) => {
    try {
        const conv = await Conversation.find(
            {
                membres: { $in: [req.params.userId] }
            }
        )

        res.status(200).json(conv)
    }
    catch (err) {
        res.status(500).json(err)

    }
})

module.exports = router;
