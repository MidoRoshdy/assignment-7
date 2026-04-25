const express = require("express");
const { connectToDatabase, syncDatabase } = require("./database/connection");
const { fn, col, Op, ValidationError, UniqueConstraintError } = require("sequelize");
const { User, Post, Comment } = require("./models");

const appController = express();

appController.use(express.json());

const handleError = (res, error) => {
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

appController.post("/users/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists." });
    }

    const user = await User.create({ name, email, password, role });
    return res.status(201).json(user);
  } catch (error) {
    return handleError(res, error);
  }
});

appController.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body, id: Number(id) };
    const [user, created] = await User.upsert(payload, {
      validate: false,
      returning: true,
    });

    return res.status(created ? 201 : 200).json({ created, user });
  } catch (error) {
    return handleError(res, error);
  }
});

appController.get("/users/by-email", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email query param is required." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json(user);
  } catch (error) {
    return handleError(res, error);
  }
});

appController.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, { attributes: { exclude: ["role"] } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json(user);
  } catch (error) {
    return handleError(res, error);
  }
});

appController.get("/posts/details", async (req, res) => {
  try {
    const posts = await Post.findAll({
      attributes: ["id", "title"],
      include: [
        { model: User, as: "user", attributes: ["id", "name"] },
        { model: Comment, as: "comments", attributes: ["id", "content"] },
      ],
    });
    return res.json(posts);
  } catch (error) {
    return handleError(res, error);
  }
});

appController.get("/posts/comment-count", async (req, res) => {
  try {
    const posts = await Post.findAll({
      attributes: ["id", "title", [fn("COUNT", col("comments.id")), "commentsCount"]],
      include: [{ model: Comment, as: "comments", attributes: [] }],
      group: ["Post.id"],
    });
    return res.json(posts);
  } catch (error) {
    return handleError(res, error);
  }
});

appController.post("/posts", async (req, res) => {
  try {
    const post = await Post.create(req.body);
    return res.status(201).json(post);
  } catch (error) {
    return handleError(res, error);
  }
});

appController.delete("/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (Number(post.userId) !== Number(userId)) {
      return res.status(403).json({ message: "Only the owner can delete this post." });
    }

    await post.destroy();
    return res.json({ message: "Post deleted successfully." });
  } catch (error) {
    return handleError(res, error);
  }
});

appController.post("/comments/find-or-create", async (req, res) => {
  try {
    const { postId, userId, content } = req.body;
    const [comment, created] = await Comment.findOrCreate({
      where: { postId, userId, content },
      defaults: { postId, userId, content },
    });

    return res.status(created ? 201 : 200).json({ created, comment });
  } catch (error) {
    return handleError(res, error);
  }
});

appController.get("/comments/search", async (req, res) => {
  try {
    const { word } = req.query;
    if (!word) {
      return res.status(400).json({ message: "word query param is required." });
    }

    const where = { content: { [Op.like]: `%${word}%` } };
    const comments = await Comment.findAll({ where });
    const matchedCount = await Comment.count({ where });
    return res.json({ matchedCount, comments });
  } catch (error) {
    return handleError(res, error);
  }
});

appController.get("/comments/newest/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.findAll({
      where: { postId },
      order: [["createdAt", "DESC"]],
      limit: 3,
    });
    return res.json(comments);
  } catch (error) {
    return handleError(res, error);
  }
});

appController.get("/comments/details/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByPk(id, {
      include: [
        { model: User, as: "user" },
        { model: Post, as: "post" },
      ],
    });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    return res.json(comment);
  } catch (error) {
    return handleError(res, error);
  }
});

appController.post("/comments", async (req, res) => {
  try {
    const { comments } = req.body;
    if (!Array.isArray(comments) || comments.length === 0) {
      return res.status(400).json({ message: "comments array is required." });
    }

    const result = await Comment.bulkCreate(comments, { validate: true });
    return res.status(201).json(result);
  } catch (error) {
    return handleError(res, error);
  }
});

appController.patch("/comments/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId, content } = req.body;
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    if (Number(comment.userId) !== Number(userId)) {
      return res.status(403).json({ message: "Only the owner can update this comment." });
    }

    comment.content = content;
    await comment.save();
    return res.json(comment);
  } catch (error) {
    return handleError(res, error);
  }
});

appController.get("/health", (req, res) => {
  res.json({ message: "Server is healthy." });
});

const startServer = () => {
  const port = process.env.PORT || 3000;

  appController.listen(port, async () => {
    await connectToDatabase();
    await syncDatabase();
    console.log(`Server is running on port ${port}`);
  });
};

module.exports = {
  appController,
  startServer,
};
