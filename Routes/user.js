const express = require("express");
const router = express.Router();
const User = require("../Models/User");
const Post = require("../Models/Post");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const upload = require("./multer"); // Import multer setup
const Message = require("../Models/Message")
// GET route to fetch users except the user with the given ID


router.get('/id/search', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
router.get("/followers/:id", async (req, res) => {
    const userId = req.params.id;

    try {
        // Fetch the user by their ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch the followers' details
        const followerIds = user.followers.map(follower => follower._id);
        const followersDetails = await User.find({ _id: { $in: followerIds } }, 'username avatar');

        // Create a mapping of follower details
        const updatedFollowers = followersDetails.map(follower => ({
            id: follower._id,
            username: follower.username,
            profilePicture: follower.avatar,
        }));

        res.status(200).json({ followers: updatedFollowers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});





// Middleware to check if a user is authenticated (if needed)

// Fetch friend status
// Assuming you have express and User model set up
router.get("/friendship-status/:friendid/:userid", async (req, res) => {
    const { friendid, userid } = req.params;

    try {
        const userfriend = await User.findById(friendid);
        const user = await User.findById(userid);

        if (!userfriend || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const requestSent = user.Requetes?.some(f => f.id.toString() === friendid);
        const invitationReceived = user.Invitations?.some(f => f.id.toString() === friendid);
        const areFriends = user.followers?.some(f => f._id.toString() === friendid);
        res.status(200).json({ requestSent, invitationReceived, areFriends });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
});



router.get("/:id", async (req, res) => {
    const userId = req.params.id;

    try {
        // Fetch all users except the one with the provided userId
        const users = await User.find({ _id: { $ne: userId } });

        res.status(200).json({ users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});








router.get("/profil/:id", async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.get("/getuser/:id", async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user); // Return user directly
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/friend/:id", async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});



router.post("/request/:friendid/:userid", async (req, res) => {
    try {

        const { friendid, userid } = req.params;
        console.log(friendid)
        console.log(userid)

        const userfriend = await User.findById(friendid);
        const user = await User.findById(userid);

        if (!userfriend || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        userfriend.Requetes.push({
            id: user._id,
            username: user.username,
            profilePicture: user.avatar,
        });
        user.Invitations.push({
            id: userfriend._id,
            username: userfriend.username,
            profilePicture: userfriend.avatar,
        });

        await userfriend.save();
        await user.save();

        res.status(200).json({message :"Request Sent" , user});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
});;


router.post("/remove/:friendid/:userid", async (req, res) => {
    try {
        const { friendid, userid } = req.params;

        const userfriend = await User.findById(friendid);
        const user = await User.findById(userid);

        if (!userfriend || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove the request from userfriend's Requetes
        userfriend.Invitations = userfriend.Invitations.filter((f) => f.id.toString() !== userid);

        // Remove the invitation from user's Invitations
        user.Requetes = user.Requetes.filter((f) => f.id.toString() !== friendid);

        await userfriend.save();
        await user.save();

        res.status(200).json({message : "Friend request removed" , user });  
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
});

router.post("/delete/:friendid/:userid", async (req, res) => {
    try {
        const { friendid, userid } = req.params;

        const userfriend = await User.findById(friendid);
        const user = await User.findById(userid);

        if (!userfriend || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove the request from userfriend's Requetes
        userfriend.followers = userfriend.followers.filter((f) => f.id.toString() !== userid);

        // Remove the invitation from user's Invitations
        user.followers = user.followers.filter((f) => f.id.toString() !== friendid);

        await userfriend.save();
        await user.save();

        res.status(200).json({message : "Friend request removed" , user});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
});


router.post("/accept/:friendid/:userid", async (req, res) => {
    try {
        const { friendid, userid } = req.params;

        // Fetch both users by their IDs
        const userfriend = await User.findById(friendid);
        const user = await User.findById(userid);

        if (!userfriend || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Ensure Requetes and Invitations arrays exist
        const userRequetes = userfriend.Invitations || [];
        const userInvitations = user.Requetes || [];

        // Check if the friend request and invitation exist
        const requestExists = userRequetes.some(f => f.id.toString() === userid);
        const invitationExists = userInvitations.some(f => f.id.toString() === friendid);

        // If both request and invitation exist
        if (requestExists && invitationExists) {
            // Remove the friend request and invitation
            userfriend.Invitations = userfriend.Requetes.filter(f => f.id.toString() !== userid);
            user.Requetes    = user.Invitations.filter(f => f.id.toString() !== friendid);

            // Add each user to the other's followers list
            userfriend.followers.push({
                _id: user._id,
                username: user.username,
                profilePicture: user.profilePicture,
            });
            user.followers.push({
                _id: userfriend._id,
                username: userfriend.username,
                profilePicture: userfriend.profilePicture,
            });

            // Save both users
            await userfriend.save();
            await user.save();

            return res.status(200).json({ message: "Friend request accepted", user: user });
        }

        // Handle cases where the request or invitation does not exist
        if (!requestExists) {
            return res.status(400).json({ error: "Friend request not found" });
        }
        if (!invitationExists) {
            return res.status(400).json({ error: "Invitation not found" });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
});





router.get("/Requetes/:id",async (req,res)=>{
    const { id } = req.params;
    try 
    {
        const user = await User.findById(id) 
        if(!user)
        {
            return res.status("User Not Exist")
        }
        const Requetes = user.Requetes

        res.status(200).json(Requetes)

    }
    catch(err){
        console.error(err)
    }





})








router.get('/shared-photos/:conversationId', async (req, res) => {
    const { conversationId } = req.params;

    try {

        // Fetch all messages where there is an image (image field is not null) for the conversation
        const images = await Message.find({
            conversationId: conversationId,
            image: { $ne: null } // Ensures only messages with an image are retrieved
        }).select('image createdAt'); // Selecting only the image and timestamp



        if (!images.length) {
            return res.status(404).json({ message: 'No shared photos found' });
        }

        res.json(images);
    } catch (error) {
        console.error('Error fetching shared photos:', error); // Add this for detailed logging
        res.status(500).json({ error: 'Server error, could not fetch shared images' });
    }
});


// PUT route to update user information and avatar
router.put("/:id", upload.fields([{ name: 'avatar' }, { name: 'coverPicture' }]), async (req, res) => {
    const { username, email, password,bio,relationshipStatus } = req.body;

    try {
        const existingUser = await User.findById(req.params.id);
        if (!existingUser) {
            return res.status(404).json({ message: "Account does not exist" });
        }

        // Check if username and email are provided
        if (!username || !email) {
            return res.status(400).json({ message: "Username and email are required" });
        }

        // Hash password if provided
        let hashedPassword = existingUser.password;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        // Update user information
        existingUser.username = username;
        existingUser.email = email;
        existingUser.password = hashedPassword;
        existingUser.desc = bio;
        existingUser.relationship = relationshipStatus

        // Update avatar if a file is uploaded
        if (req.files.avatar) {
            existingUser.avatar = req.files.avatar[0].path;
        }

        // Update cover picture if a file is uploaded
        if (req.files.coverPicture) {
            existingUser.coverPicture = req.files.coverPicture[0].path;
        }

        // Save the updated user
        await existingUser.save();

        // Update all posts associated with the user
        await Post.updateMany(
            { userId: req.params.id },  // Find all posts by this userId
            {
                username: username,
                profilePicture: existingUser.avatar   // Update with new avatar/coverPicture
            }
        );

        await User.updateMany(
            { "followers.id": req.params.id },
            { 
                $set: {
                    "followers.$.username": username, 
                    "followers.$.profilePicture": existingUser.avatar 
                }
            }
        );
        

        return res.status(200).json({ message: "User updated successfully", user: existingUser });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
});



module.exports = router;
