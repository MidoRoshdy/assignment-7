const express = require("express");
const { ValidationError, UniqueConstraintError } = require("sequelize");
const commentsService = require("./comments.service");

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

router.post("/find-or-create", async (req, res) => {
  try {
    const { comment, created } = await commentsService.findOrCreateComment(req.body);
    return res.status(created ? 201 : 200).json({ created, comment });
  } catch (error) {
    return handleError(res, error);
  }
});

router.get("/search", async (req, res) => {
  try {
    const result = await commentsService.searchCommentsWithCount(req.query.word);
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
});

router.get("/newest/:postId", async (req, res) => {
  try {
    const comments = await commentsService.getNewestCommentsByPost(req.params.postId);
    return res.json(comments);
  } catch (error) {
    return handleError(res, error);
  }
});

router.get("/details/:id", async (req, res) => {
  try {
    const comment = await commentsService.getCommentDetailsByPk(req.params.id);
    return res.json(comment);
  } catch (error) {
    return handleError(res, error);
  }
});

router.post("/", async (req, res) => {
  try {
    const result = await commentsService.bulkCreateComments(req.body.comments);
    return res.status(201).json(result);
  } catch (error) {
    return handleError(res, error);
  }
});

router.patch("/:commentId", async (req, res) => {
  try {
    const { userId, content } = req.body;
    const comment = await commentsService.updateCommentContent(
      req.params.commentId,
      userId,
      content
    );
    return res.json(comment);
  } catch (error) {
    return handleError(res, error);
  }
});

module.exports = router;
