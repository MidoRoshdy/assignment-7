const express = require("express");
const { connectToDatabase, syncDatabase } = require("./database/connection");
const userController = require("./module/users/user.controller");
const postsController = require("./module/posts/posts.controller");
const commentsController = require("./module/comments/comments.controller");

const appController = express();

appController.use(express.json());

appController.use("/users", userController);
appController.use("/posts", postsController);
appController.use("/comments", commentsController);

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
