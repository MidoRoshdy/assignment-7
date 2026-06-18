const express = require("express");
const { ValidationError, UniqueConstraintError } = require("sequelize");
const postsService = require("./posts.service");

const router = express.Router();

const handleError = (res, error) => {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof ValidationError || error instanceof UniqueConstraintError) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.errors?.map((item) => item.message) || [error.message],
    });
  }

  return res.status(500).json({
    message: "Internal server error",
    error: error.message,
  });
};

router.get("/details", async (req, res) => {
  try {
    const posts = await postsService.getPostsDetails();
    return res.json(posts);
  } catch (error) {
    return handleError(res, error);
  }
});

router.get("/comment-count", async (req, res) => {
  try {
    const posts = await postsService.getPostsCommentCount();
    return res.json(posts);
  } catch (error) {
    return handleError(res, error);
  }
});

router.post("/", async (req, res) => {
  try {
    const post = await postsService.createPost(req.body);
    return res.status(201).json(post);
  } catch (error) {
    return handleError(res, error);
  }
});

router.delete("/:postId", async (req, res) => {
  try {
    const result = await postsService.deletePostById(req.params.postId, req.body.userId);
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
});

module.exports = router;
