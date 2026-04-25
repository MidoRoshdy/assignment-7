const mysql = require("mysql2/promise");
const { Sequelize } = require("sequelize");
const { assignmentQueries } = require("./retail.queries");

const DB_NAME = "assignment7";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";

let isDatabaseConnected = false;
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "mysql",
  logging: false,
});

const executeQueryGroup = async (queries) => {
  for (const query of queries) {
    const [rows] = await sequelize.query(query.sql);
    if (Array.isArray(rows)) {
      console.log(`\n${query.title}`);
      console.table(rows);
    } else {
      console.log(`${query.title} -> OK`);
    }
  }
};

const connectToDatabase = async () => {
  try {
    const baseConnection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true,
    });

    await baseConnection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
    await baseConnection.end();

    await sequelize.authenticate();
    isDatabaseConnected = true;
    console.log(`Connected to MySQL database: ${DB_NAME}`);
  } catch (error) {
    console.error("Unable to connect to MySQL:", error.message);
    throw error;
  }
};

const syncDatabase = async () => {
  if (!isDatabaseConnected) {
    throw new Error("Database connection is not initialized.");
  }

  try {
    await executeQueryGroup(assignmentQueries);
    await sequelize.sync();
    console.log("Database synced successfully.");
  } catch (error) {
    console.error("Error while syncing database:", error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  connectToDatabase,
  syncDatabase,
};
