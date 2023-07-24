const express = require("express");
const router = express.Router();
const {
  getPosts,
  getPost,
  removePost,
  updatePost,
  createPost,
  upload,
} = require("../controllers/postController");

// Register
router.get("/posts", getPosts);
router.get("/posts/:id", getPost);
router.post("/posts", upload.single("file"), createPost);
router.delete("/posts/:id", removePost);
router.patch("/posts/:id", upload.single("file"), updatePost);

module.exports = router;
