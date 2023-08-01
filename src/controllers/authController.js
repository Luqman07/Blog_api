const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const { createApiError } = require("../utils/helpers");
const { getUser, generateTokens } = require("../utils/auth");
const db = require("../../db");
require("dotenv").config();

const register = async (req, res) => {
  let { email, password, fullName } = req.body;
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty())
      throw createApiError("form validaion failed", 422, errors.array);

    const sqlQuery = "SELECT * FROM users WHERE email = ?";

    const userExists = await getUser(sqlQuery, email);
    console.log(userExists + " Line 20");
    if (userExists) throw createApiError("User exists", 401);

    const hashedPwd = await bcrypt.hash(password, 10);
    const user = {
      email,
      password: hashedPwd,
      fullName,
    };
    let sql = `INSERT INTO users SET ? `;
    db.query(sql, user, (err, results, fields) => {
      if (err) throw err;
      console.log("line 32" + results);
      res.status(201).json({ message: "Account Created", user: { results } });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const sql = "SELECT * FROM users WHERE email = ?";
    const user = await getUser(sql, email);
    if (!user) throw createApiError("User not found", 401);

    const match = await bcrypt.compare(
      password.toString(),
      user.password.toString()
    );
    delete user["password"];

    if (match) {
      const { accessToken, refreshToken } = await generateTokens(user);

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: `user ${user.fullName} logged in`,
        data: { ...user, accessToken },
      });
    } else {
      res.status(401);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  if (req.cookies.jwt) {
    res.cookie("jwt", "", { httpOnly: true });
    res.status(200).json({ success: true, message: "Successfully Logged Out" });
  }
};

const refresh = async (req, res) => {
  try {
    // Destructuring refreshToken from cookie
    const refreshToken = req.cookies.jwt;
    if (refreshToken) {
      // Verifying refresh token
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          if (err) {
            // Wrong Refesh Token
            return res.status(401).json({ message: "Unauthorized" });
          } else {
            const sqlQuery = "SELECT * FROM users WHERE id = ?";
            const user = await getUser(sqlQuery, decoded.userId);

            if (user) {
              // Correct token we send a new access token
              const accessToken = jwt.sign(
                {
                  userId: user.id,
                },
                process.env.ACCESS_TOKEN_SECRET,
                {
                  expiresIn: "1h",
                }
              );
              return res.json({ accessToken });
            }
          }
        }
      );
    }
  } catch (error) {
    res.status(401).json({
      message: error.message,
    });
  }
};

module.exports = { register, login, refresh, logout };
