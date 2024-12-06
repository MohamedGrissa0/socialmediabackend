const router = require("express").Router();
const multer = require("multer");
const Post = require("../Models/Post");
const User = require("../Models/User");
const path = require("path");
const Notification = require("../Models/Notification");

const imgsDir = path.join(__dirname, '../uploads');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imgsDir); // Save files to 'uploads/imgs'
  },
  filename: function (req, file, cb) {
    // Create a unique filename using current timestamp and original filename
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

// POST route for creating a new post with images
router.post('/', upload.array('uploads'), async (req, res) => {
  try {
    const {
      userId,
      desc,
      tagsFriends,
      likes,
      location,
      feeling,
      profilePicture,
      username
    } = req.body;

    // Ensure that req.files is an array and map to get filenames
    const imgs = req.files ? req.files.map(file => file.filename) : []; // Get filenames of uploaded images

    const newPost = new Post({
      userId,
      desc,
      username,
      profilePicture,
      imgs, // Store the filenames of the uploaded images
      tagsFriends,
      likes,
      location,
      feeling,
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost); // Use 201 for resource creation success
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("The post has been updated");
    } else {
      res.status(403).json("You can update only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      await post.deleteOne();
      res.status(200).json("The post has been deleted");
    } else {
      res.status(404).json("Post not found");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get friends' posts
router.get("/friendsposts/:userid", async (req, res) => {
  try {
    const { userid } = req.params;

    // Find the user by ID
    const user = await User.findById(userid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Assuming user.followers is an array of friend objects, extract the IDs
    const friendIds = user.followers.map(f => f.id || f._id); // Use f.id or f._id depending on your model

    if (friendIds.length === 0) {
      return res.status(200).json({ message: "No friends found", posts: [] });
    }

    // Fetch all posts from friends in a single query
    const posts = await Post.find({ userId: { $in: friendIds } });

    res.status(200).json({ message: "Posts retrieved successfully", posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

router.get("/allposts/:userid", async (req, res) => {
  try {
    const { userid } = req.params;

    // Find the user by ID
    const user = await User.findById(userid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    // Assuming user.followers is an array of friend objects, extract the IDs
    const friendIds = user.followers.map(f => f.id || f._id); // Use f.id or f._id depending on your model
    friendIds.push(userid)
    if (friendIds.length === 0) {
      return res.status(200).json({ message: "No friends found", posts: [] });
    }

    // Fetch all posts from friends in a single query
    const posts = await Post.find({ userId: { $in: friendIds } });

    res.status(200).json({ message: "Posts retrieved successfully", posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});


router.get("/user/:userid", async (req, res) => {
    try {
      const { userid } = req.params;
  
      // Find the user by ID
      const user = await User.findById(userid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
  
      // Fetch all posts from friends in a single query
      const posts = await Post.find({userId:userid});
  
      res.status(200).json({ message: "Posts retrieved successfully", posts });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  });
  












// Like / dislike a post
router.put("/:id/like/:userId", async (req, res) => {
  try {
      const post = await Post.findById(req.params.id);
      const userId = req.params.userId;
      
      // Fetch the user details to get the username
      const user = await User.findById(userId); // Assuming you have a User model
      const username = user.username;

      // Check if the user hasn't already liked the post
      if (!post.likes.includes(userId)) {
          // Remove user from dislikes if present
          post.dislikes = post.dislikes.filter(item => item !== userId);
          // Add user to likes
          post.likes.push(userId);

          // Save the post after liking
          await post.save();

          // If the user liking the post is not the author, create a notification
          if (userId !== String(post.userId)) {
              // Create a new notification with the username
              const notification = new Notification({
                  sender: userId, // The user who liked the post
                  receiver: post.userId, // The post author
                  type: 'like', // Notification type
                  message: `${username} liked your post`, // Custom message with username
              });
              await notification.save();
          }

          // Return the updated counts of likes and dislikes
          res.status(200).json({ message: "The post has been liked", like: post.likes.length, dislike: post.dislikes.length });
      } else {
          res.status(400).json({ message: "User already liked this post" });
      }
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

  

// Dislike a post
// Dislike a post
router.put("/:id/dislike/:userId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.params.userId;

    // Fetch the user details to get the username
    const user = await User.findById(userId); // Assuming you have a User model
    const username = user.username;

    // Check if the user hasn't already disliked the post
    if (!post.dislikes.includes(userId)) {
      // Remove user from likes if present
      post.likes = post.likes.filter(item => item !== userId);
      // Add user to dislikes
      post.dislikes.push(userId);

      // Save the post after disliking
      await post.save();

      // If the user disliking the post is not the author, create a notification
      if (userId !== String(post.userId)) {
        // Create a new notification with the username
        const notification = new Notification({
          sender: userId, // The user who disliked the post
          receiver: post.userId, // The post author
          type: 'dislike', // Notification type
          message: `${username} disliked your post`, // Custom message with username
        });
        await notification.save();
      }

      // Return the updated counts of likes and dislikes
      res.status(200).json({ message: "The post has been disliked", like: post.likes.length, dislike: post.dislikes.length });
    } else {
      res.status(400).json("User already disliked this post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});


// Add a comment to a post
router.post("/:postId/comments/", async (req, res) => {
  const postId = req.params.postId;
  const { comment, userId } = req.body;

  try {
      const user = await User.findById(userId);
      const post = await Post.findById(postId);

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      if (!post) {
          return res.status(404).json({ message: "Post not found" });
      }

      const { username, avatar } = user;

      // Push the comment to the post's comments array
      post.comments.push({ userId, username, avatar, comment });

      await post.save();

      // Create a notification if the commenter is not the post owner
      if (post.userId.toString() !== userId) {
          // Create a notification object (you can customize the structure)
          const notification = {
              postId: postId,
              receiver: post.userId, // The post owner's userId
              sender: userId, // The user who commented
              type: "comment", // Type of notification
              message: `${username} commented on your post`, // Notification message
          };

          // Assuming you have a Notification model
          await Notification.create(notification);
      }

      // Send back the comment data to the client
      res.status(200).json({ message: "Comment added successfully", comment: { userId, username, avatar, comment } });

  } catch (err) {
      console.error(err); // Log the error for debugging
      res.status(500).json({ error: err.message });
  }
});

  

// Get comments for a post
router.get('/:postId/comments/', async (req, res) => {
    const postId = req.params.postId;
  
    try {
      // Find the post by ID and populate comments if they are referenced
      const post = await Post.findById(postId).populate('comments'); // Populate if comments are referenced with user data
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      // Return the comments directly
      res.status(200).json(post.comments); // Send comments directly as an array
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

// Get posts from a user's profile
router.get('/profile/:id', async (req, res) => {
  try {
    const userId = req.params.id;
  
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const posts = await Post.find({ userId: req.params.id });
    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get a user's timeline posts
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
  
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const followerIds = user.followers.map(follower => follower.id);
    followerIds.push(userId);
    const posts = await Post.find({ userId: { $in: followerIds } });
    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get timeline posts
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get a user's posts by username
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});


// Fetch all notifications for a specific user
router.get("/notifications/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
      const notifications = await Notification.find({ receiver: userId }).populate('sender', 'username avatar');

      if (!notifications.length) {
          return res.status(404).json({ message: "No notifications found." });
      }

      res.status(200).json(notifications);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
  }
});




module.exports = router;
