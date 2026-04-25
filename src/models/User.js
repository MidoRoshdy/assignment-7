const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Invalid email format.',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        checkPasswordLength(value) {
          if (!value || value.length <= 6) {
            throw new Error('Password length must be greater than 6 characters.');
          }
        },
      },
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      allowNull: false,
      defaultValue: 'user',
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate(user) {
        if (!user.name || user.name.trim().length <= 2) {
          throw new Error('Name length must be greater than 2 characters.');
        }
      },
    },
  }
);

module.exports = User;
