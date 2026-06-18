const { fn, col } = require("sequelize");
const { User, Post, Comment } = require("../../database/models");

const getPostsDetails = async () => {
  return Post.findAll({
    attributes: ["id", "title"],
    include: [
      { model: User, as: "user", attributes: ["id", "name"] },
      { model: Comment, as: "comments", attributes: ["id", "content"] },
    ],
  });
};

const getPostsCommentCount = async () => {
  return Post.findAll({
    attributes: ["id", "title", [fn("COUNT", col("comments.id")), "commentsCount"]],
    include: [{ model: Comment, as: "comments", attributes: [] }],
    group: ["Post.id"],
  });
};

const createPost = async (body) => {
  return Post.create(body);
};

const deletePostById = async (postId, userId) => {
  const post = await Post.findByPk(postId);
  if (!post) {
    const error = new Error("Post not found.");
    error.statusCode = 404;
    throw error;
  }

  if (Number(post.userId) !== Number(userId)) {
    const error = new Error("Only the owner can delete this post.");
    error.statusCode = 403;
    throw error;
  }

  await post.destroy();
  return { message: "Post deleted successfully." };
};

module.exports = {
  getPostsDetails,
  getPostsCommentCount,
  createPost,
  deletePostById,
};
