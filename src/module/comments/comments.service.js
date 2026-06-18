const { Op } = require("sequelize");
const { User, Post, Comment } = require("../../database/models");

const findOrCreateComment = async ({ postId, userId, content }) => {
  const [comment, created] = await Comment.findOrCreate({
    where: { postId, userId, content },
    defaults: { postId, userId, content },
  });

  return { comment, created };
};

const searchCommentsWithCount = async (word) => {
  if (!word) {
    const error = new Error("word query param is required.");
    error.statusCode = 400;
    throw error;
  }

  const where = { content: { [Op.like]: `%${word}%` } };
  const comments = await Comment.findAll({ where });
  const matchedCount = await Comment.count({ where });

  return { matchedCount, comments };
};

const getNewestCommentsByPost = async (postId) => {
  return Comment.findAll({
    where: { postId },
    order: [["createdAt", "DESC"]],
    limit: 3,
  });
};

const getCommentDetailsByPk = async (id) => {
  const comment = await Comment.findByPk(id, {
    include: [
      { model: User, as: "user" },
      { model: Post, as: "post" },
    ],
  });

  if (!comment) {
    const error = new Error("Comment not found.");
    error.statusCode = 404;
    throw error;
  }

  return comment;
};

const bulkCreateComments = async (comments) => {
  if (!Array.isArray(comments) || comments.length === 0) {
    const error = new Error("comments array is required.");
    error.statusCode = 400;
    throw error;
  }

  return Comment.bulkCreate(comments, { validate: true });
};

const updateCommentContent = async (commentId, userId, content) => {
  const comment = await Comment.findByPk(commentId);
  if (!comment) {
    const error = new Error("Comment not found.");
    error.statusCode = 404;
    throw error;
  }

  if (Number(comment.userId) !== Number(userId)) {
    const error = new Error("Only the owner can update this comment.");
    error.statusCode = 403;
    throw error;
  }

  comment.content = content;
  await comment.save();
  return comment;
};

module.exports = {
  findOrCreateComment,
  searchCommentsWithCount,
  getNewestCommentsByPost,
  getCommentDetailsByPk,
  bulkCreateComments,
  updateCommentContent,
};
