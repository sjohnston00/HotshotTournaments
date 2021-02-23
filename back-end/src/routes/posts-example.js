const express = require("express");
const router = express.Router();
const path = require("path");
const Post = require("../models/Post");

//get all the posts from the database
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find();
    res.send(posts);
  } catch (err) {
    res.json({ message: err });
  }
});

//Create a new post in the database
router.post("/", async (req, res) => {
  //Non-Async way
  // const post = new Post({
  //     title:req.body.title,
  //     description:req.body.description
  // })

  // post.save()
  // .then(data =>{
  //     res.json(data)
  // })
  // .catch(err => {
  //     console.log(err);
  //     res.json({message: err })
  // })

  //More Simpler way async way
  const post = new Post({
    title: req.body.title,
    description: req.body.description
  });

  try {
    const savedPost = await post.save();
    res.json(savedPost);
  } catch (err) {
    res.json({ message: err });
  }
});

//Get a post by its Id in the database
router.get("/:postId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    res.json(post);
  } catch (err) {
    res.json({ message: err });
  }
});

//Delete a specific post in the database
router.delete("/:postId", async (req, res) => {
  try {
    //used to be removed method but it is now depricated
    //const removedPost = await Post.remove({_id:req.params.postId});
    const removedPost = await Post.deleteOne({ _id: req.params.postId });
    res.json(removedPost);
  } catch (err) {
    res.json({ message: err });
  }
});

//Updating a specific post
router.patch("/:postId", async (req, res) => {
  try {
    const updatedPost = await Post.updateOne(
      { _id: req.params.postId }, //find the specific post you want to update
      {
        $set: { title: req.body.title, description: req.body.description } //values you want updating in the database
      }
    );
    res.json(updatedPost);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
