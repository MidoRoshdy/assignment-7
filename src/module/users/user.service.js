const { User } = require("../../database/models");

const signup = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    const error = new Error("Email already exists.");
    error.statusCode = 409;
    throw error;
  }

  return User.create({ name, email, password, role });
};

const upsertByPk = async (id, body) => {
  const payload = { ...body, id: Number(id) };
  const [user, created] = await User.upsert(payload, {
    validate: false,
    returning: true,
  });

  return { user, created };
};

const findByEmail = async (email) => {
  if (!email) {
    const error = new Error("Email query param is required.");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const getByPkWithoutRole = async (id) => {
  const user = await User.findByPk(id, { attributes: { exclude: ["role"] } });
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

module.exports = {
  signup,
  upsertByPk,
  findByEmail,
  getByPkWithoutRole,
};
