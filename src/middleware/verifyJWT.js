const jwt = require("jsonwebtoken");
require("dotenv").config();

// This middleware verifies if the token is available and if it is valid
const verifyJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res
        .status(401)
        .json({ message: "authentication invalid", success: false });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Token invalid",
      });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) throw err;
      req.user = decoded.userId;
      next();
    });
  } catch (error) {
    console.error(error);

    res.status(401).json({
      success: false,
      msg: "Token expired",
    });
  }
};

module.exports = verifyJWT;
