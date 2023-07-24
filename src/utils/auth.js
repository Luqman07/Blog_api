const db = require("../../db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const userExist = async (_email) => {
  const sql = "SELECT * FROM `users` WHERE `email` = ?";
  const users = db.query(sql, [`${_email}`], (err, results, fields) => {
    if (err) throw err;
    if (results.length) return results;
  });

  return users._results.length === 0;
};

const getUser = (sql, searchParameter) => {
  return new Promise((resolve, reject) => {
    db.query(sql, [`${searchParameter}`], (err, results) => {
      err ? reject(err) : resolve(results[0]);
    });
  });
};

const generateTokens = async (user) => {
  try {
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    
    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { userExist, getUser, generateTokens };
