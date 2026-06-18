const express = require("express");
const { ValidationError, UniqueConstraintError } = require("sequelize");
const userService = require("./user.service");

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

router.post("/signup", async (req, res) => {
  try {
    const user = await userService.signup(req.body);
    return res.status(201).json(user);
  } catch (error) {
    return handleError(res, error);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { user, created } = await userService.upsertByPk(req.params.id, req.body);
    return res.status(created ? 201 : 200).json({ created, user });
  } catch (error) {
    return handleError(res, error);
  }
});

router.get("/by-email", async (req, res) => {
  try {
    const user = await userService.findByEmail(req.query.email);
    return res.json(user);
  } catch (error) {
    return handleError(res, error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await userService.getByPkWithoutRole(req.params.id);
    return res.json(user);
  } catch (error) {
    return handleError(res, error);
  }
});

module.exports = router;
